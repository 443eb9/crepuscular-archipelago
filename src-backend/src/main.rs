use std::sync::Mutex;

use actix_cors::Cors;
use actix_web::{middleware::Logger, web::Data, App, HttpServer};
use sqlx::SqlitePool;

use crate::{
    env::get_island_storage_root,
    islands::IslandMaps,
    sql::{IslandDB, MemorizeDB},
};

mod env;
mod filter;
mod fs;
mod http;
mod islands;
mod memorize;
mod model;
mod sql;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    env_logger::init_from_env(env_logger::Env::new().default_filter_or("info"));
    dotenvy::dotenv().ok();

    let islands_db = IslandDB {
        db: fs::init_cache().await,
    };

    let memorize_db = MemorizeDB {
        db: SqlitePool::connect(&format!(
            "sqlite://{}/memorize.sqlite3",
            get_island_storage_root().to_str().unwrap()
        ))
        .await
        .unwrap(),
    };

    let island_map = IslandMaps::new(&islands_db);

    HttpServer::new(move || {
        App::new()
            .app_data(Data::new(islands_db.clone()))
            .app_data(Data::new(memorize_db.clone()))
            .app_data(Data::new(Mutex::new(island_map.clone())))
            .wrap(Logger::default())
            .wrap(Cors::permissive())
            .service(http::get_all_tags)
            .service(http::get_island_count)
            .service(http::get_island_meta)
            .service(http::get_islands_meta)
            .service(http::get_island)
            .service(http::get_island_map_meta)
            .service(http::get_island_map_noise_texture)
            .service(http::get_island_map_centers)
            .service(http::get_island_at)
            .service(http::submit_memorize)
            .service(http::download_memorize_db)
            .service(http::download_memorize_csv)
            .service(http::error_test)
    })
    .bind(("localhost", 8080))?
    .run()
    .await
}
