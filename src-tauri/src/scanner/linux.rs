use super::{PortInfo, ScanError, ScanResult};
use std::collections::HashMap;
use std::fs;
use std::process::Command;

/// Scan listening ports on Linux using /proc filesystem and ss command
pub fn scan_ports() -> ScanResult<Vec<PortInfo>> {
    // Try ss command first (more reliable)
    match scan_with_ss() {
        Ok(ports) => Ok(ports),
        Err(_) => {
            // Fallback to parsing /proc/net directly
            scan_with_proc()
        }
    }
}

/// Scan using ss command
fn scan_with_ss() -> ScanResult<Vec<PortInfo>> {
    let output = Command::new("ss")
        .args(["-tlnp", "-H"]) // TCP, listening, numeric, processes, no header
        .output()?;

    if !output.status.success() {
        return Err(ScanError::from("ss command failed"));
    }

    let stdout = String::from_utf8_lossy(&output.stdout);
    let mut ports = Vec::new();

    for line in stdout.lines() {
        if let Some(port_info) = parse_ss_line(line) {
            ports.push(port_info);
        }
    }

    // Also get UDP
    let udp_output = Command::new("ss")
        .args(["-ulnp", "-H"]) // UDP, listening, numeric, processes, no header
        .output()?;

    if udp_output.status.success() {
        let udp_stdout = String::from_utf8_lossy(&udp_output.stdout);
        for line in udp_stdout.lines() {
            if let Some(mut port_info) = parse_ss_line(line) {
                port_info.protocol = "udp".to_string();
                ports.push(port_info);
            }
        }
    }

    Ok(ports)
}

/// Parse a line from ss output
/// Format: LISTEN 0 4096 0.0.0.0:22 0.0.0.0:* users:(("sshd",pid=1234,fd=3))
fn parse_ss_line(line: &str) -> Option<PortInfo> {
    let parts: Vec<&str> = line.split_whitespace().collect();
    if parts.len() < 5 {
        return None;
    }

    // Get local address (format: addr:port)
    let local_addr = parts[3];
    let (address, port) = parse_address_port(local_addr)?;

    // Get process info from the last part
    let (pid, process_name) = if let Some(users_part) = parts.get(5) {
        parse_users_field(users_part)
    } else {
        (0, "unknown".to_string())
    };

    Some(PortInfo {
        port,
        pid,
        process_name,
        protocol: "tcp".to_string(),
        local_address: address,
        state: "LISTEN".to_string(),
    })
}

/// Parse address:port format
fn parse_address_port(addr_port: &str) -> Option<(String, u16)> {
    // Handle IPv6 format [::]:port or IPv4 format addr:port
    if let Some(bracket_pos) = addr_port.rfind("]:") {
        let port_str = &addr_port[bracket_pos + 2..];
        let addr = &addr_port[..bracket_pos + 1];
        let port = port_str.parse().ok()?;
        Some((addr.to_string(), port))
    } else if let Some(colon_pos) = addr_port.rfind(':') {
        let port_str = &addr_port[colon_pos + 1..];
        let addr = &addr_port[..colon_pos];
        let port = port_str.parse().ok()?;
        Some((addr.to_string(), port))
    } else {
        None
    }
}

/// Parse users field from ss: users:(("process",pid=123,fd=4))
fn parse_users_field(field: &str) -> (u32, String) {
    // Extract process name
    let process_name = field
        .split("((\"")
        .nth(1)
        .and_then(|s| s.split('"').next())
        .unwrap_or("unknown")
        .to_string();

    // Extract PID
    let pid = field
        .split("pid=")
        .nth(1)
        .and_then(|s| s.split(',').next())
        .and_then(|s| s.split(')').next())
        .and_then(|s| s.parse().ok())
        .unwrap_or(0);

    (pid, process_name)
}

