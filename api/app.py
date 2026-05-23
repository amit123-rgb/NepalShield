from flask import Flask, jsonify, request
from flask_cors import CORS
import sys
sys.path.append('/home/amit/NepalShield')
from database.models import Session, Breach
from detection.keyword_filter import analyze_text

app = Flask(__name__)
CORS(app)

@app.route("/")
def home():
    return jsonify({
        "message": "NepalShield API is running!",
        "version": "1.0",
        "status": "active"
    })

@app.route("/breaches", methods=["GET"])
def get_breaches():
    session = Session()
    breaches = session.query(Breach).order_by(Breach.found_at.desc()).limit(50).all()
    result = []
    for b in breaches:
        result.append({
            "id": b.id,
            "source": b.source,
            "email": b.email,
            "threat_score": b.threat_score,
            "found_at": str(b.found_at),
            "alerted": b.alerted
        })
    session.close()
    return jsonify(result)

@app.route("/scan", methods=["POST"])
def scan_text():
    data = request.json
    text = data.get("text", "")
    source = data.get("source", "manual")
    result = analyze_text(text, source)
    return jsonify(result)

@app.route("/stats", methods=["GET"])
def get_stats():
    session = Session()
    total = session.query(Breach).count()
    high_threats = session.query(Breach).filter(Breach.threat_score >= 7).count()
    session.close()
    return jsonify({
        "total_breaches": total,
        "high_threats": high_threats,
        "status": "active",
        "system": "NepalShield v1.0"
    })

if __name__ == "__main__":
    print("Starting NepalShield API...")
    app.run(debug=True, port=5000)
