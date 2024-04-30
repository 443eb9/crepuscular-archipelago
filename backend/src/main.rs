use actix_cors::Cors;
use actix_web::{middleware::Logger, web::Data, App, HttpServer};
use sqlx::SqlitePool;

mod fs;
mod http;
mod model;
mod sql;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    env_logger::init_from_env(env_logger::Env::new().default_filter_or("info"));
    dotenvy::dotenv().ok();

    let storage_root = std::env::var("ISLAND_STORAGE_ROOT").unwrap();
    let db = SqlitePool::connect(&format!("sqlite://{}archipelago.sqlite3", storage_root))
        .await
        .unwrap();

    HttpServer::new(move || {
        App::new()
            .app_data(Data::new(db.clone()))
            .wrap(Logger::default())
            .wrap(Cors::permissive())
            .service(http::get_all_tags)
            .service(http::get_island_meta)
            .service(http::get_islands_meta)
            .service(http::get_island_tags)
            .service(http::get_islands_tags)
            .service(http::get_island)
    })
    .bind(("localhost", 8080))?
    .run()
    .await
}
