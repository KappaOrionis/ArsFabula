pub mod models;

use sqlx::sqlite::{SqliteConnectOptions, SqlitePool};
use std::str::FromStr;
use tauri::AppHandle;
use tauri::Manager;

pub async fn init_db(app_handle: &AppHandle) -> Result<SqlitePool, sqlx::Error> {
    let app_dir = app_handle.path().app_data_dir().expect("failed to get app data dir");
    std::fs::create_dir_all(&app_dir).expect("failed to create app data dir");
    
    let db_path = app_dir.join("arsfabula.db");
    let db_url = format!("sqlite://{}", db_path.to_str().expect("invalid db path"));

    let options = SqliteConnectOptions::from_str(&db_url)?
        .create_if_missing(true);

    let pool_result = SqlitePool::connect_with(options).await;
    let pool = match pool_result {
        Ok(p) => p,
        Err(e) => {
            let _ = std::fs::write(app_dir.join("db_init_error.log"), format!("connect_with error: {}", e));
            return Err(e);
        }
    };

    // Run migrations automatically
    let migration_result = sqlx::migrate!("./migrations").run(&pool).await;
    match migration_result {
        Ok(_) => {
            let _ = std::fs::write(app_dir.join("db_init_success.log"), "migrations successful");
        },
        Err(e) => {
            let _ = std::fs::write(app_dir.join("db_init_error.log"), format!("migrate run error: {}", e));
            return Err(sqlx::Error::Configuration(e.into()));
        }
    }

    Ok(pool)
}
