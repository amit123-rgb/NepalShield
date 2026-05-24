import requests
import time
import sys
sys.path.append('/home/amit/NepalShield')
from detection.keyword_filter import analyze_text

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:102.0) Gecko/20100101 Firefox/102.0'
}

TOR_PROXY = {
    'http':  'socks5h://127.0.0.1:9050',
    'https': 'socks5h://127.0.0.1:9050'
}

def scan_pastebin_archive():
    """Scan real Pastebin archive for .gov.np leaks"""
    print("\nScanning Pastebin archive...")
    threats = []
    try:
        res = requests.get(
            "https://pastebin.com/archive",
            headers=HEADERS, timeout=15
        )
        if res.status_code == 200:
            import re
            paste_ids = re.findall(r'href="/([A-Za-z0-9]{8})"', res.text)
            print(f"Found {len(paste_ids)} pastes to check")
            for paste_id in paste_ids[:8]:
                try:
                    raw = requests.get(
                        f"https://pastebin.com/raw/{paste_id}",
                        headers=HEADERS, timeout=10
                    )
                    if raw.status_code == 200:
                        result = analyze_text(
                            raw.text,
                            source=f"pastebin.com/{paste_id}"
                        )
                        if result['is_threat']:
                            threats.append(result)
                    time.sleep(2)
                except Exception as e:
                    print(f"Error reading paste {paste_id}: {e}")
        else:
            print(f"Pastebin returned: {res.status_code}")
    except Exception as e:
        print(f"Pastebin error: {e}")
    return threats

def search_github_leaks():
    """Search GitHub for leaked .gov.np files"""
    print("\nSearching GitHub for .gov.np leaks...")
    threats = []
    queries = [
        'gov.np+password',
        'nepal+government+credentials',
        'moha.gov.np+leaked',
    ]
    for query in queries:
        try:
            url = f"https://api.github.com/search/code?q={query}&sort=indexed&order=desc"
            res = requests.get(url, headers=HEADERS, timeout=15)
            if res.status_code == 200:
                data  = res.json()
                items = data.get('items', [])
                print(f"GitHub '{query}': {len(items)} results")
                for item in items[:3]:
                    text   = f"{item.get('name','')} {item.get('path','')} {query}"
                    result = analyze_text(text, source=f"github:{item.get('html_url','')}")
                    if result['is_threat']:
                        threats.append(result)
            elif res.status_code == 403:
                print(f"GitHub rate limit — waiting 10s...")
                time.sleep(10)
            time.sleep(3)
        except Exception as e:
            print(f"GitHub error: {e}")
    return threats

def search_via_tor(query):
    """Search through Tor anonymously"""
    print(f"\nTor search: {query}")
    threats = []
    try:
        url = f"https://html.duckduckgo.com/html/?q={requests.utils.quote(query)}"
        res = requests.get(
            url, proxies=TOR_PROXY,
            headers=HEADERS, timeout=20
        )
        if res.status_code == 200:
            result = analyze_text(
                res.text,
                source=f"tor-search:{query[:30]}"
            )
            if result['is_threat']:
                threats.append(result)
                print(f"Threat found via Tor search!")
    except Exception as e:
        print(f"Tor search error: {e}")
    return threats

def monitor_pastebin():
    """Original monitor with test data"""
    print("Running paste monitor with test data...")
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
            "text": "Random cooking recipes nothing sensitive here"
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
        print(f"\nChecking: {paste['source']}")
        result = analyze_text(paste["text"], source=paste["source"])
        if result["is_threat"]:
            threats.append(result)
        time.sleep(1)
    return threats

def run_full_scan():
    """Run complete real scan"""
    print("\n" + "="*50)
    print("  NEPALSHIELD - FULL SOURCE MONITOR")
    print("  Scanning all sources for .gov.np leaks")
    print("="*50)

    all_threats = []

    # 1. Test data scan
    print("\n[1/4] Test data scan...")
    all_threats.extend(monitor_pastebin())

    # 2. Real Pastebin
    print("\n[2/4] Real Pastebin scan...")
    all_threats.extend(scan_pastebin_archive())

    # 3. GitHub search
    print("\n[3/4] GitHub leak search...")
    all_threats.extend(search_github_leaks())

    # 4. Tor searches
    print("\n[4/4] Tor anonymous search...")
    tor_queries = [
        '"gov.np" "password" leaked',
        '"nepal government" credentials dump',
    ]
    for query in tor_queries:
        all_threats.extend(search_via_tor(query))
        time.sleep(3)

    # Results summary
    print(f"\n{'='*50}")
    print(f"SCAN COMPLETE")
    print(f"Total threats : {len(all_threats)}")

    if all_threats:
        print(f"\nTHREATS FOUND:")
        for i, t in enumerate(all_threats, 1):
            print(f"\n  Threat #{i}")
            print(f"  Level  : {t['level']}")
            print(f"  Score  : {t['score']}/10")
            print(f"  Source : {t['source']}")
            print(f"  Emails : {t['emails']}")

    return all_threats

if __name__ == "__main__":
    run_full_scan()
