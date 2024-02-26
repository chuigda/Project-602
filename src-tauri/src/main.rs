#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod protocol;

use protocol::{CommandResult, EvaluateRequest, EvaluateResponse};

#[tauri::command]
async fn evaluate(request: EvaluateRequest) -> CommandResult<EvaluateResponse> {
    let mut scores = Vec::new();
    scores.extend(request.positions.iter().map(|_| 1));
    CommandResult::success(EvaluateResponse { scores })
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![evaluate])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
