use futures::{future::join_all, join};
use sqlx::{Result, SqlitePool};

use crate::{
    filter::{AdvancedFilter, TagsFilter},
    models::{Foam, FoamCount, Island, IslandCount, IslandMeta, IslandMetaTagged, TagData},
};

pub async fn query_all_tags(pool: &SqlitePool) -> Result<Vec<TagData>> {
    Ok(sqlx::query_as("SELECT id, name, amount FROM tags")
        .fetch_all(pool)
        .await?)
}

pub async fn query_island_content(pool: &SqlitePool, id: u32) -> Result<Island> {
    sqlx::query_as("SELECT id, content FROM islands WHERE id = ?")
        .bind(id)
        .fetch_one(pool)
        .await
}

pub async fn query_island_count(pool: &SqlitePool) -> Result<IslandCount> {
    Ok(sqlx::query_as("SELECT COUNT(*) as count FROM islands")
        .fetch_one(pool)
        .await?)
}

pub async fn query_island_count_filtered(
    pool: &SqlitePool,
    tags_filter: i32,
    advanced_filter: i32,
) -> Result<IslandCount> {
    let tags_filter = TagsFilter::new(tags_filter);
    let advanced_filter = AdvancedFilter::new(advanced_filter);

    if tags_filter.filtered_ids.is_empty() {
        return query_island_count(pool).await;
    }

    let and_restriction = {
        if advanced_filter.is_or_not_and {
            String::default()
        } else {
            format!(
                "
                HAVING COUNT(tag_id) = {}
                ",
                tags_filter.filtered_ids.len()
            )
        }
    };

    let sql = {
        if advanced_filter.is_exclude {
            format!(
                "
                SELECT COUNT(*) AS count FROM islands
                WHERE NOT EXISTS (
                    SELECT id, tag_id
                    FROM island_tags
                    WHERE island_id = id
                    AND tag_id IN ({})
                    GROUP BY island_id
                    {}
                )
                ",
                &tags_filter.sql_conditions, and_restriction
            )
        } else {
            format!(
                "
                WITH Filtered AS (
                    SELECT id FROM islands
                    JOIN island_tags ON id = island_id
                    AND tag_id IN ({})
                    GROUP BY island_id
                    {}
                )
                SELECT COUNT(*) as count FROM Filtered
                ",
                &tags_filter.sql_conditions, and_restriction
            )
        }
    };

    let mut query = sqlx::query_as(&sql);

    for tag_id in tags_filter.filtered_ids {
        query = query.bind(tag_id);
    }

    Ok(query.fetch_one(pool).await?)
}

pub async fn query_island_meta(pool: &SqlitePool, id: u32) -> Result<IslandMetaTagged> {
    let (meta, tags) = join!(
        sqlx::query_as::<_,IslandMeta>(
            "SELECT id, title, subtitle, desc, ty, date, license, state, banner, is_encrypted, is_deleted FROM islands
            WHERE id = ?"
        )
        .bind(id)
        .fetch_one(pool),
        query_island_tags(pool, id)
    );

    Ok(IslandMetaTagged::new(meta?.apply_deleted(), tags?))
}

pub async fn query_islands_meta(
    pool: &SqlitePool,
    page: u32,
    length: u32,
) -> Result<Vec<IslandMetaTagged>> {
    let total = query_island_count(pool).await?.count;

    if page * length > total {
        return Ok(Vec::new());
    }

    let end = total - page * length;
    let start = total
        .checked_sub((page + 1) * length - 1)
        .unwrap_or_default();

    let metas = sqlx::query_as::<_,IslandMeta>(
        "
            SELECT id, title, subtitle, desc, ty, date, license, state, banner, is_encrypted, is_deleted FROM islands
            JOIN island_tags ON id = island_id
            WHERE id BETWEEN ? AND ?
            GROUP BY id
        ",
    )
    .bind(start)
    .bind(end)
    .fetch_all(pool)
    .await?;

    join_all(
        (start..=end)
            .into_iter()
            .map(|id| query_island_tags(pool, id)),
    )
    .await
    .into_iter()
    .zip(metas)
    .try_fold(Vec::new(), |mut acc, (tags, meta)| match tags {
        Ok(tags) => {
            acc.push(IslandMetaTagged::new(meta.apply_deleted(), tags));
            Ok(acc)
        }
        Err(err) => Err(err),
    })
}

