use serde::{Serialize, Deserialize};
// Triggers a backend rebuild 3
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
    pub is_official: bool,
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
    pub is_official: bool,
    pub domus_magna: Option<String>,
    pub season_status: Option<String>,
    pub location_desc: Option<String>,
    pub gps_coords: Option<String>,
    pub notable_magi: Option<String>,
    pub custodes: Option<String>,
    pub grogs_desc: Option<String>,
    pub vis_sources: Option<String>,
    pub laboratories: Option<String>,
    pub library: Option<String>,
    pub created_at: String,
    pub updated_at: String,
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
    pub created_at: String,
}
#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Season {
    pub id: String,
    pub covenant_id: String,
    pub year: i32,
    pub quarter: String,
    pub event_summary: Option<String>,
    pub is_current: bool,
    pub completed_at: Option<String>,
    pub created_at: String,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Resource {
    pub id: String,
    pub covenant_id: String,
    pub resource_type: String,
    pub amount: i32,
    pub notes: Option<String>,
    pub updated_at: String,
}
