use futures::future::join_all;
use sqlx::{Error, SqlitePool};

use crate::model::{IslandFilename, IslandMeta, Tag};

pub async fn query_all_tags(pool: &SqlitePool) -> Result<Vec<Tag>, Error> {
    Ok(sqlx::query_as("SELECT id, name, amount FROM tags")
        .fetch_all(pool)
        .await?)
}

pub async fn query_island_meta(pool: &SqlitePool, id: u32) -> Result<IslandMeta, Error> {
    Ok(sqlx::query_as(
        "SELECT id, title, desc, ty, date FROM islands
            WHERE id = ?",
    )
    .bind(id)
    .fetch_one(pool)
    .await?)
}

pub async fn query_islands_meta(
    pool: &SqlitePool,
    start: u32,
    length: u32,
) -> Result<Vec<IslandMeta>, Error> {
    Ok(sqlx::query_as(
        "SELECT id, title, desc, ty, date FROM islands
        WHERE id BETWEEN ? AND ?",
    )
    .bind(start)
    .bind(start + length - 1)
    .fetch_all(pool)
    .await?)
}

pub async fn query_islands_tags(
    pool: &SqlitePool,
    start: u32,
    length: u32,
) -> Result<Vec<Vec<Tag>>, Error> {
    join_all(
        (start..start + length)
            .into_iter()
            .map(|id| query_island_tags(pool, id)),
    )
    .await
    .into_iter()
    .try_fold(Vec::new(), |mut acc, elem| match elem {
        Ok(ok) => {
            acc.push(ok);
            Ok(acc)
        }
        Err(err) => Err(err),
    })
}

pub async fn query_island_tags(pool: &SqlitePool, id: u32) -> Result<Vec<Tag>, Error> {
    Ok(sqlx::query_as(
        "SELECT id, name, amount FROM tags t
            JOIN island_tags mt ON t.id = mt.tag_id
            WHERE mt.island_id = ?",
    )
    .bind(id)
    .fetch_all(pool)
    .await?)
}

pub async fn query_island_filename(pool: &SqlitePool, id: u32) -> Result<IslandFilename, Error> {
    Ok(sqlx::query_as("SELECT filename FROM islands WHERE id = ?")
        .bind(id)
        .fetch_one(pool)
        .await?)
}
