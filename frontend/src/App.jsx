import { useState, useEffect } from "react";

const API = "http://localhost:5000";

const MOCK = {
  breaches: [
    { id:1, source:"pastebin.com/abc123", email:"admin@mofa.gov.np, secretary@moha.gov.np", threat_score:10, found_at:"2026-05-22 00:43:00", alerted:"Yes" },
    { id:2, source:"ghostbin.com/abc789", email:"officer@nepalpolice.gov.np", threat_score:9, found_at:"2026-05-22 00:43:02", alerted:"Yes" },
  ],
  stats: { total_breaches:2, high_threats:2 }
};

function Badge({ score }) {
  const c = score>=9?"#ff2d55":score>=7?"#ff9500":score>=4?"#ffcc00":"#30d158";
  return <span style={{background:c+"22",color:c,border:`1px solid ${c}55`,borderRadius:6,padding:"3px 12px",fontWeight:700,fontSize:12}}>{score}/10</span>;
}

function LevelBadge({ level }) {
  const colors = {CRITICAL:"#ff2d55",HIGH:"#ff9500",MEDIUM:"#ffcc00",LOW:"#30d158"};
  const c = colors[level]||"#666";
  return <span style={{background:c+"22",color:c,border:`1px solid ${c}55`,borderRadius:4,padding:"2px 8px",fontSize:10,fontWeight:700,letterSpacing:2}}>{level}</span>;
}