pub async fn query_islands_meta_filtered(
    pool: &SqlitePool,
    page: u32,
    length: u32,
    tags_filter: i32,
    advanced_filter: i32,
) -> Result<Vec<IslandMetaTagged>> {
    let total = query_island_count_filtered(pool, tags_filter, advanced_filter)
        .await?
        .count;

    if page * length > total {
        return Ok(Vec::new());
    }

    let end = total - page * length;
    let start = total
        .checked_sub((page + 1) * length - 1)
        .unwrap_or_default();

    let tags_filter = TagsFilter::new(tags_filter);
    let advanced_filter = AdvancedFilter::new(advanced_filter);

    if tags_filter.filtered_ids.is_empty() {
        return query_islands_meta(pool, page, length).await;
    }

    let and_restriction = {
        if advanced_filter.is_or_not_and {
            String::default()
        } else {
            format!(
                "
                HAVING COUNT(tag_id) = {}
                ",
                tags_filter.filtered_ids.len()
            )
        }
    };

    let sql = {
        if advanced_filter.is_exclude {
            format!(
                "
                WITH FilteredIslands AS (
                    SELECT
                        id,
                        title,
                        subtitle,
                        desc,
                        ty,
                        date,
                        license,
                        state,
                        banner,
                        is_encrypted,
                        is_deleted,
                        ROW_NUMBER() OVER (ORDER BY id) AS rn
                    FROM islands
                    WHERE NOT EXISTS (
                        SELECT island_id, tag_id
                        FROM island_tags
                        WHERE island_id = islands.id
                        AND tag_id IN ({})
                        GROUP BY island_id
                        {}
                    )
                )
                SELECT
                    id,
                    title,
                    subtitle,
                    desc,
                    ty,
                    date,
                    license,
                    state,
                    banner,
                    is_encrypted,
                    is_deleted
                FROM FilteredIslands
                WHERE rn BETWEEN ? AND ?
                ",
                &tags_filter.sql_conditions, and_restriction
            )
        } else {
            format!(
                "
                WITH FilteredIslands AS (
                    SELECT
                        id,
                        title,
                        subtitle,
                        desc,
                        ty,
                        date,
                        license,
                        state,
                        banner,
                        is_encrypted,
                        is_deleted,
                        ROW_NUMBER() OVER (ORDER BY id) AS rn
                    FROM islands
                    JOIN island_tags ON id = island_id
                    AND tag_id IN ({})
                    GROUP BY island_id
                    {}
                )
                SELECT
                    id,
                    title,
                    subtitle,
                    desc,
                    ty,
                    date,
                    license,
                    state,
                    banner,
                    is_encrypted,
                    is_deleted
                FROM FilteredIslands
                WHERE rn BETWEEN ? AND ?
                GROUP BY id
                ",
                &tags_filter.sql_conditions, and_restriction
            )
        }
    };

    let mut query = sqlx::query_as(&sql);

    for tag_id in tags_filter.filtered_ids {
        query = query.bind(tag_id);
    }

    query = query.bind(start).bind(end);

    let metas: Vec<IslandMeta> = query.fetch_all(pool).await?;
    join_all(metas.iter().map(|meta| query_island_tags(pool, meta.id)))
        .await
        .into_iter()
        .zip(metas)
        .try_fold(Vec::new(), |mut acc, (tags, meta)| match tags {
            Ok(tags) => {
                acc.push(IslandMetaTagged::new(meta.apply_deleted(), tags));
                Ok(acc)
            }
            Err(err) => Err(err),
        })
}

async fn query_island_tags(pool: &SqlitePool, id: u32) -> Result<Vec<TagData>> {
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

pub async fn query_foams_count(pool: &SqlitePool) -> Result<FoamCount> {
    Ok(sqlx::query_as("SELECT COUNT(*) as count FROM foams")
        .fetch_one(pool)
        .await?)
}

pub async fn query_foams(pool: &SqlitePool, page: u32, length: u32) -> Result<Vec<Foam>> {
    let total = query_foams_count(pool).await?.count;
    let end = total - page * length;
    let start = total
        .checked_sub((page + 1) * length - 1)
        .unwrap_or_default();
    sqlx::query_as(
        "
            SELECT id, content, date, is_encrypted FROM foams
            WHERE id BETWEEN ? AND ?
        ",
    )
    .bind(start)
    .bind(end)
    .fetch_all(pool)
    .await
}
