use std::sync::Mutex;

use actix_cors::Cors;
use actix_web::{middleware::Logger, web::Data, App, HttpServer};

mod env;
mod filter;
mod http;
mod islands;
mod models;
mod preprocess;
mod sql;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenvy::dotenv().unwrap();
    env_logger::init_from_env(env_logger::Env::new().default_filter_or("info"));

    let program_data = preprocess::preprocess().await;

    HttpServer::new(move || {
        App::new()
            .app_data(Data::new(program_data.main_db.clone()))
            .app_data(Data::new(Mutex::new(program_data.island_maps.clone())))
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
            .service(http::get_foams)
            .service(http::get_foams_count)
            .service(http::download_memorize_db)
            .service(http::error_test)
    })
    .bind(("localhost", 8080))?
    .run()
    .await
}
