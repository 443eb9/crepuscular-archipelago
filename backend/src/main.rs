use actix_web::{middleware::Logger, web::Data, App, HttpServer};
use sqlx::SqlitePool;

mod http;
mod model;
mod sql;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    env_logger::init_from_env(env_logger::Env::new().default_filter_or("info"));

    let db = SqlitePool::connect("sqlite://archipelago.sqlite3").await.unwrap();

    HttpServer::new(move || {
        App::new()
            .app_data(Data::new(db.clone()))
            .wrap(Logger::default())
            .service(http::get_all_tags)
            .service(http::get_islands_meta)
    })
    .bind(("localhost", 8080))?
    .run()
    .await
}
