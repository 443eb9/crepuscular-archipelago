use futures::{future::join_all, join};
use sqlx::{Error, SqlitePool};

use crate::model::{IslandFilename, IslandMeta, IslandMetaTagged, Tag};

pub async fn query_all_tags(pool: &SqlitePool) -> Result<Vec<Tag>, Error> {
    Ok(sqlx::query_as("SELECT id, name, amount FROM tags")
        .fetch_all(pool)
        .await?)
}

pub async fn query_island_meta_tagged(
    pool: &SqlitePool,
    id: u32,
) -> Result<IslandMetaTagged, Error> {
    let (meta, tags) = join!(
        sqlx::query_as::<_, IslandMeta>(
            "SELECT id, title, desc, ty, date FROM islands WHERE id = ?"
        )
        .bind(id)
        .fetch_one(pool),
        query_island_tags(pool, id)
    );

    Ok(IslandMetaTagged::new(meta?, tags?))
}

pub async fn query_islands_meta_tagged(
    pool: &SqlitePool,
    start: u32,
    length: u32,
    mut tags_filter: u32,
) -> Result<Vec<IslandMetaTagged>, Error> {
    if tags_filter == 0 {
        tags_filter = !0;
    }

    let included_tag_ids = (0..32)
        .into_iter()
        .filter_map(|bit| {
            if (tags_filter & (1 << bit)) != 0 {
                Some(bit)
            } else {
                None
            }
        })
        .collect::<Vec<_>>();

    let included_tag_conditions = included_tag_ids
        .iter()
        .map(|_| "?")
        .collect::<Vec<_>>()
        .join(", ");

    let sql = format!(
        "
            SELECT id, title, desc, ty, date FROM islands
            LEFT OUTER JOIN island_tags ON islands.id = island_tags.island_id
            WHERE id BETWEEN ? AND ?
            AND island_tags.tag_id IN ({})
            GROUP BY islands.id
            HAVING COUNT(island_tags.tag_id) != 0
        ",
        &included_tag_conditions
    );

    let mut query = sqlx::query_as(&sql).bind(start).bind(start + length - 1);

    for tag_id in included_tag_ids {
        query = query.bind(tag_id);
    }

    let metas: Vec<IslandMeta> = query.fetch_all(pool).await?;
    join_all(metas.iter().map(|meta| query_island_tags(pool, meta.id)))
        .await
        .into_iter()
        .zip(metas.into_iter())
        .try_fold(Vec::new(), |mut acc, (tags, meta)| match tags {
            Ok(tags) => {
                acc.push(IslandMetaTagged::new(meta, tags));
                Ok(acc)
            }
            Err(err) => Err(err),
        })
}

async fn query_island_tags(pool: &SqlitePool, id: u32) -> Result<Vec<Tag>, Error> {
    Ok(sqlx::query_as(
        "
            SELECT id, name, amount FROM tags
            JOIN island_tags ON tags.id = island_tags.tag_id
            WHERE island_tags.island_id = ?
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
