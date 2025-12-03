use serde::{Deserialize, Serialize};

#[cfg(target_os = "linux")]
mod linux;
#[cfg(target_os = "macos")]
mod macos;
#[cfg(target_os = "windows")]
mod windows;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PortInfo {
    pub port: u16,
    pub pid: u32,
    pub process_name: String,
    pub protocol: String,
    pub local_address: String,
    pub state: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ScanError {
    pub message: String,
}

impl From<std::io::Error> for ScanError {
    fn from(err: std::io::Error) -> Self {
        ScanError {
            message: err.to_string(),
        }
    }
}

impl From<String> for ScanError {
    fn from(err: String) -> Self {
        ScanError { message: err }
    }
}

impl From<&str> for ScanError {
    fn from(err: &str) -> Self {
        ScanError {
            message: err.to_string(),
        }
    }
}

pub type ScanResult<T> = Result<T, ScanError>;

/// Scan all listening ports on the system
pub fn scan_ports() -> ScanResult<Vec<PortInfo>> {
    #[cfg(target_os = "linux")]
    {
        linux::scan_ports()
    }
    #[cfg(target_os = "macos")]
    {
        macos::scan_ports()
    }
    #[cfg(target_os = "windows")]
    {
        windows::scan_ports()
    }
    #[cfg(not(any(target_os = "linux", target_os = "macos", target_os = "windows")))]
    {
        Err(ScanError::from("Unsupported operating system"))
    }
}

/// Kill a process by PID
pub fn kill_process(pid: u32) -> ScanResult<()> {
    #[cfg(target_os = "linux")]
    {
        linux::kill_process(pid)
    }
    #[cfg(target_os = "macos")]
    {
        macos::kill_process(pid)
    }
    #[cfg(target_os = "windows")]
    {
        windows::kill_process(pid)
    }
    #[cfg(not(any(target_os = "linux", target_os = "macos", target_os = "windows")))]
    {
        Err(ScanError::from("Unsupported operating system"))
    }
}
