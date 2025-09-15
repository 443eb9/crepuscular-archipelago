use std::path::{Path, PathBuf};

pub fn get_island_storage_root() -> PathBuf {
    "src-media".into()
}

pub fn get_island_cache_root() -> PathBuf {
    "cache".into()
}

pub fn get_site_public_root() -> PathBuf {
    Path::new(env!("CARGO_MANIFEST_DIR"))
        .parent()
        .unwrap()
        .join("public")
}
