use std::{io::Result, path::PathBuf};

use crate::model::{Island, IslandFilename};

pub fn load_island(id: u32, filename: &IslandFilename) -> Result<Island> {
    std::fs::read_to_string(
        PathBuf::new()
            .join(std::env::var("ISLAND_STORAGE_ROOT").unwrap())
            .join("islands")
            .join(id.to_string())
            .join(&filename.0),
    )
    .map(|content| Island { content })
}
