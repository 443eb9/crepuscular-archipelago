use std::{thread, time::Duration};

use log::{error, info};

use crate::git;

pub fn start_schedules() {
    thread::spawn(|| auto_update());
}

fn auto_update() {
    loop {
        info!("Start updating article repo.");
        match git::update_repo() {
            Ok(ok) => info!("{}", String::from_utf8(ok.stdout).unwrap()),
            Err(err) => error!("{}", err.to_string()),
        }
        info!("Update successed.");
        thread::sleep(Duration::from_secs(3600));
    }
}
