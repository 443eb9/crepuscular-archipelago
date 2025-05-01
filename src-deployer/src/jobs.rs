use std::{
    error::Error,
    fs::{create_dir_all, read_to_string, remove_dir_all, write},
    io::Cursor,
    ops::{Deref, DerefMut},
    process::{Child, Command},
    time::Duration,
};

use async_trait::async_trait;
use chrono::{DateTime, Utc};
use clokwerk::{Scheduler, SyncJob};
use futures_lite::future::block_on;
use image::{GenericImageView, ImageFormat, imageops::FilterType};
use reqwest::{
    Client, StatusCode,
    header::{HeaderMap, HeaderName, HeaderValue},
};
use serde::{Deserialize, Serialize};
use tokio::time::timeout;
use zip::ZipArchive;

use crate::utils::{ProcessLoggingIo, create_process_io, retrieve_bytes_logged};

const DEFAULT_UA: &str =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0";

const WEB_REQUEST_TIMEOUT: Duration = Duration::new(5, 0);

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
            let _ = block_on(job.wrapped_run());
        });
        self
    }

    pub fn start(mut self) {
        loop {
            self.scheduler.run_pending();
            std::thread::sleep(Duration::from_secs(5));
        }
    }
}

#[async_trait]
pub trait Job: Send + Sync {
    async fn run(&mut self) -> Result<(), Box<dyn Error>>;

    async fn wrapped_run(&mut self) -> Result<(), Box<dyn Error>> {
        let start = self.log_start();

        let result = if let Some(max_run_time) = self.timeout() {
            match timeout(max_run_time, self.run()).await {
                Ok(done) => done,
                Err(timeout) => Err(timeout.into()),
            }
        } else {
            self.run().await
        };

        if let Err(err) = &result {
            self.log_err(err.as_ref());
        }
        self.log_end(start);

        result
    }

    fn timeout(&self) -> Option<Duration>;

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
            job.wrapped_run().await?;
        }

        Ok(())
    }

    fn timeout(&self) -> Option<Duration> {
        None
    }
}

macro_rules! resp_check_ok {
    ($resp: expr) => {
        if $resp.status() != StatusCode::OK {
            return Err($resp.text().await?.replace('\n', "").into());
        }
    };
}

pub struct RepoUpdater {
    client: Client,
}

