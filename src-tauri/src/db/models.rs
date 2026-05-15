use serde::{Serialize, Deserialize};
use sqlx::FromRow;

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Character {
    pub id: String,
    pub covenant_id: String,
    pub name: String,
    pub character_type: String,
    pub house: Option<String>,
    pub birth_year: i32,
    pub warp_score: i32,
    pub warp_points: i32,
    pub confidence_score: i32,
    pub confidence_points: i32,
    pub description: Option<String>,
    pub is_active: bool,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Art {
    pub id: String,
    pub character_id: String,
    pub art_name: String,
    pub score: i32,
    pub xp: i32,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Covenant {
    pub id: String,
    pub name: String,
    pub aura_type: String,
    pub aura_level: i32,
    pub founding_year: i32,
    pub location_id: Option<String>,
    pub tribunal: String,
    pub size: String,
    pub description: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Spell {
    pub id: String,
    pub character_id: Option<String>,
    pub name: String,
    pub technique: String,
    pub form: String,
    pub level: i32,
    pub mastery_score: i32,
    pub range_param: String,
    pub duration_param: String,
    pub target_param: String,
    pub description: Option<String>,
    pub openars_page: Option<String>,
}