/// Fallback: scan using /proc/net
fn scan_with_proc() -> ScanResult<Vec<PortInfo>> {
    let mut ports = Vec::new();
    let pid_to_name = build_pid_name_map();

    // Parse TCP
    if let Ok(content) = fs::read_to_string("/proc/net/tcp") {
        for line in content.lines().skip(1) {
            if let Some(port_info) = parse_proc_net_line(line, "tcp", &pid_to_name) {
                ports.push(port_info);
            }
        }
    }

    // Parse TCP6
    if let Ok(content) = fs::read_to_string("/proc/net/tcp6") {
        for line in content.lines().skip(1) {
            if let Some(port_info) = parse_proc_net_line(line, "tcp", &pid_to_name) {
                ports.push(port_info);
            }
        }
    }

    // Parse UDP
    if let Ok(content) = fs::read_to_string("/proc/net/udp") {
        for line in content.lines().skip(1) {
            if let Some(port_info) = parse_proc_net_line(line, "udp", &pid_to_name) {
                ports.push(port_info);
            }
        }
    }

    Ok(ports)
}

/// Parse a line from /proc/net/tcp or /proc/net/udp
fn parse_proc_net_line(
    line: &str,
    protocol: &str,
    pid_map: &HashMap<u32, String>,
) -> Option<PortInfo> {
    let parts: Vec<&str> = line.split_whitespace().collect();
    if parts.len() < 4 {
        return None;
    }

    // State: 0A = LISTEN
    let state = parts.get(3)?;
    if *state != "0A" {
        return None; // Only listening sockets
    }

    // Local address format: hex_ip:hex_port
    let local_addr = parts.get(1)?;
    let addr_parts: Vec<&str> = local_addr.split(':').collect();
    if addr_parts.len() != 2 {
        return None;
    }

    let port = u16::from_str_radix(addr_parts[1], 16).ok()?;
    let inode = parts.get(9)?.parse::<u64>().ok()?;

    // Find PID by inode
    let (pid, process_name) = find_pid_by_inode(inode, pid_map);

    Some(PortInfo {
        port,
        pid,
        process_name,
        protocol: protocol.to_string(),
        local_address: "0.0.0.0".to_string(),
        state: "LISTEN".to_string(),
    })
}

/// Build a map of PID to process name
fn build_pid_name_map() -> HashMap<u32, String> {
    let mut map = HashMap::new();

    if let Ok(entries) = fs::read_dir("/proc") {
        for entry in entries.flatten() {
            let name = entry.file_name();
            if let Some(name_str) = name.to_str() {
                if let Ok(pid) = name_str.parse::<u32>() {
                    let comm_path = format!("/proc/{}/comm", pid);
                    if let Ok(comm) = fs::read_to_string(&comm_path) {
                        map.insert(pid, comm.trim().to_string());
                    }
                }
            }
        }
    }

    map
}

/// Find PID by socket inode
fn find_pid_by_inode(inode: u64, pid_map: &HashMap<u32, String>) -> (u32, String) {
    let socket_pattern = format!("socket:[{}]", inode);

    if let Ok(entries) = fs::read_dir("/proc") {
        for entry in entries.flatten() {
            let name = entry.file_name();
            if let Some(name_str) = name.to_str() {
                if let Ok(pid) = name_str.parse::<u32>() {
                    let fd_path = format!("/proc/{}/fd", pid);
                    if let Ok(fd_entries) = fs::read_dir(&fd_path) {
                        for fd_entry in fd_entries.flatten() {
                            if let Ok(link) = fs::read_link(fd_entry.path()) {
                                if link.to_string_lossy() == socket_pattern {
                                    let name = pid_map
                                        .get(&pid)
                                        .cloned()
                                        .unwrap_or_else(|| "unknown".to_string());
                                    return (pid, name);
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    (0, "unknown".to_string())
}

/// Kill a process by PID on Linux
pub fn kill_process(pid: u32) -> ScanResult<()> {
    let output = Command::new("kill")
        .args(["-9", &pid.to_string()])
        .output()?;

    if output.status.success() {
        Ok(())
    } else {
        let stderr = String::from_utf8_lossy(&output.stderr);
        Err(ScanError::from(format!("Failed to kill process: {}", stderr)))
    }
}
