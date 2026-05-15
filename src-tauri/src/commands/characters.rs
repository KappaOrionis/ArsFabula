use crate::db::models::Character;
use sqlx::SqlitePool;
use tauri::command;
use tauri::State;

#[command]
pub async fn list_characters(pool: State<'_, SqlitePool>) -> Result<Vec<Character>, String> {
    let characters = sqlx::query_as::<_, Character>(
        "SELECT id, covenant_id, name, character_type, house, birth_year, warp_score, warp_points, confidence_score, confidence_points, description, is_active, is_official, death_year, favored_arts, familiar_link, apprentice_registry, biographical_notice, source_book, page_reference, created_at, updated_at FROM characters ORDER BY name ASC"
    )
    .fetch_all(&*pool)
    .await
    .map_err(|e| e.to_string())?;

    Ok(characters)
}

#[command]
pub async fn get_character(id: String, pool: State<'_, SqlitePool>) -> Result<Character, String> {
    let character = sqlx::query_as::<_, Character>(
        "SELECT id, covenant_id, name, character_type, house, birth_year, warp_score, warp_points, confidence_score, confidence_points, description, is_active, is_official, death_year, favored_arts, familiar_link, apprentice_registry, biographical_notice, source_book, page_reference, created_at, updated_at FROM characters WHERE id = ?"
    )
    .bind(id)
    .fetch_one(&*pool)
    .await
    .map_err(|e| e.to_string())?;

    Ok(character)
}

#[command]
#[allow(clippy::too_many_arguments)]
pub async fn create_character(
    name: String, 
    character_type: String, 
    covenant_id: Option<String>,
    house: Option<String>,
    birth_year: Option<i32>,
    death_year: Option<i32>,
    description: Option<String>,
    favored_arts: Option<String>,
    familiar_link: Option<String>,
    apprentice_registry: Option<String>,
    biographical_notice: Option<String>,
    source_book: Option<String>,
    page_reference: Option<String>,
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
    let by = birth_year.unwrap_or(1200);
    
    sqlx::query(
        "INSERT INTO characters (id, covenant_id, name, character_type, house, birth_year, death_year, description, favored_arts, familiar_link, apprentice_registry, biographical_notice, source_book, page_reference, is_official, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 1)"
    )
    .bind(&id)
    .bind(cov_id)
    .bind(name)
    .bind(character_type)
    .bind(house)
    .bind(by)
    .bind(death_year)
    .bind(description)
    .bind(favored_arts)
    .bind(familiar_link)
    .bind(apprentice_registry)
    .bind(biographical_notice)
    .bind(source_book)
    .bind(page_reference)
    .execute(&*pool)
    .await
    .map_err(|e| e.to_string())?;

    Ok(id)
}
