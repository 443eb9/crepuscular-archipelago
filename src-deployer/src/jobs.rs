use std::{
    error::Error,
    fs::{create_dir_all, read_to_string, remove_dir_all, write},
    io::Cursor,
    ops::{Deref, DerefMut},
    process::{Child, Command},
};

use async_trait::async_trait;
use chrono::{DateTime, Utc};
use clokwerk::{Scheduler, SyncJob};
use futures_lite::{future::block_on, StreamExt};
use reqwest::{
    header::{HeaderMap, HeaderName, HeaderValue},
    Client, StatusCode,
};
use serde::Deserialize;
use zip::ZipArchive;

pub struct EventLoop {
    scheduler: Scheduler<Utc>,
}

impl EventLoop {
    pub fn new() -> Self {
        Self {
            scheduler: Scheduler::with_tz(Utc),
        }
    }

    pub fn schedule(
        mut self,
        mut job: impl Job + Send + Sync + 'static,
        config: impl Fn(&mut Scheduler<Utc>) -> &mut SyncJob<Utc>,
    ) -> Self {
        config(&mut self.scheduler).run(move || {
            let _ = block_on(job.run_logged());
        });
        self
    }

    pub fn start(mut self) {
        loop {
            self.scheduler.run_pending();
        }
    }
}

#[async_trait]
pub trait Job: Send + Sync {
    async fn run(&mut self) -> Result<(), Box<dyn Error>>;

    async fn run_logged(&mut self) -> Result<(), Box<dyn Error>> {
        let start = self.log_start();
        let result = self.run().await;
        if let Err(err) = &result {
            self.log_err(err.as_ref());
        }
        self.log_end(start);

        result
    }

    fn log_start(&self) -> DateTime<Utc> {
        log::info!(
            "======Running job {}======",
            std::any::type_name_of_val(self)
        );
        Utc::now()
    }

    fn log_err(&self, err: &dyn Error) {
        log::error!("Job {} error: {}", std::any::type_name_of_val(self), err);
    }

    fn log_end(&self, start: DateTime<Utc>) {
        log::info!(
            "======Job {} finished. {}ms elapsed======",
            std::any::type_name_of_val(self),
            (Utc::now() - start).num_milliseconds()
        );
    }
}

#[derive(Default)]
pub struct ChainedJobs {
    jobs: Vec<Box<dyn Job>>,
}

impl Deref for ChainedJobs {
    type Target = Vec<Box<dyn Job>>;

    fn deref(&self) -> &Self::Target {
        &self.jobs
    }
}

impl DerefMut for ChainedJobs {
    fn deref_mut(&mut self) -> &mut Self::Target {
        &mut self.jobs
    }
}

#[async_trait]
impl Job for ChainedJobs {
    async fn run(&mut self) -> Result<(), Box<dyn Error>> {
        let total = self.len();

        for (index, job) in self.iter_mut().enumerate() {
            log::info!("Chained job running {}/{}", index, total);
            job.run_logged().await?;
        }

        Ok(())
    }
}

macro_rules! resp_check_ok {
    ($resp: expr) => {
        if $resp.status() != StatusCode::OK {
            return Err($resp.text().await?.replace('\n', "").into());
        }
    };
}

pub struct ArtifactFetcher {
    client: Client,
}

impl Default for ArtifactFetcher {
    fn default() -> Self {
        let api_key = std::env::var("GITHUB_TOKEN").unwrap();
        let client = Client::builder()
            .default_headers(HeaderMap::from_iter([
                (
                    HeaderName::from_static("user-agent"),
                    HeaderValue::from_static("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36 Edge/12.246"),
                ),
                (
                    HeaderName::from_static("accept"),
                    HeaderValue::from_static("application/vnd.github+json"),
                ),
                (
                    HeaderName::from_static("authorization"),
                    HeaderValue::from_str(&format!("Bearer {}", api_key)).unwrap(),
                ),
                (
                    HeaderName::from_static("x-github-api-version"),
                    HeaderValue::from_static("2022-11-28"),
                ),
            ]))
            .build()
            .unwrap();

        Self { client }
    }
}

#[derive(Deserialize)]
pub struct ArtifactList {
    pub artifacts: Vec<Artifact>,
}

#[derive(Deserialize)]
pub struct Artifact {
    pub workflow_run: WorkflowRun,
    pub archive_download_url: String,
}

#[derive(Deserialize)]
pub struct WorkflowRun {
    pub head_sha: String,
}

impl ArtifactFetcher {
    const ARTIFACTS_API_URL: &str =
        "https://api.github.com/repos/443eb9/crepuscular-archipelago/actions/artifacts";
}

#[async_trait]
impl Job for ArtifactFetcher {
    async fn run(&mut self) -> Result<(), Box<dyn Error>> {
        log::info!("Checking local commit hash.");
        let local_commit = read_to_string(".next/commit");

        let artifact_list_resp = self.client.get(Self::ARTIFACTS_API_URL).send().await?;
        resp_check_ok!(artifact_list_resp);

        let artifacts = artifact_list_resp.json::<ArtifactList>().await?;
        let latest = artifacts.artifacts.first().unwrap();

        log::info!(
            "Local commit: {:?}, remote commit: {}",
            local_commit.as_ref().ok(),
            latest.workflow_run.head_sha,
        );

        if local_commit.is_ok_and(|c| c == latest.workflow_run.head_sha) {
            return Err("Already up-to-date. Skipping".into());
        }

        log::info!("Updating local repo.");
        Command::new("git").arg("pull").output()?;

        let artifact_resp = self.client.get(&latest.archive_download_url).send().await?;
        resp_check_ok!(artifact_resp);

        log::info!("Start downloading artifact.");
        let total_size = artifact_resp.content_length().unwrap_or_default() as usize;
        let mut artifact = Vec::with_capacity(total_size);
        let mut stream = artifact_resp.bytes_stream();
        while let Some(bytes) = stream.next().await {
            artifact.extend(bytes?);
            if total_size != 0 {
                log::info!(
                    "Retrieved: {}/{} bytes. {}%",
                    artifact.len(),
                    total_size,
                    (artifact.len() as f32 / total_size as f32 * 10000.0).round() / 100.0
                )
            }
        }

        log::info!("Start unpacking artifact.");
        let _ = remove_dir_all(".next"); // Can fail
        create_dir_all(".next")?;
        write(".next/commit", &latest.workflow_run.head_sha)?;
        ZipArchive::new(Cursor::new(artifact))?.extract(".next")?;

        Ok(())
    }
}

#[derive(Default)]
pub struct FrontendRunner {
    npm: Option<Child>,
}

#[async_trait]
impl Job for FrontendRunner {
    async fn run(&mut self) -> Result<(), Box<dyn Error>> {
        if let Some(old_npm) = &mut self.npm {
            old_npm.kill()?;
        }

        Command::new("deno").arg("i").output()?;
        let npm = Command::new("deno").args(["task", "start"]).spawn()?;
        self.npm.replace(npm);

        Ok(())
    }
}

#[derive(Default)]
pub struct BackendRunner {
    process: Option<Child>,
}

#[async_trait]
impl Job for BackendRunner {
    async fn run(&mut self) -> Result<(), Box<dyn Error>> {
        if let Some(old_process) = &mut self.process {
            old_process.kill()?;
        }

        let process = Command::new("cargo")
            .args(["run", "--bin", "backend", "--release"])
            .spawn()?;
        self.process.replace(process);

        Ok(())
    }
}
