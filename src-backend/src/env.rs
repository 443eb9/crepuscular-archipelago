use std::path::PathBuf;

pub fn get_island_storage_root() -> PathBuf {
    "src-media".into()
}

pub fn get_island_cache_root() -> PathBuf {
    get_island_storage_root().join("cache")
}
