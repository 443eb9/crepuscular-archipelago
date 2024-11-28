use actix_cors::Cors;
use actix_web::{middleware::Logger, web::Data, App, HttpServer};
use sqlx::{sqlite::SqliteConnectOptions, SqlitePool};

use crate::sql::{IslandDB, MemorizeDB};

mod env;
mod filter;
mod fs;
mod http;
mod memorize;
mod model;
mod sql;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    env_logger::init_from_env(env_logger::Env::new().default_filter_or("info"));
    dotenvy::dotenv().ok();

    let storage_root = std::env::var("ISLAND_STORAGE_ROOT").unwrap();

    let (islands, tags) = fs::load_all_islands();
    let conn_opt = SqliteConnectOptions::new()
        .filename(format!("{}/archipelago.sqlite3", storage_root))
        .create_if_missing(true);
    let islands_db = IslandDB {
        db: SqlitePool::connect_with(conn_opt).await.unwrap(),
    };
    fs::generate_db(&islands_db.db, islands, tags).await;

    let memorize_db = MemorizeDB {
        db: SqlitePool::connect(&format!("sqlite://{}/memorize.sqlite3", storage_root))
            .await
            .unwrap(),
    };

    HttpServer::new(move || {
        App::new()
            .app_data(Data::new(islands_db.clone()))
            .app_data(Data::new(memorize_db.clone()))
            .wrap(Logger::default())
            .wrap(Cors::permissive())
            .service(http::get_all_tags)
            .service(http::get_island_count)
            .service(http::get_island_meta)
            .service(http::get_islands_meta)
            .service(http::get_island)
            .service(http::get_projects_list)
            .service(http::submit_memorize)
            .service(http::download_memorize_db)
            .service(http::download_memorize_csv)
            .service(http::error_test)
    })
    .bind(("localhost", 8080))?
    .run()
    .await
}