function StatCard({ label, value, color, icon, sub }) {
  return (
    <div style={{background:"#0d0d1a",borderRadius:12,padding:"20px 24px",borderTop:`3px solid ${color}`,position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",top:16,right:16,fontSize:24,opacity:0.15}}>{icon}</div>
      <div style={{fontSize:9,color:"#555",letterSpacing:2,marginBottom:6}}>{label}</div>
      <div style={{fontSize:34,fontWeight:700,color}}>{value}</div>
      {sub && <div style={{fontSize:10,color:"#444",marginTop:4}}>{sub}</div>}
    </div>
  );
}

function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  async function handleLogin() {
    if (!username || !password) { setError("Please enter username and password"); return; }
    setLoading(true);
    setError("");
    try {
      const res  = await fetch(`${API}/auth/login`, {
        method:  "POST",
        headers: {"Content-Type": "application/json"},
        body:    JSON.stringify({username, password})
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("ns_token",    data.token);
        localStorage.setItem("ns_username", data.username);
        localStorage.setItem("ns_role",     data.role);
        onLogin(data);
      } else {
        setError(data.message || "Invalid credentials");
      }
    } catch {
      if (username === "admin" && password === "NepalShield@2026") {
        const data = {token:"admin-nepal-2026", username:"admin", role:"admin"};
        localStorage.setItem("ns_token",    data.token);
        localStorage.setItem("ns_username", data.username);
        localStorage.setItem("ns_role",     data.role);
        onLogin(data);
      } else {
        setError("Invalid credentials. Try admin / NepalShield@2026");
      }
    }
    setLoading(false);
  }

  return (
    <div style={{background:"#07070f",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"monospace"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        body{background:#07070f}
        input{width:100%;background:#111;border:1px solid #1a1a2e;color:#e0e0e0;border-radius:8px;padding:12px 16px;font-family:monospace;font-size:13px;outline:none}
        input:focus{border-color:#ff2d55;box-shadow:0 0 0 2px #ff2d5522}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
      `}</style>

      <div style={{width:420,animation:"fadeIn 0.5s ease"}}>
        {/* Logo */}
        <div style={{textAlign:"center",marginBottom:40}}>
          <div style={{fontSize:36,fontWeight:700,color:"#ff2d55",letterSpacing:4}}>NEPALSHIELD</div>
          <div style={{fontSize:10,color:"#444",letterSpacing:3,marginTop:4}}>GOVERNMENT BREACH MONITOR • v2.0</div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,marginTop:12}}>
            <span style={{width:6,height:6,borderRadius:"50%",background:"#30d158",animation:"pulse 2s infinite",display:"inline-block"}}/>
            <span style={{fontSize:10,color:"#30d158"}}>SYSTEM ACTIVE</span>
          </div>
        </div>

        {/* Login Box */}
        <div style={{background:"#0a0a12",border:"1px solid #1a1a2e",borderRadius:16,padding:36,boxShadow:"0 20px 60px rgba(255,45,85,0.1)"}}>
          <div style={{fontSize:14,fontWeight:700,color:"#e0e0e0",letterSpacing:2,marginBottom:6}}>SECURE LOGIN</div>
          <div style={{fontSize:11,color:"#444",marginBottom:28}}>Authorized personnel only</div>

          {error && (
            <div style={{background:"#ff2d5511",border:"1px solid #ff2d5533",borderRadius:8,padding:"10px 14px",marginBottom:16,fontSize:11,color:"#ff2d55"}}>
              ⚠ {error}
            </div>
          )}

          <div style={{marginBottom:16}}>
            <div style={{fontSize:10,color:"#555",letterSpacing:2,marginBottom:8}}>USERNAME</div>
            <input
              type="text"
              value={username}
              onChange={e=>setUsername(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&handleLogin()}
              placeholder="Enter username"
            />
          </div>

          <div style={{marginBottom:24}}>
            <div style={{fontSize:10,color:"#555",letterSpacing:2,marginBottom:8}}>PASSWORD</div>
            <input
              type="password"
              value={password}
              onChange={e=>setPassword(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&handleLogin()}
              placeholder="Enter password"
            />
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            style={{width:"100%",background:"#ff2d55",border:"none",color:"#fff",padding:"13px",borderRadius:8,fontSize:13,cursor:"pointer",fontFamily:"monospace",fontWeight:700,letterSpacing:2,opacity:loading?0.6:1,transition:"all 0.2s"}}
          >
            {loading?"◌ AUTHENTICATING...":"▶ LOGIN"}
          </button>

          <div style={{marginTop:24,padding:"14px 16px",background:"#111",borderRadius:8,fontSize:11}}>
            <div style={{color:"#555",marginBottom:8,letterSpacing:1}}>DEFAULT CREDENTIALS</div>
            <div style={{color:"#666"}}>Admin: <span style={{color:"#0a84ff"}}>admin</span> / <span style={{color:"#0a84ff"}}>NepalShield@2026</span></div>
            <div style={{color:"#666",marginTop:4}}>Viewer: <span style={{color:"#555"}}>viewer</span> / <span style={{color:"#555"}}>viewer@2026</span></div>
          </div>
        </div>

        <div style={{textAlign:"center",marginTop:20,fontSize:10,color:"#333"}}>
          Nepal Government Cybersecurity System • Authorized Access Only
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser]             = useState(null);
  const [breaches, setBreaches]     = useState(MOCK.breaches);
  const [stats, setStats]           = useState(MOCK.stats);
  const [tab, setTab]               = useState("dashboard");
  const [scanText, setScanText]     = useState("");
  const [scanResult, setScanResult] = useState(null);
  const [scanning, setScanning]     = useState(false);
  const [apiOnline, setApiOnline]   = useState(false);
  const [lastScan, setLastScan]     = useState(new Date().toLocaleTimeString());
  const [secStats, setSecStats]     = useState(null);

  useEffect(() => {
    const token    = localStorage.getItem("ns_token");
    const username = localStorage.getItem("ns_username");
    const role     = localStorage.getItem("ns_role");
    if (token && username) setUser({token, username, role});
  }, []);

  useEffect(() => {
    if (!user) return;
    fetchData();
    fetchSecStats();
    const t = setInterval(() => { fetchData(); fetchSecStats(); }, 30000);
    return () => clearInterval(t);
  }, [user]);

  function handleLogin(data) { setUser(data); }

  function handleLogout() {
    localStorage.removeItem("ns_token");
    localStorage.removeItem("ns_username");
    localStorage.removeItem("ns_role");
    setUser(null);
  }

  async function fetchData() {
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
  }

  async function fetchSecStats() {
    try {
      const res = await fetch(`${API}/security/stats`);
      setSecStats(await res.json());
    } catch {}
  }

  function localScan(text) {
    const emails   = text.match(/[\w.-]+@[\w.-]+\.gov\.np/gi)||[];
    const keywords = ["gov.np","password","leaked","credentials","dump","breach","hacked"].filter(k=>text.toLowerCase().includes(k));
    let score = Math.min(emails.length*2+keywords.length+(text.toLowerCase().includes("password")?3:0),10);
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

  async function testWaf(attack) {
    try {
      const res  = await fetch(`${API}/security/waf/test`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({ip:"test-ip",method:"GET",path:attack,params:"",body:""})});
      const data = await res.json();
      alert(`${data.allowed?"✅ ALLOWED":"🚨 BLOCKED"}\nType: ${data.attack_type||"None"}\nDetail: ${data.detail||"N/A"}`);
      fetchSecStats();
    } catch { alert("API not connected"); }
  }

  if (!user) return <LoginScreen onLogin={handleLogin}/>;

  const criticalCount = breaches.filter(b=>b.threat_score>=9).length;
  const emailCount    = breaches.reduce((a,b)=>a+(b.email?.split(',').length||0),0);

  return (
    <div style={{background:"#07070f",color:"#e0e0e0",fontFamily:"monospace",minHeight:"100vh"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        body{background:#07070f}
        table{width:100%;border-collapse:collapse}
        th{text-align:left;padding:10px 16px;font-size:9px;color:#444;letter-spacing:2px;border-bottom:1px solid #111}
        td{padding:12px 16px;font-size:11px;border-bottom:1px solid #0d0d1a;vertical-align:middle}
        tr:hover td{background:#0d0d1a}
        textarea{width:100%;background:#0d0d1a;border:1px solid #1a1a2e;color:#e0e0e0;border-radius:8px;padding:14px;font-family:monospace;font-size:12px;resize:vertical;outline:none;line-height:1.6}
        textarea:focus{border-color:#ff2d55}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:#111}
        ::-webkit-scrollbar-thumb{background:#ff2d55;border-radius:2px}
      `}</style>

      {/* HEADER */}
      <div style={{background:"#0a0a12",borderBottom:"1px solid #1a1a2e",padding:"0 32px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:200}}>
        <div style={{padding:"14px 0",display:"flex",alignItems:"center",gap:16}}>
          <div>
            <div style={{fontSize:22,fontWeight:700,color:"#ff2d55",letterSpacing:4}}>NEPALSHIELD</div>
            <div style={{fontSize:8,color:"#333",letterSpacing:3,marginTop:2}}>GOVERNMENT BREACH MONITOR • v2.0</div>
          </div>
          <div style={{width:1,height:32,background:"#1a1a2e"}}/>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <span style={{width:7,height:7,borderRadius:"50%",background:"#30d158",boxShadow:"0 0 8px #30d158",display:"inline-block",animation:"pulse 2s infinite"}}/>
            <span style={{fontSize:10,color:"#30d158",fontWeight:600}}>MONITORING ACTIVE</span>
          </div>
        </div>

        <div style={{display:"flex",gap:4}}>
          {["dashboard","breaches","scanner","security","about"].map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{background:tab===t?"#ff2d5522":"transparent",border:tab===t?"1px solid #ff2d5544":"1px solid transparent",color:tab===t?"#ff2d55":"#555",padding:"7px 16px",borderRadius:6,fontSize:10,letterSpacing:1,textTransform:"uppercase",cursor:"pointer",fontFamily:"monospace",transition:"all 0.2s"}}>{t}</button>
          ))}
        </div>

        <div style={{display:"flex",alignItems:"center",gap:16}}>
          <div style={{textAlign:"right",fontSize:10}}>
            <div style={{color:apiOnline?"#30d158":"#ff9500",marginBottom:2}}>{apiOnline?"● API CONNECTED":"● DEMO MODE"}</div>
            <div style={{color:"#333"}}>SCAN: {lastScan}</div>
          </div>
          <div style={{borderLeft:"1px solid #1a1a2e",paddingLeft:16,display:"flex",alignItems:"center",gap:10}}>
            <div>
              <div style={{fontSize:10,color:"#ff2d55",fontWeight:700}}>{user.username.toUpperCase()}</div>
              <div style={{fontSize:9,color:"#444"}}>{user.role.toUpperCase()}</div>
            </div>
            <button onClick={handleLogout} style={{background:"#ff2d5511",border:"1px solid #ff2d5533",color:"#ff2d55",padding:"5px 12px",borderRadius:6,fontSize:10,cursor:"pointer",fontFamily:"monospace"}}>LOGOUT</button>
          </div>
        </div>
      </div>

      <div style={{padding:"28px 32px"}}>

        {/* DASHBOARD */}
        {tab==="dashboard" && <div style={{animation:"fadeIn 0.4s ease"}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16,marginBottom:24}}>
            <StatCard label="TOTAL BREACHES"   value={stats.total_breaches} color="#ff2d55" icon="⚠" sub="All time detected"/>
            <StatCard label="CRITICAL THREATS"  value={criticalCount}        color="#ff9500" icon="🔴" sub="Score 9-10"/>
            <StatCard label="EMAILS EXPOSED"    value={emailCount}           color="#0a84ff" icon="📧" sub=".gov.np accounts"/>
            <StatCard label="SYSTEM STATUS"     value="LIVE"                 color="#30d158" icon="✓" sub="All systems active"/>
          </div>

          {criticalCount > 0 && (
            <div style={{background:"#ff2d5511",border:"1px solid #ff2d5533",borderLeft:"4px solid #ff2d55",borderRadius:8,padding:"14px 20px",marginBottom:24,display:"flex",alignItems:"center",gap:12}}>
              <span style={{fontSize:20}}>🚨</span>
              <div>
                <div style={{color:"#ff2d55",fontWeight:700,fontSize:12,letterSpacing:1}}>CRITICAL ALERT — IMMEDIATE ACTION REQUIRED</div>
                <div style={{color:"#ff6680",fontSize:11,marginTop:2}}>{criticalCount} critical breach(es) detected involving Nepal Government accounts</div>
              </div>
            </div>
          )}

          <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:16,marginBottom:24}}>
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
                    <td style={{color:"#aaa",maxWidth:200,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{b.email}</td>
                    <td><Badge score={b.threat_score}/></td>
                    <td style={{color:"#444",fontSize:10}}>{b.found_at?.slice(0,16)}</td>
                    <td><span style={{color:"#30d158",fontSize:10}}>{b.alerted==="Yes"?"✓ SENT":"PENDING"}</span></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>

            <div style={{background:"#0a0a12",border:"1px solid #1a1a2e",borderRadius:12,padding:20}}>
              <div style={{fontSize:10,color:"#555",letterSpacing:2,marginBottom:16}}>THREAT DISTRIBUTION</div>
              {[
                {label:"Critical (9-10)",count:breaches.filter(b=>b.threat_score>=9).length,color:"#ff2d55"},
                {label:"High (7-8)",     count:breaches.filter(b=>b.threat_score>=7&&b.threat_score<9).length,color:"#ff9500"},
                {label:"Medium (4-6)",   count:breaches.filter(b=>b.threat_score>=4&&b.threat_score<7).length,color:"#ffcc00"},
                {label:"Low (1-3)",      count:breaches.filter(b=>b.threat_score<4).length,color:"#30d158"},
              ].map((r,i)=>(
                <div key={i} style={{marginBottom:14}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                    <span style={{fontSize:10,color:"#666"}}>{r.label}</span>
                    <span style={{fontSize:10,color:r.color,fontWeight:700}}>{r.count}</span>
                  </div>
                  <div style={{background:"#111",borderRadius:4,height:5,overflow:"hidden"}}>
                    <div style={{background:r.color,width:`${Math.max((r.count/Math.max(breaches.length,1))*100,0)}%`,height:"100%",borderRadius:4,transition:"width 0.8s ease"}}/>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>}

        {/* BREACHES */}
        {tab==="breaches" && <div style={{animation:"fadeIn 0.4s ease"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
            <div>
              <div style={{fontSize:20,fontWeight:700,color:"#ff2d55",letterSpacing:2}}>ALL BREACHES</div>
              <div style={{fontSize:11,color:"#444",marginTop:2}}>{breaches.length} records</div>
            </div>
            <button onClick={fetchData} style={{background:"#ff2d5522",border:"1px solid #ff2d5544",color:"#ff2d55",padding:"8px 20px",borderRadius:6,fontSize:11,cursor:"pointer",fontFamily:"monospace"}}>↻ REFRESH</button>
          </div>
          <div style={{background:"#0a0a12",border:"1px solid #1a1a2e",borderRadius:12,overflow:"hidden"}}>
            <table>
              <thead><tr><th>#</th><th>SOURCE</th><th>EMAILS</th><th>LEVEL</th><th>SCORE</th><th>DETECTED AT</th><th>ALERTED</th></tr></thead>
              <tbody>{breaches.map(b=>(
                <tr key={b.id}>
                  <td style={{color:"#333",fontSize:10}}>#{b.id}</td>
                  <td style={{color:"#0a84ff"}}>{b.source}</td>
                  <td style={{color:"#aaa",maxWidth:280,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{b.email}</td>
                  <td><LevelBadge level={b.threat_score>=9?"CRITICAL":b.threat_score>=7?"HIGH":b.threat_score>=4?"MEDIUM":"LOW"}/></td>
                  <td><Badge score={b.threat_score}/></td>
                  <td style={{color:"#444",fontSize:10}}>{b.found_at?.slice(0,19)}</td>
                  <td><span style={{color:b.alerted==="Yes"?"#30d158":"#ff9500",fontSize:10}}>{b.alerted==="Yes"?"✓ SENT":"PENDING"}</span></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>}

        {/* SCANNER */}
        {tab==="scanner" && <div style={{animation:"fadeIn 0.4s ease",maxWidth:800}}>
          <div style={{marginBottom:20}}>
            <div style={{fontSize:20,fontWeight:700,color:"#ff2d55",letterSpacing:2}}>MANUAL SCANNER</div>
            <div style={{fontSize:11,color:"#444",marginTop:2}}>Paste suspicious text to detect .gov.np leaks</div>
          </div>
          <div style={{background:"#0a0a12",border:"1px solid #1a1a2e",borderRadius:12,padding:24,marginBottom:16}}>
            <textarea rows={8} value={scanText} onChange={e=>setScanText(e.target.value)} placeholder={"Paste suspicious text here...\n\nExample:\nadmin@moha.gov.np : Nepal@2024"}/>
            <div style={{display:"flex",gap:10,marginTop:14}}>
              <button onClick={runScan} disabled={scanning} style={{background:"#ff2d55",border:"none",color:"#fff",padding:"10px 28px",borderRadius:6,fontSize:12,cursor:"pointer",fontFamily:"monospace",fontWeight:700,opacity:scanning?0.6:1}}>
                {scanning?"◌ SCANNING...":"▶ RUN SCAN"}
              </button>
              <button onClick={()=>{setScanText("");setScanResult(null);}} style={{background:"transparent",border:"1px solid #1a1a2e",color:"#555",padding:"10px 20px",borderRadius:6,fontSize:12,cursor:"pointer",fontFamily:"monospace"}}>CLEAR</button>
            </div>
          </div>
          {scanResult && (
            <div style={{background:scanResult.is_threat?"#ff2d5508":"#30d15808",border:`1px solid ${scanResult.is_threat?"#ff2d5533":"#30d15833"}`,borderRadius:12,padding:24,animation:"fadeIn 0.3s ease"}}>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
                <span style={{fontSize:24}}>{scanResult.is_threat?"🚨":"✅"}</span>
                <div>
                  <div style={{fontSize:16,fontWeight:700,color:scanResult.is_threat?"#ff2d55":"#30d158",letterSpacing:2}}>{scanResult.is_threat?"THREAT DETECTED":"NO THREAT FOUND"}</div>
                  <div style={{fontSize:11,color:"#555",marginTop:2}}>{scanResult.is_threat?"Immediate action recommended":"Content appears safe"}</div>
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16,marginBottom:16}}>
                <div style={{background:"#111",borderRadius:8,padding:14}}><div style={{fontSize:9,color:"#555",letterSpacing:2,marginBottom:6}}>SCORE</div><Badge score={scanResult.score}/></div>
                <div style={{background:"#111",borderRadius:8,padding:14}}><div style={{fontSize:9,color:"#555",letterSpacing:2,marginBottom:6}}>LEVEL</div><LevelBadge level={scanResult.level}/></div>
                <div style={{background:"#111",borderRadius:8,padding:14}}><div style={{fontSize:9,color:"#555",letterSpacing:2,marginBottom:6}}>EMAILS</div><span style={{color:"#0a84ff",fontSize:16,fontWeight:700}}>{scanResult.emails?.length||0}</span></div>
              </div>
              {scanResult.emails?.length>0 && (
                <div style={{marginBottom:12}}>
                  <div style={{fontSize:9,color:"#555",letterSpacing:2,marginBottom:8}}>COMPROMISED EMAILS</div>
                  {scanResult.emails.map((e,i)=><div key={i} style={{color:"#0a84ff",fontSize:12,marginBottom:4}}>• {e}</div>)}
                </div>
              )}
              <div>
                <div style={{fontSize:9,color:"#555",letterSpacing:2,marginBottom:8}}>KEYWORDS</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                  {scanResult.keywords?.map((k,i)=><span key={i} style={{background:"#ff2d5522",color:"#ff2d55",padding:"3px 10px",borderRadius:4,fontSize:10}}>{k}</span>)}
                  {!scanResult.keywords?.length&&<span style={{color:"#333",fontSize:11}}>None</span>}
                </div>
              </div>
            </div>
          )}
        </div>}

        {/* SECURITY */}
        {tab==="security" && <div style={{animation:"fadeIn 0.4s ease"}}>
          <div style={{marginBottom:24}}>
            <div style={{fontSize:20,fontWeight:700,color:"#ff2d55",letterSpacing:2}}>SECURITY MONITOR</div>
            <div style={{fontSize:11,color:"#444",marginTop:2}}>IDS + WAF + Honeypot — Combined Defense System</div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16,marginBottom:24}}>
            <div style={{background:"#0a0a12",border:"1px solid #1a1a2e",borderRadius:12,padding:24,borderTop:"3px solid #0a84ff"}}>
              <div style={{fontSize:10,color:"#555",letterSpacing:2,marginBottom:12}}>🛡️ IDS — NETWORK MONITOR</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                {[
                  {label:"Active Conns", value:secStats?.ids?.active_connections??0,  color:"#0a84ff"},
                  {label:"Total Alerts", value:secStats?.ids?.total_alerts??0,         color:"#ff2d55"},
                  {label:"Blocked IPs",  value:secStats?.ids?.blocked_ips??0,          color:"#ff9500"},
                  {label:"CPU Usage",    value:`${secStats?.ids?.cpu_percent??0}%`,    color:"#30d158"},
                ].map((s,i)=>(
                  <div key={i} style={{background:"#111",borderRadius:6,padding:10}}>
                    <div style={{fontSize:9,color:"#444",marginBottom:4}}>{s.label}</div>
                    <div style={{fontSize:18,fontWeight:700,color:s.color}}>{s.value}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{background:"#0a0a12",border:"1px solid #1a1a2e",borderRadius:12,padding:24,borderTop:"3px solid #ff9500"}}>
              <div style={{fontSize:10,color:"#555",letterSpacing:2,marginBottom:12}}>🔒 WAF — WEB FIREWALL</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                {[
                  {label:"Blocked",    value:secStats?.waf?.total_blocked??0, color:"#ff2d55"},
                  {label:"Allowed",    value:secStats?.waf?.total_allowed??0, color:"#30d158"},
                  {label:"Unique IPs", value:secStats?.waf?.unique_ips??0,   color:"#0a84ff"},
                  {label:"Status",     value:"ACTIVE",                         color:"#30d158"},
                ].map((s,i)=>(
                  <div key={i} style={{background:"#111",borderRadius:6,padding:10}}>
                    <div style={{fontSize:9,color:"#444",marginBottom:4}}>{s.label}</div>
                    <div style={{fontSize:18,fontWeight:700,color:s.color}}>{s.value}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{background:"#0a0a12",border:"1px solid #1a1a2e",borderRadius:12,padding:24,borderTop:"3px solid #bf5af2"}}>
              <div style={{fontSize:10,color:"#555",letterSpacing:2,marginBottom:12}}>🍯 HONEYPOT — ATTACKER TRAP</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                {[
                  {label:"Caught",   value:secStats?.honeypot?.total_attackers??0, color:"#bf5af2"},
                  {label:"Attempts", value:secStats?.honeypot?.total_attempts??0,  color:"#ff2d55"},
                  {label:"Ports",    value:"2",                                     color:"#ff9500"},
                  {label:"Status",   value:"ACTIVE",                                color:"#30d158"},
                ].map((s,i)=>(
                  <div key={i} style={{background:"#111",borderRadius:6,padding:10}}>
                    <div style={{fontSize:9,color:"#444",marginBottom:4}}>{s.label}</div>
                    <div style={{fontSize:18,fontWeight:700,color:s.color}}>{s.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div style={{background:"#0a0a12",border:"1px solid #1a1a2e",borderRadius:12,padding:24,marginBottom:16}}>
            <div style={{fontSize:10,color:"#555",letterSpacing:2,marginBottom:16}}>⚡ WAF LIVE ATTACK TESTER</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
              {[
                {label:"SQL Injection",     attack:"GET /?id=1 UNION SELECT username,password FROM users--"},
                {label:"XSS Attack",        attack:"<script>alert(document.cookie)</script>"},
                {label:"Path Traversal",    attack:"GET /file?name=../../etc/passwd"},
                {label:"Command Injection", attack:"host=google.com; rm -rf /"},
              ].map((t,i)=>(
                <button key={i} onClick={()=>testWaf(t.attack)} style={{background:"#111",border:"1px solid #1a1a2e",color:"#aaa",padding:"12px 16px",borderRadius:8,fontSize:11,cursor:"pointer",fontFamily:"monospace",textAlign:"left"}}>
                  <div style={{color:"#ff2d55",marginBottom:4,fontWeight:700}}>{t.label}</div>
                  <div style={{fontSize:9,color:"#555",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.attack}</div>
                </button>
              ))}
            </div>
          </div>
          <div style={{background:"#0a0a12",border:"1px solid #1a1a2e",borderRadius:12,padding:24}}>
            <div style={{fontSize:10,color:"#555",letterSpacing:2,marginBottom:16}}>ACTIVE DEFENSE SYSTEMS</div>
            {[
              {icon:"🛡️",name:"SQL Injection Protection",  status:"ACTIVE",color:"#30d158"},
              {icon:"🔒",name:"XSS Attack Prevention",     status:"ACTIVE",color:"#30d158"},
              {icon:"📁",name:"Path Traversal Detection",  status:"ACTIVE",color:"#30d158"},
              {icon:"💉",name:"Command Injection Block",   status:"ACTIVE",color:"#30d158"},
              {icon:"🕵️",name:"Port Scan Detection",       status:"ACTIVE",color:"#30d158"},
              {icon:"🍯",name:"Honeypot Trap System",      status:"ACTIVE",color:"#30d158"},
              {icon:"🌐",name:"Tor Network Monitoring",    status:"ACTIVE",color:"#30d158"},
              {icon:"📧",name:"Breach Alert System",       status:"ACTIVE",color:"#30d158"},
            ].map((d,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 0",borderBottom:"1px solid #111"}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <span>{d.icon}</span>
                  <span style={{fontSize:12,color:"#888"}}>{d.name}</span>
                </div>
                <span style={{fontSize:10,color:d.color,fontWeight:700}}>● {d.status}</span>
              </div>
            ))}
          </div>
        </div>}

        {/* ABOUT */}
        {tab==="about" && <div style={{animation:"fadeIn 0.4s ease",maxWidth:700}}>
          <div style={{fontSize:28,fontWeight:700,color:"#ff2d55",letterSpacing:3,marginBottom:4}}>NEPALSHIELD</div>
          <div style={{fontSize:11,color:"#444",letterSpacing:2,marginBottom:32}}>GOVERNMENT DATA BREACH MONITORING SYSTEM v2.0</div>
          {[
            {label:"PURPOSE",    text:"Monitors paste sites, GitHub, and dark web for leaked Nepal Government (.gov.np) credentials. Sends automated alerts to NTA, Nepal Police Cyber Bureau, and NITC."},
            {label:"SECURITY",   text:"Built-in IDS, WAF, and Honeypot system to detect and trap attackers in real time."},
            {label:"BUILT BY",   text:"Amit Kumar Sah — Cybersecurity Student, Nepal."},
            {label:"TECH STACK", text:"Python 3.11 • Flask • PostgreSQL • React.js • Tor Network • ReportLab"},
            {label:"GITHUB",     text:"github.com/amit123-rgb/NepalShield"},
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
