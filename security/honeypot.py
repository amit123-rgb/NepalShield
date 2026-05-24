import socket
import threading
import json
import time
import sys
from datetime import datetime
from collections import defaultdict
sys.path.append('/home/amit/NepalShield')

class Honeypot:
    def __init__(self):
        self.captured_attacks = []
        self.attacker_profiles = defaultdict(lambda: {
            "ip": "",
            "first_seen": "",
            "last_seen": "",
            "attempts": 0,
            "commands": [],
            "ports_tried": set()
        })
        self.running = False

    def log_attack(self, ip, port, data, attack_type="CONNECTION"):
        """Log an attacker interaction"""
        profile = self.attacker_profiles[ip]
        profile["ip"]        = ip
        profile["last_seen"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        profile["attempts"] += 1
        profile["ports_tried"].add(port)

        if not profile["first_seen"]:
            profile["first_seen"] = profile["last_seen"]

        attack = {
            "ip":          ip,
            "port":        port,
            "type":        attack_type,
            "data":        str(data)[:200],
            "timestamp":   datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "total_attempts": profile["attempts"]
        }

        self.captured_attacks.append(attack)

        print(f"\n\033[95m[HONEYPOT] Attacker caught!")
        print(f"  IP        : {ip}")
        print(f"  Port      : {port}")
        print(f"  Type      : {attack_type}")
        print(f"  Data      : {str(data)[:100]}")
        print(f"  Attempts  : {profile['attempts']}\033[0m")

        return attack

    def fake_ssh_handler(self, conn, addr):
        """Fake SSH server to trap attackers"""
        ip   = addr[0]
        port = addr[1]
        try:
            conn.send(b"SSH-2.0-OpenSSH_8.9p1 Ubuntu-3ubuntu0.1\r\n")
            data = conn.recv(1024)
            self.log_attack(ip, 22, data, "SSH_PROBE")
            conn.send(b"Permission denied (publickey,password).\r\n")
        except:
            pass
        finally:
            conn.close()

    def fake_http_handler(self, conn, addr):
        """Fake HTTP server to trap attackers"""
        ip   = addr[0]
        port = addr[1]
        try:
            data = conn.recv(4096).decode('utf-8', errors='ignore')

            # Detect attack type from request
            attack_type = "HTTP_PROBE"
            if "UNION SELECT" in data.upper():
                attack_type = "SQL_INJECTION"
            elif "<script" in data.lower():
                attack_type = "XSS_ATTEMPT"
            elif "../" in data:
                attack_type = "PATH_TRAVERSAL"
            elif "cmd.exe" in data.lower() or "/bin/sh" in data:
                attack_type = "COMMAND_INJECTION"

            self.log_attack(ip, port, data[:200], attack_type)

            # Send fake response
            response = b"""HTTP/1.1 200 OK\r\n"""
            response += b"""Content-Type: text/html\r\n\r\n"""
            response += b"""<html><body><h1>Nepal Government Portal</h1>"""
            response += b"""<p>Welcome to the official portal.</p></body></html>"""
            conn.send(response)

        except:
            pass
        finally:
            conn.close()

    def start_listener(self, port, handler, name):
        """Start a fake service listener"""
        try:
            server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            server.bind(('0.0.0.0', port))
            server.listen(5)
            server.settimeout(1)
            print(f"\033[92m[HONEYPOT] {name} listening on port {port}\033[0m")

            while self.running:
                try:
                    conn, addr = server.accept()
                    thread = threading.Thread(
                        target=handler,
                        args=(conn, addr),
                        daemon=True
                    )
                    thread.start()
                except socket.timeout:
                    continue
                except Exception as e:
                    break

            server.close()
        except Exception as e:
            print(f"[HONEYPOT] Could not bind port {port}: {e}")

    def get_attacker_report(self):
        """Generate report of all caught attackers"""
        report = []
        for ip, profile in self.attacker_profiles.items():
            report.append({
                "ip":          ip,
                "first_seen":  profile["first_seen"],
                "last_seen":   profile["last_seen"],
                "attempts":    profile["attempts"],
                "ports_tried": list(profile["ports_tried"]),
                "risk_level":  "HIGH" if profile["attempts"] > 5 else "MEDIUM"
            })
        return sorted(report, key=lambda x: x["attempts"], reverse=True)

    def simulate_attacks(self):
        """Simulate attacks for testing"""
        print("\n" + "="*45)
        print("  NEPALSHIELD HONEYPOT — SIMULATION TEST")
        print("="*45)

        fake_attacks = [
            {"ip": "185.220.101.45", "port": 22,   "data": "SSH-2.0-PuTTY_Release_0.77",    "type": "SSH_PROBE"},
            {"ip": "185.220.101.45", "port": 22,   "data": "root:password123",               "type": "BRUTE_FORCE"},
            {"ip": "45.142.212.100", "port": 8080, "data": "GET /?id=1 UNION SELECT 1,2,3--","type": "SQL_INJECTION"},
            {"ip": "45.142.212.100", "port": 8080, "data": "<script>alert(1)</script>",       "type": "XSS_ATTEMPT"},
            {"ip": "194.165.16.11",  "port": 22,   "data": "admin:admin",                    "type": "BRUTE_FORCE"},
            {"ip": "194.165.16.11",  "port": 8080, "data": "GET /../../etc/passwd",          "type": "PATH_TRAVERSAL"},
            {"ip": "91.240.118.222", "port": 3306, "data": "MySQL connection attempt",        "type": "DB_PROBE"},
        ]

        print("\nSimulating real attacker scenarios...")
        for attack in fake_attacks:
            self.log_attack(
                attack["ip"],
                attack["port"],
                attack["data"],
                attack["type"]
            )
            time.sleep(0.5)

        report = self.get_attacker_report()
        print(f"\n{'='*45}")
        print(f"HONEYPOT REPORT")
        print(f"Total attackers caught : {len(report)}")
        print(f"Total attack attempts  : {sum(r['attempts'] for r in report)}")
        print(f"\nTOP ATTACKERS:")
        for r in report[:3]:
            print(f"  {r['ip']} — {r['attempts']} attempts — {r['risk_level']}")

        return report

    def start(self):
        """Start all honeypot services"""
        self.running = True
        print("\n" + "="*45)
        print("  NEPALSHIELD HONEYPOT — STARTING")
        print("="*45)

        services = [
            (2222,  self.fake_ssh_handler,  "Fake SSH"),
            (8888,  self.fake_http_handler, "Fake HTTP"),
        ]

        threads = []
        for port, handler, name in services:
            t = threading.Thread(
                target=self.start_listener,
                args=(port, handler, name),
                daemon=True
            )
            t.start()
            threads.append(t)

        print("\nHoneypot active! Waiting for attackers...")
        print("Press Ctrl+C to stop.\n")

        try:
            while True:
                time.sleep(10)
                if self.captured_attacks:
                    print(f"[{datetime.now().strftime('%H:%M:%S')}] Total attacks captured: {len(self.captured_attacks)}")
        except KeyboardInterrupt:
            self.running = False
            print(f"\nHoneypot stopped. Caught {len(self.captured_attacks)} attacks.")
            return self.get_attacker_report()

if __name__ == "__main__":
    hp = Honeypot()
    hp.simulate_attacks()
