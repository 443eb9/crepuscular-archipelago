use sqlx::{Error, SqlitePool};

use crate::model::{IslandMeta, IslandTag};

pub async fn query_all_tags(pool: &SqlitePool) -> Result<Vec<IslandTag>, Error> {
    Ok(sqlx::query_as("SELECT * FROM main.tags")
        .fetch_all(pool)
        .await?)
}

pub async fn query_islands_meta(
    pool: &SqlitePool,
    start: u32,
    length: u32,
) -> Result<Vec<IslandMeta>, Error> {
    Ok(
        sqlx::query_as("SELECT * FROM main.meta WHERE id BETWEEN ? AND ?")
            .bind(start)
            .bind(start + length - 1)
            .fetch_all(pool)
            .await?,
    )
}
