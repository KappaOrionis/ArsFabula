pub mod models;

use sqlx::sqlite::{SqliteConnectOptions, SqlitePool};
use std::str::FromStr;
use std::path::Path;
use tauri::AppHandle;
use tauri::Manager;

pub async fn init_db(app_handle: &AppHandle) -> Result<SqlitePool, sqlx::Error> {
    let app_dir = app_handle.path().app_data_dir().expect("failed to get app data dir");
    std::fs::create_dir_all(&app_dir).expect("failed to create app data dir");
    
    let db_path = app_dir.join("arsfabula.db");
    let db_url = format!("sqlite://{}", db_path.to_str().expect("invalid db path"));

    let options = SqliteConnectOptions::from_str(&db_url)?
        .create_if_missing(true);

    let pool = SqlitePool::connect_with(options).await?;

    // Run migrations automatically
    sqlx::migrate!("./migrations").run(&pool).await?;

    Ok(pool)
}
