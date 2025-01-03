use chrono::{DateTime, FixedOffset};
use serde::{Deserialize, Serialize};
use serde_repr::Serialize_repr;
use sqlx::{prelude::Type, FromRow, Row};

use crate::islands::IslandMapQuery;

#[derive(Debug, Serialize_repr, Type, PartialEq, Eq)]
#[repr(u32)]
pub enum IslandType {
    Article,
    Achievement,
    Note,
}

impl IslandType {
    pub fn from_str(s: &str) -> Option<Self> {
        match s {
            "Article" => Some(Self::Article),
            "Achievement" => Some(Self::Achievement),
            "Note" => Some(Self::Note),
            _ => None,
        }
    }
}

#[derive(Debug, Serialize, FromRow)]
pub struct TagData {
    pub id: u32,
    pub name: String,
    pub amount: u32,
}

#[derive(Debug, Serialize, FromRow)]
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

#[derive(Debug, Serialize)]
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
pub struct Island {
    pub id: u32,
    pub content: String,
}

#[derive(Debug, Serialize, FromRow)]
pub struct IslandCount {
    pub count: u32,
}

#[derive(Debug, Serialize)]
pub struct IslandSearchResults {
    pub results: Vec<IslandSearchResult>,
}

#[derive(Debug, Serialize)]
pub struct IslandSearchResult {
    pub score: f32,
    pub id: u32,
    pub preview: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct MemorizeForm {
    pub stu_id: String,
    pub name: String,

    pub wechat: String,
    pub qq: String,
    pub phone: String,
    pub email: String,

    pub desc: String,
    pub hobby: String,
    pub position: String,
    pub ftr_major: String,

    pub message: String,
    pub ip: String,
}

impl<'a, R: Row> FromRow<'a, R> for MemorizeForm
where
    &'a std::primitive::str: sqlx::ColumnIndex<R>,
    String: Type<<R as Row>::Database>,
    String: sqlx::Decode<'a, <R as Row>::Database>,
    u32: Type<<R as Row>::Database>,
    u32: sqlx::Decode<'a, <R as Row>::Database>,
{
    fn from_row(row: &'a R) -> Result<Self, sqlx::Error> {
        Ok(Self {
            stu_id: row.try_get::<u32, _>("stu_id")?.to_string(),
            name: row.try_get("name")?,
            wechat: row.try_get("wechat")?,
            qq: row.try_get("qq")?,
            phone: row.try_get("phone")?,
            email: row.try_get("email")?,
            desc: row.try_get("desc")?,
            hobby: row.try_get("hobby")?,
            position: row.try_get("position")?,
            ftr_major: row.try_get("ftr_major")?,
            message: row.try_get("message")?,
            ip: String::new(),
        })
    }
}

#[derive(Debug, Serialize, FromRow)]
pub struct MemorizeFormMeta {
    pub time: String,
    pub ip: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Project {
    pub owner: String,
    pub name: String,
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
    pub island_centers: Vec<[f32; 2]>,
}
