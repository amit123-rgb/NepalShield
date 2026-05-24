from flask import Flask, jsonify
from flask_cors import CORS
import sys
sys.path.append('/home/amit/NepalShield')
from crawler.tor_crawler import run_dark_web_scan

app = Flask(__name__)
# Enable CORS so your Vite React frontend can read the ports without browser blocks
CORS(app)

@app.route('/', methods=['GET'])
def home():
    return jsonify({
        "system": "NepalShield API Gateway",
        "status": "operational"
    }), 200

@app.route('/scan', methods=['GET'])
@app.route('/api/scan', methods=['GET'])
def trigger_scan():
    """Triggers the crawl sequence"""
    try:
        results = run_dark_web_scan()
        return jsonify(results), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/stats', methods=['GET'])
@app.route('/breaches', methods=['GET'])
def get_dashboard_data():
    """Returns matching data structure instantly for your React UI components"""
    # This matches the mock data template structure to fill your dashboard text fields
    mock_data = [
        {
            "id": "#1",
            "source": "pastebin.com/abc123",
            "emails": "admin@mofa.gov.np, secretary@moha.gov.np",
            "score": "10/10",
            "detected": "2026-05-22 00:43:00",
            "alerted": "SENT"
        },
        {
            "id": "#2",
            "source": "ghostbin.com/abc789",
            "emails": "officer@nepalpolice.gov.np",
            "score": "9/10",
            "detected": "2026-05-22 00:43:02",
            "alerted": "SENT"
        }
    ]
    return jsonify(mock_data), 200

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=True)
