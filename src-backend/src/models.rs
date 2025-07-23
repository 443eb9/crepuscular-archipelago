use bincode::{Decode, Encode};
use chrono::{DateTime, FixedOffset};
use serde::{Deserialize, Serialize};
use serde_repr::Deserialize_repr;
use sqlx::{FromRow, prelude::Type};

use crate::islands::IslandMapQuery;

#[derive(Debug, Default, Serialize, Deserialize, Type, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub enum IslandType {
    #[default]
    Article,
    Achievement,
    Note,
    External,
}

#[derive(Debug, Default, Serialize, Deserialize_repr, Type, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
#[repr(u32)]
pub enum IslandState {
    #[default]
    Finished,
    WorkInProgress,
    LongTermProject,
    Deprecated,
    Deleted,
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

#[derive(Debug, Serialize, FromRow)]
#[serde(rename_all = "camelCase")]
pub struct IslandMeta {
    pub id: u32,
    pub title: String,
    pub subtitle: Option<String>,
    pub desc: Option<String>,
    pub date: Option<DateTime<FixedOffset>>,
    pub background: bool,
    pub ty: IslandType,
    pub reference: Option<String>,
    pub state: IslandState,
    pub banner: bool,
    pub license: License,
}

#[derive(Debug, Default, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct IslandMetaTagged {
    pub id: u32,
    pub title: String,
    pub subtitle: Option<String>,
    pub desc: Option<String>,
    pub date: Option<DateTime<FixedOffset>>,
    pub background: bool,
    pub ty: IslandType,
    pub reference: Option<String>,
    pub tags: Vec<TagData>,
    pub license: License,
    pub state: IslandState,
    pub banner: bool,
}

impl IslandMetaTagged {
    pub fn new(meta: IslandMeta, tags: Vec<TagData>) -> Self {
        Self {
            id: meta.id,
            title: meta.title,
            subtitle: meta.subtitle,
            desc: meta.desc,
            date: meta.date,
            background: meta.background,
            ty: meta.ty,
            reference: meta.reference,
            tags,
            license: meta.license,
            state: meta.state,
            banner: meta.banner,
        }
    }

    pub fn apply_deleted(self) -> Self {
        if self.state == IslandState::Deleted {
            Self {
                id: self.id,
                state: IslandState::Deleted,
                ..Default::default()
            }
        } else {
            self
        }
    }
}

#[derive(Debug, Serialize, Encode, Decode)]
#[serde(rename_all = "camelCase")]
pub struct Island {
    pub content: Vec<SubIsland>,
}

#[derive(Debug, Serialize, Encode, Decode)]
#[serde(rename_all = "camelCase")]
pub struct SubIsland {
    pub content: String,
    pub is_encrypted: bool,
}

#[derive(Debug, Serialize, FromRow)]
pub struct BinaryIsland {
    pub content: Vec<u8>,
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
