# 🛡️ NepalShield
### Nepal Government Data Breach Monitoring System

![Python](https://img.shields.io/badge/Python-3.11-blue)
![Flask](https://img.shields.io/badge/Flask-3.1-green)
![React](https://img.shields.io/badge/React-18-cyan)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-18-blue)
![Tor](https://img.shields.io/badge/Tor-Enabled-purple)
![License](https://img.shields.io/badge/License-MIT-yellow)

---

## What is NepalShield?

NepalShield is an open-source cybersecurity tool that monitors
paste sites and dark web sources for leaked Nepal Government
(.gov.np) credentials and automatically alerts concerned
government departments.

Built by a cybersecurity student in Nepal to protect
Nepal's government digital infrastructure.

---

## Features

- Dark web monitoring via Tor network
- Paste site scanner (Pastebin, Ghostbin)
- AI-powered keyword detection engine
- Threat scoring system (1-10)
- Automated email alerts to NTA and Nepal Police
- Real-time React.js dashboard
- PostgreSQL database for breach logging
- PDF report generation
- REST API with Flask
- Deduplication to avoid repeat alerts

---

## Tech Stack

| Layer | Technology |
|---|---|
| Language | Python 3.11 |
| Backend API | Flask + Flask-CORS |
| Database | PostgreSQL + SQLAlchemy |
| Frontend | React.js + Vite |
| Dark Web | Tor + SOCKS5 Proxy |
| Alerts | SMTP Email (Gmail) |
| Reports | ReportLab PDF |
| Cache | Redis |

---

## Project Structure
NepalShield/
├── crawler/
│   ├── tor_crawler.py      # Dark web Tor crawler
│   └── paste_monitor.py    # Paste site monitor
├── detection/
│   └── keyword_filter.py   # Threat detection engine
├── database/
│   └── models.py           # PostgreSQL models
├── alerts/
│   ├── email_alert.py      # Email alert system
│   └── report_gen.py       # PDF report generator
├── api/
│   └── app.py              # Flask REST API
├── frontend/
│   └── src/App.jsx         # React dashboard
└── main.py                 # Main runner

---

## How to Run

### 1. Clone the repository
```bash
git clone https://github.com/amit123-rgb/NepalShield.git
cd NepalShield
```

### 2. Create virtual environment
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 3. Set up database
```bash
sudo service postgresql start
python3 database/models.py
```

### 4. Configure environment
```bash
cp .env.example .env
nano .env
```

### 5. Start Tor
```bash
sudo service tor start
```

### 6. Run the system
```bash
python3 main.py
```

### 7. Start the dashboard
```bash
cd frontend
npm install
npm run dev
```

### 8. Open browser
http://localhost:5173




---

## API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| / | GET | API status |
| /breaches | GET | All detected breaches |
| /stats | GET | System statistics |
| /scan | POST | Manual text scan |
| /report/id | GET | Download PDF report |

---

## Who Can Use This

- Nepal Telecommunications Authority (NTA)
- Nepal Police Cyber Bureau
- National IT Center (NITC)
- Nepal Rastra Bank (NRB)
- Any Nepal Government Department

---

## Built By

Amit Kumar Sah
Cybersecurity Student — Nepal
GitHub: github.com/amit123-rgb

---

## License

MIT License — Free to use and modify
