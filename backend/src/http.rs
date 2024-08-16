use std::{convert::Infallible, fmt::Debug, sync::Mutex};

use actix_web::{
    get,
    http::{
        header::{ContentDisposition, ContentType},
        StatusCode,
    },
    post,
    web::{Data, Json, Path},
    HttpResponse, Responder,
};
use async_stream::stream;
use chrono::{SecondsFormat, Timelike, Utc};
use once_cell::sync::Lazy;
use serde::Serialize;

use crate::{
    fs::{load_island, load_link_exchange_list, load_projects_list},
    memorize::{self, MemorizeCoolDown, MemorizeValidator},
    model::{MemorizeForm, MemorizeFormMeta},
    sql::*,
};

static COOL_DOWN: Mutex<Lazy<MemorizeCoolDown>> =
    Mutex::new(Lazy::new(|| MemorizeCoolDown::default()));

macro_rules! sql_query_request {
    ($query: ident, $($param: expr),+) => {
        match $query($($param,)+).await {
            Ok(ok) => HttpResponse::Ok().json(ok),
            Err(err) => HttpResponse::BadRequest().json(err.to_string()),
        }
    };
}

macro_rules! sql_query_attempt {
    ($query: ident, $($param: expr),+) => {
        match $query($($param,)+).await {
            Ok(ok) => ok,
            Err(err) => return HttpResponse::BadRequest().json(err.to_string()),
        }
    };
}

#[get("/api/get/allTags")]
pub async fn get_all_tags(pool: Data<IslandDB>) -> impl Responder {
    sql_query_request!(query_all_tags, &pool)
}

#[get("/api/get/islandCount/{tagsFilter}/{advancedFilter}")]
pub async fn get_island_count(pool: Data<IslandDB>, params: Path<(i32, i32)>) -> impl Responder {
    if *params == (0, 0) {
        sql_query_request!(query_island_count, &pool)
    } else {
        sql_query_request!(query_island_count_filtered, &pool, params.0, params.1)
    }
}

#[get("/api/get/islandMeta/{id}")]
pub async fn get_island_meta(pool: Data<IslandDB>, id: Path<u32>) -> impl Responder {
    sql_query_request!(query_island_meta, &pool, *id)
}

#[get("/api/get/islandsMeta/{page}/{length}/{tagsFilter}/{advancedFilter}")]
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
    let filename = sql_query_attempt!(query_island_filename, &pool, *id);

    result_to_response(load_island(*id, &filename))
}

#[get("/api/get/linkExchange")]
pub async fn get_link_exchange_list() -> impl Responder {
    HttpResponse::Ok().json(load_link_exchange_list())
}

#[get("/api/get/projects")]
pub async fn get_projects_list() -> impl Responder {
    HttpResponse::Ok().json(load_projects_list())
}

#[post("/api/post/memorize")]
pub async fn submit_memorize(
    pool: Data<MemorizeDB>,
    form: Json<MemorizeForm>,
    validator: Data<MemorizeValidator>,
) -> (impl Responder, StatusCode) {
    let meta = MemorizeFormMeta {
        time: Utc::now().to_rfc3339_opts(SecondsFormat::Millis, true),
        ip: form.ip.clone(),
    };

    let Ok(mut cool_down) = COOL_DOWN.lock() else {
        return (
            HttpResponse::Ok().json("有其他人正在提交，请稍后再试。"),
            StatusCode::BAD_REQUEST,
        );
    };

    let cd = cool_down.get(&meta.ip);
    log::info!("{:?} {:?} {}", &form, &meta, cd);

    if cd < 600 {
        return (
            HttpResponse::Ok().json(format!(
                "请不要在10分钟内多次提交。{} {}",
                meta.ip,
                600 - cd
            )),
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
                HttpResponse::Ok().json(format!("成功记录 {} {} {}", meta.time, meta.ip, cd)),
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

fn result_to_response<T: Serialize, E: Debug>(result: Result<T, E>) -> HttpResponse {
    match result {
        Ok(ok) => HttpResponse::Ok().json(ok),
        Err(err) => HttpResponse::BadRequest().json(format!("{:?}", err)),
    }
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
