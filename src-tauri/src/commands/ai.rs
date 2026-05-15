use serde::Serialize;
use tauri::command;

#[derive(Serialize)]
pub struct AIStatus {
    pub is_connected: bool,
    pub model_name: Option<String>,
    pub error: Option<String>,
}

#[derive(serde::Deserialize, Serialize)]
pub struct LoreEntry {
    pub id: String,
    pub title: String,
    pub content: String,
    pub entity_type: String,
    pub metadata: serde_json::Value,
}

#[command]
pub async fn check_ai_status() -> Result<AIStatus, String> {
    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(2))
        .build()
        .map_err(|e| e.to_string())?;

    match client.get("http://127.0.0.1:1234/v1/models").send().await {
        Ok(resp) => {
            if resp.status().is_success() {
                // For simplicity, we just return true if we get a response
                // You could parse the JSON to get the actual model name
                Ok(AIStatus {
                    is_connected: true,
                    model_name: Some("LM Studio".to_string()),
                    error: None,
                })
            } else {
                Ok(AIStatus {
                    is_connected: false,
                    model_name: None,
                    error: Some(format!("HTTP Error: {}", resp.status())),
                })
            }
        }
        Err(e) => Ok(AIStatus {
            is_connected: false,
            model_name: None,
            error: Some(e.to_string()),
        }),
    }
}
#[command]
pub async fn search_lore(query: String, filter_type: Option<String>) -> Result<Vec<LoreEntry>, String> {
    let root_dir = find_project_root().ok_or("Could not find project root directory")?;

    let python_path = if cfg!(windows) {
        root_dir.join("python").join("venv").join("Scripts").join("python.exe")
    } else {
        root_dir.join("python").join("venv").join("bin").join("python")
    };

    let script_path = root_dir.join("python").join("api").join("query_lore.py");

    if !python_path.exists() {
        return Err(format!("Python venv not found at {:?}", python_path));
    }

    let mut cmd = std::process::Command::new(python_path);
    cmd.current_dir(&root_dir);
    cmd.arg(script_path).arg(&query);

    if let Some(f) = filter_type {
        if f != "null" && !f.is_empty() {
            cmd.arg(f);
        }
    }

    let output = cmd.output().map_err(|e| format!("Failed to execute Python: {}", e))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("Python script failed: {}", stderr));
    }

    let results: Vec<LoreEntry> = serde_json::from_slice(&output.stdout)
        .map_err(|e| {
            let stdout = String::from_utf8_lossy(&output.stdout);
            format!("Failed to parse Python output: {}. Raw output: {}", e, stdout)
        })?;

    Ok(results)
}

#[command]
pub async fn list_lore() -> Result<Vec<LoreEntry>, String> {
    let root_dir = find_project_root().ok_or("Could not find project root directory")?;

    let python_path = if cfg!(windows) {
        root_dir.join("python").join("venv").join("Scripts").join("python.exe")
    } else {
        root_dir.join("python").join("venv").join("bin").join("python")
    };

    let script_path = root_dir.join("python").join("api").join("list_lore.py");

    let output = std::process::Command::new(python_path)
        .current_dir(&root_dir)
        .arg(script_path)
        .output()
        .map_err(|e| format!("Failed to execute Python: {}", e))?;

    let results: Vec<LoreEntry> = serde_json::from_slice(&output.stdout)
        .map_err(|e| {
            let stdout = String::from_utf8_lossy(&output.stdout);
            format!("Failed to parse Python output: {}. Raw output: {}", e, stdout)
        })?;

    Ok(results)
}

fn find_project_root() -> Option<std::path::PathBuf> {
    let mut current = std::env::current_dir().ok()?;
    loop {
        if current.join("data").exists() && current.join("config").exists() {
            return Some(current);
        }
        if !current.pop() {
            break;
        }
    }
    None
}

#[command]
pub async fn list_source_files() -> Result<Vec<String>, String> {
    let root_dir = find_project_root().ok_or("Could not find project root directory (containing data/ and config/)")?;
    let sources_dir = root_dir.join("data").join("sources").join("ars-magica-open-license").join("Ars-Magica-Open-License-main").join("reviewed");
    
    if !sources_dir.exists() {
        return Err(format!("Sources directory not found at {:?}", sources_dir));
    }

    let mut files = Vec::new();
    let entries = std::fs::read_dir(sources_dir).map_err(|e| e.to_string())?;
    
    for entry in entries {
        if let Ok(entry) = entry {
            let path = entry.path();
            if path.is_file() && path.extension().map_or(false, |ext| ext == "md") {
                if let Some(name) = path.file_name().and_then(|n| n.to_str()) {
                    files.push(name.to_string());
                }
            }
        }
    }
    
    files.sort();
    Ok(files)
}

#[command]
pub async fn read_source_file(filename: String) -> Result<String, String> {
    let root_dir = find_project_root().ok_or("Could not find project root directory")?;

    let file_path = root_dir.join("data").join("sources").join("ars-magica-open-license").join("Ars-Magica-Open-License-main").join("reviewed").join(filename);
    
    if !file_path.exists() {
        return Err(format!("File not found: {:?}", file_path));
    }

    std::fs::read_to_string(file_path).map_err(|e| e.to_string())
}
