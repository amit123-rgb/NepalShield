from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
import sys
sys.path.append('/home/amit/NepalShield')
from database.models import Session, Breach
from detection.keyword_filter import analyze_text
from security.ids import IntrusionDetector
from security.waf import WebApplicationFirewall
from security.honeypot import Honeypot

app = Flask(__name__)
CORS(app)

ids_system = IntrusionDetector()
waf_system = WebApplicationFirewall()
hp_system  = Honeypot()

@app.route("/")
def home():
    return jsonify({
        "message": "NepalShield API is running!",
        "version": "2.0",
        "status":  "active"
    })

@app.route("/breaches", methods=["GET"])
def get_breaches():
    session  = Session()
    breaches = session.query(Breach).order_by(Breach.found_at.desc()).limit(50).all()
    result   = []
    for b in breaches:
        result.append({
            "id":           b.id,
            "source":       b.source,
            "email":        b.email,
            "threat_score": b.threat_score,
            "found_at":     str(b.found_at),
            "alerted":      b.alerted
        })
    session.close()
    return jsonify(result)

@app.route("/scan", methods=["POST"])
def scan_text():
    data   = request.json
    text   = data.get("text", "")
    source = data.get("source", "manual")
    result = analyze_text(text, source)
    return jsonify(result)

@app.route("/stats", methods=["GET"])
def get_stats():
    session      = Session()
    total        = session.query(Breach).count()
    high_threats = session.query(Breach).filter(Breach.threat_score >= 7).count()
    session.close()
    return jsonify({
        "total_breaches": total,
        "high_threats":   high_threats,
        "status":         "active",
        "system":         "NepalShield v2.0"
    })

@app.route("/security/stats", methods=["GET"])
def get_security_stats():
    ids_stats = ids_system.get_network_stats()
    waf_stats = waf_system.get_stats()
    hp_report = hp_system.get_attacker_report()
    return jsonify({
        "ids": {
            "active_connections": ids_stats.get("active_connections", 0),
            "total_alerts":       ids_stats.get("total_alerts", 0),
            "blocked_ips":        ids_stats.get("blocked_ips", 0),
            "cpu_percent":        ids_stats.get("cpu_percent", 0),
            "memory_percent":     ids_stats.get("memory_percent", 0),
        },
        "waf": {
            "total_blocked": waf_stats["total_blocked"],
            "total_allowed": waf_stats["total_allowed"],
            "unique_ips":    waf_stats["unique_ips"],
        },
        "honeypot": {
            "total_attackers": len(hp_report),
            "total_attempts":  sum(r["attempts"] for r in hp_report),
        }
    })

@app.route("/security/ids", methods=["GET"])
def get_ids_status():
    result = ids_system.run_scan()
    return jsonify({
        "stats":   result["stats"],
        "alerts":  result["alerts"],
        "blocked": result["blocked"]
    })

@app.route("/security/waf/test", methods=["POST"])
def test_waf():
    data        = request.json
    ip          = data.get("ip", "unknown")
    method      = data.get("method", "GET")
    path        = data.get("path", "/")
    params      = data.get("params", "")
    body        = data.get("body", "")
    allowed, attack_type, detail = waf_system.analyze_request(
        ip, method, path, params, body
    )
    return jsonify({
        "allowed":     allowed,
        "attack_type": attack_type,
        "detail":      detail,
        "stats":       waf_system.get_stats()
    })

@app.route("/security/honeypot", methods=["GET"])
def get_honeypot_data():
    hp_system.simulate_attacks()
    report = hp_system.get_attacker_report()
    return jsonify({
        "attackers":      report,
        "total_attacks":  len(hp_system.captured_attacks),
        "recent_attacks": hp_system.captured_attacks[-10:]
    })

if __name__ == "__main__":
    print("Starting NepalShield API v2.0...")
    app.run(debug=True, port=5000)
