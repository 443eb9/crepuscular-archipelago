use std::env;

pub fn get_island_storage_root() -> String {
    env::var("ISLAND_STORAGE_ROOT").unwrap()
}
