fn main() {
    // Explicitly declare custom commands so Runtime Authority can allow them.
    // This helps in setups where capabilities are enforced.
    tauri_build::try_build(
        tauri_build::Attributes::new()
            .app_manifest(tauri_build::AppManifest::new().commands(&[
                "load_data",
                "save_data",
                "append_log",
            ])),
    )
    .expect("failed to build tauri manifest with commands");
}
