use futures::{future::join_all, join};
use sqlx::{sqlite::SqliteQueryResult, Error, SqlitePool};

use crate::{
    filter::{AdvancedFilter, TagsFilter},
    model::{
        IslandCount, IslandFilename, IslandMeta, IslandMetaTagged, MemorizeForm, MemorizeFormMeta,
        TagData,
    },
};

#[derive(Clone)]
pub struct IslandDB {
    pub db: SqlitePool,
}

#[derive(Clone)]
pub struct MemorizeDB {
    pub db: SqlitePool,
}

pub async fn query_all_tags(pool: &IslandDB) -> Result<Vec<TagData>, Error> {
    Ok(sqlx::query_as("SELECT id, name, amount FROM tags")
        .fetch_all(&pool.db)
        .await?)
}

pub async fn query_island_count(pool: &IslandDB) -> Result<IslandCount, Error> {
    Ok(sqlx::query_as("SELECT COUNT(*) as count FROM islands")
        .fetch_one(&pool.db)
        .await?)
}

pub async fn query_island_count_filtered(
    pool: &IslandDB,
    tags_filter: i32,
    advanced_filter: i32,
) -> Result<IslandCount, Error> {
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

    Ok(query.fetch_one(&pool.db).await?)
}

pub async fn query_island_meta(pool: &IslandDB, id: u32) -> Result<IslandMetaTagged, Error> {
    let (meta, tags) = join!(
        sqlx::query_as(
            "SELECT id, title, subtitle, desc, ty, date, banner, is_original, is_encrypted, is_deleted FROM islands
            WHERE id = ?"
        )
        .bind(id)
        .fetch_one(&pool.db),
        query_island_tags(pool, id)
    );

    Ok(IslandMetaTagged::new(meta?, tags?))
}

pub async fn query_islands_meta(
    pool: &IslandDB,
    page: u32,
    length: u32,
) -> Result<Vec<IslandMetaTagged>, Error> {
    let total = query_island_count(pool).await?.count;

    if page * length > total {
        return Ok(Vec::new());
    }

    let end = total - page * length;
    let start = total
        .checked_sub((page + 1) * length - 1)
        .unwrap_or_default();

    let metas = sqlx::query_as(
        "
            SELECT id, title, subtitle, desc, ty, date, banner, is_original, is_encrypted, is_deleted FROM islands
            JOIN island_tags ON id = island_id
            WHERE id BETWEEN ? AND ?
            GROUP BY id
        ",
    )
    .bind(start)
    .bind(end)
    .fetch_all(&pool.db)
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
            acc.push(IslandMetaTagged::new(meta, tags));
            Ok(acc)
        }
        Err(err) => Err(err),
    })
}

pub async fn query_islands_meta_filtered(
    pool: &IslandDB,
    page: u32,
    length: u32,
    tags_filter: i32,
    advanced_filter: i32,
) -> Result<Vec<IslandMetaTagged>, Error> {
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
                        banner,
                        is_original,
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
                    banner,
                    is_original,
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
                        banner,
                        is_original,
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
                    banner,
                    is_original,
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

    let metas: Vec<IslandMeta> = query.fetch_all(&pool.db).await?;
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

async fn query_island_tags(pool: &IslandDB, id: u32) -> Result<Vec<TagData>, Error> {
    Ok(sqlx::query_as(
        "
            SELECT id, name, amount FROM tags
            JOIN island_tags ON tags.id = tag_id
            WHERE island_id = ?
        ",
    )
    .bind(id)
    .fetch_all(&pool.db)
    .await?)
}

pub async fn query_island_filename(pool: &IslandDB, id: u32) -> Result<IslandFilename, Error> {
    Ok(sqlx::query_as("SELECT filename FROM islands WHERE id = ?")
        .bind(id)
        .fetch_one(&pool.db)
        .await?)
}

pub async fn insert_memorize_form(
    pool: &MemorizeDB,
    form: &MemorizeForm,
    meta: &MemorizeFormMeta,
) -> Result<SqliteQueryResult, Error> {
    sqlx::query(
        "INSERT INTO memorize (stu_id, name, wechat, qq, phone, email, desc, hobby, position, ftr_major, message)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        "
        )
        .bind(&form.stu_id)
        .bind(&form.name)
        .bind(&form.wechat)
        .bind(&form.qq)
        .bind(&form.phone)
        .bind(&form.email)
        .bind(&form.desc)
        .bind(&form.hobby)
        .bind(&form.position)
        .bind(&form.ftr_major)
        .bind(&form.message)
        .execute(&pool.db)
        .await?;

    sqlx::query("INSERT INTO memorize_meta (time, ip) VALUES (?, ?)")
        .bind(&meta.time)
        .bind(&meta.ip)
        .execute(&pool.db)
        .await
}

pub async fn query_all_memorize(
    pool: &MemorizeDB,
) -> Result<Vec<(MemorizeForm, MemorizeFormMeta)>, Error> {
    let form: Vec<MemorizeForm> = sqlx::query_as(
        "SELECT stu_id, name, wechat, qq, phone, email, desc, hobby, position, ftr_major, message
        FROM memorize
        ",
    )
    .fetch_all(&pool.db)
    .await?;

    let meta: Vec<MemorizeFormMeta> = sqlx::query_as("SELECT ip, time FROM memorize_meta")
        .fetch_all(&pool.db)
        .await?;

    Ok(form.into_iter().zip(meta).collect())
}
