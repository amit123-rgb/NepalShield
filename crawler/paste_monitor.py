import requests
import time
import sys
sys.path.append('/home/amit/NepalShield')
from detection.keyword_filter import analyze_text

def scan_manual_text(text, source="manual-input"):
    """Scan any text you paste manually for gov.np credentials"""
    print(f"\n🔍 Scanning text from: {source}")
    result = analyze_text(text, source)
    return result

def monitor_pastebin():
    """Fetch recent public pastes and scan them"""
    print("🔍 Scanning recent Pastebin pastes...")
    print("⚠️  Note: Full scraping API requires Pastebin Pro account")
    print("✅ Using manual scan mode for now\n")

    # Sample test data simulating a real breach
    test_pastes = [
        {
            "source": "pastebin.com/abc123",
            "text": """
                Nepal Government Employee Database
                admin@mofa.gov.np : Summer2024!
                secretary@moha.gov.np : Nepal@123
                it@nitc.gov.np : password123
                credentials leaked from gov server backup
            """
        },
        {
            "source": "pastebin.com/xyz456",
            "text": """
                Random text about cooking recipes
                Nothing sensitive here
                Just normal content
            """
        },
        {
            "source": "ghostbin.com/abc789",
            "text": """
                Nepal Police Internal System Dump
                officer@nepalpolice.gov.np : Police@2024
                inspector@nepalpolice.gov.np : Nepal#999
                database breach credentials dump
            """
        }
    ]

    threats = []
    for paste in test_pastes:
        print(f"📋 Checking: {paste['source']}")
        result = analyze_text(paste["text"], source=paste["source"])
        if result["is_threat"]:
            threats.append(result)
        time.sleep(1)

    print(f"\n📊 Scan complete!")
    print(f"   Total checked : {len(test_pastes)}")
    print(f"   Threats found : {len(threats)}")
    return threats

if __name__ == "__main__":
    threats = monitor_pastebin()
    if threats:
        print("\n🚨 SUMMARY OF THREATS FOUND:")
        for i, t in enumerate(threats, 1):
            print(f"\n  Threat #{i}")
            print(f"  Source : {t['source']}")
            print(f"  Emails : {t['emails']}")
            print(f"  Score  : {t['score']}/10")
