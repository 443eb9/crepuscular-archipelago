use clokwerk::TimeUnits;
use env_logger::Env;

use crate::jobs::{ArtifactFetcher, BackendRunner, ChainedJobs, EventLoop, FrontendRunner};

mod jobs;

#[tokio::main]
async fn main() {
    dotenvy::dotenv().unwrap();
    env_logger::init_from_env(Env::default().filter_or("LOG_LEVEL", "info"));

    let mut jobs = ChainedJobs::default();
    jobs.push(Box::new(ArtifactFetcher::default()));
    jobs.push(Box::new(BackendRunner::default()));
    jobs.push(Box::new(FrontendRunner::default()));

    log::info!("Initial run begin.");
    for job in jobs.iter_mut() {
        let _ = job.wrapped_run().await;
    }
    log::info!("Initial run end.");

    EventLoop::new()
        .schedule(jobs, |sc| sc.every(5u32.minutes()))
        .start();
}
