use chrono::{DateTime, Utc};
use serde::Serialize;
use sqlx::FromRow;

#[derive(Debug, Serialize, FromRow)]
pub struct IslandTag {
    pub id: u32,
    pub name: String,
    pub amount: u32,
}

#[derive(Debug, Serialize, FromRow)]
pub struct IslandMeta {
    pub id: u32,
    pub title: String,
    pub desc: String,
    pub tags: String,
    pub date: DateTime<Utc>,
    pub ty: u32,
}
