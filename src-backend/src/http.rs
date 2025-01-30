use std::{convert::Infallible, sync::Mutex};

use actix_web::{
    get,
    http::header::{ContentDisposition, ContentType},
    web::{Data, Path},
    HttpResponse, Responder,
};
use async_stream::stream;
use chrono::{Timelike, Utc};

use crate::{islands::IslandMaps, models::IslandMapQueryResponse, sql::*};

macro_rules! sql_query_request {
    ($query: ident, $($param: expr),+) => {
        match $query($($param,)+).await {
            Ok(ok) => HttpResponse::Ok().json(ok),
            Err(err) => HttpResponse::BadRequest().json(err.to_string()),
        }
    };
}

#[get("/api/get/allTags")]
pub async fn get_all_tags(pool: Data<IslandDB>) -> impl Responder {
    sql_query_request!(query_all_tags, &pool)
}

#[get("/api/get/island/count/{tagsFilter}/{advancedFilter}")]
pub async fn get_island_count(pool: Data<IslandDB>, params: Path<(i32, i32)>) -> impl Responder {
    if *params == (0, 0) {
        sql_query_request!(query_island_count, &pool)
    } else {
        sql_query_request!(query_island_count_filtered, &pool, params.0, params.1)
    }
}

#[get("/api/get/island/meta/{id}")]
pub async fn get_island_meta(pool: Data<IslandDB>, id: Path<u32>) -> impl Responder {
    sql_query_request!(query_island_meta, &pool, *id)
}

#[get("/api/get/island/metas/{page}/{length}/{tagsFilter}/{advancedFilter}")]
pub async fn get_islands_meta(
    pool: Data<IslandDB>,
    params: Path<(u32, u32, i32, i32)>,
) -> impl Responder {
    if params.2 == 0 && params.3 == 0 {
        sql_query_request!(query_islands_meta, &pool, params.0, params.1)
    } else {
        sql_query_request!(
            query_islands_meta_filtered,
            &pool,
            params.0,
            params.1,
            params.2,
            params.3
        )
    }
}

#[get("/api/get/island/{id}")]
pub async fn get_island(pool: Data<IslandDB>, id: Path<u32>) -> impl Responder {
    sql_query_request!(query_island_content, &pool, *id)
}

#[get("/api/get/map/{page}")]
pub async fn get_island_map_noise_texture(
    params: Path<u32>,
    island_map: Data<Mutex<IslandMaps>>,
) -> impl Responder {
    HttpResponse::Ok().content_type("image/png").body(
        island_map
            .lock()
            .unwrap()
            .get_cache(*params)
            .texture
            .to_vec(),
    )
}

#[get("/api/get/map/meta")]
pub async fn get_island_map_meta(island_map: Data<Mutex<IslandMaps>>) -> impl Responder {
    match island_map.lock() {
        Ok(map) => HttpResponse::Ok().json(map.get_map_meta()),
        Err(err) => HttpResponse::InternalServerError().json(err.to_string()),
    }
}

#[get("/api/get/map/{page}/centers")]
pub async fn get_island_map_centers(
    params: Path<u32>,
    island_map: Data<Mutex<IslandMaps>>,
) -> impl Responder {
    match island_map.lock() {
        Ok(map) => HttpResponse::Ok().json(map.get_cache(*params).region_centers.clone()),
        Err(err) => HttpResponse::InternalServerError().json(err.to_string()),
    }
}

#[get("/api/get/map/{page}/{x}/{y}")]
pub async fn get_island_at(
    params: Path<(u32, i32, i32)>,
    island_map: Data<Mutex<IslandMaps>>,
) -> impl Responder {
    match island_map.lock() {
        Ok(mut map) => {
            let (page, x, y) = *params;

            if x < 0 || y < 0 {
                return HttpResponse::Ok().json(IslandMapQueryResponse { result: None });
            }
            return HttpResponse::Ok().json(IslandMapQueryResponse {
                result: map.get_region_at(page, (x as usize, y as usize)),
            });
        }
        Err(err) => HttpResponse::InternalServerError().json(err.to_string()),
    }
}

#[get("/api/get/foam/count")]
pub async fn get_foams_count(pool: Data<IslandDB>) -> impl Responder {
    sql_query_request!(query_foams_count, &pool)
}

#[get("/api/get/foam/{page}/{len}")]
pub async fn get_foams(pool: Data<IslandDB>, params: Path<(u32, u32)>) -> impl Responder {
    sql_query_request!(query_foams, &pool, params.0, params.1)
}

#[get("/api/get/memorizeDb")]
pub async fn download_memorize_db() -> impl Responder {
    let root = std::env::var("ISLAND_STORAGE_ROOT").unwrap();
    let db = std::fs::read(format!("{}/memorize.sqlite3", root)).unwrap();
    HttpResponse::Ok()
        .content_type(ContentType::octet_stream())
        .insert_header(ContentDisposition::attachment("memorize.sqlite3"))
        .streaming(stream!(
            yield Ok::<_, Infallible>(actix_web::web::Bytes::from(db))
        ))
}

#[get("/api/get/errorTest")]
pub async fn error_test() -> impl Responder {
    let t = Utc::now().second();
    match t % 4 {
        0 => HttpResponse::BadRequest().json("BadRequest error test."),
        1 => HttpResponse::NotFound().json("NotFound error test."),
        2 => HttpResponse::Forbidden().json("Forbidden error test."),
        3 => HttpResponse::BadGateway().json("BadGateway error test."),
        _ => unreachable!(),
    }
}
