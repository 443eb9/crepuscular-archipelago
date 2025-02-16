use clokwerk::TimeUnits;
use env_logger::Env;

use crate::jobs::{
    BackendRunner, ChainedJobs, EventLoop, FrontendRunner, Job, PixivIllustFetcher, RepoUpdater,
};

mod jobs;
mod utils;

#[tokio::main]
async fn main() {
    dotenvy::dotenv().unwrap();
    env_logger::init_from_env(Env::default().filter_or("LOG_LEVEL", "info"));

    let mut pixiv = PixivIllustFetcher::default();
    let mut backend = BackendRunner::default();

    let mut frontend = ChainedJobs::default();
    frontend.push(Box::new(RepoUpdater::default()));
    frontend.push(Box::new(FrontendRunner::default()));

    log::info!("Initial run begin.");
    let _ = pixiv.wrapped_run().await;
    for job in frontend.iter_mut() {
        let _ = job.wrapped_run().await;
    }
    let _ = backend.wrapped_run().await;
    log::info!("Initial run end.");

    EventLoop::new()
        .schedule(frontend, |sc| sc.every(5u32.minutes()))
        .schedule(backend, |sc| sc.every(5u32.minutes()))
        .schedule(pixiv, |sc| sc.every(1u32.day()))
        .start();
}
