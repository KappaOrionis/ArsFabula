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
    let current_dir = std::env::current_dir().map_err(|e| e.to_string())?;
    
    // In dev mode, we are usually in the project root or src-tauri
    // Let's try to find the python venv relative to the current dir
    let mut python_path = current_dir.join("python").join("venv").join("Scripts").join("python.exe");
    if !python_path.exists() {
        // Try one level up if we are in src-tauri
        python_path = current_dir.parent().unwrap().join("python").join("venv").join("Scripts").join("python.exe");
    }

    let mut script_path = current_dir.join("python").join("api").join("query_lore.py");
    if !script_path.exists() {
        script_path = current_dir.parent().unwrap().join("python").join("api").join("query_lore.py");
    }

    if !python_path.exists() {
        return Err(format!("Python venv not found at {:?}. Current dir: {:?}", python_path, current_dir));
    }

    let mut cmd = std::process::Command::new(python_path);
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
    let current_dir = std::env::current_dir().map_err(|e| e.to_string())?;
    
    let mut python_path = current_dir.join("python").join("venv").join("Scripts").join("python.exe");
    if !python_path.exists() {
        python_path = current_dir.parent().unwrap().join("python").join("venv").join("Scripts").join("python.exe");
    }

    let mut script_path = current_dir.join("python").join("api").join("list_lore.py");
    if !script_path.exists() {
        script_path = current_dir.parent().unwrap().join("python").join("api").join("list_lore.py");
    }

    let output = std::process::Command::new(python_path)
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
