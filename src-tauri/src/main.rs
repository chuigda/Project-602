#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod protocol;
mod analyse;

use analyse::evaluate_position;
use protocol::{CommandResult, EvaluateRequest, EvaluateResponse};

#[tauri::command]
async fn evaluate(request: EvaluateRequest) -> CommandResult<EvaluateResponse> {
    if let Ok(scores) = evaluate_position(request).await {
        CommandResult::success(EvaluateResponse { scores })
    } else {
        CommandResult::failure()
    }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![evaluate])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
