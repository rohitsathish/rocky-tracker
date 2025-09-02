#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Deserialize, Serialize};
use std::{
    ffi::OsStr,
    fs,
    fs::File,
    io::Write,
    path::{Path, PathBuf},
    time::{Duration, SystemTime, UNIX_EPOCH},
};
use tauri::Manager;

#[derive(Debug, Serialize, Deserialize)]
struct RockyData {
    version: i32,
    #[serde(default)]
    days: serde_json::Value,
    #[serde(default)]
    goals: serde_json::Value,
}

fn data_path<R: tauri::Runtime>(app: &tauri::AppHandle<R>) -> PathBuf {
    // Store under the OS app-data directory for packaged apps (and dev),
    // matching project guidelines.
    let mut dir = app
        .path()
        .app_data_dir()
        .expect("failed to resolve app data dir");
    let _ = fs::create_dir_all(&dir);
    dir.push("rocky.json");
    dir
}

fn log_path<R: tauri::Runtime>(app: &tauri::AppHandle<R>) -> PathBuf {
    let mut dir = app
        .path()
        .app_data_dir()
        .expect("failed to resolve app data dir");
    let _ = fs::create_dir_all(&dir);
    dir.push("debug.log");
    dir
}

fn backups_dir<R: tauri::Runtime>(app: &tauri::AppHandle<R>) -> PathBuf {
    let mut dir = app
        .path()
        .app_data_dir()
        .expect("failed to resolve app data dir");
    let _ = fs::create_dir_all(&dir);
    dir.push("backups");
    let _ = fs::create_dir_all(&dir);
    dir
}

const BACKUP_KEEP: usize = 7;
const BACKUP_MIN_INTERVAL: Duration = Duration::from_secs(24 * 60 * 60 - 60 * 30); // ~23.5h

fn list_backups(dir: &Path) -> Vec<PathBuf> {
    let mut files = Vec::new();
    if let Ok(rd) = fs::read_dir(dir) {
        for e in rd.flatten() {
            let p = e.path();
            if p.is_file() && p.extension() == Some(OsStr::new("json")) {
                files.push(p);
            }
        }
    }
    files
}

fn latest_backup(dir: &Path) -> Option<(PathBuf, SystemTime)> {
    let mut latest: Option<(PathBuf, SystemTime)> = None;
    for p in list_backups(dir) {
        if let Ok(meta) = fs::metadata(&p) {
            if let Ok(modified) = meta.modified() {
                match latest {
                    Some((_, t)) if modified <= t => {}
                    _ => latest = Some((p.clone(), modified)),
                }
            }
        }
    }
    latest
}

fn rotate_backups(dir: &Path, keep: usize) {
    let mut files = list_backups(dir);
    files.sort_by(|a, b| {
        let ma = fs::metadata(a).and_then(|m| m.modified()).ok();
        let mb = fs::metadata(b).and_then(|m| m.modified()).ok();
        mb.cmp(&ma) // newest first
    });
    if files.len() > keep {
        for p in files.into_iter().skip(keep) {
            let _ = fs::remove_file(p);
        }
    }
}

fn ensure_periodic_backup<R: tauri::Runtime>(app: &tauri::AppHandle<R>, data_file: &Path) {
    if !data_file.exists() {
        return;
    }
    let bdir = backups_dir(app);
    let mut should_backup = true;
    if let Some((_, last)) = latest_backup(&bdir) {
        if let Ok(elapsed) = SystemTime::now().duration_since(last) {
            if elapsed < BACKUP_MIN_INTERVAL {
                should_backup = false;
            }
        }
    }
    if should_backup {
        // Name with epoch seconds for simplicity
        let ts = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap_or_else(|_| Duration::from_secs(0))
            .as_secs();
        let mut target = bdir.clone();
        target.push(format!("rocky-{}.json", ts));
        let _ = fs::copy(data_file, target);
        rotate_backups(&bdir, BACKUP_KEEP);
    }
}

fn safe_write(path: &Path, contents: &str) -> Result<(), String> {
    let mut tmp = path.to_path_buf();
    tmp.set_extension("json.tmp");

    // Write pretty JSON to temp file
    let mut f = File::create(&tmp).map_err(|e| e.to_string())?;
    f.write_all(contents.as_bytes()).map_err(|e| e.to_string())?;
    f.flush().map_err(|e| e.to_string())?;

    // Try rename, replacing the old file on platforms that allow it
    match fs::rename(&tmp, path) {
        Ok(_) => Ok(()),
        Err(_) => {
            let _ = fs::remove_file(path);
            fs::rename(&tmp, path).map_err(|e| e.to_string())
        }
    }
}

#[tauri::command]
fn load_data<R: tauri::Runtime>(app: tauri::AppHandle<R>) -> Result<serde_json::Value, String> {
    let path = data_path(&app);
    if !path.exists() {
        let default = serde_json::json!({"version": 1, "days": [], "goals": []});
        let mut f = fs::File::create(&path).map_err(|e| e.to_string())?;
        f.write_all(serde_json::to_string_pretty(&default).unwrap().as_bytes())
            .map_err(|e| e.to_string())?;
        return Ok(default);
    }
    let content = fs::read_to_string(&path).map_err(|e| e.to_string())?;
    match serde_json::from_str::<serde_json::Value>(&content) {
        Ok(json) => Ok(json),
        Err(_) => {
            // Fallback to latest backup if available
            let bdir = backups_dir(&app);
            if let Some((bp, _)) = latest_backup(&bdir) {
                if let Ok(bc) = fs::read_to_string(&bp) {
                    if let Ok(json) = serde_json::from_str::<serde_json::Value>(&bc) {
                        return Ok(json);
                    }
                }
            }
            Ok(serde_json::json!({"version":1, "days": [], "goals": []}))
        }
    }
}

#[tauri::command]
fn save_data<R: tauri::Runtime>(app: tauri::AppHandle<R>, payload: serde_json::Value) -> Result<(), String> {
    let path = data_path(&app);
    // Make a periodic backup of the current file before writing
    ensure_periodic_backup(&app, &path);

    let pretty = serde_json::to_string_pretty(&payload).map_err(|e| e.to_string())?;
    safe_write(&path, &pretty)?;
    Ok(())
}

#[tauri::command]
fn append_log<R: tauri::Runtime>(app: tauri::AppHandle<R>, line: String) -> Result<(), String> {
    let path = log_path(&app);
    let mut f = fs::OpenOptions::new()
        .create(true)
        .append(true)
        .open(&path)
        .map_err(|e| e.to_string())?;
    let ts = chrono::Local::now().format("%Y-%m-%d %H:%M:%S");
    let record = format!("{} | {}\n", ts, line);
    f.write_all(record.as_bytes()).map_err(|e| e.to_string())
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![load_data, save_data, append_log])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
