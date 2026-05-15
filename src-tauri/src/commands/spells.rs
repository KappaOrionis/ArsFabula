use crate::db::models::Spell;
use sqlx::SqlitePool;
use tauri::command;
use tauri::State;

#[command]
pub async fn list_spells(pool: State<'_, SqlitePool>) -> Result<Vec<Spell>, String> {
    let spells = sqlx::query_as::<_, Spell>(
        "SELECT * FROM spells ORDER BY name ASC"
    )
    .fetch_all(&*pool)
    .await
    .map_err(|e| e.to_string())?;

    Ok(spells)
}
