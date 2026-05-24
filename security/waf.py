import re
import sys
from datetime import datetime
from collections import defaultdict
sys.path.append('/home/amit/NepalShield')

# ── ATTACK PATTERNS ───────────────────────────────
SQL_INJECTION_PATTERNS = [
    r"(\bUNION\b.*\bSELECT\b)",
    r"(\bSELECT\b.*\bFROM\b)",
    r"(\bDROP\b.*\bTABLE\b)",
    r"(\bINSERT\b.*\bINTO\b)",
    r"(\bDELETE\b.*\bFROM\b)",
    r"(--|\#|\/\*)",
    r"(\bOR\b\s+\d+=\d+)",
    r"(\bAND\b\s+\d+=\d+)",
    r"(\'|\"|;|--)",
    r"(\bEXEC\b|\bEXECUTE\b)",
    r"(\bxp_\w+)",
    r"(\bWAITFOR\b.*\bDELAY\b)",
]

XSS_PATTERNS = [
    r"(<script[^>]*>.*?</script>)",
    r"(javascript\s*:)",
    r"(<.*?on\w+\s*=)",
    r"(<iframe[^>]*>)",
    r"(<img[^>]*onerror)",
    r"(alert\s*\()",
    r"(document\.cookie)",
    r"(window\.location)",
    r"(<svg[^>]*>)",
    r"(eval\s*\()",
]

PATH_TRAVERSAL_PATTERNS = [
    r"(\.\./|\.\.\\)",
    r"(/etc/passwd)",
    r"(/etc/shadow)",
    r"(c:\\windows)",
    r"(cmd\.exe)",
    r"(/proc/self)",
    r"(\%2e\%2e)",
    r"(\.\.%2f)",
]

COMMAND_INJECTION_PATTERNS = [
    r"(;\s*\w+)",
    r"(\|\s*\w+)",
    r"(`[^`]*`)",
    r"(\$\([^)]*\))",
    r"(\bping\b.*\-[cn])",
    r"(\bnmap\b)",
    r"(\bwget\b|\bcurl\b)",
    r"(\brm\b.*\-rf)",
    r"(\bchmod\b|\bchown\b)",
]

class WebApplicationFirewall:
    def __init__(self):
        self.blocked_requests = []
        self.allowed_requests = 0
        self.ip_request_count = defaultdict(int)
        self.ip_block_count   = defaultdict(int)

    def check_sql_injection(self, input_data):
        """Check for SQL injection attempts"""
        for pattern in SQL_INJECTION_PATTERNS:
            if re.search(pattern, input_data, re.IGNORECASE):
                return True, f"SQL Injection pattern: {pattern[:30]}"
        return False, None

    def check_xss(self, input_data):
        """Check for XSS attacks"""
        for pattern in XSS_PATTERNS:
            if re.search(pattern, input_data, re.IGNORECASE | re.DOTALL):
                return True, f"XSS pattern: {pattern[:30]}"
        return False, None

    def check_path_traversal(self, input_data):
        """Check for directory traversal attacks"""
        for pattern in PATH_TRAVERSAL_PATTERNS:
            if re.search(pattern, input_data, re.IGNORECASE):
                return True, f"Path traversal: {pattern[:30]}"
        return False, None

    def check_command_injection(self, input_data):
        """Check for command injection"""
        for pattern in COMMAND_INJECTION_PATTERNS:
            if re.search(pattern, input_data, re.IGNORECASE):
                return True, f"Command injection: {pattern[:30]}"
        return False, None

    def analyze_request(self, ip, method, path, params="", body=""):
        """Analyze a web request for attacks"""
        self.ip_request_count[ip] += 1
        all_input = f"{path} {params} {body}"

        checks = [
            ("SQL_INJECTION",      self.check_sql_injection(all_input)),
            ("XSS",                self.check_xss(all_input)),
            ("PATH_TRAVERSAL",     self.check_path_traversal(all_input)),
            ("COMMAND_INJECTION",  self.check_command_injection(all_input)),
        ]

        for attack_type, (detected, detail) in checks:
            if detected:
                self.ip_block_count[ip] += 1
                blocked = {
                    "ip":          ip,
                    "method":      method,
                    "path":        path,
                    "attack_type": attack_type,
                    "detail":      detail,
                    "timestamp":   datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                    "blocked":     True
                }
                self.blocked_requests.append(blocked)

                print(f"\n\033[91m[WAF BLOCKED] {attack_type}")
                print(f"  IP     : {ip}")
                print(f"  Path   : {path}")
                print(f"  Detail : {detail}\033[0m")

                return False, attack_type, detail

        self.allowed_requests += 1
        return True, None, None

    def get_stats(self):
        """Get WAF statistics"""
        return {
            "total_blocked":  len(self.blocked_requests),
            "total_allowed":  self.allowed_requests,
            "unique_ips":     len(self.ip_request_count),
            "top_attackers":  sorted(
                self.ip_block_count.items(),
                key=lambda x: x[1],
                reverse=True
            )[:5],
            "recent_blocks":  self.blocked_requests[-5:]
        }

    def run_test(self):
        """Test WAF with sample attacks"""
        print("\n" + "="*45)
        print("  NEPALSHIELD WAF — ATTACK DETECTION TEST")
        print("="*45)

        test_attacks = [
            {
                "ip":     "192.168.1.100",
                "method": "GET",
                "path":   "/search",
                "params": "q=1' UNION SELECT username,password FROM users--",
                "desc":   "SQL Injection"
            },
            {
                "ip":     "10.0.0.50",
                "method": "POST",
                "path":   "/comment",
                "body":   "<script>alert(document.cookie)</script>",
                "desc":   "XSS Attack"
            },
            {
                "ip":     "172.16.0.25",
                "method": "GET",
                "path":   "/file?name=../../etc/passwd",
                "params": "",
                "desc":   "Path Traversal"
            },
            {
                "ip":     "192.168.1.200",
                "method": "POST",
                "path":   "/ping",
                "body":   "host=google.com; rm -rf /",
                "desc":   "Command Injection"
            },
            {
                "ip":     "203.0.113.50",
                "method": "GET",
                "path":   "/dashboard",
                "params": "id=1",
                "desc":   "Normal Request"
            },
        ]

        for attack in test_attacks:
            print(f"\nTesting: {attack['desc']}")
            allowed, attack_type, detail = self.analyze_request(
                ip     = attack['ip'],
                method = attack['method'],
                path   = attack['path'],
                params = attack.get('params', ''),
                body   = attack.get('body', '')
            )
            if allowed:
                print(f"\033[92m  ALLOWED — No threat detected\033[0m")

        stats = self.get_stats()
        print(f"\n{'='*45}")
        print(f"WAF TEST RESULTS")
        print(f"  Blocked : {stats['total_blocked']}")
        print(f"  Allowed : {stats['total_allowed']}")
        return stats

if __name__ == "__main__":
    waf = WebApplicationFirewall()
    waf.run_test()
