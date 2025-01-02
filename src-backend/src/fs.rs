use std::collections::HashMap;

use chrono::DateTime;
use sqlx::{query, sqlite::SqliteConnectOptions, SqlitePool};

use crate::{
    env::{get_island_cache_root, get_island_storage_root},
    model::{IslandMeta, IslandMetaTagged, IslandType, Project, TagData},
};

pub fn load_projects_list() -> Vec<Project> {
    serde_json::from_str(
        &std::fs::read_to_string(get_island_storage_root().join("json").join("projects.json"))
            .unwrap(),
    )
    .unwrap()
}

pub async fn init_cache() -> SqlitePool {
    let _ = std::fs::create_dir_all(get_island_cache_root());

    let conn_opt = SqliteConnectOptions::new()
        .filename(get_island_cache_root().join("archipelago.sqlite3"))
        .create_if_missing(true);
    let db = SqlitePool::connect_with(conn_opt).await.unwrap();
    return db;

    let (islands, tags) = load_and_cache_all_islands();
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
            date         text,
            banner       boolean default false not null,
            is_original  Boolean,
            is_encrypted Boolean default false,
            is_deleted   integer default false,
            content      text    default ""
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
        match query(cmd).execute(&db).await {
            Ok(_) => {}
            Err(err) => log::error!("{}", err),
        };
    }

    for tag in tags {
        query("INSERT INTO tags (name, amount) VALUES (?, ?)")
            .bind(tag.name)
            .bind(tag.amount)
            .execute(&db)
            .await
            .unwrap();
    }

    for (island, content) in islands {
        query("INSERT INTO islands (title, subtitle, desc, ty, date, banner, is_original, is_encrypted, is_deleted, content) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
            .bind(island.title)
            .bind(island.subtitle)
            .bind(island.desc)
            .bind(island.ty)
            .bind(island.date)
            .bind(island.banner)
            .bind(island.is_original)
            .bind(island.is_encrypted)
            .bind(island.is_deleted)
            .bind(content)
            .execute(&db)
            .await
            .unwrap();

        for tag in island.tags {
            query("INSERT INTO island_tags (island_id, tag_id) VALUES (?, ?)")
                .bind(island.id)
                .bind(tag.id)
                .execute(&db)
                .await
                .unwrap();
        }
    }

    db
}

fn load_and_cache_all_islands() -> (Vec<(IslandMetaTagged, String)>, Vec<TagData>) {
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
        let content = assets
            .into_iter()
            .filter_map(|entry| {
                entry.ok().and_then(|entry| {
                    entry
                        .path()
                        .extension()
                        .is_some_and(|ext| ext == "md")
                        .then(|| std::fs::read_to_string(entry.path()).ok())
                        .flatten()
                })
            })
            .collect::<Vec<_>>();
        assert_eq!(content.len(), 1);

        let content = &content[0];
        let lines = content.lines().collect::<Vec<_>>();

        let mut front_matter_boundary = Vec::with_capacity(2);
        for (index, line) in lines.iter().enumerate() {
            if *line == "---" {
                front_matter_boundary.push(index);
            }
            if front_matter_boundary.len() == 2 {
                break;
            }
        }

        let (island, tags) =
            front_matter_parse(&lines[front_matter_boundary[0] + 1..front_matter_boundary[1]]);
        let body = lines[front_matter_boundary[1] + 1..]
            .iter()
            .map(|s| s.chars().chain(['\n']))
            .flatten()
            .collect::<String>();
        islands.push((IslandMeta { id, ..island }, tags.clone(), body));

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
            .map(|(island, tags, content)| {
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
                    content,
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
