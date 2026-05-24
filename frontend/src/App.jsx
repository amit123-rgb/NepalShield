import { useState, useEffect } from "react";

const API = "http://localhost:5000";

const MOCK = {
  breaches: [
    { id:1, source:"pastebin.com/abc123", email:"admin@mofa.gov.np, secretary@moha.gov.np, it@nitc.gov.np", threat_score:10, found_at:"2026-05-22 00:43:00", alerted:"Yes" },
    { id:2, source:"ghostbin.com/abc789", email:"officer@nepalpolice.gov.np, inspector@nepalpolice.gov.np", threat_score:9, found_at:"2026-05-22 00:43:02", alerted:"Yes" },
  ],
  stats: { total_breaches:2, high_threats:2 }
};

function Badge({ score }) {
  const c = score>=9?"#ff2d55":score>=7?"#ff9500":score>=4?"#ffcc00":"#30d158";
  return <span style={{background:c+"22",color:c,border:`1px solid ${c}55`,borderRadius:6,padding:"3px 12px",fontWeight:700,fontSize:12,letterSpacing:1}}>{score}/10</span>;
}

function LevelBadge({ level }) {
  const colors = { CRITICAL:"#ff2d55", HIGH:"#ff9500", MEDIUM:"#ffcc00", LOW:"#30d158" };
  const c = colors[level] || "#666";
  return <span style={{background:c+"22",color:c,border:`1px solid ${c}55`,borderRadius:4,padding:"2px 8px",fontSize:10,fontWeight:700,letterSpacing:2}}>{level}</span>;
}

