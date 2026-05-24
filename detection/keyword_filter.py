import re
import hashlib
import sys
sys.path.append('/home/amit/NepalShield')

# ── NEPAL GOVERNMENT DOMAINS ──────────────────────
GOV_PATTERNS = [
    r'[\w\.-]+@[\w\.-]+\.gov\.np',
    r'[\w\.-]+@[\w\.-]+\.mil\.np',
    r'[\w\.-]+@[\w\.-]+\.edu\.np',
    r'[\w\.-]+@[\w\.-]+\.org\.np',
    r'[\w\.-]+@nepal\.gov\.np',
    r'[\w\.-]+@nta\.gov\.np',
    r'[\w\.-]+@nepalpolice\.gov\.np',
    r'[\w\.-]+@moha\.gov\.np',
    r'[\w\.-]+@mofa\.gov\.np',
    r'[\w\.-]+@moe\.gov\.np',
    r'[\w\.-]+@nitc\.gov\.np',
    r'[\w\.-]+@election\.gov\.np',
]

# ── CRITICAL KEYWORDS (high score) ────────────────
CRITICAL_KEYWORDS = [
    "password", "passwd", "pwd", "pass123",
    "credentials", "leaked", "dump", "breach",
    "hacked", "compromised", "plaintext",
    "md5", "sha1", "hash", "cracked",
    "database leak", "db dump", "sql dump",
]

# ── NEPAL SPECIFIC KEYWORDS (medium score) ────────
NEPAL_KEYWORDS = [
    "gov.np", "nepal government", "nepal police",
    "nepal army", "nepal telecom", "nta.gov",
    "moha.gov", "mofa.gov", "moe.gov",
    "nitc.gov", "election.gov", "nrb.org",
    "nepal rastra bank", "singha durbar",
    "nepal army", "armed police force",
    "civil service", "loksewa",
]

# ── SENSITIVE DATA PATTERNS ───────────────────────
SENSITIVE_PATTERNS = [
    r'\b\d{16}\b',                          # credit card
    r'\b\d{10}\b',                          # NID/phone
    r'password\s*[:=]\s*\S+',              # password: value
    r'passwd\s*[:=]\s*\S+',               # passwd: value
    r'[\w\.-]+@[\w\.-]+\s*:\s*\S+',       # email:password combo
    r'[\w\.-]+@[\w\.-]+\s*\|\s*\S+',      # email|password combo
]

def extract_gov_emails(text):
    """Find all government emails in text"""
    emails = []
    for pattern in GOV_PATTERNS:
        found = re.findall(pattern, text, re.IGNORECASE)
        emails.extend(found)
    return list(set(emails))

def find_sensitive_patterns(text):
    """Find sensitive data patterns like email:password combos"""
    found = []
    for pattern in SENSITIVE_PATTERNS:
        matches = re.findall(pattern, text, re.IGNORECASE)
        found.extend(matches)
    return found

def contains_keywords(text):
    """Find all matching keywords"""
    text_lower = text.lower()
    critical = [k for k in CRITICAL_KEYWORDS if k in text_lower]
    nepal    = [k for k in NEPAL_KEYWORDS if k in text_lower]
    return critical, nepal

def calculate_threat_score(text, emails, critical_kw, nepal_kw, sensitive):
    """Advanced threat scoring 1-10"""
    score = 0

    # Email scoring
    score += min(len(emails) * 2, 4)        # max 4 points

    # Critical keyword scoring
    score += min(len(critical_kw) * 1, 3)   # max 3 points

    # Nepal keyword scoring
    score += min(len(nepal_kw) * 0.5, 1)    # max 1 point

    # Sensitive pattern scoring
    score += min(len(sensitive) * 1, 2)      # max 2 points

    # Bonus for email:password combos
    if re.search(r'[\w\.-]+@[\w\.-]+\.gov\.np\s*[:=|]\s*\S+', text, re.IGNORECASE):
        score += 3

    # Bonus for "dump" or "database"
    if any(w in text.lower() for w in ['dump', 'database', 'sql', 'backup']):
        score += 1

    return min(round(score), 10)

def get_threat_level(score):
    """Get human readable threat level"""
    if score >= 9: return "CRITICAL"
    if score >= 7: return "HIGH"
    if score >= 4: return "MEDIUM"
    return "LOW"

def make_hash(text):
    """Create unique ID for deduplication"""
    return hashlib.sha256(text.encode()).hexdigest()

def analyze_text(text, source="unknown"):
    """Full analysis of any text"""
    emails    = extract_gov_emails(text)
    crit_kw, nepal_kw = contains_keywords(text)
    sensitive = find_sensitive_patterns(text)
    score     = calculate_threat_score(text, emails, crit_kw, nepal_kw, sensitive)
    level     = get_threat_level(score)
    hash_id   = make_hash(text[:500])

    all_keywords = crit_kw + nepal_kw

    result = {
        "source":    source,
        "emails":    emails,
        "keywords":  all_keywords,
        "sensitive": sensitive,
        "score":     score,
        "level":     level,
        "hash_id":   hash_id,
        "raw_text":  text[:1000],
        "is_threat": score >= 3
    }

    if result["is_threat"]:
        print(f"\n{'='*45}")
        print(f"THREAT DETECTED from {source}")
        print(f"Level        : {level}")
        print(f"Score        : {score}/10")
        print(f"Emails found : {emails}")
        print(f"Keywords     : {all_keywords}")
        if sensitive:
            print(f"Sensitive    : {len(sensitive)} patterns found")
        print(f"{'='*45}")
    else:
        print(f"Clean: No threat from {source}")

    return result

if __name__ == "__main__":
    tests = [
        {
            "name": "Email:Password combo",
            "text": "admin@moha.gov.np:Nepal@2024\nsecretary@mofa.gov.np|password123"
        },
        {
            "name": "Database dump",
            "text": "Nepal government database dump\ninfo@nta.gov.np\ninfo@nitc.gov.np\npassword hashes leaked"
        },
        {
            "name": "Clean text",
            "text": "This is a normal news article about Nepal tourism"
        },
        {
            "name": "Critical breach",
            "text": "nepal police database compromised\nofficer@nepalpolice.gov.np:police123\ninspector@nepalpolice.gov.np:nepal456\nplaintext passwords leaked sql dump"
        },
    ]

    print("NEPALSHIELD — IMPROVED DETECTION ENGINE TEST")
    print("="*45)
    for t in tests:
        print(f"\nTest: {t['name']}")
        result = analyze_text(t['text'], source="test")
        print(f"Result: {result['level']} ({result['score']}/10)")
