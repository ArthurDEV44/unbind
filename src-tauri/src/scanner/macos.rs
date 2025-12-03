use super::{PortInfo, ScanError, ScanResult};
use std::process::Command;

/// Scan listening ports on macOS using lsof
pub fn scan_ports() -> ScanResult<Vec<PortInfo>> {
    // Use lsof to list all listening TCP and UDP ports
    // -i = select internet addresses
    // -P = inhibit port number to port name conversion
    // -n = inhibit host name conversion
    // -sTCP:LISTEN = only TCP in LISTEN state
    let tcp_output = Command::new("lsof")
        .args(["-i", "-P", "-n", "-sTCP:LISTEN"])
        .output()?;

    let mut ports = Vec::new();

    if tcp_output.status.success() {
        let stdout = String::from_utf8_lossy(&tcp_output.stdout);
        for line in stdout.lines().skip(1) {
            // Skip header
            if let Some(port_info) = parse_lsof_line(line, "tcp") {
                ports.push(port_info);
            }
        }
    }

    // Also get UDP listeners
    let udp_output = Command::new("lsof")
        .args(["-i", "UDP", "-P", "-n"])
        .output()?;

    if udp_output.status.success() {
        let stdout = String::from_utf8_lossy(&udp_output.stdout);
        for line in stdout.lines().skip(1) {
            if let Some(port_info) = parse_lsof_line(line, "udp") {
                ports.push(port_info);
            }
        }
    }

    // Deduplicate by port
    ports.sort_by_key(|p| p.port);
    ports.dedup_by_key(|p| p.port);

    Ok(ports)
}

/// Parse a line from lsof output
/// Format: COMMAND PID USER FD TYPE DEVICE SIZE/OFF NODE NAME
/// Example: node 1234 user 22u IPv4 0x... 0t0 TCP *:3000 (LISTEN)
fn parse_lsof_line(line: &str, protocol: &str) -> Option<PortInfo> {
    let parts: Vec<&str> = line.split_whitespace().collect();
    if parts.len() < 9 {
        return None;
    }

    let process_name = parts[0].to_string();
    let pid: u32 = parts[1].parse().ok()?;

    // The NAME field contains the address and port
    // Format: *:port or localhost:port or IP:port
    let name_field = parts.last()?;

    // Remove (LISTEN) suffix if present
    let name_clean = name_field.trim_end_matches("(LISTEN)").trim();

    // Extract port from format like *:3000 or 127.0.0.1:3000 or [::1]:3000
    let port = extract_port_from_name(name_clean)?;

    // Extract address
    let local_address = extract_address_from_name(name_clean);

    Some(PortInfo {
        port,
        pid,
        process_name,
        protocol: protocol.to_string(),
        local_address,
        state: "LISTEN".to_string(),
    })
}

/// Extract port from lsof NAME field
fn extract_port_from_name(name: &str) -> Option<u16> {
    // Handle IPv6 format [::]:port
    if let Some(bracket_pos) = name.rfind("]:") {
        let port_str = &name[bracket_pos + 2..];
        return port_str.parse().ok();
    }

    // Handle IPv4 or *:port format
    if let Some(colon_pos) = name.rfind(':') {
        let port_str = &name[colon_pos + 1..];
        return port_str.parse().ok();
    }

    None
}

/// Extract address from lsof NAME field
fn extract_address_from_name(name: &str) -> String {
    // Handle IPv6 format [::]:port
    if let Some(bracket_pos) = name.rfind("]:") {
        return name[..bracket_pos + 1].to_string();
    }

    // Handle IPv4 or *:port format
    if let Some(colon_pos) = name.rfind(':') {
        let addr = &name[..colon_pos];
        if addr == "*" {
            return "0.0.0.0".to_string();
        }
        return addr.to_string();
    }

    "0.0.0.0".to_string()
}

/// Kill a process by PID on macOS
pub fn kill_process(pid: u32) -> ScanResult<()> {
    let output = Command::new("kill")
        .args(["-9", &pid.to_string()])
        .output()?;

    if output.status.success() {
        Ok(())
    } else {
        let stderr = String::from_utf8_lossy(&output.stderr);
        Err(ScanError::from(format!(
            "Failed to kill process: {}",
            stderr
        )))
    }
}
