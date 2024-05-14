use futures::{future::join_all, join};
use sqlx::{Error, SqlitePool};

use crate::model::{IslandCount, IslandFilename, IslandMeta, IslandMetaTagged, TagData};

pub async fn query_all_tags(pool: &SqlitePool) -> Result<Vec<TagData>, Error> {
    Ok(sqlx::query_as("SELECT id, name, amount FROM tags")
        .fetch_all(pool)
        .await?)
}

pub async fn query_island_count(pool: &SqlitePool) -> Result<IslandCount, Error> {
    Ok(sqlx::query_as("SELECT COUNT(*) as count FROM islands")
        .fetch_one(pool)
        .await?)
}

pub async fn query_island_meta(pool: &SqlitePool, id: u32) -> Result<IslandMetaTagged, Error> {
    let (meta, tags) = join!(
        sqlx::query_as(
            "SELECT id, title, desc, ty, date, banner, wip FROM islands WHERE id = ?"
        )
        .bind(id)
        .fetch_one(pool),
        query_island_tags(pool, id)
    );

    Ok(IslandMetaTagged::new(meta?, tags?))
}

pub async fn query_islands_meta(
    pool: &SqlitePool,
    start: u32,
    length: u32,
) -> Result<Vec<IslandMetaTagged>, Error> {
    let metas = sqlx::query_as(
        "
            SELECT id, title, desc, ty, date, banner, wip FROM islands
            LEFT JOIN island_tags ON id = island_id
            WHERE id BETWEEN ? AND ?
            GROUP BY id
        ",
    )
    .bind(start)
    .bind(start + length - 1)
    .fetch_all(pool)
    .await?;

    join_all(
        (start..start + length)
            .into_iter()
            .map(|id| query_island_tags(pool, id)),
    )
    .await
    .into_iter()
    .zip(metas)
    .try_fold(Vec::new(), |mut acc, (tags, meta)| match tags {
        Ok(tags) => {
            acc.push(IslandMetaTagged::new(meta, tags));
            Ok(acc)
        }
        Err(err) => Err(err),
    })
}

pub async fn query_islands_meta_filtered(
    pool: &SqlitePool,
    start: u32,
    length: u32,
    tags_filter: u32,
) -> Result<Vec<IslandMetaTagged>, Error> {
    let is_exclude_mode = (tags_filter & (1 << 31)) != 0;
    let filter_ids = (0..30)
        .into_iter()
        .filter_map(|bit| {
            if (tags_filter & (1 << bit)) != 0 {
                Some(bit)
            } else {
                None
            }
        })
        .collect::<Vec<_>>();

    let filter_conditions = filter_ids
        .iter()
        .map(|_| "?")
        .collect::<Vec<_>>()
        .join(", ");

    let sql = {
        if is_exclude_mode {
            format!(
                "
                    SELECT id, title, desc, ty, date, banner, wip FROM islands
                    WHERE id BETWEEN ? AND ?
                    AND NOT EXISTS (
                        SELECT 1
                        FROM island_tags
                        WHERE island_id = id
                        AND tag_id IN ({})
                    )
                ",
                &filter_conditions,
            )
        } else {
            format!(
                "
                    SELECT id, title, desc, ty, date, banner, wip FROM islands
                    LEFT OUTER JOIN island_tags ON id = island_id
                    WHERE id BETWEEN ? AND ?
                    AND tag_id IN ({})
                    GROUP BY id
                    HAVING COUNT(tag_id) = {}
                ",
                &filter_conditions,
                filter_ids.len()
            )
        }
    };

    let mut query = sqlx::query_as(&sql).bind(start).bind(start + length - 1);

    for tag_id in filter_ids {
        query = query.bind(tag_id);
    }

    let metas: Vec<IslandMeta> = query.fetch_all(pool).await?;
    join_all(metas.iter().map(|meta| query_island_tags(pool, meta.id)))
        .await
        .into_iter()
        .zip(metas)
        .try_fold(Vec::new(), |mut acc, (tags, meta)| match tags {
            Ok(tags) => {
                acc.push(IslandMetaTagged::new(meta, tags));
                Ok(acc)
            }
            Err(err) => Err(err),
        })
}

async fn query_island_tags(pool: &SqlitePool, id: u32) -> Result<Vec<TagData>, Error> {
    Ok(sqlx::query_as(
        "
            SELECT id, name, amount FROM tags
            JOIN island_tags ON tags.id = tag_id
            WHERE island_id = ?
        ",
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
