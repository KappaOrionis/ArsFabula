use crate::db::models::Character;
use sqlx::SqlitePool;
use tauri::command;
use tauri::State;

#[command]
pub async fn list_characters(pool: State<'_, SqlitePool>) -> Result<Vec<Character>, String> {
    let characters = sqlx::query_as::<_, Character>(
        "SELECT * FROM characters ORDER BY name ASC"
    )
    .fetch_all(&*pool)
    .await
    .map_err(|e| e.to_string())?;

    Ok(characters)
}

#[command]
pub async fn get_character(id: String, pool: State<'_, SqlitePool>) -> Result<Character, String> {
    let character = sqlx::query_as::<_, Character>(
        "SELECT * FROM characters WHERE id = ?"
    )
    .bind(id)
    .fetch_one(&*pool)
    .await
    .map_err(|e| e.to_string())?;

    Ok(character)
}

#[command]
pub async fn create_character(
    name: String, 
    character_type: String, 
    covenant_id: Option<String>,
    pool: State<'_, SqlitePool>
) -> Result<String, String> {
    // Default covenant if not provided (should be handled better in real app)
    let cov_id = match covenant_id {
        Some(id) => id,
        None => {
            // Try to find the first covenant
            let row: (String,) = sqlx::query_as("SELECT id FROM covenants LIMIT 1")
                .fetch_one(&*pool)
                .await
                .map_err(|_| "No covenant found. Please create one first.")?;
            row.0
        }
    };

    let id = uuid::Uuid::new_v4().to_string();
    
    sqlx::query(
        "INSERT INTO characters (id, covenant_id, name, character_type, birth_year) VALUES (?, ?, ?, ?, ?)"
    )
    .bind(&id)
    .bind(cov_id)
    .bind(name)
    .bind(character_type)
    .bind(1200) // Default birth year
    .execute(&*pool)
    .await
    .map_err(|e| e.to_string())?;

    Ok(id)
}
