use std::{io::Result, path::PathBuf};

use crate::model::{Island, IslandFilename};

pub fn load_island(filename: &IslandFilename) -> Result<Island> {
    std::fs::read_to_string(
        PathBuf::new()
            .join(std::env::var("ISLAND_STORAGE_ROOT").unwrap())
            .join("islands")
            .join(&filename.0),
    )
    .map(|content| Island { content })
}
