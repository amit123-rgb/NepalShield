import { useState, useEffect } from "react";

const API = "http://localhost:5000";

const mockBreaches = [
  { id: 1, source: "pastebin.com/abc123", email: "admin@mofa.gov.np, secretary@moha.gov.np", threat_score: 10, found_at: "2026-05-22 00:43:00", alerted: "Yes" },
  { id: 2, source: "ghostbin.com/abc789", email: "officer@nepalpolice.gov.np", threat_score: 9, found_at: "2026-05-22 00:43:02", alerted: "Yes" },
];

function Badge({ score }) {
  const color = score >= 9 ? "#ff2d55" : score >= 7 ? "#ff9500" : "#ffcc00";
  return <span style={{ background: color+"22", color, border: `1px solid ${color}55`, borderRadius: 6, padding: "2px 10px", fontWeight: 700, fontSize: 12 }}>{score}/10</span>;
}

export default function App() {
  const [breaches, setBreaches] = useState(mockBreaches);
  const [stats, setStats]       = useState({ total_breaches: 2, high_threats: 2 });
  const [tab, setTab]           = useState("dashboard");
  const [scanText, setScanText] = useState("");
  const [scanResult, setScanResult] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [apiOnline, setApiOnline] = useState(false);

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    try {
      const [s, b] = await Promise.all([
        fetch(`${API}/stats`).then(r => r.json()),
        fetch(`${API}/breaches`).then(r => r.json()),
      ]);
      setStats(s);
      if (b.length) setBreaches(b);
      setApiOnline(true);
    } catch { setApiOnline(false); }
  }

  async function runScan() {
    if (!scanText.trim()) return;
    setScanning(true);
    try {
      const res = await fetch(`${API}/scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: scanText, source: "manual" })
      });
      setScanResult(await res.json());
    } catch {
      const emails = scanText.match(/[\w.-]+@[\w.-]+\.gov\.np/gi) || [];
      const keywords = ["gov.np","password","leaked","credentials","dump"].filter(k => scanText.toLowerCase().includes(k));
      let score = emails.length*2 + keywords.length;
      if (scanText.toLowerCase().includes("password")) score += 3;
      score = Math.min(score, 10);
      setScanResult({ is_threat: score>=3, score, emails, keywords, source: "manual" });
    }
    setScanning(false);
  }

  const s = { background: "#0a0a0f", color: "#e0e0e0", fontFamily: "'IBM Plex Mono',monospace", minHeight: "100vh" };

  return (
    <div style={s}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        body{background:#0a0a0f}
        table{width:100%;border-collapse:collapse}
        th{text-align:left;padding:8px 14px;font-size:10px;color:#555;letter-spacing:1px;border-bottom:1px solid #1a1a2e}
        td{padding:10px 14px;font-size:11px;border-bottom:1px solid #0d0d1a}
        tr:hover td{background:#0d0d1a}
        textarea{width:100%;background:#111;border:1px solid #1a1a2e;color:#e0e0e0;border-radius:8px;padding:12px;font-family:monospace;font-size:12px;resize:vertical;outline:none}
        textarea:focus{border-color:#ff2d55}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
      `}</style>

      {/* Header */}
      <div style={{ background:"#0d0d1a", borderBottom:"1px solid #1a1a2e", padding:"0 32px", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100 }}>
        <div style={{ padding:"14px 0" }}>
          <div style={{ fontSize:26, fontWeight:700, color:"#ff2d55", letterSpacing:3 }}>NEPALSHIELD</div>
          <div style={{ fontSize:9, color:"#444", letterSpacing:2 }}>GOVERNMENT BREACH MONITOR • v1.0</div>
        </div>
        <div style={{ display:"flex", gap:4 }}>
          {["dashboard","breaches","scanner"].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ background: tab===t ? "#ff2d5522":"transparent", border: tab===t ? "1px solid #ff2d5544":"1px solid transparent", color: tab===t ? "#ff2d55":"#666", padding:"6px 16px", borderRadius:6, fontSize:10, letterSpacing:1, textTransform:"uppercase", cursor:"pointer", fontFamily:"monospace" }}>{t}</button>
          ))}
        </div>
        <div style={{ fontSize:10, textAlign:"right" }}>
          <span style={{ display:"inline-block", width:8, height:8, borderRadius:"50%", background: apiOnline ? "#30d158":"#ff9500", boxShadow: apiOnline ? "0 0 8px #30d158":"none", marginRight:6, animation:"pulse 2s infinite" }} />
          <span style={{ color: apiOnline ? "#30d158":"#ff9500" }}>{apiOnline ? "API LIVE" : "DEMO MODE"}</span>
        </div>
      </div>

      <div style={{ padding:32 }}>

        {/* DASHBOARD */}
        {tab === "dashboard" && <>
          {/* Stats */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:24 }}>
            {[
              { label:"TOTAL BREACHES", value: stats.total_breaches, color:"#ff2d55" },
              { label:"HIGH THREATS",   value: stats.high_threats,   color:"#ff9500" },
              { label:"EMAILS LEAKED",  value: breaches.length * 2,  color:"#0a84ff" },
              { label:"STATUS",         value:"ACTIVE",              color:"#30d158" },
            ].map((s,i) => (
              <div key={i} style={{ background:"#0d0d1a", borderRadius:10, padding:"20px 24px", borderTop:`3px solid ${s.color}` }}>
                <div style={{ fontSize:9, color:"#555", letterSpacing:2, marginBottom:8 }}>{s.label}</div>
                <div style={{ fontSize:32, fontWeight:700, color:s.color }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Recent Breaches Table */}
          <div style={{ background:"#0d0d1a", border:"1px solid #1a1a2e", borderRadius:10, overflow:"hidden", marginBottom:24 }}>
            <div style={{ padding:"14px 16px", fontSize:10, color:"#555", letterSpacing:2, borderBottom:"1px solid #1a1a2e" }}>RECENT DETECTIONS</div>
            <table>
              <thead><tr><th>ID</th><th>SOURCE</th><th>EMAILS</th><th>SCORE</th><th>DETECTED</th><th>ALERTED</th></tr></thead>
              <tbody>
                {breaches.slice(0,5).map(b => (
                  <tr key={b.id}>
                    <td style={{ color:"#444" }}>#{b.id}</td>
                    <td style={{ color:"#0a84ff" }}>{b.source}</td>
                    <td style={{ color:"#aaa", maxWidth:260, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{b.email}</td>
                    <td><Badge score={b.threat_score} /></td>
                    <td style={{ color:"#555" }}>{b.found_at?.slice(0,19)}</td>
                    <td><span style={{ color:"#30d158", fontSize:11 }}>{b.alerted==="Yes" ? "✓ SENT" : "PENDING"}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Score breakdown */}
          <div style={{ background:"#0d0d1a", border:"1px solid #1a1a2e", borderRadius:10, padding:24 }}>
            <div style={{ fontSize:10, color:"#555", letterSpacing:2, marginBottom:16 }}>THREAT SCORE BREAKDOWN</div>
            {[{label:"Critical (9-10)", count: breaches.filter(b=>b.threat_score>=9).length, color:"#ff2d55", max:breaches.length||1},
              {label:"High (7-8)",      count: breaches.filter(b=>b.threat_score>=7&&b.threat_score<9).length, color:"#ff9500", max:breaches.length||1},
              {label:"Medium (4-6)",    count: breaches.filter(b=>b.threat_score>=4&&b.threat_score<7).length, color:"#ffcc00", max:breaches.length||1},
              {label:"Low (1-3)",       count: breaches.filter(b=>b.threat_score<4).length, color:"#30d158", max:breaches.length||1},
            ].map((r,i) => (
              <div key={i} style={{ marginBottom:12 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                  <span style={{ fontSize:11, color:"#666" }}>{r.label}</span>
                  <span style={{ fontSize:11, color:r.color, fontWeight:700 }}>{r.count}</span>
                </div>
                <div style={{ background:"#1a1a2e", borderRadius:4, height:6 }}>
                  <div style={{ background:r.color, width:`${(r.count/r.max)*100}%`, height:"100%", borderRadius:4, transition:"width 0.5s" }} />
                </div>
              </div>
            ))}
          </div>
        </>}

        {/* BREACHES */}
        {tab === "breaches" && <>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
            <div>
              <div style={{ fontSize:22, fontWeight:700, color:"#ff2d55", letterSpacing:2 }}>ALL BREACHES</div>
              <div style={{ fontSize:11, color:"#555" }}>{breaches.length} records</div>
            </div>
            <button onClick={fetchData} style={{ background:"#ff2d5522", border:"1px solid #ff2d5544", color:"#ff2d55", padding:"8px 20px", borderRadius:6, fontSize:11, cursor:"pointer", fontFamily:"monospace" }}>↻ REFRESH</button>
          </div>
          <div style={{ background:"#0d0d1a", border:"1px solid #1a1a2e", borderRadius:10, overflow:"hidden" }}>
            <table>
              <thead><tr><th>ID</th><th>SOURCE</th><th>EMAILS</th><th>SCORE</th><th>FOUND AT</th><th>ALERTED</th></tr></thead>
              <tbody>
                {breaches.map(b => (
                  <tr key={b.id}>
                    <td style={{ color:"#444" }}>#{b.id}</td>
                    <td style={{ color:"#0a84ff" }}>{b.source}</td>
                    <td style={{ color:"#aaa" }}>{b.email}</td>
                    <td><Badge score={b.threat_score} /></td>
                    <td style={{ color:"#555" }}>{b.found_at?.slice(0,19)}</td>
                    <td><span style={{ color:"#30d158" }}>{b.alerted==="Yes" ? "✓ SENT":"PENDING"}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>}

        {/* SCANNER */}
        {tab === "scanner" && <>
          <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:22, fontWeight:700, color:"#ff2d55", letterSpacing:2 }}>MANUAL SCANNER</div>
            <div style={{ fontSize:11, color:"#555" }}>Paste any text to detect .gov.np credential leaks</div>
          </div>
          <div style={{ background:"#0d0d1a", border:"1px solid #1a1a2e", borderRadius:10, padding:24, marginBottom:16 }}>
            <textarea rows={7} value={scanText} onChange={e=>setScanText(e.target.value)}
              placeholder={"Paste suspicious text here...\n\nExample:\nadmin@moha.gov.np : password123\nsecretary@moe.gov.np : nepal@456"} />
            <button onClick={runScan} disabled={scanning} style={{ marginTop:12, background:"#ff2d55", border:"none", color:"#fff", padding:"10px 28px", borderRadius:6, fontSize:12, cursor:"pointer", fontFamily:"monospace", fontWeight:700, letterSpacing:1, opacity: scanning ? 0.6:1 }}>
              {scanning ? "SCANNING..." : "▶ RUN SCAN"}
            </button>
          </div>

          {scanResult && (
            <div style={{ background: scanResult.is_threat ? "#ff2d5511":"#30d15811", border:`1px solid ${scanResult.is_threat ? "#ff2d5533":"#30d15833"}`, borderRadius:10, padding:24, animation:"fadeIn 0.3s ease" }}>
              <div style={{ fontSize:18, fontWeight:700, color: scanResult.is_threat ? "#ff2d55":"#30d158", marginBottom:16, letterSpacing:2 }}>
                {scanResult.is_threat ? "🚨 THREAT DETECTED" : "✅ NO THREAT FOUND"}
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, fontSize:12 }}>
                <div><div style={{ color:"#555", marginBottom:4, fontSize:10 }}>THREAT SCORE</div><Badge score={scanResult.score} /></div>
                <div><div style={{ color:"#555", marginBottom:4, fontSize:10 }}>EMAILS FOUND</div><span style={{ color:"#0a84ff" }}>{scanResult.emails?.join(", ")||"None"}</span></div>
                <div style={{ gridColumn:"1/-1" }}>
                  <div style={{ color:"#555", marginBottom:6, fontSize:10 }}>KEYWORDS MATCHED</div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                    {scanResult.keywords?.map((k,i) => <span key={i} style={{ background:"#ff2d5522", color:"#ff2d55", padding:"2px 8px", borderRadius:4, fontSize:11 }}>{k}</span>)}
                    {!scanResult.keywords?.length && <span style={{ color:"#444" }}>None</span>}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>}
      </div>
    </div>
  );
}
