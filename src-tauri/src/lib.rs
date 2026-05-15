#![deny(warnings, clippy::all)]

pub mod commands;
pub mod db;
pub mod errors;

use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                match db::init_db(&handle).await {
                    Ok(pool) => {
                        handle.manage(pool);
                        println!("Database initialized successfully.");
                    }
                    Err(e) => {
                        eprintln!("Failed to initialize database: {}", e);
                    }
                }
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::ai::check_ai_status,
            commands::ai::search_lore,
            commands::characters::list_characters,
            commands::characters::get_character,
            commands::characters::create_character,
            commands::spells::list_spells
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
