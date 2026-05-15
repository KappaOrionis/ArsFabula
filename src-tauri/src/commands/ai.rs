use serde::Serialize;
use tauri::command;

#[derive(Serialize)]
pub struct AIStatus {
    pub is_connected: bool,
    pub model_name: Option<String>,
    pub error: Option<String>,
}

#[command]
pub async fn check_ai_status() -> Result<AIStatus, String> {
    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(2))
        .build()
        .map_err(|e| e.to_string())?;

    match client.get("http://localhost:1234/v1/models").send().await {
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
