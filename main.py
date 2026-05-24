import time
import sys
sys.path.append('/home/amit/NepalShield')
from crawler.paste_monitor import run_full_scan
from alerts.email_alert import send_alert
from database.models import Session, Breach
from colorama import Fore, Style, init

init(autoreset=True)

def save_threat(threat):
    session = Session()
    try:
        existing = session.query(Breach).filter_by(
            hash_id=threat["hash_id"]
        ).first()
        if existing:
            print(Fore.YELLOW + f"  Already logged: {threat['source']}")
            return False
        breach = Breach(
            source       = threat["source"],
            email        = ', '.join(threat["emails"]) if threat["emails"] else "Unknown",
            domain       = "gov.np",
            data_found   = threat["raw_text"],
            threat_score = threat["score"],
            hash_id      = threat["hash_id"],
            alerted      = "No"
        )
        session.add(breach)
        session.commit()
        print(Fore.GREEN + f"  Saved to database!")
        return True
    except Exception as e:
        print(Fore.RED + f"  DB Error: {e}")
        session.rollback()
        return False
    finally:
        session.close()

def run_monitor():
    print(Fore.CYAN + """
╔══════════════════════════════════════════╗
║   NEPALSHIELD v2.0                      ║
║   Government Breach Monitor              ║
║   Nepal Cybersecurity System             ║
╚══════════════════════════════════════════╝
    """)

    scan_count = 0

    while True:
        scan_count += 1
        print(Fore.CYAN + f"\n{'='*45}")
        print(Fore.CYAN + f"  SCAN #{scan_count} STARTED")
        print(Fore.CYAN + f"{'='*45}")

        threats = run_full_scan()

        new_threats = 0
        for threat in threats:
            saved = save_threat(threat)
            if saved:
                new_threats += 1
                try:
                    send_alert(threat, "NTA")
                except Exception as e:
                    print(Fore.YELLOW + f"  Alert error: {e}")

        if new_threats > 0:
            print(Fore.RED + f"\n{new_threats} NEW threat(s) saved and alerted!")
        else:
            print(Fore.GREEN + f"\nNo new threats this scan.")

        print(Fore.YELLOW + f"\nNext scan in 60 seconds...")
        print(Fore.YELLOW + f"Press Ctrl+C to stop.\n")
        time.sleep(60)

if __name__ == "__main__":
    try:
        run_monitor()
    except KeyboardInterrupt:
        print(Fore.CYAN + "\n\nNepalShield stopped. Stay safe!")
