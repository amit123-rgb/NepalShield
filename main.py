import time
import sys
sys.path.append('/home/amit/NepalShield')
from crawler.paste_monitor import monitor_pastebin
from alerts.email_alert import send_alert
from database.models import Session, Breach
from detection.keyword_filter import make_hash
from colorama import Fore, Style, init

init(autoreset=True)

def save_threat(threat):
    """Save detected threat to database"""
    session = Session()
    try:
        # Check if already exists
        existing = session.query(Breach).filter_by(
            hash_id=threat["hash_id"]
        ).first()

        if existing:
            print(Fore.YELLOW + f"  ⚠️  Already logged: {threat['source']}")
            return

        breach = Breach(
            source       = threat["source"],
            email        = ', '.join(threat["emails"]),
            domain       = "gov.np",
            data_found   = threat["raw_text"],
            threat_score = threat["score"],
            hash_id      = threat["hash_id"],
            alerted      = "No"
        )
        session.add(breach)
        session.commit()
        print(Fore.GREEN + f"  ✅ Saved to database!")

    except Exception as e:
        print(Fore.RED + f"  ❌ DB Error: {e}")
        session.rollback()
    finally:
        session.close()

def run_monitor():
    print(Fore.CYAN + """
╔══════════════════════════════════════╗
║   🇳🇵  NepalShield v1.0             ║
║   Government Breach Monitor          ║
║   Built for Nepal Cybersecurity      ║
╚══════════════════════════════════════╝
    """)

    scan_count = 0

    while True:
        scan_count += 1
        print(Fore.CYAN + f"\n{'='*45}")
        print(Fore.CYAN + f"  🔍 Scan #{scan_count} started...")
        print(Fore.CYAN + f"{'='*45}")

        # Run paste monitor
        threats = monitor_pastebin()

        if threats:
            print(Fore.RED + f"\n🚨 {len(threats)} threat(s) found!")
            for threat in threats:
                save_threat(threat)
                send_alert(threat, "NTA")
        else:
            print(Fore.GREEN + "\n✅ No threats found this scan.")

        print(Fore.YELLOW + f"\n⏳ Next scan in 60 seconds...")
        print(Fore.YELLOW + f"   Press Ctrl+C to stop.\n")
        time.sleep(60)

if __name__ == "__main__":
    try:
        run_monitor()
    except KeyboardInterrupt:
        print(Fore.CYAN + "\n\n👋 NepalShield stopped. Stay safe!")
