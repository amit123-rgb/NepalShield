import re
import hashlib

GOV_PATTERNS = [
    r'[\w\.-]+@[\w\.-]+\.gov\.np',
    r'[\w\.-]+@[\w\.-]+\.mil\.np',
    r'[\w\.-]+@[\w\.-]+\.edu\.np',
]

SENSITIVE_KEYWORDS = [
    "gov.np", "nepal government", "nepal police",
    "nepal army", "nepal telecom", "nta.gov",
    "moha.gov", "moe.gov", "nrb.org",
    "password", "passwd", "credentials",
    "username", "leaked", "dump", "breach"
]

def extract_gov_emails(text):
    emails = []
    for pattern in GOV_PATTERNS:
        found = re.findall(pattern, text, re.IGNORECASE)
        emails.extend(found)
    return list(set(emails))

def contains_sensitive_keywords(text):
    text_lower = text.lower()
    found = []
    for keyword in SENSITIVE_KEYWORDS:
        if keyword in text_lower:
            found.append(keyword)
    return found

def score_threat(text, emails_found, keywords_found):
    score = 0
    score += len(emails_found) * 2
    score += len(keywords_found)
    if "password" in text.lower(): score += 3
    if "admin" in text.lower(): score += 2
    return min(score, 10)

def make_hash(text):
    return hashlib.sha256(text.encode()).hexdigest()

def analyze_text(text, source="unknown"):
    emails   = extract_gov_emails(text)
    keywords = contains_sensitive_keywords(text)
    score    = score_threat(text, emails, keywords)
    hash_id  = make_hash(text[:500])

    result = {
        "source":    source,
        "emails":    emails,
        "keywords":  keywords,
        "score":     score,
        "hash_id":   hash_id,
        "raw_text":  text[:1000],
        "is_threat": score >= 3
    }

    if result["is_threat"]:
        print(f"\n🚨 THREAT DETECTED from {source}")
        print(f"   Emails found : {emails}")
        print(f"   Keywords     : {keywords}")
        print(f"   Threat score : {score}/10")
    else:
        print(f"✅ No threat found from {source}")

    return result

if __name__ == "__main__":
    sample = """
    Nepal Police database dump
    admin@nepal.gov.np : password123
    info@moha.gov.np : nepal@456
    credentials leaked from gov server
    """
    analyze_text(sample, source="test")
