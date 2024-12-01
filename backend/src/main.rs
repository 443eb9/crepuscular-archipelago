use actix_cors::Cors;
use actix_web::{middleware::Logger, web::Data, App, HttpServer};
use sqlx::SqlitePool;

use crate::{
    search::FullTextSearchEngine,
    sql::{IslandDB, MemorizeDB},
};

mod env;
mod filter;
mod fs;
mod http;
mod memorize;
mod model;
mod search;
mod sql;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    env_logger::init_from_env(env_logger::Env::new().default_filter_or("info"));
    dotenvy::dotenv().ok();

    let islands_db = IslandDB {
        db: fs::init_cache().await,
    };

    let storage_root = std::env::var("ISLAND_STORAGE_ROOT").unwrap();
    let memorize_db = MemorizeDB {
        db: SqlitePool::connect(&format!("sqlite://{}/memorize.sqlite3", storage_root))
            .await
            .unwrap(),
    };

    let search_engine = FullTextSearchEngine::new(&islands_db.db).await;

    HttpServer::new(move || {
        App::new()
            .app_data(Data::new(islands_db.clone()))
            .app_data(Data::new(memorize_db.clone()))
            .app_data(Data::new(search_engine.clone()))
            .wrap(Logger::default())
            .wrap(Cors::permissive())
            .service(http::get_all_tags)
            .service(http::get_island_count)
            .service(http::get_island_meta)
            .service(http::get_islands_meta)
            .service(http::get_island)
            .service(http::get_projects_list)
            .service(http::search_islands)
            .service(http::submit_memorize)
            .service(http::download_memorize_db)
            .service(http::download_memorize_csv)
            .service(http::error_test)
    })
    .bind(("localhost", 8080))?
    .run()
    .await
}
