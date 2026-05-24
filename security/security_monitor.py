import time
import threading
import sys
sys.path.append('/home/amit/NepalShield')
from security.ids       import IntrusionDetector
from security.waf       import WebApplicationFirewall
from security.honeypot  import Honeypot
from colorama import Fore, init

init(autoreset=True)

class SecurityMonitor:
    def __init__(self):
        self.ids      = IntrusionDetector()
        self.waf      = WebApplicationFirewall()
        self.honeypot = Honeypot()
        self.running  = False

    def print_banner(self):
        print(Fore.RED + """
╔══════════════════════════════════════════════╗
║   NEPALSHIELD SECURITY MONITOR              ║
║   IDS + WAF + HONEYPOT Combined System      ║
║   Nepal Cybersecurity Defense System        ║
╚══════════════════════════════════════════════╝
        """)

    def run_ids_monitor(self):
        """Run IDS in background"""
        print(Fore.CYAN + "\n[IDS] Starting network monitoring...")
        while self.running:
            self.ids.run_scan()
            time.sleep(30)

    def run_security_monitor(self):
        """Run complete security monitor"""
        self.print_banner()
        self.running = True

        print(Fore.YELLOW + "\n[1/3] Starting IDS — Network Intrusion Detection")
        print(Fore.YELLOW + "[2/3] Starting WAF — Web Application Firewall")
        print(Fore.YELLOW + "[3/3] Starting Honeypot — Attacker Trap System")

        # Run IDS in background thread
        ids_thread = threading.Thread(
            target=self.run_ids_monitor,
            daemon=True
        )
        ids_thread.start()

        # Run WAF test
        print(Fore.CYAN + "\n" + "="*45)
        print(Fore.CYAN + "WAF PROTECTION — TESTING ATTACK DETECTION")
        self.waf.run_test()

        # Run Honeypot simulation
        print(Fore.CYAN + "\n" + "="*45)
        print(Fore.CYAN + "HONEYPOT — SIMULATING ATTACKER CAPTURE")
        self.honeypot.simulate_attacks()

        # Print combined report
        print(Fore.RED + "\n" + "="*45)
        print(Fore.RED + "COMBINED SECURITY REPORT")
        print(Fore.RED + "="*45)

        ids_stats  = self.ids.get_network_stats()
        waf_stats  = self.waf.get_stats()
        hp_report  = self.honeypot.get_attacker_report()

        print(Fore.WHITE + f"""
IDS Results:
  Active connections : {ids_stats.get('active_connections', 0)}
  Total IDS alerts   : {ids_stats.get('total_alerts', 0)}
  Blocked IPs        : {ids_stats.get('blocked_ips', 0)}

WAF Results:
  Attacks blocked    : {waf_stats['total_blocked']}
  Requests allowed   : {waf_stats['total_allowed']}

Honeypot Results:
  Attackers caught   : {len(hp_report)}
  Total attempts     : {sum(r['attempts'] for r in hp_report)}
        """)

        print(Fore.GREEN + "All security systems operational!")
        return {
            "ids":      ids_stats,
            "waf":      waf_stats,
            "honeypot": hp_report
        }

if __name__ == "__main__":
    monitor = SecurityMonitor()
    monitor.run_security_monitor()
