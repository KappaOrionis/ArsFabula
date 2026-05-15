use crate::db::models::{Covenant, Season, Resource};
use sqlx::SqlitePool;
use tauri::command;
use tauri::State;
use uuid::Uuid;

#[command]
pub async fn list_covenants(pool: State<'_, SqlitePool>) -> Result<Vec<Covenant>, String> {
    let covenants = sqlx::query_as::<_, Covenant>(
        "SELECT id, name, aura_type, aura_level, founding_year, location_id, tribunal, size, description, is_official, domus_magna, created_at, updated_at FROM covenants ORDER BY name ASC"
    )    .fetch_all(&*pool)
        .await
        .map_err(|e| e.to_string())?;
    Ok(covenants)
}

#[command]
pub async fn get_covenant(id: String, pool: State<'_, SqlitePool>) -> Result<Covenant, String> {
    let covenant = sqlx::query_as::<_, Covenant>("SELECT * FROM covenants WHERE id = ?")
        .bind(id)
        .fetch_one(&*pool)
        .await
        .map_err(|e| e.to_string())?;
    Ok(covenant)
}

#[command]
pub async fn create_covenant(
    name: String,
    aura_type: String,
    aura_level: i32,
    founding_year: i32,
    tribunal: String,
    pool: State<'_, SqlitePool>
) -> Result<String, String> {
    let id = Uuid::new_v4().to_string();
    
    sqlx::query(
        "INSERT INTO covenants (id, name, aura_type, aura_level, founding_year, tribunal, is_official, domus_magna) VALUES (?, ?, ?, ?, ?, ?, 0, NULL)"
    )
    .bind(&id)
    .bind(name)
    .bind(aura_type)
    .bind(aura_level)
    .bind(founding_year)
    .bind(tribunal)
    .execute(&*pool)
    .await
    .map_err(|e| e.to_string())?;

    // Create initial season
    let season_id = Uuid::new_v4().to_string();
    sqlx::query(
        "INSERT INTO seasons (id, covenant_id, year, quarter, is_current) VALUES (?, ?, ?, 'spring', 1)"
    )
    .bind(season_id)
    .bind(&id)
    .bind(founding_year)
    .execute(&*pool)
    .await
    .map_err(|e| e.to_string())?;

    Ok(id)
}

#[command]
pub async fn get_current_season(covenant_id: String, pool: State<'_, SqlitePool>) -> Result<Season, String> {
    let season = sqlx::query_as::<_, Season>(
        "SELECT * FROM seasons WHERE covenant_id = ? AND is_current = 1"
    )
    .bind(covenant_id)
    .fetch_one(&*pool)
    .await
    .map_err(|e| e.to_string())?;
    Ok(season)
}

#[command]
pub async fn advance_season(covenant_id: String, pool: State<'_, SqlitePool>) -> Result<Season, String> {
    let current = get_current_season(covenant_id.clone(), pool.clone()).await?;
    
    let (next_year, next_quarter) = match current.quarter.as_str() {
        "spring" => (current.year, "summer"),
        "summer" => (current.year, "autumn"),
        "autumn" => (current.year, "winter"),
        "winter" => (current.year + 1, "spring"),
        _ => return Err("Invalid quarter".to_string()),
    };

    let mut tx = pool.begin().await.map_err(|e| e.to_string())?;

    // Mark current as finished
    sqlx::query("UPDATE seasons SET is_current = 0, completed_at = CURRENT_TIMESTAMP WHERE id = ?")
        .bind(&current.id)
        .execute(&mut *tx)
        .await
        .map_err(|e| e.to_string())?;

    // Create next season
    let next_id = Uuid::new_v4().to_string();
    sqlx::query(
        "INSERT INTO seasons (id, covenant_id, year, quarter, is_current) VALUES (?, ?, ?, ?, 1)"
    )
    .bind(&next_id)
    .bind(&covenant_id)
    .bind(next_year)
    .bind(next_quarter)
    .execute(&mut *tx)
    .await
    .map_err(|e| e.to_string())?;

    tx.commit().await.map_err(|e| e.to_string())?;

    let next_season = sqlx::query_as::<_, Season>("SELECT * FROM seasons WHERE id = ?")
        .bind(next_id)
        .fetch_one(&*pool)
        .await
        .map_err(|e| e.to_string())?;

    Ok(next_season)
}

#[command]
pub async fn get_resources(covenant_id: String, pool: State<'_, SqlitePool>) -> Result<Vec<Resource>, String> {
    let resources = sqlx::query_as::<_, Resource>(
        "SELECT * FROM resources WHERE covenant_id = ?"
    )
    .bind(covenant_id)
    .fetch_all(&*pool)
    .await
    .map_err(|e| e.to_string())?;
    Ok(resources)
}

#[command]
pub async fn delete_covenant(id: String, pool: State<'_, SqlitePool>) -> Result<(), String> {
    sqlx::query("DELETE FROM covenants WHERE id = ?")
        .bind(id)
        .execute(&*pool)
        .await
        .map_err(|e| e.to_string())?;
    Ok(())
}
