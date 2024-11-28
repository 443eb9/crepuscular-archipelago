use std::{collections::HashMap, io::Result};

use chrono::DateTime;
use sqlx::{query, SqlitePool};

use crate::{
    env::get_island_storage_root,
    model::{Island, IslandFilename, IslandMeta, IslandMetaTagged, IslandType, Project, TagData},
};

pub fn load_island(id: u32, filename: &IslandFilename) -> Result<Island> {
    std::fs::read_to_string(
        get_island_storage_root()
            .join("islands")
            .join(id.to_string())
            .join(&filename.0),
    )
    .map(|content| Island { content })
}

pub fn load_projects_list() -> Vec<Project> {
    serde_json::from_str(
        &std::fs::read_to_string(get_island_storage_root().join("json").join("projects.json"))
            .unwrap(),
    )
    .unwrap()
}

pub async fn generate_db(
    db: &SqlitePool,
    islands: Vec<(IslandMetaTagged, String)>,
    tags: Vec<TagData>,
) {
    const INIT_TABLES: &[&'static str] = &[
        "DROP TABLE island_tags",
        "DROP TABLE islands",
        "DROP TABLE tags",
        r#"create table islands
        (
            id           integer               not null
                constraint meta_pk
                    primary key autoincrement,
            title        text                  not null,
            subtitle     TEXT,
            desc         text,
            ty           integer               not null,
            filename     text    default "",
            date         text,
            banner       boolean default false not null,
            is_original  Boolean,
            is_encrypted Boolean default false,
            is_deleted   integer default false
        );"#,
        r#"create table tags
        (
            id     integer           not null
                constraint tags_pk
                    primary key autoincrement,
            name   text              not null,
            amount integer default 0 not null
        );"#,
        r#"create table island_tags
        (
            island_id integer
                constraint island_id_fk
                    references islands,
            tag_id    integer
                constraint tag_id_fk
                    references tags,
            constraint island_tags_pk
                primary key (island_id, tag_id)
        );"#,
    ];

    for cmd in INIT_TABLES {
        match query(cmd).execute(db).await {
            Ok(_) => {}
            Err(err) => log::error!("{}", err),
        };
    }

    for tag in tags {
        query("INSERT INTO tags (name, amount) VALUES (?, ?)")
            .bind(tag.name)
            .bind(tag.amount)
            .execute(db)
            .await
            .unwrap();
    }

    for (island, filename) in islands {
        query("INSERT INTO islands (title, subtitle, desc, ty, filename, date, banner, is_original, is_encrypted, is_deleted) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
            .bind(island.title)
            .bind(island.subtitle)
            .bind(island.desc)
            .bind(island.ty)
            .bind(filename)
            .bind(island.date)
            .bind(island.banner)
            .bind(island.is_original)
            .bind(island.is_encrypted)
            .bind(island.is_deleted)
            .execute(db)
            .await
            .unwrap();

        for tag in island.tags {
            query("INSERT INTO island_tags (island_id, tag_id) VALUES (?, ?)")
                .bind(island.id)
                .bind(tag.id)
                .execute(db)
                .await
                .unwrap();
        }
    }
}

pub fn load_all_islands() -> (Vec<(IslandMetaTagged, String)>, Vec<TagData>) {
    let dir = std::fs::read_dir(get_island_storage_root().join("islands")).unwrap();
    let mut all_tags = HashMap::<String, u32>::default();
    let mut islands = Vec::new();

    for entry in dir {
        let Ok(entry) = entry else {
            break;
        };

        let id = entry
            .file_name()
            .to_str()
            .unwrap()
            .to_string()
            .parse()
            .unwrap();

        let assets = std::fs::read_dir(entry.path()).unwrap();
        let content_and_filename = assets
            .into_iter()
            .filter_map(|entry| {
                entry.ok().and_then(|entry| {
                    entry
                        .path()
                        .extension()
                        .is_some_and(|ext| ext == "md")
                        .then(|| {
                            (
                                std::fs::read_to_string(entry.path()).ok(),
                                entry
                                    .path()
                                    .file_name()
                                    .unwrap()
                                    .to_str()
                                    .unwrap()
                                    .to_string(),
                            )
                        })
                })
            })
            .filter_map(|(files, filenames)| files.map(|f| (f, filenames)))
            .collect::<Vec<_>>();
        assert_eq!(content_and_filename.len(), 1);

        let (content, filename) = &content_and_filename[0];
        let markdown = content.lines().collect::<Vec<_>>();
        let mut indices = Vec::with_capacity(2);
        for (index, line) in markdown.iter().enumerate() {
            if *line == "---" {
                indices.push(index);
            }
            if indices.len() == 2 {
                break;
            }
        }

        let (island, tags) = front_matter_parse(&markdown[indices[0] + 1..indices[1]]);
        islands.push((
            IslandMeta { id, ..island },
            tags.clone(),
            filename.to_string(),
        ));

        for tag in &tags {
            all_tags
                .entry(tag.to_owned())
                .and_modify(|cnt| *cnt = *cnt + 1)
                .or_insert(1u32);
        }
    }

    islands.sort_by_key(|(meta, ..)| meta.id);

    let mut all_tags = all_tags.into_iter().collect::<Vec<_>>();
    all_tags.sort_by_key(|(name, _)| name.to_owned());
    let all_tags_ids = all_tags
        .iter()
        .enumerate()
        .map(|(i, (name, _))| (name.to_owned(), i as u32 + 1))
        .collect::<HashMap<_, _>>();

    (
        islands
            .into_iter()
            .map(|(island, tags, filename)| {
                (
                    IslandMetaTagged::new(
                        island,
                        tags.into_iter()
                            .map(|name| {
                                let id = all_tags_ids[&name];
                                TagData {
                                    id,
                                    name,
                                    amount: all_tags[id as usize - 1].1,
                                }
                            })
                            .collect(),
                    ),
                    filename,
                )
            })
            .collect(),
        all_tags
            .into_iter()
            .map(|(name, amount)| TagData {
                id: all_tags_ids[&name],
                name,
                amount,
            })
            .collect(),
    )
}

fn front_matter_parse(lines: &[&str]) -> (IslandMeta, Vec<String>) {
    let mut meta = IslandMeta::default();
    let mut tags = Vec::new();
    for item in lines {
        let idx = item.find(": ").unwrap();
        let field = &item[..idx];
        let data = &item[idx + 2..];

        match field {
            "title" => meta.title = data.to_string(),
            "subtitle" => meta.subtitle = (!data.is_empty()).then(|| data.to_string()),
            "desc" => meta.desc = (!data.is_empty()).then(|| data.to_string()),
            "ty" => meta.ty = IslandType::from_str(data).unwrap(),
            "date" => meta.date = Some(DateTime::parse_from_rfc3339(data).unwrap()),
            "banner" => meta.banner = data.parse::<bool>().unwrap(),
            "is_original" => meta.is_original = data.parse::<bool>().unwrap(),
            "is_encrypted" => meta.is_encrypted = data.parse::<bool>().unwrap(),
            "is_deleted" => meta.is_deleted = data.parse::<bool>().unwrap(),
            "tags" => tags.extend(data.split(',').map(str::to_string)),
            _ => unreachable!(),
        }
    }
    (meta, tags)
}
