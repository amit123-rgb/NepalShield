import psutil
import socket
import time
import json
import sys
from datetime import datetime
from collections import defaultdict
sys.path.append('/home/amit/NepalShield')

# ── THREAT THRESHOLDS ─────────────────────────────
MAX_CONNECTIONS_PER_IP = 10    # max connections from one IP
PORT_SCAN_THRESHOLD    = 5     # ports scanned in short time = port scan
BRUTE_FORCE_THRESHOLD  = 5     # failed attempts = brute force
TIME_WINDOW            = 60    # seconds to track activity

# ── SUSPICIOUS PORTS ──────────────────────────────
SUSPICIOUS_PORTS = [
    22,    # SSH
    23,    # Telnet
    3389,  # RDP
    445,   # SMB
    1433,  # MSSQL
    3306,  # MySQL
    5432,  # PostgreSQL
    6379,  # Redis
    27017, # MongoDB
    4444,  # Metasploit
    5555,  # Android Debug
    8080,  # HTTP alt
]

# ── KNOWN MALICIOUS IP RANGES ─────────────────────
MALICIOUS_RANGES = [
    "192.168.1.",  # example internal
    "10.0.0.",     # example internal
]

class IntrusionDetector:
    def __init__(self):
        self.connection_count  = defaultdict(int)
        self.port_scan_tracker = defaultdict(set)
        self.brute_force_track = defaultdict(int)
        self.alerts            = []
        self.blocked_ips       = set()
        self.start_time        = datetime.now()

    def get_network_connections(self):
        """Get all current network connections"""
        connections = []
        try:
            for conn in psutil.net_connections(kind='inet'):
                if conn.raddr:
                    connections.append({
                        "local_ip":   conn.laddr.ip if conn.laddr else "",
                        "local_port": conn.laddr.port if conn.laddr else 0,
                        "remote_ip":  conn.raddr.ip,
                        "remote_port":conn.raddr.port,
                        "status":     conn.status,
                        "pid":        conn.pid
                    })
        except Exception as e:
            print(f"Connection error: {e}")
        return connections

    def detect_port_scan(self, ip, port):
        """Detect if IP is scanning multiple ports"""
        self.port_scan_tracker[ip].add(port)
        if len(self.port_scan_tracker[ip]) >= PORT_SCAN_THRESHOLD:
            return True
        return False

    def detect_high_connections(self, ip):
        """Detect if IP has too many connections"""
        self.connection_count[ip] += 1
        if self.connection_count[ip] >= MAX_CONNECTIONS_PER_IP:
            return True
        return False

    def is_suspicious_port(self, port):
        """Check if port is commonly targeted"""
        return port in SUSPICIOUS_PORTS

    def create_alert(self, alert_type, ip, details, severity="MEDIUM"):
        """Create a new security alert"""
        alert = {
            "id":        len(self.alerts) + 1,
            "type":      alert_type,
            "ip":        ip,
            "details":   details,
            "severity":  severity,
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "blocked":   False
        }
        self.alerts.append(alert)

        color = {
            "CRITICAL": "\033[91m",
            "HIGH":     "\033[93m",
            "MEDIUM":   "\033[94m",
            "LOW":      "\033[92m"
        }.get(severity, "\033[0m")

        print(f"\n{color}[IDS ALERT] {severity} — {alert_type}")
        print(f"  IP      : {ip}")
        print(f"  Details : {details}")
        print(f"  Time    : {alert['timestamp']}\033[0m")

        return alert

    def analyze_connections(self):
        """Analyze all current connections for threats"""
        connections = self.get_network_connections()
        threats_found = 0

        for conn in connections:
            ip   = conn['remote_ip']
            port = conn['local_port']

            # Skip localhost
            if ip in ['127.0.0.1', '::1', '0.0.0.0']:
                continue

            # Check suspicious port access
            if self.is_suspicious_port(port):
                self.create_alert(
                    "SUSPICIOUS PORT ACCESS",
                    ip,
                    f"Connection to port {port} detected",
                    "HIGH"
                )
                threats_found += 1

            # Check high connection count
            if self.detect_high_connections(ip):
                self.create_alert(
                    "HIGH CONNECTION COUNT",
                    ip,
                    f"{self.connection_count[ip]} connections from same IP",
                    "CRITICAL"
                )
                self.blocked_ips.add(ip)
                threats_found += 1

            # Check port scanning
            if self.detect_port_scan(ip, port):
                self.create_alert(
                    "PORT SCAN DETECTED",
                    ip,
                    f"Scanned {len(self.port_scan_tracker[ip])} ports: {list(self.port_scan_tracker[ip])}",
                    "CRITICAL"
                )
                self.blocked_ips.add(ip)
                threats_found += 1

        return threats_found

    def get_network_stats(self):
        """Get current network statistics"""
        try:
            net_io   = psutil.net_io_counters()
            cpu_use  = psutil.cpu_percent(interval=1)
            mem_use  = psutil.virtual_memory().percent
            return {
                "bytes_sent":     net_io.bytes_sent,
                "bytes_recv":     net_io.bytes_recv,
                "packets_sent":   net_io.packets_sent,
                "packets_recv":   net_io.packets_recv,
                "cpu_percent":    cpu_use,
                "memory_percent": mem_use,
                "active_connections": len(self.get_network_connections()),
                "blocked_ips":    len(self.blocked_ips),
                "total_alerts":   len(self.alerts)
            }
        except Exception as e:
            return {"error": str(e)}

    def run_scan(self):
        """Run one IDS scan"""
        print("\n" + "="*45)
        print("  NEPALSHIELD IDS — NETWORK SCAN")
        print("="*45)

        stats = self.get_network_stats()
        print(f"\nNetwork Stats:")
        print(f"  CPU Usage    : {stats.get('cpu_percent', 0)}%")
        print(f"  Memory Usage : {stats.get('memory_percent', 0)}%")
        print(f"  Active Conns : {stats.get('active_connections', 0)}")
        print(f"  Blocked IPs  : {stats.get('blocked_ips', 0)}")

        threats = self.analyze_connections()
        print(f"\nScan complete — {threats} threat(s) found")

        return {
            "stats":  stats,
            "alerts": self.alerts[-10:],
            "blocked": list(self.blocked_ips)
        }

if __name__ == "__main__":
    ids = IntrusionDetector()
    print("Starting IDS scan...")
    result = ids.run_scan()
    print(f"\nTotal alerts: {len(result['alerts'])}")
    print(f"Blocked IPs : {result['blocked']}")
