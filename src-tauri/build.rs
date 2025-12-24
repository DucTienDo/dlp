use std::env;
use std::fs;
use std::path::PathBuf;

fn main() {
    // Get the target directory
    let out_dir = env::var("OUT_DIR").unwrap();
    let target_dir = PathBuf::from(out_dir)
        .ancestors()
        .nth(3)
        .unwrap()
        .to_path_buf();

    // Create binaries directory in target
    let binaries_target = target_dir.join("binaries");
    fs::create_dir_all(&binaries_target).ok();

    // Copy binaries from src-tauri/binaries to target/binaries
    let binaries_src = PathBuf::from("binaries");
    if binaries_src.exists() {
        for entry in fs::read_dir(&binaries_src).unwrap() {
            let entry = entry.unwrap();
            let src_path = entry.path();
            if src_path.extension().and_then(|s| s.to_str()) == Some("exe") {
                let file_name = src_path.file_name().unwrap();
                let dest_path = binaries_target.join(file_name);
                fs::copy(&src_path, &dest_path).ok();
                println!("cargo:rerun-if-changed={}", src_path.display());
            }
        }
    }

    tauri_build::build()
}
