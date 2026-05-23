from flask import Flask, jsonify
from flask_cors import CORS
import sys
sys.path.append('/home/amit/NepalShield')
from crawler.tor_crawler import run_dark_web_scan

app = Flask(__name__)
# This allows your React frontend port to talk to this backend port safely
CORS(app)

@app.route('/api/scan', methods=['GET'])
def trigger_scan():
    """Triggers the Tor Dark Web scan from the React Dashboard"""
    try:
        results = run_dark_web_scan()
        return jsonify({
            "status": "success",
            "threats_found": len(results),
            "data": results
        }), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=True)
