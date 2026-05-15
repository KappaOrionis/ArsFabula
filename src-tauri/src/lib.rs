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
            
            // Block on database initialization so it completes before the app starts accepting commands
            match tauri::async_runtime::block_on(db::init_db(&handle)) {
                Ok(pool) => {
                    handle.manage(pool);
                    println!("Database initialized successfully.");
                }
                Err(e) => {
                    eprintln!("Failed to initialize database: {}", e);
                }
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::ai::check_ai_status,
            commands::ai::search_lore,
            commands::characters::list_characters,
            commands::characters::get_character,
            commands::characters::create_character,
            commands::spells::list_spells,
            commands::ai::list_lore,
            commands::ai::list_source_files,
            commands::ai::read_source_file,
            commands::covenant::list_covenants,
            commands::covenant::get_covenant,
            commands::covenant::create_covenant,
            commands::covenant::get_current_season,
            commands::covenant::advance_season,
            commands::covenant::get_resources,
            commands::covenant::delete_covenant
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
