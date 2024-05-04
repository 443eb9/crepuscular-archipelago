use std::env;

pub fn get_island_storage_root() -> String {
    env::var("ISLAND_STORAGE_ROOT").unwrap()
}

pub fn get_img_assets_root() -> String {
    env::var("IMG_ASSETS_ROOT").unwrap()
}
