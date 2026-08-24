//! Local media tools (Higgsfield, HyperFrames).
//!
//! Both ship as authenticated command-line tools, so the desktop app drives
//! them by process rather than reimplementing their APIs. Only these two
//! binaries can be launched, and only with arguments the caller supplies as a
//! list, so nothing is passed through a shell.

use std::process::Stdio;
use std::time::Duration;

use serde::{Deserialize, Serialize};
use tokio::io::AsyncReadExt;
use tokio::process::Command;

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
    run_media_tool_process(path, tool, args, TIMEOUT).await
}

async fn run_media_tool_process(
    path: String,
    tool: String,
    args: Vec<String>,
    timeout: Duration,
) -> Result<MediaToolResult, String> {
    let mut command = Command::new(path);
    command
        .args(&args)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .kill_on_drop(true);
    let mut child = command
        .spawn()
        .map_err(|error| format!("failed to run {tool}: {error}"))?;

    let mut stdout = child
        .stdout
        .take()
        .ok_or_else(|| format!("failed to capture {tool} stdout"))?;
    let mut stderr = child
        .stderr
        .take()
        .ok_or_else(|| format!("failed to capture {tool} stderr"))?;
    let stdout_reader = tokio::spawn(async move {
        let mut bytes = Vec::new();
        stdout.read_to_end(&mut bytes).await.map(|_| bytes)
    });
    let stderr_reader = tokio::spawn(async move {
        let mut bytes = Vec::new();
        stderr.read_to_end(&mut bytes).await.map(|_| bytes)
    });

    let status = match tokio::time::timeout(timeout, child.wait()).await {
        Ok(status) => status.map_err(|error| format!("failed to wait for {tool}: {error}"))?,
        Err(_) => {
            let kill_result = child.kill().await;
            stdout_reader.abort();
            stderr_reader.abort();
            let _ = stdout_reader.await;
            let _ = stderr_reader.await;
            kill_result.map_err(|error| {
                format!("media tool timed out and could not be stopped: {error}")
            })?;
            return Err("media tool timed out and was stopped".to_string());
        }
    };
    let stdout = stdout_reader
        .await
        .map_err(|error| format!("media tool stdout task failed: {error}"))?
        .map_err(|error| format!("failed to read {tool} stdout: {error}"))?;
    let stderr = stderr_reader
        .await
        .map_err(|error| format!("media tool stderr task failed: {error}"))?
        .map_err(|error| format!("failed to read {tool} stderr: {error}"))?;

    Ok(MediaToolResult {
        ok: status.success(),
        stdout: String::from_utf8_lossy(&stdout).to_string(),
        stderr: String::from_utf8_lossy(&stderr).to_string(),
        code: status.code(),
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

    #[cfg(unix)]
    #[tokio::test]
    async fn timeout_kills_and_reaps_the_spawned_process() {
        let directory = tempfile::tempdir().expect("temp directory");
        let pid_file = directory.path().join("pid");
        let script = format!("echo $$ > '{}'; exec sleep 30", pid_file.display());

        let error = run_media_tool_process(
            "/bin/sh".to_string(),
            "test-media-tool".to_string(),
            vec!["-c".to_string(), script],
            Duration::from_millis(100),
        )
        .await
        .expect_err("the process should time out");
        assert_eq!(error, "media tool timed out and was stopped");

        let pid = std::fs::read_to_string(pid_file)
            .expect("child wrote its pid")
            .trim()
            .to_string();
        let still_running = std::process::Command::new("/bin/kill")
            .args(["-0", &pid])
            .status()
            .expect("kill probe runs")
            .success();
        assert!(!still_running, "timed-out child {pid} must be reaped");
    }
}
