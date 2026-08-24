//! Local media tools (Higgsfield, HyperFrames).
//!
//! Both ship as authenticated command-line tools, so the desktop app drives
//! them by process rather than reimplementing their APIs. Only these two
//! binaries can be launched, and only with arguments the caller supplies as a
//! list, so nothing is passed through a shell.

use std::process::Command;
use std::time::Duration;

use serde::{Deserialize, Serialize};

/// Tools the app is allowed to launch.
const ALLOWED: [&str; 2] = ["higgsfield", "hyperframes"];

/// Generation can take minutes; anything longer is treated as stuck.
const TIMEOUT: Duration = Duration::from_secs(15 * 60);

#[derive(Debug, Serialize, Deserialize)]
pub struct MediaToolResult {
    pub ok: bool,
    pub stdout: String,
    pub stderr: String,
    pub code: Option<i32>,
}

fn resolve(tool: &str) -> Result<String, String> {
    if !ALLOWED.contains(&tool) {
        return Err(format!("tool '{tool}' is not allowed"));
    }
    let home = std::env::var("HOME").map_err(|_| "HOME is not set".to_string())?;
    let candidates = [
        format!("{home}/.local/bin/{tool}"),
        format!("/opt/homebrew/bin/{tool}"),
        format!("/usr/local/bin/{tool}"),
    ];
    candidates
        .iter()
        .find(|path| std::path::Path::new(path).exists())
        .cloned()
        .ok_or_else(|| format!("{tool} is not installed"))
}

/// Report whether a tool is present, so the UI can offer it or explain its absence.
#[tauri::command]
pub fn media_tool_available(tool: String) -> bool {
    resolve(&tool).is_ok()
}

/// Run a media tool with an explicit argument list and return its output.
#[tauri::command]
pub async fn run_media_tool(tool: String, args: Vec<String>) -> Result<MediaToolResult, String> {
    let path = resolve(&tool)?;

    let handle = tokio::task::spawn_blocking(move || {
        Command::new(path)
            .args(&args)
            .output()
            .map_err(|error| format!("failed to run {tool}: {error}"))
    });

    let output = tokio::time::timeout(TIMEOUT, handle)
        .await
        .map_err(|_| "media tool timed out".to_string())?
        .map_err(|error| format!("media tool task failed: {error}"))??;

    Ok(MediaToolResult {
        ok: output.status.success(),
        stdout: String::from_utf8_lossy(&output.stdout).to_string(),
        stderr: String::from_utf8_lossy(&output.stderr).to_string(),
        code: output.status.code(),
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn rejects_tools_outside_the_allowlist() {
        assert!(resolve("curl").is_err());
        assert!(resolve("sh").is_err());
        assert!(resolve("../../bin/sh").is_err());
    }

    #[test]
    fn allowlist_holds_only_the_two_media_tools() {
        assert_eq!(ALLOWED.len(), 2);
        assert!(ALLOWED.contains(&"higgsfield"));
        assert!(ALLOWED.contains(&"hyperframes"));
    }
}
