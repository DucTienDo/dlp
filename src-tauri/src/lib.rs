use std::process::{Command as StdCommand, Stdio};
use std::io::{BufRead, BufReader, Read};
use tauri::{Emitter, Manager};

#[tauri::command]
fn get_sidecar_path(app: tauri::AppHandle, binary_name: String) -> Result<String, String> {
    let sidecar_path = app
        .path()
        .resolve(
            format!("binaries/{}", binary_name),
            tauri::path::BaseDirectory::Resource,
        )
        .map_err(|e| format!("Failed to resolve sidecar path: {}", e))?;

    sidecar_path
        .to_str()
        .map(|s| s.to_string())
        .ok_or_else(|| "Path contains invalid UTF-8".to_string())
}

#[tauri::command]
fn save_cookies_to_temp(cookies_text: String) -> Result<String, String> {
    use std::io::Write;
    
    let temp_dir = std::env::temp_dir();
    let temp_file = temp_dir.join(format!("yt-dlp-cookies-{}.txt", std::process::id()));
    
    let mut file = std::fs::File::create(&temp_file)
        .map_err(|e| format!("Failed to create temp file: {}", e))?;
    
    file.write_all(cookies_text.as_bytes())
        .map_err(|e| format!("Failed to write cookies: {}", e))?;
    
    temp_file
        .to_str()
        .map(|s| s.to_string())
        .ok_or_else(|| "Path contains invalid UTF-8".to_string())
}

#[tauri::command]
async fn execute_downloader(
    app: tauri::AppHandle,
    window_label: String,
    binary_name: String,
    args: Vec<String>,
) -> Result<i32, String> {
    // Resolve sidecar path
    let sidecar_path = app
        .path()
        .resolve(
            format!("binaries/{}", binary_name),
            tauri::path::BaseDirectory::Resource,
        )
        .map_err(|e| format!("Failed to resolve sidecar path: {}", e))?;

    // Validate path exists
    if !sidecar_path.exists() {
        return Err(format!("Sidecar not found: {:?}", sidecar_path));
    }

    // Spawn process with stdout/stderr piping
    // Force UTF-8 encoding for python/yt-dlp output to support non-ASCII characters (e.g. Japanese)
    let mut child = StdCommand::new(&sidecar_path)
        .args(&args)
        .env("PYTHONIOENCODING", "utf-8")
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|e| format!("Failed to spawn process: {}", e))?;

    // Get target window
    let window = app.get_webview_window(&window_label);

    // Capture stdout with support for \r (carriage return) line delimiters
    if let Some(stdout) = child.stdout.take() {
        let window_clone = window.clone();
        let label_clone = window_label.clone();
        
        std::thread::spawn(move || {
            let mut reader = BufReader::new(stdout);
            let mut buffer = Vec::new();
            let mut byte = [0u8; 1];
            
            loop {
                match reader.read(&mut byte) {
                    Ok(0) => break, // EOF
                    Ok(_) => {
                        // Check for line delimiters: \r or \n
                        if byte[0] == b'\r' || byte[0] == b'\n' {
                            if !buffer.is_empty() {
                                // Use from_utf8_lossy to handle any potential invalid sequences gracefully
                                // instead of failing completely. This is crucial for multi-byte/Japanese text.
                                let line = String::from_utf8_lossy(&buffer).to_string();
                                let line = line.trim();
                                if !line.is_empty() {
                                    // Try to extract video title and update window title
                                    if line.contains("[download] Destination:") || line.contains("[info]") {
                                        if let Some(title) = extract_title_from_line(line) {
                                            if let Some(ref win) = window_clone {
                                                let _ = win.set_title(&format!("Downloading: {}", title));
                                                let _ = win.emit(&format!("{}-title", label_clone), title);
                                            }
                                        }
                                    }
                                    
                                    if let Some(ref win) = window_clone {
                                        let _ = win.emit(&format!("{}-stdout", label_clone), line);
                                    }
                                }
                                buffer.clear();
                            }
                        } else {
                            buffer.push(byte[0]);
                        }
                    }
                    Err(_) => break,
                }
            }
        });
    }

    // Capture stderr
    if let Some(stderr) = child.stderr.take() {
        let reader = BufReader::new(stderr);
        let window = app.get_webview_window(&window_label);
        let label_clone = window_label.clone();
        
        std::thread::spawn(move || {
            for line in reader.lines() {
                if let Ok(line) = line {
                    if let Some(ref win) = window {
                        let _ = win.emit(&format!("{}-stderr", label_clone), &line);
                    }
                }
            }
        });
    }

    // Wait for process to complete
    let status = child.wait().map_err(|e| format!("Process error: {}", e))?;
    let code = status.code().unwrap_or(-1);

    // Emit completion event to specific window
    if let Some(window) = app.get_webview_window(&window_label) {
        let _ = window.emit(&format!("{}-close", window_label), code);
    }

    Ok(code)
}

// Helper function to extract title from yt-dlp output
// Helper function to extract title from yt-dlp output
fn extract_title_from_line(line: &str) -> Option<String> {
    if let Some(start) = line.find("Destination: ") {
        // Get the full path part after "Destination: "
        let path_part = &line[start + 13..];
        
        // Extract filename from path (handle both / and \)
        // We replace \ with / to simplify splitting
        let normalized_path = path_part.replace('\\', "/");
        if let Some(filename) = normalized_path.split('/').last() {
            // Remove extension
            let mut title = filename.to_string();
            if let Some(dot_idx) = title.rfind('.') {
                title = title[..dot_idx].to_string();
            }

            // Remove trailing video ID like "[123]" or "[aBc-123]"
            // We look for " [" followed by some characters and a closing "]" at the end
            if let Some(bracket_start) = title.rfind(" [") {
                if title[bracket_start..].ends_with(']') {
                    title = title[..bracket_start].to_string();
                }
            }
            
            return Some(title);
        }
    }
    None
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![execute_downloader, get_sidecar_path, save_cookies_to_temp])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
