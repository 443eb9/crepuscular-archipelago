use std::{convert::Infallible, sync::Mutex};

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

use crate::{
    fs::load_projects_list,
    memorize::{self, MemorizeCoolDown},
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
    sql_query_request!(query_island_content, &pool, *id)
}

#[get("/api/get/projects")]
pub async fn get_projects_list() -> impl Responder {
    HttpResponse::Ok().json(load_projects_list())
}

#[post("/api/post/memorize")]
pub async fn submit_memorize(
    pool: Data<MemorizeDB>,
    form: Json<MemorizeForm>,
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

    if form.stu_id.parse::<u32>().is_err() {
        return (
            HttpResponse::BadRequest().json("无效学号"),
            StatusCode::BAD_REQUEST,
        );
    };

    if form.wechat.is_empty()
        && form.qq.is_empty()
        && form.phone.is_empty()
        && form.email.is_empty()
    {
        return (
            HttpResponse::BadRequest().json("请至少留一种联系方式"),
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
