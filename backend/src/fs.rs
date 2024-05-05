use std::{io::Result, path::PathBuf};

use crate::{
    env::get_island_storage_root,
    model::{Island, IslandFilename},
};

pub fn load_island(id: u32, filename: &IslandFilename) -> Result<Island> {
    std::fs::read_to_string(
        PathBuf::new()
            .join(get_island_storage_root())
            .join("islands")
            .join(id.to_string())
            .join(&filename.0),
    )
    .map(|content| Island { content })
}
