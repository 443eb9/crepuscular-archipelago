use std::{io::Result, path::PathBuf};

use log::info;

use crate::{
    env::{get_img_assets_root, get_island_storage_root},
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

pub fn copy_all_article_imgs() {
    let storage_path = PathBuf::new()
        .join(get_island_storage_root())
        .join("islands");

    let img_path = PathBuf::new().join(get_img_assets_root());

    std::fs::read_dir(&storage_path)
        .unwrap()
        .filter_map(|entry| entry.map(|article| article.file_name()).ok())
        .filter_map(|island| std::fs::read_dir(storage_path.join(island).join("imgs")).ok())
        .for_each(|imgs| {
            imgs.filter_map(|i| i.ok()).for_each(|img| {
                let dest = img_path.join(img.file_name());
                if std::fs::metadata(&dest).is_ok() {
                    info!(
                        "Ignored image {:?} when copying images to the static asset folder.",
                        img.file_name()
                    );
                    return;
                }
                
                std::fs::copy(img.path(), &dest).unwrap();
                info!(
                    "Copied new image {:?} to the static asset folder.",
                    img.file_name()
                );
            })
        });
}
