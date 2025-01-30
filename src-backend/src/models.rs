use chrono::{DateTime, FixedOffset};
use serde::{Deserialize, Serialize};
use sqlx::{prelude::Type, FromRow};

use crate::islands::IslandMapQuery;

#[derive(Debug, Serialize, Deserialize, Type, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub enum IslandType {
    Article,
    Achievement,
    Note,
}

#[derive(Debug, Serialize, FromRow)]
#[serde(rename_all = "camelCase")]
pub struct TagData {
    pub id: u32,
    pub name: String,
    pub amount: u32,
}

#[derive(Debug, Serialize, FromRow)]
#[serde(rename_all = "camelCase")]
pub struct IslandMeta {
    pub id: u32,
    pub title: String,
    pub subtitle: Option<String>,
    pub desc: Option<String>,
    pub date: Option<DateTime<FixedOffset>>,
    pub ty: IslandType,
    pub banner: bool,
    pub is_original: bool,
    pub is_encrypted: bool,
    pub is_deleted: bool,
}

impl Default for IslandMeta {
    fn default() -> Self {
        Self {
            id: 0,
            title: Default::default(),
            subtitle: None,
            desc: None,
            date: None,
            ty: IslandType::Achievement,
            banner: false,
            is_original: true,
            is_encrypted: false,
            is_deleted: false,
        }
    }
}

impl IslandMeta {
    pub fn apply_deleted(self) -> Self {
        if self.is_deleted {
            Self {
                id: self.id,
                is_deleted: true,
                ..Default::default()
            }
        } else {
            self
        }
    }
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct IslandMetaTagged {
    pub id: u32,
    pub title: String,
    pub subtitle: Option<String>,
    pub desc: Option<String>,
    pub date: Option<DateTime<FixedOffset>>,
    pub ty: IslandType,
    pub tags: Vec<TagData>,
    pub banner: bool,
    pub is_original: bool,
    pub is_encrypted: bool,
    pub is_deleted: bool,
}

impl IslandMetaTagged {
    pub fn new(meta: IslandMeta, tags: Vec<TagData>) -> Self {
        Self {
            id: meta.id,
            title: meta.title,
            subtitle: meta.subtitle,
            desc: meta.desc,
            date: meta.date,
            ty: meta.ty,
            tags,
            banner: meta.banner,
            is_original: meta.is_original,
            is_encrypted: meta.is_encrypted,
            is_deleted: meta.is_deleted,
        }
    }
}

#[derive(Debug, Serialize, FromRow)]
#[serde(rename_all = "camelCase")]
pub struct Island {
    pub id: u32,
    pub content: String,
}

#[derive(Debug, Serialize, FromRow)]
#[serde(rename_all = "camelCase")]
pub struct IslandCount {
    pub count: u32,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct IslandMapQueryResponse {
    pub result: Option<IslandMapQuery>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct IslandMapMeta {
    pub size: u32,
    pub per_page_regions: u32,
    pub page_cnt: u32,
}

#[derive(Serialize, FromRow)]
#[serde(rename_all = "camelCase")]
pub struct Foam {
    pub id: u32,
    pub date: DateTime<FixedOffset>,
    pub content: String,
    pub is_encrypted: bool,
}

#[derive(Debug, Serialize, FromRow)]
#[serde(rename_all = "camelCase")]
pub struct FoamCount {
    pub count: u32,
}
