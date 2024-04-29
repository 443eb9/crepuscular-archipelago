use actix_web::{
    get,
    web::{Data, Path},
    HttpResponse, Responder,
};
use sqlx::SqlitePool;

use crate::sql::{query_all_tags, query_islands_meta};

#[get("/api/get/allTags")]
pub async fn get_all_tags(pool: Data<SqlitePool>) -> impl Responder {
    match query_all_tags(&pool).await {
        Ok(tags) => HttpResponse::Ok().json(tags),
        Err(_) => todo!(),
    }
}

#[get("/api/get/islandsMeta/{start}/{length}")]
pub async fn get_islands_meta(pool: Data<SqlitePool>, params: Path<(u32, u32)>) -> impl Responder {
    match query_islands_meta(&pool, params.0, params.1).await {
        Ok(meta) => HttpResponse::Ok().json(meta),
        Err(_) => todo!(),
    }
}
