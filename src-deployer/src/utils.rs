use std::{
    error::Error,
    fs::{create_dir_all, File},
    process::Stdio,
    sync::{
        atomic::{AtomicU32, Ordering},
        Arc,
    },
    time::Duration,
};

use futures_lite::StreamExt;
use reqwest::Response;

pub async fn retrieve_bytes_logged(resp: Response) -> Result<Vec<u8>, Box<dyn Error>> {
    let total_size = resp.content_length().unwrap_or_default() as u32;
    let mut result = Vec::with_capacity(total_size as usize);
    let mut stream = resp.bytes_stream();
    let progress = Arc::new(AtomicU32::new(0));

    let progress_clone = progress.clone();
    std::thread::spawn(move || {
        let total = total_size as u32;
        loop {
            let cur = progress_clone.load(Ordering::SeqCst);
            if cur == total {
                break;
            }
            log::info!(
                "Retrieved: {}/{} bytes. {}%",
                cur,
                total_size,
                (cur as f32 / total as f32 * 10000.0).round() / 100.0
            );
            std::thread::sleep(Duration::from_secs_f32(0.5));
        }
    });

    while let Some(bytes) = stream.next().await {
        result.extend(bytes?);
        progress.store(result.len() as u32, Ordering::SeqCst);
    }

    Ok(result)
}

pub struct ProcessLoggingIo {
    pub out: Stdio,
    pub err: Stdio,
}

pub fn create_process_io(name: &str) -> std::io::Result<ProcessLoggingIo> {
    let _ = create_dir_all("log");
    Ok(ProcessLoggingIo {
        out: File::create(format!("log/{name}-stdout.log"))?.into(),
        err: File::create(format!("log/{name}-stderr.log"))?.into(),
    })
}
