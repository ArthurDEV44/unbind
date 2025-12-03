use crate::scanner::{self, PortInfo};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct CommandResponse<T> {
    pub success: bool,
    pub data: Option<T>,
    pub error: Option<String>,
}

impl<T> CommandResponse<T> {
    pub fn ok(data: T) -> Self {
        CommandResponse {
            success: true,
            data: Some(data),
            error: None,
        }
    }

    pub fn err(message: String) -> Self {
        CommandResponse {
            success: false,
            data: None,
            error: Some(message),
        }
    }
}

/// Scan all listening ports
#[tauri::command]
pub fn scan_ports() -> CommandResponse<Vec<PortInfo>> {
    match scanner::scan_ports() {
        Ok(ports) => CommandResponse::ok(ports),
        Err(e) => CommandResponse::err(e.message),
    }
}

/// Kill a process by PID
#[tauri::command]
pub fn kill_process(pid: u32) -> CommandResponse<()> {
    match scanner::kill_process(pid) {
        Ok(()) => CommandResponse::ok(()),
        Err(e) => CommandResponse::err(e.message),
    }
}

/// Get a specific port info
#[tauri::command]
pub fn get_port_info(port: u16) -> CommandResponse<Option<PortInfo>> {
    match scanner::scan_ports() {
        Ok(ports) => {
            let port_info = ports.into_iter().find(|p| p.port == port);
            CommandResponse::ok(port_info)
        }
        Err(e) => CommandResponse::err(e.message),
    }
}
