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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_port_info_serialization() {
        let port_info = PortInfo {
            port: 3000,
            pid: 1234,
            process_name: "node".to_string(),
            protocol: "tcp".to_string(),
            local_address: "0.0.0.0".to_string(),
            state: "LISTEN".to_string(),
        };

        let json = serde_json::to_string(&port_info).unwrap();
        assert!(json.contains("\"port\":3000"));
        assert!(json.contains("\"pid\":1234"));
        assert!(json.contains("\"process_name\":\"node\""));
    }

    #[test]
    fn test_port_info_deserialization() {
        let json = r#"{
            "port": 8080,
            "pid": 5678,
            "process_name": "java",
            "protocol": "tcp",
            "local_address": "127.0.0.1",
            "state": "LISTEN"
        }"#;

        let port_info: PortInfo = serde_json::from_str(json).unwrap();
        assert_eq!(port_info.port, 8080);
        assert_eq!(port_info.pid, 5678);
        assert_eq!(port_info.process_name, "java");
        assert_eq!(port_info.protocol, "tcp");
        assert_eq!(port_info.local_address, "127.0.0.1");
        assert_eq!(port_info.state, "LISTEN");
    }

    #[test]
    fn test_port_info_clone() {
        let original = PortInfo {
            port: 3000,
            pid: 1234,
            process_name: "node".to_string(),
            protocol: "tcp".to_string(),
            local_address: "0.0.0.0".to_string(),
            state: "LISTEN".to_string(),
        };

        let cloned = original.clone();
        assert_eq!(original.port, cloned.port);
        assert_eq!(original.pid, cloned.pid);
        assert_eq!(original.process_name, cloned.process_name);
    }

    #[test]
    fn test_scan_error_from_io_error() {
        let io_error = std::io::Error::new(std::io::ErrorKind::NotFound, "File not found");
        let scan_error: ScanError = io_error.into();
        assert!(scan_error.message.contains("File not found"));
    }

    #[test]
    fn test_scan_error_from_string() {
        let error: ScanError = "Something went wrong".to_string().into();
        assert_eq!(error.message, "Something went wrong");
    }

    #[test]
    fn test_scan_error_from_str() {
        let error: ScanError = "Error message".into();
        assert_eq!(error.message, "Error message");
    }

    #[test]
    fn test_scan_error_serialization() {
        let error = ScanError {
            message: "Test error".to_string(),
        };

        let json = serde_json::to_string(&error).unwrap();
        assert!(json.contains("\"message\":\"Test error\""));
    }
}
