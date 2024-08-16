use std::{io::Result, path::Path};

use crate::{
    env::get_island_storage_root,
    model::{Island, IslandFilename, LinkExchange, Project},
};

pub fn load_island(id: u32, filename: &IslandFilename) -> Result<Island> {
    std::fs::read_to_string(
        Path::new(&get_island_storage_root())
            .join("islands")
            .join(id.to_string())
            .join(&filename.0),
    )
    .map(|content| Island { content })
}

pub fn load_link_exchange_list() -> Vec<LinkExchange> {
    serde_json::from_str(
        &std::fs::read_to_string(
            Path::new(&get_island_storage_root())
                .join("json")
                .join("link_exchange_list.json"),
        )
        .unwrap(),
    )
    .unwrap()
}

pub fn load_projects_list() -> Vec<Project> {
    serde_json::from_str(
        &std::fs::read_to_string(
            Path::new(&get_island_storage_root())
                .join("json")
                .join("projects.json"),
        )
        .unwrap(),
    )
    .unwrap()
}
