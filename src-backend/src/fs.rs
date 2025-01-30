use std::{collections::HashMap, str::FromStr};

use aes_gcm::{
    aead::{Aead, Nonce},
    Aes256Gcm, Key, KeyInit,
};
use base64::{prelude::BASE64_STANDARD, Engine};
use chrono::{DateTime, FixedOffset};
use serde::{de::DeserializeOwned, Deserialize};
use sqlx::{query, sqlite::SqliteConnectOptions, SqlitePool};

use crate::{
    env::{get_island_cache_root, get_island_storage_root},
    model::{IslandMeta, IslandMetaTagged, IslandType, TagData},
};

pub async fn init_islands_cache() -> SqlitePool {
    let _ = std::fs::create_dir_all(get_island_cache_root());

    let conn_opt = SqliteConnectOptions::new()
        .filename(get_island_cache_root().join("archipelago.sqlite3"))
        .create_if_missing(true);
    let db = SqlitePool::connect_with(conn_opt).await.unwrap();

    let (islands, tags) = load_all_islands();
    const INIT_TABLES: &[&'static str] = &[
        "DROP TABLE island_tags",
        "DROP TABLE islands",
        "DROP TABLE tags",
        "DROP TABLE foams",
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
        r#"create table foams
        (
            id           integer               not null
                constraint meta_pk
                    primary key autoincrement,
            date         text,
            is_encrypted Boolean default false,
            is_deleted   integer default false,
            content      text    default ""
        );"#,
    ];

    for cmd in INIT_TABLES {
        let _ = query(cmd).execute(&db).await;
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

fn load_all_islands() -> (Vec<(IslandMetaTagged, String)>, Vec<TagData>) {
    let encryption_key =
        std::env::var("ENCRYPTION_KEY").expect("Missing ENCRYPTION_KEY in environment variable.");
    let encryption_key = Key::<Aes256Gcm>::from_slice(&encryption_key.as_bytes());
    let encrypt_nonce =
        std::env::var("ENCRYPTION_IV").expect("Missing ENCRYPTION_IV in environment variable.");
    let encrypt_nonce = Nonce::<Aes256Gcm>::from_slice(&encrypt_nonce.as_bytes());
    let cipher = Aes256Gcm::new(encryption_key);

    fn bool_true() -> bool {
        true
    }

    #[derive(Deserialize)]
    struct IslandStringTagged {
        pub title: String,
        #[serde(default)]
        pub subtitle: Option<String>,
        #[serde(default)]
        pub desc: Option<String>,
        #[serde(default)]
        pub date: Option<toml::value::Datetime>,
        pub ty: IslandType,
        pub tags: Vec<String>,
        #[serde(default)]
        pub banner: bool,
        #[serde(default = "bool_true")]
        pub is_original: bool,
        #[serde(default)]
        pub is_encrypted: bool,
        #[serde(default)]
        pub is_deleted: bool,
    }

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
            .parse::<u32>()
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

        let (island, mut body) = extract_frontmatter::<IslandStringTagged>(content);
        if island.is_encrypted {
            body = BASE64_STANDARD.encode(cipher.encrypt(encrypt_nonce, body.as_bytes()).unwrap());
        }

        for tag in &island.tags {
            all_tags
                .entry(tag.to_owned())
                .and_modify(|cnt| *cnt = *cnt + 1)
                .or_insert(1u32);
        }

        islands.push((id, island, body));
    }

    islands.sort_by_key(|(id, ..)| *id);

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
            .map(|(id, island, content)| {
                (
                    IslandMetaTagged::new(
                        IslandMeta {
                            id,
                            title: island.title,
                            subtitle: island.subtitle,
                            desc: island.desc,
                            date: island
                                .date
                                .map(|t| DateTime::from_str(&t.to_string()).unwrap()),
                            ty: island.ty,
                            banner: island.banner,
                            is_original: island.is_original,
                            is_encrypted: island.is_encrypted,
                            is_deleted: island.is_deleted,
                        },
                        island
                            .tags
                            .into_iter()
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

fn extract_frontmatter<T: DeserializeOwned>(body: &str) -> (T, String) {
    const DELIMITER: &str = "---";
    let frontmatter_begin = body.find(DELIMITER).unwrap() + DELIMITER.len();
    let frontmatter_end = body[frontmatter_begin..].find(DELIMITER).unwrap() + frontmatter_begin;
    (
        toml::from_str(&body[frontmatter_begin..frontmatter_end]).unwrap(),
        body[frontmatter_end + DELIMITER.len()..].to_string(),
    )
}
