use super::{PortInfo, ScanError, ScanResult};
use std::collections::HashMap;
use std::process::Command;

/// Scan listening ports on Windows using netstat and tasklist
pub fn scan_ports() -> ScanResult<Vec<PortInfo>> {
    // Build PID to process name map first
    let pid_to_name = build_pid_name_map()?;

    // Use netstat to list listening ports
    // -a = all connections
    // -n = numeric addresses
    // -o = show PID
    // -p TCP = TCP only (we'll run again for UDP)
    let tcp_output = Command::new("netstat")
        .args(["-ano", "-p", "TCP"])
        .output()?;

    let mut ports = Vec::new();

    if tcp_output.status.success() {
        let stdout = String::from_utf8_lossy(&tcp_output.stdout);
        for line in stdout.lines() {
            if let Some(port_info) = parse_netstat_line(line, "tcp", &pid_to_name) {
                ports.push(port_info);
            }
        }
    }

    // Get UDP listeners
    let udp_output = Command::new("netstat")
        .args(["-ano", "-p", "UDP"])
        .output()?;

    if udp_output.status.success() {
        let stdout = String::from_utf8_lossy(&udp_output.stdout);
        for line in stdout.lines() {
            if let Some(port_info) = parse_netstat_line(line, "udp", &pid_to_name) {
                ports.push(port_info);
            }
        }
    }

    Ok(ports)
}

/// Parse a line from netstat output
/// Format: Proto Local Address Foreign Address State PID
/// Example: TCP 0.0.0.0:3000 0.0.0.0:0 LISTENING 1234
fn parse_netstat_line(line: &str, protocol: &str, pid_map: &HashMap<u32, String>) -> Option<PortInfo> {
    let line = line.trim();

    // Skip header lines and empty lines
    if line.is_empty() || line.starts_with("Proto") || line.starts_with("Active") {
        return None;
    }

    let parts: Vec<&str> = line.split_whitespace().collect();

    // TCP lines have 5 columns, UDP lines have 4 (no state)
    let (local_addr_idx, state, pid_idx) = if line.to_uppercase().starts_with("TCP") {
        if parts.len() < 5 {
            return None;
        }
        // Only interested in LISTENING state
        if !parts[3].eq_ignore_ascii_case("LISTENING") {
            return None;
        }
        (1, "LISTEN".to_string(), 4)
    } else if line.to_uppercase().starts_with("UDP") {
        if parts.len() < 4 {
            return None;
        }
        (1, "LISTEN".to_string(), 3)
    } else {
        return None;
    };

    // Parse local address (format: IP:port or [IPv6]:port)
    let local_addr = parts[local_addr_idx];
    let (address, port) = parse_address_port(local_addr)?;

    // Parse PID
    let pid: u32 = parts[pid_idx].parse().ok()?;

    // Skip system process (PID 0)
    if pid == 0 {
        return None;
    }

    let process_name = pid_map
        .get(&pid)
        .cloned()
        .unwrap_or_else(|| "unknown".to_string());

    Some(PortInfo {
        port,
        pid,
        process_name,
        protocol: protocol.to_string(),
        local_address: address,
        state,
    })
}

/// Parse address:port format for Windows
fn parse_address_port(addr_port: &str) -> Option<(String, u16)> {
    // Handle IPv6 format [::]:port
    if let Some(bracket_pos) = addr_port.rfind("]:") {
        let port_str = &addr_port[bracket_pos + 2..];
        let addr = &addr_port[..bracket_pos + 1];
        let port = port_str.parse().ok()?;
        return Some((addr.to_string(), port));
    }

    // Handle IPv4 format addr:port
    if let Some(colon_pos) = addr_port.rfind(':') {
        let port_str = &addr_port[colon_pos + 1..];
        let addr = &addr_port[..colon_pos];
        let port = port_str.parse().ok()?;
        return Some((addr.to_string(), port));
    }

    None
}

/// Build a map of PID to process name using tasklist
fn build_pid_name_map() -> ScanResult<HashMap<u32, String>> {
    let output = Command::new("tasklist")
        .args(["/FO", "CSV", "/NH"]) // CSV format, no header
        .output()?;

    let mut map = HashMap::new();

    if output.status.success() {
        let stdout = String::from_utf8_lossy(&output.stdout);
        for line in stdout.lines() {
            // Format: "process.exe","1234","Console","1","memory"
            let parts: Vec<&str> = line.split(',').collect();
            if parts.len() >= 2 {
                let name = parts[0].trim_matches('"').to_string();
                if let Ok(pid) = parts[1].trim_matches('"').parse::<u32>() {
                    map.insert(pid, name);
                }
            }
        }
    }

    Ok(map)
}

/// Kill a process by PID on Windows
pub fn kill_process(pid: u32) -> ScanResult<()> {
    let output = Command::new("taskkill")
        .args(["/F", "/PID", &pid.to_string()])
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