impl Default for RepoUpdater {
    fn default() -> Self {
        let api_key = std::env::var("GITHUB_TOKEN").unwrap();
        let client = Client::builder()
            .connect_timeout(WEB_REQUEST_TIMEOUT)
            .user_agent(DEFAULT_UA)
            .default_headers(HeaderMap::from_iter([
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

impl RepoUpdater {
    const ARTIFACTS_API_URL: &str =
        "https://api.github.com/repos/443eb9/crepuscular-archipelago/actions/artifacts";
}

#[async_trait]
impl Job for RepoUpdater {
    async fn run(&mut self) -> Result<(), Box<dyn Error>> {
        let local_commit = read_to_string(".next/commit");
        log::info!("Local commit: {:?}", local_commit.as_ref().ok());

        let artifact_list_resp = futures_lite::future::block_on(
            self.client
                .get(Self::ARTIFACTS_API_URL)
                .timeout(Duration::from_secs(300))
                .send(),
        )?;
        resp_check_ok!(artifact_list_resp);

        let artifacts = artifact_list_resp.json::<ArtifactList>().await?;
        let latest = artifacts.artifacts.first().unwrap();
        log::info!("Remote commit: {}", latest.workflow_run.head_sha);

        if local_commit.is_ok_and(|c| c == latest.workflow_run.head_sha) {
            return Err("Already up-to-date. Skipping".into());
        }

        let artifact_resp = self.client.get(&latest.archive_download_url).send().await?;
        resp_check_ok!(artifact_resp);

        log::info!("Start downloading artifact.");
        let artifact = retrieve_bytes_logged(artifact_resp).await?;

        log::info!("Start unpacking artifact.");
        let _ = remove_dir_all(".next");
        create_dir_all(".next")?;
        write(".next/commit", &latest.workflow_run.head_sha)?;
        ZipArchive::new(Cursor::new(artifact))?.extract(".next")?;

        Ok(())
    }

    fn timeout(&self) -> Option<Duration> {
        Some(Duration::from_secs(600))
    }
}

pub struct PixivIllustFetcher {
    client: Client,
}

impl Default for PixivIllustFetcher {
    fn default() -> Self {
        let client = Client::builder()
            .connect_timeout(WEB_REQUEST_TIMEOUT)
            .user_agent(DEFAULT_UA)
            .default_headers(HeaderMap::from_iter([(
                HeaderName::from_static("referer"),
                HeaderValue::from_static("https://www.pixiv.net/"),
            )]))
            .build()
            .unwrap();

        Self { client }
    }
}

impl PixivIllustFetcher {
    const PIXIV_RANKING_PAGE: &str = "https://www.pixiv.net/ranking.php?mode=weekly&content=illust";
    const MAX_IMAGE_WIDTH: u32 = 1280;
    const MAX_IMAGE_HEIGHT: u32 = 720;
}

#[async_trait]
impl Job for PixivIllustFetcher {
    async fn run(&mut self) -> Result<(), Box<dyn Error>> {
        log::info!("Start fetching ranking list");
        let ranking_page_resp = self.client.get(Self::PIXIV_RANKING_PAGE).send().await?;
        resp_check_ok!(ranking_page_resp);
        let ranking_page = ranking_page_resp.text().await?;

        const DATA_ID_START_PAT: &str = "data-id=\"";
        const DATA_ID_END_PAT: &str = "\"";
        let first_artwork_id_pos = ranking_page.find(DATA_ID_START_PAT).ok_or_else(|| {
            format!(
                "Unable to find the id of first valid artwork in page. {}",
                ranking_page
            )
        })? + DATA_ID_START_PAT.len();
        let end_first_artwork_id_pos = ranking_page[first_artwork_id_pos..]
            .find(DATA_ID_END_PAT)
            .ok_or_else(|| {
            format!(
                "Unable to find the end position of id of first valid artwork in page. {}",
                ranking_page
            )
        })? + first_artwork_id_pos;

        let first_artwork_id = u32::from_str_radix(
            &ranking_page[first_artwork_id_pos..end_first_artwork_id_pos],
            10,
        )?;
        log::info!("Found artwork. Id: {}", first_artwork_id);

        let artwork_page_url = format!("https://www.pixiv.net/artworks/{}", first_artwork_id);
        let artwork_page_page_resp = self.client.get(&artwork_page_url).send().await?;
        resp_check_ok!(artwork_page_page_resp);
        let artwork_page = artwork_page_page_resp.text().await?;
        const ORIGINAL_ARTWORK_LINK_START_PAT: &str = "https://i.pximg.net/img-original/img/";
        const ORIGINAL_ARTWORK_LINK_END_PAT: &str = "\"";
        let original_artwork_link_pos = artwork_page
            .find(ORIGINAL_ARTWORK_LINK_START_PAT)
            .ok_or_else(|| {
                format!(
                    "Unable to find link to original artwork in page. {}",
                    artwork_page
                )
            })?;
        let end_original_artwork_link_pos = artwork_page[original_artwork_link_pos..]
            .find(ORIGINAL_ARTWORK_LINK_END_PAT)
            .ok_or_else(|| {
                format!(
                    "Unable to find end of link to original artwork in page. {}",
                    artwork_page
                )
            })?
            + original_artwork_link_pos;
        let original_artwork_link =
            &artwork_page[original_artwork_link_pos..end_original_artwork_link_pos];
        log::info!(
            "Found link to the original artwork image: {}",
            original_artwork_link
        );

        const TITLE_START_PAT: &str = "<title>";
        const TITLE_END_PAT: &str = " - pixiv";
        let title_pos = artwork_page
            .find(TITLE_START_PAT)
            .ok_or_else(|| format!("Unable to find title pos in page. {}", artwork_page))?
            + TITLE_START_PAT.len();
        let end_title_pos = artwork_page[title_pos..]
            .find(TITLE_END_PAT)
            .ok_or_else(|| format!("Unable to find end of title pos in page. {}", artwork_page))?
            + title_pos;
        let split_title = artwork_page[title_pos..end_title_pos]
            .split(" - ")
            .collect::<Vec<_>>();
        if split_title.len() != 2 {
            return Err(format!(
                "Unable to parse title: {}",
                &artwork_page[title_pos..end_title_pos]
            )
            .into());
        }

        let original_artwork_resp = self.client.get(original_artwork_link).send().await?;
        resp_check_ok!(original_artwork_resp);

        log::info!("Start downloading artwork.");
        let original_artwork = retrieve_bytes_logged(original_artwork_resp).await?;
        let Ok(mut artwork) = image::load_from_memory(&original_artwork) else {
            return Err("Failed to load image.".into());
        };

        log::info!("Resizing image.");
        let (width, height) = artwork.dimensions();
        let resized = {
            let aspect_ratio = width as f32 / height as f32;
            if aspect_ratio >= 1.0 && width > Self::MAX_IMAGE_WIDTH {
                Some((
                    Self::MAX_IMAGE_WIDTH,
                    (Self::MAX_IMAGE_WIDTH as f32 / aspect_ratio) as u32,
                ))
            } else if aspect_ratio < 1.0 && height > Self::MAX_IMAGE_HEIGHT {
                Some((
                    (Self::MAX_IMAGE_HEIGHT as f32 * aspect_ratio) as u32,
                    Self::MAX_IMAGE_HEIGHT,
                ))
            } else {
                None
            }
        };
        if let Some((new_width, new_height)) = resized {
            artwork = artwork.resize_exact(new_width, new_height, FilterType::CatmullRom);
        } else {
            log::info!("Image already smaller than maximum size. Resizing skipped.");
        }

        log::info!("Start saving image to disk.");
        artwork.save_with_format("public/images/pixiv-weekly.webp", ImageFormat::WebP)?;

        #[derive(Serialize)]
        struct ArtworkMeta {
            name: String,
            author: String,
            src: String,
        }

        write(
            "public/pixiv-weekly.json",
            serde_json::to_string(&ArtworkMeta {
                name: split_title[0].to_string(),
                author: split_title[1].to_string(),
                src: artwork_page_url,
            })?,
        )?;

        Ok(())
    }

    fn timeout(&self) -> Option<Duration> {
        Some(Duration::from_secs(30))
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

        #[cfg(windows)]
        const NPM: &str = "npm.cmd";
        #[cfg(not(windows))]
        const NPM: &str = "npm";

        Command::new(NPM).args(["i", "--verbose"]).output()?;
        let ProcessLoggingIo { out, err } = create_process_io("frontend")?;
        let npm = Command::new(NPM)
            .args(["run", "start"])
            .stdout(out)
            .stderr(err)
            .spawn()?;
        self.npm.replace(npm);

        Ok(())
    }

    fn timeout(&self) -> Option<Duration> {
        Some(Duration::from_secs(90))
    }
}

#[derive(Default)]
pub struct BackendRunner {
    process: Option<Child>,
}

#[async_trait]
impl Job for BackendRunner {
    async fn run(&mut self) -> Result<(), Box<dyn Error>> {
        log::info!("Updating local repo.");
        let output_code = Command::new("git").arg("pull").output()?;
        Command::new("git")
            .args(["checkout", "main"])
            .current_dir("src-media")
            .spawn()?
            .wait()?;
        let output_media = Command::new("git")
            .arg("pull")
            .current_dir("src-media")
            .output()?;

        if String::from_utf8(output_code.stdout)?.contains("Already")
            && String::from_utf8(output_media.stdout)?.contains("Already")
            && self.process.is_some()
        {
            return Err("Already up to date. Skipping.".into());
        }

        if let Some(old_process) = &mut self.process {
            old_process.kill()?;
        }

        let ProcessLoggingIo { out, err } = create_process_io("backend")?;
        let process = Command::new("cargo")
            .args(["run", "--bin", "backend", "--release"])
            .stdout(out)
            .stderr(err)
            .spawn()?;
        self.process.replace(process);

        Ok(())
    }

    fn timeout(&self) -> Option<Duration> {
        Some(Duration::from_secs(120))
    }
}
