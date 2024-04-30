use actix_web::{
    get,
    web::{Data, Path},
    HttpResponse, Responder,
};
use sqlx::SqlitePool;

use crate::{fs::load_island, sql::*};

#[get("/api/get/allTags")]
pub async fn get_all_tags(pool: Data<SqlitePool>) -> impl Responder {
    match query_all_tags(&pool).await {
        Ok(tags) => HttpResponse::Ok().json(tags),
        Err(err) => HttpResponse::BadRequest().json(err.to_string()),
    }
}

#[get("/api/get/islandMeta/{id}")]
pub async fn get_island_meta(pool: Data<SqlitePool>, id: Path<u32>) -> impl Responder {
    match query_island_meta_tagged(&pool, *id).await {
        Ok(meta) => HttpResponse::Ok().json(meta),
        Err(err) => HttpResponse::BadRequest().json(err.to_string()),
    }
}

#[get("/api/get/islandsMeta/{start}/{length}/{tagsFilter}")]
pub async fn get_islands_meta(
    pool: Data<SqlitePool>,
    params: Path<(u32, u32, u32)>,
) -> impl Responder {
    match query_islands_meta_tagged(&pool, params.0, params.1, params.2).await {
        Ok(meta) => HttpResponse::Ok().json(meta),
        Err(err) => HttpResponse::BadRequest().json(err.to_string()),
    }
}

#[get("/api/get/island/{id}")]
pub async fn get_island(pool: Data<SqlitePool>, id: Path<u32>) -> impl Responder {
    match query_island_filename(&pool, *id).await {
        Ok(filename) => match load_island(&filename) {
            Ok(island) => HttpResponse::Ok().json(island),
            Err(err) => HttpResponse::BadRequest().json(err.to_string()),
        },
        Err(err) => HttpResponse::BadRequest().json(err.to_string()),
    }
}
