use std::{convert::Infallible, sync::Mutex};

use actix_web::{
    get,
    http::{
        header::{ContentDisposition, ContentType},
        StatusCode,
    },
    post,
    web::{Data, Json, Path},
    HttpRequest, HttpResponse, Responder,
};
use async_stream::stream;
use chrono::{SecondsFormat, Utc};

use crate::{
    fs::load_island,
    memorize::{self, MemorizeCoolDown, MemorizeValidator},
    model::{MemorizeForm, MemorizeFormMeta},
    sql::*,
};

#[get("/api/get/allTags")]
pub async fn get_all_tags(pool: Data<IslandDB>) -> impl Responder {
    match query_all_tags(&pool).await {
        Ok(tags) => HttpResponse::Ok().json(tags),
        Err(err) => HttpResponse::BadRequest().json(err.to_string()),
    }
}

#[get("/api/get/islandCount")]
pub async fn get_island_count(pool: Data<IslandDB>) -> impl Responder {
    match query_island_count(&pool).await {
        Ok(tags) => HttpResponse::Ok().json(tags),
        Err(err) => HttpResponse::BadRequest().json(err.to_string()),
    }
}

#[get("/api/get/islandMeta/{id}")]
pub async fn get_island_meta(pool: Data<IslandDB>, id: Path<u32>) -> impl Responder {
    match query_island_meta(&pool, *id).await {
        Ok(meta) => HttpResponse::Ok().json(meta),
        Err(err) => HttpResponse::BadRequest().json(err.to_string()),
    }
}

#[get("/api/get/islandsMeta/{start}/{length}/{tagsFilter}")]
pub async fn get_islands_meta(
    pool: Data<IslandDB>,
    params: Path<(u32, u32, i32)>,
) -> impl Responder {
    if params.2 == 0 {
        match query_islands_meta(&pool, params.0, params.1).await {
            Ok(meta) => HttpResponse::Ok().json(meta),
            Err(err) => HttpResponse::BadRequest().json(err.to_string()),
        }
    } else {
        let actual_filter = unsafe { std::mem::transmute(params.2) };
        match query_islands_meta_filtered(&pool, params.0, params.1, actual_filter).await {
            Ok(meta) => HttpResponse::Ok().json(meta),
            Err(err) => HttpResponse::BadRequest().json(err.to_string()),
        }
    }
}

#[get("/api/get/island/{id}")]
pub async fn get_island(pool: Data<IslandDB>, id: Path<u32>) -> impl Responder {
    match query_island_filename(&pool, *id).await {
        Ok(filename) => match load_island(*id, &filename) {
            Ok(island) => HttpResponse::Ok().json(island),
            Err(err) => HttpResponse::BadRequest().json(err.to_string()),
        },
        Err(err) => HttpResponse::BadRequest().json(err.to_string()),
    }
}

#[post("/api/post/memorize")]
pub async fn submit_memorize(
    req: HttpRequest,
    pool: Data<MemorizeDB>,
    form: Json<MemorizeForm>,
    validator: Data<MemorizeValidator>,
    cool_down: Data<Mutex<MemorizeCoolDown>>,
) -> (impl Responder, StatusCode) {
    let meta = MemorizeFormMeta {
        time: Utc::now().to_rfc3339_opts(SecondsFormat::Millis, true),
        ip: req
            .peer_addr()
            .map(|a| a.ip().to_string())
            .unwrap_or_default(),
    };

    let Ok(mut cool_down) = cool_down.lock() else {
        return (
            HttpResponse::Ok()
                .json("Someone else is submitting their form. Please wait a moment and try again."),
            StatusCode::BAD_REQUEST,
        );
    };

    if cool_down.is_cooling_down(&meta.ip) {
        return (
            HttpResponse::Ok().json("Please don't sent multiple requests in an hour."),
            StatusCode::BAD_REQUEST,
        );
    }

    if let Err(err) = validator.validate(&form) {
        return (
            HttpResponse::BadRequest().json(err),
            StatusCode::BAD_REQUEST,
        );
    }

    match insert_memorize_form(&pool, &form, &meta).await {
        Ok(_) => {
            cool_down.add(meta.ip.clone());
            (
                HttpResponse::Ok()
                    .json(format!("Successfully memorized. {} {}", meta.time, meta.ip)),
                StatusCode::OK,
            )
        }
        Err(err) => (
            HttpResponse::BadRequest().json(err.to_string()),
            StatusCode::BAD_REQUEST,
        ),
    }
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

#[get("/api/get/memorizeCsv")]
pub async fn download_memorize_csv(pool: Data<MemorizeDB>) -> impl Responder {
    let data = query_all_memorize(&pool).await.unwrap();
    let csv = memorize::generate_csv(data);
    HttpResponse::Ok()
        .content_type(ContentType::plaintext())
        .insert_header(ContentDisposition::attachment("memorize.csv"))
        .streaming(stream!(
            yield Ok::<_, Infallible>(actix_web::web::Bytes::from(csv.into_bytes()))
        ))
}
