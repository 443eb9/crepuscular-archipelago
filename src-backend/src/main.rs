use std::sync::Mutex;

use actix_cors::Cors;
use actix_web::{middleware::Logger, web::Data, App, HttpServer};

use crate::{islands::IslandMaps, sql::IslandDB};

mod env;
mod filter;
mod fs;
mod http;
mod islands;
mod model;
mod sql;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    env_logger::init_from_env(env_logger::Env::new().default_filter_or("info"));

    let islands_db = IslandDB {
        db: fs::init_cache().await,
    };

    let island_map = IslandMaps::new(&islands_db);

    HttpServer::new(move || {
        App::new()
            .app_data(Data::new(islands_db.clone()))
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
            .service(http::download_memorize_db)
            .service(http::error_test)
    })
    .bind(("localhost", 8080))?
    .run()
    .await
}