function StatCard({ label, value, color, icon, sub }) {
  return (
    <div style={{background:"#0d0d1a",borderRadius:12,padding:"20px 24px",borderTop:`3px solid ${color}`,position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",top:16,right:16,fontSize:24,opacity:0.15}}>{icon}</div>
      <div style={{fontSize:9,color:"#555",letterSpacing:2,marginBottom:6,textTransform:"uppercase"}}>{label}</div>
      <div style={{fontSize:34,fontWeight:700,color,letterSpacing:1}}>{value}</div>
      {sub && <div style={{fontSize:10,color:"#444",marginTop:4}}>{sub}</div>}
    </div>
  );
}

export default function App() {
  const [breaches, setBreaches] = useState(MOCK.breaches);
  const [stats, setStats]       = useState(MOCK.stats);
  const [tab, setTab]           = useState("dashboard");
  const [scanText, setScanText] = useState("");
  const [scanResult, setScanResult] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [apiOnline, setApiOnline] = useState(false);
  const [lastScan, setLastScan] = useState(new Date().toLocaleTimeString());
  const [loading, setLoading]   = useState(false);

  useEffect(() => { fetchData(); const t = setInterval(fetchData, 30000); return ()=>clearInterval(t); }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [s,b] = await Promise.all([
        fetch(`${API}/stats`).then(r=>r.json()),
        fetch(`${API}/breaches`).then(r=>r.json()),
      ]);
      setStats(s);
      if(b.length) setBreaches(b);
      setApiOnline(true);
    } catch { setApiOnline(false); }
    setLastScan(new Date().toLocaleTimeString());
    setLoading(false);
  }

  function localScan(text) {
    const emails   = text.match(/[\w.-]+@[\w.-]+\.gov\.np/gi)||[];
    const keywords = ["gov.np","password","leaked","credentials","dump","breach","hacked","plaintext"].filter(k=>text.toLowerCase().includes(k));
    let score = Math.min(emails.length*2+keywords.length+(text.toLowerCase().includes("password")?3:0)+(text.toLowerCase().includes("dump")?1:0),10);
    const level = score>=9?"CRITICAL":score>=7?"HIGH":score>=4?"MEDIUM":"LOW";
    setScanResult({is_threat:score>=3,score,level,emails,keywords});
  }

  async function runScan() {
    if(!scanText.trim()) return;
    setScanning(true);
    try {
      const res = await fetch(`${API}/scan`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({text:scanText,source:"manual"})});
      setScanResult(await res.json());
    } catch { localScan(scanText); }
    setScanning(false);
  }

  const criticalCount = breaches.filter(b=>b.threat_score>=9).length;
  const highCount     = breaches.filter(b=>b.threat_score>=7&&b.threat_score<9).length;
  const emailCount    = breaches.reduce((a,b)=>a+(b.email?.split(',').length||0),0);

  return (
    <div style={{background:"#07070f",color:"#e0e0e0",fontFamily:"'IBM Plex Mono',monospace",minHeight:"100vh"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        body{background:#07070f}
        table{width:100%;border-collapse:collapse}
        th{text-align:left;padding:10px 16px;font-size:9px;color:#444;letter-spacing:2px;border-bottom:1px solid #111}
        td{padding:12px 16px;font-size:11px;border-bottom:1px solid #0d0d1a;vertical-align:middle}
        tr:hover td{background:#0d0d1a}
        textarea{width:100%;background:#0d0d1a;border:1px solid #1a1a2e;color:#e0e0e0;border-radius:8px;padding:14px;font-family:monospace;font-size:12px;resize:vertical;outline:none;line-height:1.6}
        textarea:focus{border-color:#ff2d55;box-shadow:0 0 0 2px #ff2d5522}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:#111}
        ::-webkit-scrollbar-thumb{background:#ff2d55;border-radius:2px}
      `}</style>

      {/* TOP BAR */}
      <div style={{background:"#0a0a12",borderBottom:"1px solid #1a1a2e",padding:"0 32px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:200,backdropFilter:"blur(10px)"}}>
        <div style={{padding:"14px 0",display:"flex",alignItems:"center",gap:16}}>
          <div>
            <div style={{fontSize:22,fontWeight:700,color:"#ff2d55",letterSpacing:4,lineHeight:1}}>NEPALSHIELD</div>
            <div style={{fontSize:8,color:"#333",letterSpacing:3,marginTop:2}}>GOVERNMENT BREACH MONITOR • v2.0</div>
          </div>
          <div style={{width:1,height:32,background:"#1a1a2e"}}/>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <span style={{width:7,height:7,borderRadius:"50%",background:"#30d158",boxShadow:"0 0 8px #30d158",display:"inline-block",animation:"pulse 2s infinite"}}/>
            <span style={{fontSize:10,color:"#30d158",fontWeight:600,letterSpacing:1}}>MONITORING ACTIVE</span>
          </div>
        </div>

        <div style={{display:"flex",gap:4}}>
          {["dashboard","breaches","scanner","about"].map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{background:tab===t?"#ff2d5522":"transparent",border:tab===t?"1px solid #ff2d5544":"1px solid transparent",color:tab===t?"#ff2d55":"#555",padding:"7px 18px",borderRadius:6,fontSize:10,letterSpacing:1,textTransform:"uppercase",cursor:"pointer",fontFamily:"monospace",transition:"all 0.2s"}}>{t}</button>
          ))}
        </div>

        <div style={{textAlign:"right",fontSize:10}}>
          <div style={{color:apiOnline?"#30d158":"#ff9500",marginBottom:2}}>{apiOnline?"● API CONNECTED":"● DEMO MODE"}</div>
          <div style={{color:"#333"}}>LAST SCAN: {lastScan}</div>
        </div>
      </div>

      <div style={{padding:"28px 32px"}}>

        {/* DASHBOARD */}
        {tab==="dashboard" && <div style={{animation:"fadeIn 0.4s ease"}}>

          {/* Stats */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16,marginBottom:24}}>
            <StatCard label="Total Breaches"  value={stats.total_breaches} color="#ff2d55" icon="⚠" sub="All time detected"/>
            <StatCard label="Critical Threats" value={criticalCount}        color="#ff9500" icon="🔴" sub="Score 9-10"/>
            <StatCard label="Emails Exposed"   value={emailCount}           color="#0a84ff" icon="📧" sub=".gov.np accounts"/>
            <StatCard label="System Status"    value="LIVE"                 color="#30d158" icon="✓" sub="Monitoring active"/>
          </div>

          {/* Alert Banner */}
          {criticalCount > 0 && (
            <div style={{background:"#ff2d5511",border:"1px solid #ff2d5533",borderLeft:"4px solid #ff2d55",borderRadius:8,padding:"14px 20px",marginBottom:24,display:"flex",alignItems:"center",gap:12,animation:"fadeIn 0.3s ease"}}>
              <span style={{fontSize:20}}>🚨</span>
              <div>
                <div style={{color:"#ff2d55",fontWeight:700,fontSize:12,letterSpacing:1}}>CRITICAL ALERT — IMMEDIATE ACTION REQUIRED</div>
                <div style={{color:"#ff6680",fontSize:11,marginTop:2}}>{criticalCount} critical breach(es) detected involving Nepal Government email accounts</div>
              </div>
            </div>
          )}

          {/* Two column layout */}
          <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:16,marginBottom:24}}>

            {/* Recent Breaches */}
            <div style={{background:"#0a0a12",border:"1px solid #1a1a2e",borderRadius:12,overflow:"hidden"}}>
              <div style={{padding:"14px 20px",borderBottom:"1px solid #1a1a2e",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:10,color:"#555",letterSpacing:2}}>RECENT DETECTIONS</span>
                <button onClick={fetchData} style={{background:"transparent",border:"1px solid #1a1a2e",color:"#555",padding:"4px 12px",borderRadius:4,fontSize:10,cursor:"pointer",fontFamily:"monospace"}}>↻ REFRESH</button>
              </div>
              <table>
                <thead><tr><th>SOURCE</th><th>EMAILS</th><th>SCORE</th><th>TIME</th><th>STATUS</th></tr></thead>
                <tbody>{breaches.slice(0,5).map(b=>(
                  <tr key={b.id}>
                    <td style={{color:"#0a84ff",maxWidth:160,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{b.source}</td>
                    <td style={{color:"#aaa",maxWidth:220,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{b.email}</td>
                    <td><Badge score={b.threat_score}/></td>
                    <td style={{color:"#444",fontSize:10}}>{b.found_at?.slice(0,16)}</td>
                    <td><span style={{color:"#30d158",fontSize:10}}>{b.alerted==="Yes"?"✓ SENT":"PENDING"}</span></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>

            {/* Score Breakdown */}
            <div style={{background:"#0a0a12",border:"1px solid #1a1a2e",borderRadius:12,padding:20}}>
              <div style={{fontSize:10,color:"#555",letterSpacing:2,marginBottom:16}}>THREAT DISTRIBUTION</div>
              {[
                {label:"Critical (9-10)", count:breaches.filter(b=>b.threat_score>=9).length, color:"#ff2d55"},
                {label:"High (7-8)",      count:breaches.filter(b=>b.threat_score>=7&&b.threat_score<9).length, color:"#ff9500"},
                {label:"Medium (4-6)",    count:breaches.filter(b=>b.threat_score>=4&&b.threat_score<7).length, color:"#ffcc00"},
                {label:"Low (1-3)",       count:breaches.filter(b=>b.threat_score<4).length, color:"#30d158"},
              ].map((r,i)=>(
                <div key={i} style={{marginBottom:14}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                    <span style={{fontSize:10,color:"#666"}}>{r.label}</span>
                    <span style={{fontSize:10,color:r.color,fontWeight:700}}>{r.count}</span>
                  </div>
                  <div style={{background:"#111",borderRadius:4,height:5,overflow:"hidden"}}>
                    <div style={{background:r.color,width:`${Math.max((r.count/Math.max(breaches.length,1))*100,0)}%`,height:"100%",borderRadius:4,transition:"width 0.8s ease",boxShadow:`0 0 6px ${r.color}`}}/>
                  </div>
                </div>
              ))}

              <div style={{marginTop:20,paddingTop:16,borderTop:"1px solid #111"}}>
                <div style={{fontSize:10,color:"#555",letterSpacing:2,marginBottom:12}}>SOURCES</div>
                {[
                  {name:"Pastebin",  count:breaches.filter(b=>b.source?.includes('pastebin')).length,  color:"#0a84ff"},
                  {name:"Ghostbin",  count:breaches.filter(b=>b.source?.includes('ghostbin')).length,  color:"#ff2d55"},
                  {name:"GitHub",    count:breaches.filter(b=>b.source?.includes('github')).length,    color:"#bf5af2"},
                  {name:"Dark Web",  count:breaches.filter(b=>b.source?.includes('onion')).length,     color:"#ff9500"},
                ].map((s,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <span style={{width:6,height:6,borderRadius:2,background:s.color,display:"inline-block"}}/>
                      <span style={{fontSize:10,color:"#666"}}>{s.name}</span>
                    </div>
                    <span style={{fontSize:10,color:s.color,fontWeight:700}}>{s.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* System Info */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16}}>
            {[
              {label:"DETECTION ENGINE",  value:"v2.0 — Enhanced",    color:"#0a84ff"},
              {label:"TOR NETWORK",       value:"Connected & Active",  color:"#30d158"},
              {label:"DATABASE",          value:"PostgreSQL Online",   color:"#30d158"},
            ].map((s,i)=>(
              <div key={i} style={{background:"#0a0a12",border:"1px solid #1a1a2e",borderRadius:8,padding:"14px 18px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:9,color:"#444",letterSpacing:2}}>{s.label}</span>
                <span style={{fontSize:10,color:s.color,fontWeight:600}}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>}

        {/* BREACHES */}
        {tab==="breaches" && <div style={{animation:"fadeIn 0.4s ease"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
            <div>
              <div style={{fontSize:20,fontWeight:700,color:"#ff2d55",letterSpacing:2}}>ALL BREACHES</div>
              <div style={{fontSize:11,color:"#444",marginTop:2}}>{breaches.length} records in database</div>
            </div>
            <button onClick={fetchData} style={{background:"#ff2d5522",border:"1px solid #ff2d5544",color:"#ff2d55",padding:"8px 20px",borderRadius:6,fontSize:11,cursor:"pointer",fontFamily:"monospace",letterSpacing:1}}>↻ REFRESH</button>
          </div>
          <div style={{background:"#0a0a12",border:"1px solid #1a1a2e",borderRadius:12,overflow:"hidden"}}>
            <table>
              <thead><tr><th>#</th><th>SOURCE</th><th>EMAILS COMPROMISED</th><th>LEVEL</th><th>SCORE</th><th>DETECTED AT</th><th>ALERTED</th></tr></thead>
              <tbody>{breaches.map(b=>(
                <tr key={b.id}>
                  <td style={{color:"#333",fontSize:10}}>#{b.id}</td>
                  <td style={{color:"#0a84ff"}}>{b.source}</td>
                  <td style={{color:"#aaa",maxWidth:300,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{b.email}</td>
                  <td><LevelBadge level={b.threat_score>=9?"CRITICAL":b.threat_score>=7?"HIGH":b.threat_score>=4?"MEDIUM":"LOW"}/></td>
                  <td><Badge score={b.threat_score}/></td>
                  <td style={{color:"#444",fontSize:10}}>{b.found_at?.slice(0,19)}</td>
                  <td><span style={{color:b.alerted==="Yes"?"#30d158":"#ff9500",fontSize:10,fontWeight:600}}>{b.alerted==="Yes"?"✓ SENT":"PENDING"}</span></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>}

        {/* SCANNER */}
        {tab==="scanner" && <div style={{animation:"fadeIn 0.4s ease",maxWidth:800}}>
          <div style={{marginBottom:20}}>
            <div style={{fontSize:20,fontWeight:700,color:"#ff2d55",letterSpacing:2}}>MANUAL SCANNER</div>
            <div style={{fontSize:11,color:"#444",marginTop:2}}>Paste any suspicious text to detect .gov.np credential leaks</div>
          </div>

          <div style={{background:"#0a0a12",border:"1px solid #1a1a2e",borderRadius:12,padding:24,marginBottom:16}}>
            <div style={{fontSize:10,color:"#555",letterSpacing:2,marginBottom:10}}>INPUT TEXT</div>
            <textarea rows={8} value={scanText} onChange={e=>setScanText(e.target.value)}
              placeholder={"Paste suspicious text here...\n\nExample:\n  admin@moha.gov.np : Nepal@2024\n  secretary@mofa.gov.np | password123\n  Nepal Police database dump leaked"}/>
            <div style={{display:"flex",gap:10,marginTop:14}}>
              <button onClick={runScan} disabled={scanning} style={{background:"#ff2d55",border:"none",color:"#fff",padding:"10px 28px",borderRadius:6,fontSize:12,cursor:"pointer",fontFamily:"monospace",fontWeight:700,letterSpacing:1,opacity:scanning?0.6:1,transition:"opacity 0.2s"}}>
                {scanning?"◌ SCANNING...":"▶ RUN SCAN"}
              </button>
              <button onClick={()=>{setScanText("");setScanResult(null);}} style={{background:"transparent",border:"1px solid #1a1a2e",color:"#555",padding:"10px 20px",borderRadius:6,fontSize:12,cursor:"pointer",fontFamily:"monospace"}}>
                CLEAR
              </button>
            </div>
          </div>

          {scanResult && (
            <div style={{background:scanResult.is_threat?"#ff2d5508":"#30d15808",border:`1px solid ${scanResult.is_threat?"#ff2d5533":"#30d15833"}`,borderRadius:12,padding:24,animation:"fadeIn 0.3s ease"}}>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
                <span style={{fontSize:24}}>{scanResult.is_threat?"🚨":"✅"}</span>
                <div>
                  <div style={{fontSize:16,fontWeight:700,color:scanResult.is_threat?"#ff2d55":"#30d158",letterSpacing:2}}>
                    {scanResult.is_threat?"THREAT DETECTED":"NO THREAT FOUND"}
                  </div>
                  <div style={{fontSize:11,color:"#555",marginTop:2}}>
                    {scanResult.is_threat?"Immediate action recommended":"Content appears safe"}
                  </div>
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16,marginBottom:16}}>
                <div style={{background:"#111",borderRadius:8,padding:14}}>
                  <div style={{fontSize:9,color:"#555",letterSpacing:2,marginBottom:6}}>THREAT SCORE</div>
                  <Badge score={scanResult.score}/>
                </div>
                <div style={{background:"#111",borderRadius:8,padding:14}}>
                  <div style={{fontSize:9,color:"#555",letterSpacing:2,marginBottom:6}}>THREAT LEVEL</div>
                  <LevelBadge level={scanResult.level||(scanResult.score>=9?"CRITICAL":scanResult.score>=7?"HIGH":scanResult.score>=4?"MEDIUM":"LOW")}/>
                </div>
                <div style={{background:"#111",borderRadius:8,padding:14}}>
                  <div style={{fontSize:9,color:"#555",letterSpacing:2,marginBottom:6}}>EMAILS FOUND</div>
                  <span style={{color:"#0a84ff",fontSize:12,fontWeight:700}}>{scanResult.emails?.length||0}</span>
                </div>
              </div>
              {scanResult.emails?.length>0 && (
                <div style={{marginBottom:12}}>
                  <div style={{fontSize:9,color:"#555",letterSpacing:2,marginBottom:8}}>COMPROMISED EMAILS</div>
                  {scanResult.emails.map((e,i)=>(
                    <div key={i} style={{color:"#0a84ff",fontSize:12,marginBottom:4}}>• {e}</div>
                  ))}
                </div>
              )}
              <div>
                <div style={{fontSize:9,color:"#555",letterSpacing:2,marginBottom:8}}>KEYWORDS MATCHED</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                  {scanResult.keywords?.map((k,i)=>(
                    <span key={i} style={{background:"#ff2d5522",color:"#ff2d55",padding:"3px 10px",borderRadius:4,fontSize:10,border:"1px solid #ff2d5533"}}>{k}</span>
                  ))}
                  {!scanResult.keywords?.length && <span style={{color:"#333",fontSize:11}}>None detected</span>}
                </div>
              </div>
            </div>
          )}
        </div>}

        {/* ABOUT */}
        {tab==="about" && <div style={{animation:"fadeIn 0.4s ease",maxWidth:700}}>
          <div style={{fontSize:28,fontWeight:700,color:"#ff2d55",letterSpacing:3,marginBottom:4}}>NEPALSHIELD</div>
          <div style={{fontSize:11,color:"#444",letterSpacing:2,marginBottom:32}}>GOVERNMENT DATA BREACH MONITORING SYSTEM v2.0</div>
          {[
            {label:"PURPOSE", text:"Monitors paste sites, GitHub, and dark web sources for leaked Nepal Government (.gov.np) credentials. Sends automated alerts to NTA, Nepal Police Cyber Bureau, and NITC."},
            {label:"BUILT BY", text:"Amit Kumar Sah — Cybersecurity Student, Nepal. Built as an advanced open-source project to protect Nepal's government digital infrastructure."},
            {label:"TECH STACK", text:"Python 3.11 • Flask • PostgreSQL • SQLAlchemy • Redis • Tor Network • React.js • ReportLab PDF"},
            {label:"MONITORS", text:"Pastebin • Ghostbin • GitHub • Dark Web (.onion sites) • DuckDuckGo via Tor • HaveIBeenPwned API"},
            {label:"DETECTS", text:"Leaked .gov.np email credentials • Password dumps • Database breaches • Email:password combos • Sensitive government data"},
            {label:"ALERTS", text:"Automated email alerts to NTA, Nepal Police Cyber Bureau, and NITC when .gov.np credentials are detected anywhere online."},
            {label:"GITHUB", text:"github.com/amit123-rgb/NepalShield"},
          ].map((item,i)=>(
            <div key={i} style={{borderLeft:"2px solid #ff2d5522",paddingLeft:20,marginBottom:24}}>
              <div style={{fontSize:9,color:"#ff2d55",letterSpacing:2,marginBottom:6,fontWeight:700}}>{item.label}</div>
              <div style={{fontSize:12,color:"#888",lineHeight:1.8}}>{item.text}</div>
            </div>
          ))}
        </div>}

      </div>
    </div>
  );
}
