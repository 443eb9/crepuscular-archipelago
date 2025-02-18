use chrono::{DateTime, FixedOffset};
use serde::{Deserialize, Serialize};
use sqlx::{prelude::Type, FromRow};

use crate::islands::IslandMapQuery;

#[derive(Debug, Default, Serialize, Deserialize, Type, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub enum IslandType {
    #[default]
    Article,
    Achievement,
    Note,
}

#[derive(Debug, Default, Serialize, Deserialize, Type, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub enum IslandState {
    #[default]
    Finished,
    // Leave date to None sets state to WorkInProgress.
    WorkInProgress,
    // This requires manually assignment.
    LongTermProject,
    // This requires manually assignment.
    Deprecated,
}

#[derive(Debug, Default, Serialize, Deserialize, Type, PartialEq, Eq)]
pub enum License {
    #[serde(rename = "CC_BY")]
    CcBy,
    #[serde(rename = "CC_BY_SA")]
    CcBySa,
    #[default]
    #[serde(rename = "CC_BY_NC")]
    CcByNc,
    #[serde(rename = "CC_BY_NC_SA")]
    CcByNcSa,
    #[serde(rename = "CC_BY_ND")]
    CcByNd,
    #[serde(rename = "CC_BY_NC_ND")]
    CcByNcNd,
    #[serde(rename = "CC0")]
    Cc0,
    Repost,
}

#[derive(Debug, Serialize, FromRow)]
#[serde(rename_all = "camelCase")]
pub struct TagData {
    pub id: u32,
    pub name: String,
    pub amount: u32,
}

#[derive(Debug, Default, Serialize, FromRow)]
#[serde(rename_all = "camelCase")]
pub struct IslandMeta {
    pub id: u32,
    pub title: String,
    pub subtitle: Option<String>,
    pub desc: Option<String>,
    pub date: Option<DateTime<FixedOffset>>,
    pub ty: IslandType,
    pub state: IslandState,
    pub banner: bool,
    pub license: License,
    pub is_encrypted: bool,
    pub is_deleted: bool,
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
    pub license: License,
    pub state: IslandState,
    pub banner: bool,
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
            license: meta.license,
            state: meta.state,
            banner: meta.banner,
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
