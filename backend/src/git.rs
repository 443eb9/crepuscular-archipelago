use std::{
    path::Path,
    process::{Command, Output},
};

use crate::env::get_island_storage_root;

pub fn update_repo() -> std::io::Result<Output> {
    let path = Path::new(&get_island_storage_root())
        .canonicalize()
        .unwrap();
    Command::new("git").arg("pull").current_dir(path).output()
}
