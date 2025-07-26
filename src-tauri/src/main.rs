
#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use tauri::{Manager, AppHandle, WindowBuilder, WindowUrl};

#[tauri::command]
async fn open_docs(app: AppHandle) -> Result<(), String> {
  // Use "docs" as a unique label for the documentation window
  if let Some(window) = app.get_window("docs") {
      // If the window already exists, bring it to the front
      window.set_focus().map_err(|e| e.to_string())?;
  } else {
      // Otherwise, create a new window
      WindowBuilder::new(
          &app,
          "docs",
          WindowUrl::App("README.html".into())
      )
      .title("MiStory Documentation")
      .inner_size(900.0, 750.0)
      .build()
      .map_err(|e| e.to_string())?;
  }
  Ok(())
}


fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![open_docs])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
