use std::{env, path::PathBuf};

pub fn get_island_storage_root() -> PathBuf {
    env::var("ISLAND_STORAGE_ROOT").unwrap().into()
}
