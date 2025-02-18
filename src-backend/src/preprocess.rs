use std::{collections::HashMap, fs::create_dir_all, str::FromStr};

use aes_gcm::{
    aead::{consts::U12, Aead, Nonce},
    aes::Aes256,
    Aes256Gcm, AesGcm, Key, KeyInit,
};
use base64::{prelude::BASE64_STANDARD, Engine};
use chrono::DateTime;
use serde::{de::DeserializeOwned, Deserialize};
use sqlx::{query, sqlite::SqliteConnectOptions, SqlitePool};

use crate::{
    env::{get_island_cache_root, get_island_storage_root},
    islands::IslandMaps,
    models::{Foam, IslandMeta, IslandMetaTagged, IslandType, License, TagData},
};

pub struct InitData {
    pub main_db: SqlitePool,
    pub island_maps: IslandMaps,
}

pub async fn preprocess() -> InitData {
    log::info!("Preprocess start.");
    let _ = create_dir_all(get_island_cache_root());
    let conn_opt = SqliteConnectOptions::new()
        .filename(get_island_cache_root().join("archipelago.sqlite3"))
        .create_if_missing(true);
    let db = SqlitePool::connect_with(conn_opt).await.unwrap();
    init_cache_db(&db).await;

    log::info!("Preprocess done, starting web server.");

    InitData {
        island_maps: IslandMaps::new(&db),
        main_db: db,
    }
}

struct ContentEncryptor {
    cipher: AesGcm<Aes256, U12>,
    iv: Nonce<Aes256Gcm>,
}

impl Default for ContentEncryptor {
    fn default() -> Self {
        let encryption_key = std::env::var("ENCRYPTION_KEY")
            .expect("Missing ENCRYPTION_KEY in environment variable.");
        let encryption_key = Key::<Aes256Gcm>::from_slice(&encryption_key.as_bytes());
        let encrypt_nonce =
            std::env::var("ENCRYPTION_IV").expect("Missing ENCRYPTION_IV in environment variable.");
        let encrypt_nonce = Nonce::<Aes256Gcm>::from_slice(&encrypt_nonce.as_bytes());
        let cipher = Aes256Gcm::new(encryption_key);

        Self {
            cipher,
            iv: encrypt_nonce.to_owned(),
        }
    }
}

impl ContentEncryptor {
    pub fn encrypt(&self, content: &mut String) {
        *content =
            BASE64_STANDARD.encode(self.cipher.encrypt(&self.iv, content.as_bytes()).unwrap());
    }
}

pub async fn init_cache_db(db: &SqlitePool) {
    let encryptor = ContentEncryptor::default();

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
            license      text,
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

    log::info!("Start initializing tables...");
    for cmd in INIT_TABLES {
        match query(cmd).execute(db).await {
            Ok(_) => {}
            Err(err) => log::error!("{}", err),
        }
    }

    log::info!("Start loading all islands...");
    let (islands, tags) = load_all_islands(&encryptor);
    log::info!(
        "Successfully loaded {} islands and {} tags.",
        islands.len(),
        tags.len()
    );

    for tag in tags {
        query("INSERT INTO tags (name, amount) VALUES (?, ?)")
            .bind(tag.name)
            .bind(tag.amount)
            .execute(db)
            .await
            .unwrap();
    }

    for (island, content) in islands {
        query("INSERT INTO islands (title, subtitle, desc, ty, date, license, banner, is_encrypted, is_deleted, content) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
            .bind(island.title)
            .bind(island.subtitle)
            .bind(island.desc)
            .bind(island.ty)
            .bind(island.date)
            .bind(island.license)
            .bind(island.banner)
            .bind(island.is_encrypted)
            .bind(island.is_deleted)
            .bind(content)
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

    log::info!("Start loading all foams...");
    let foams = load_all_foams(&encryptor);
    log::info!("Successfully loaded {} foams.", foams.len());

    for foam in foams {
        query("INSERT INTO foams (date, is_encrypted, content) VALUES (?, ?, ?)")
            .bind(foam.date)
            .bind(foam.is_encrypted)
            .bind(foam.content)
            .execute(db)
            .await
            .unwrap();
    }
}

fn load_all_islands(
    encryptor: &ContentEncryptor,
) -> (Vec<(IslandMetaTagged, String)>, Vec<TagData>) {
    #[derive(Deserialize)]
    struct IslandToml {
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
        pub license: License,
        #[serde(default)]
        pub banner: bool,
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

        let (island, mut body) = extract_frontmatter::<IslandToml>(content);
        body = replace_image_urls(body);
        if island.is_encrypted {
            encryptor.encrypt(&mut body);
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
    all_tags.sort_by_key(|(_, amount)| -(*amount as i32));
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
                            license: island.license,
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

fn load_all_foams(encryptor: &ContentEncryptor) -> Vec<Foam> {
    #[derive(Deserialize)]
    struct FoamToml {
        pub date: toml::value::Datetime,
        #[serde(default = "bool_true")]
        pub is_encrypted: bool,
    }

    let dir = std::fs::read_dir(get_island_storage_root().join("foams")).unwrap();
    let mut foams = Vec::new();

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

        let (foam, mut body) = extract_frontmatter::<FoamToml>(content);
        body = replace_image_urls(body);
        if foam.is_encrypted {
            encryptor.encrypt(&mut body);
        }

        foams.push(Foam {
            id,
            date: DateTime::from_str(&foam.date.to_string()).unwrap(),
            content: body,
            is_encrypted: foam.is_encrypted,
        });
    }

    foams
}

fn extract_frontmatter<T: DeserializeOwned>(body: &str) -> (T, String) {
    const DELIMITER: &str = "---";
    let frontmatter_begin = body.find(DELIMITER).unwrap() + DELIMITER.len();
    let frontmatter_end = body[frontmatter_begin..].find(DELIMITER).unwrap() + frontmatter_begin;
    (
        toml::from_str(&body[frontmatter_begin..frontmatter_end]).unwrap(),
        body[frontmatter_end + DELIMITER.len()..].trim().to_string(),
    )
}

fn replace_image_urls(body: String) -> String {
    regex::Regex::new(r#"\.\/([0-9]+)\/"#)
        .unwrap()
        .replace_all(&body, "https://oss.443eb9.dev/islandsmedia/$1/")
        .into()
}

fn bool_true() -> bool {
    true
}
