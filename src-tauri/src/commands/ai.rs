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
    let python_path = "python/venv/Scripts/python.exe";
    let script_path = "python/api/query_lore.py";

    let mut cmd = std::process::Command::new(python_path);
    cmd.arg(script_path).arg(&query);

    if let Some(f) = filter_type {
        cmd.arg(f);
    }

    let output = cmd.output().map_err(|e| e.to_string())?;

    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }

    let results: Vec<LoreEntry> = serde_json::from_slice(&output.stdout)
        .map_err(|e| format!("Failed to parse Python output: {}. Raw: {}", e, String::from_utf8_lossy(&output.stdout)))?;

    Ok(results)
}
