'use client';

import { useState, useEffect, useCallback } from 'react';

interface CrimePoint {
  id: string; x: number; y: number; type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  count: number; district: string; time: string;
}

const BASE_POINTS: CrimePoint[] = [
  { id:'C1',  x:180, y:120, type:'Cyber Intrusion',   severity:'critical', count:23, district:'District 1',  time:'09:30' },
  { id:'C2',  x:320, y:180, type:'Property Crime',    severity:'high',     count:15, district:'District 2',  time:'08:45' },
  { id:'C3',  x:450, y:250, type:'Violent Crime',     severity:'critical', count:8,  district:'District 3',  time:'07:15' },
  { id:'C4',  x:150, y:300, type:'Financial Fraud',   severity:'medium',   count:31, district:'District 4',  time:'11:20' },
  { id:'C5',  x:550, y:150, type:'Drug Offence',      severity:'high',     count:19, district:'District 5',  time:'06:00' },
  { id:'C6',  x:280, y:370, type:'Domestic Violence', severity:'high',     count:12, district:'District 6',  time:'10:05' },
  { id:'C7',  x:420, y:400, type:'Cybercrime',        severity:'medium',   count:27, district:'District 7',  time:'13:30' },
  { id:'C8',  x:100, y:430, type:'Stalking',          severity:'low',      count:5,  district:'District 8',  time:'09:00' },
  { id:'C9',  x:490, y:340, type:'Robbery',           severity:'critical', count:9,  district:'District 9',  time:'02:15' },
  { id:'C10', x:370, y:100, type:'Vandalism',         severity:'low',      count:42, district:'District 10', time:'23:00' },
  { id:'C11', x:250, y:220, type:'Identity Theft',    severity:'medium',   count:18, district:'District 11', time:'14:45' },
  { id:'C12', x:570, y:420, type:'Organised Crime',   severity:'high',     count:6,  district:'District 12', time:'01:30' },
];

const SEV_COLORS: Record<string, string> = {
  critical:'#ef4444', high:'#f97316', medium:'#eab308', low:'#22c55e',
};

const CRIME_TYPES = ['All','Cyber Intrusion','Property Crime','Violent Crime','Financial Fraud','Drug Offence','Domestic Violence','Cybercrime','Stalking','Robbery'];
const SEVERITIES  = ['All','Critical','High','Medium','Low'];

export default function MappingPage() {
  const [selectedType,     setSelectedType]     = useState('All');
  const [selectedSeverity, setSelectedSeverity] = useState('All');
  const [activePoint,      setActivePoint]      = useState<CrimePoint | null>(null);
  const [hovered,          setHovered]          = useState<string | null>(null);
  const [points,           setPoints]           = useState(BASE_POINTS);
  const [tick,             setTick]             = useState(0); // for pulsing animation phase

  /* Restore filter state */
  useEffect(() => {
    const saved = localStorage.getItem('cbami_map_filter');
    if (saved) { const f = JSON.parse(saved); setSelectedType(f.type); setSelectedSeverity(f.sev); }
  }, []);

  /* Persist filter */
  useEffect(() => {
    localStorage.setItem('cbami_map_filter', JSON.stringify({ type: selectedType, sev: selectedSeverity }));
  }, [selectedType, selectedSeverity]);

  /* Simulate live incident count updates every 6s */
  useEffect(() => {
    const id = setInterval(() => {
      setPoints(prev => prev.map(p => ({
        ...p,
        count: p.severity === 'critical' || p.severity === 'high'
          ? p.count + (Math.random() > 0.6 ? 1 : 0)
          : p.count,
        time: Math.random() > 0.8 ? new Date().toLocaleTimeString('en-US', {hour:'2-digit',minute:'2-digit'}) : p.time,
      })));
      setTick(t => t + 1);
    }, 6000);
    return () => clearInterval(id);
  }, []);

  const filtered = points.filter(p => {
    const typeOk = selectedType === 'All' || p.type === selectedType;
    const sevOk  = selectedSeverity === 'All' || p.severity === selectedSeverity.toLowerCase();
    return typeOk && sevOk;
  });

  const totalIncidents = filtered.reduce((s,p) => s + p.count, 0);
  const criticalZones  = filtered.filter(p => p.severity === 'critical').length;

  return (
    <div>
      <div className="page-header">
        <div className="page-header-top">
          <div>
            <h1 className="page-title">Crime Mapping</h1>
            <p className="page-subtitle">Live geo-spatial visualization of crime hotspots with auto-updating incident counts</p>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <span className="page-badge">🗺️ Spatial Intelligence</span>
            <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, color:'var(--green-light)', fontWeight:600 }}>
              <div className="status-dot dot-green" />LIVE
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-4 mb-20">
        {[
          { label:'Total Zones',     value:filtered.length, color:'var(--cyan)' },
          { label:'Total Incidents', value:totalIncidents,  color:'var(--orange)' },
          { label:'Critical Zones',  value:criticalZones,   color:'var(--red-light)' },
          { label:'Districts',       value:12,              color:'var(--purple-light)' },
        ].map(s => (
          <div key={s.label} className="card" style={{ textAlign:'center', padding:'16px' }}>
            <div style={{ fontSize:28, fontWeight:700, color:s.color, fontVariantNumeric:'tabular-nums' }}>{s.value}</div>
            <div style={{ fontSize:11, color:'var(--text-3)', marginTop:4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginBottom:16, alignItems:'center' }}>
        <span style={{ fontSize:11, color:'var(--text-3)', fontWeight:600 }}>TYPE:</span>
        {CRIME_TYPES.slice(0,5).map(t => (
          <button key={t} className={selectedType===t ? 'btn btn-primary btn-sm' : 'btn btn-ghost btn-sm'}
            onClick={() => setSelectedType(t)}>{t}</button>
        ))}
        <div style={{ width:1, height:20, background:'var(--border)', margin:'0 4px' }} />
        <span style={{ fontSize:11, color:'var(--text-3)', fontWeight:600 }}>SEVERITY:</span>
        {SEVERITIES.map(s => (
          <button key={s} className={selectedSeverity===s ? 'btn btn-primary btn-sm' : 'btn btn-ghost btn-sm'}
            onClick={() => setSelectedSeverity(s)}>{s}</button>
        ))}
      </div>

      <div className="grid-2-1">
        {/* SVG Map */}
        <div className="crime-map-container">
          <svg className="crime-map-svg" viewBox="0 0 700 520" style={{ background:'var(--bg-2)' }}>
            {/* Grid */}
            {Array.from({length:12},(_,i) => (
              <line key={`h${i}`} x1="0" y1={i*44} x2="700" y2={i*44} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
            ))}
            {Array.from({length:16},(_,i) => (
              <line key={`v${i}`} x1={i*44} y1="0" x2={i*44} y2="520" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
            ))}

            {/* Roads */}
            {[[0,260,700,260],[350,0,350,520],[0,180,350,260],[350,180,700,100],[0,380,350,340],[350,340,700,420]].map(([x1,y1,x2,y2],i) => (
              <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.06)" strokeWidth="2" />
            ))}

            {/* City blocks */}
            {[[40,40,120,100],[200,60,140,80],[400,50,100,60],[520,70,130,90],[60,200,100,120],[240,310,110,90],[440,290,100,110],[560,330,100,80],[80,360,100,80]].map(([x,y,w,h],i) => (
              <rect key={i} x={x} y={y} width={w} height={h} fill="rgba(255,255,255,0.025)" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" rx="2" />
            ))}

            {/* Heatmap glow + PULSING RINGS for critical/high */}
            {filtered.map(p => {
              const color = SEV_COLORS[p.severity];
              const isCritical = p.severity === 'critical';
              const isHigh = p.severity === 'high';
              return (
                <g key={`bg_${p.id}`}>
                  {/* Background heat */}
                  <circle cx={p.x} cy={p.y} r={p.count*1.8+22} fill={color} opacity={0.04} />
                  <circle cx={p.x} cy={p.y} r={p.count*0.9+12} fill={color} opacity={0.07} />

                  {/* Pulsing rings for high/critical */}
                  {(isCritical || isHigh) && (
                    <>
                      <circle cx={p.x} cy={p.y} r={15} fill="none" stroke={color} strokeWidth="1.5"
                        className="hotspot-ring" style={{ animationDuration: isCritical ? '2s' : '2.8s' }} />
                      <circle cx={p.x} cy={p.y} r={15} fill="none" stroke={color} strokeWidth="1"
                        className="hotspot-ring" style={{ animationDuration: isCritical ? '2s' : '2.8s', animationDelay:'0.9s' }} />
                    </>
                  )}
                </g>
              );
            })}

            {/* Crime points */}
            {filtered.map(p => {
              const isActive  = activePoint?.id === p.id;
              const isHovered = hovered === p.id;
              const r = Math.sqrt(p.count) * 2.5 + 6;
              const color = SEV_COLORS[p.severity];
              return (
                <g key={p.id} style={{ cursor:'pointer' }}
                  onClick={() => setActivePoint(activePoint?.id===p.id ? null : p)}
                  onMouseEnter={() => setHovered(p.id)}
                  onMouseLeave={() => setHovered(null)}
                >
                  {/* Selection ring */}
                  {isActive && (
                    <circle cx={p.x} cy={p.y} r={r+8} fill="none" stroke="white" strokeWidth="1.5" opacity={0.5} />
                  )}
                  <circle cx={p.x} cy={p.y} r={r+5} fill={color} opacity={isActive||isHovered ? 0.2 : 0.08} style={{ transition:'all 0.2s' }} />
                  <circle cx={p.x} cy={p.y} r={r} fill={color}
                    stroke={isActive ? '#fff' : color}
                    strokeWidth={isActive ? 2 : 1}
                    opacity={isActive||isHovered ? 1 : 0.88}
                    style={{ filter:`drop-shadow(0 0 ${isActive?10:5}px ${color})`, transition:'all 0.2s' }}
                  />
                  <text x={p.x} y={p.y+1} textAnchor="middle" dominantBaseline="middle"
                    fill="white" fontSize={r>12?9:7} fontWeight="700">{p.count}</text>
                  {(isHovered||isActive) && (
                    <text x={p.x} y={p.y-r-7} textAnchor="middle"
                      fill="white" fontSize="8" fontWeight="600" style={{ filter:'drop-shadow(0 1px 2px black)' }}>
                      {p.district}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Compass */}
            <g transform="translate(660,40)">
              <circle cx="0" cy="0" r="18" fill="var(--surface-2)" stroke="var(--border)" />
              <text x="0" y="-6" textAnchor="middle" fill="var(--cyan)" fontSize="9" fontWeight="700">N</text>
              <text x="0"  y="10" textAnchor="middle" fill="var(--text-3)" fontSize="7">S</text>
              <text x="-10" y="3" textAnchor="middle" fill="var(--text-3)" fontSize="7">W</text>
              <text x="10" y="3" textAnchor="middle" fill="var(--text-3)" fontSize="7">E</text>
            </g>
          </svg>

          {/* Legend */}
          <div className="map-legend">
            {Object.entries(SEV_COLORS).map(([sev,color]) => (
              <div key={sev} className="map-legend-item">
                <div className="map-legend-dot" style={{ background:color, boxShadow:`0 0 6px ${color}` }} />
                <span>{sev.charAt(0).toUpperCase()+sev.slice(1)}</span>
              </div>
            ))}
            <div className="map-legend-item" style={{ marginLeft:'auto', color:'var(--text-3)' }}>
              ⊙ Ring = live pulse
            </div>
          </div>
        </div>

        {/* Detail Panel */}
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {activePoint ? (
            <div className="card animate-slide-up" style={{ border:`1px solid ${SEV_COLORS[activePoint.severity]}33` }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:16 }}>
                <div>
                  <div style={{ fontSize:16, fontWeight:700 }}>{activePoint.district}</div>
                  <div style={{ fontSize:11, color:'var(--text-3)' }}>Zone ID: {activePoint.id}</div>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => setActivePoint(null)}>×</button>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:14 }}>
                {[
                  { label:'Crime Type',  value:activePoint.type },
                  { label:'Severity',    value:<span className={`badge badge-${activePoint.severity}`}>{activePoint.severity.toUpperCase()}</span> },
                  { label:'Incidents',   value:<span style={{fontSize:20,fontWeight:700,color:SEV_COLORS[activePoint.severity]}}>{activePoint.count}</span> },
                  { label:'Last Report', value:activePoint.time },
                ].map(item => (
                  <div key={item.label} style={{ background:'var(--surface-2)', padding:'10px 12px', borderRadius:8 }}>
                    <div style={{ fontSize:10, color:'var(--text-3)', marginBottom:4 }}>{item.label}</div>
                    <div style={{ fontSize:13, fontWeight:600 }}>{item.value}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginBottom:6 }}>
                <div style={{ fontSize:11, color:'var(--text-3)', marginBottom:5 }}>Incident Density</div>
                <div className="progress">
                  <div className="progress-fill" style={{
                    width:`${Math.min(100,(activePoint.count/50)*100)}%`,
                    background:SEV_COLORS[activePoint.severity],
                    boxShadow:`0 0 8px ${SEV_COLORS[activePoint.severity]}55`,
                  }} />
                </div>
                <div style={{ fontSize:10, color:'var(--text-3)', marginTop:3 }}>{activePoint.count}/50 max density</div>
              </div>
            </div>
          ) : (
            <div className="card" style={{ textAlign:'center', padding:'32px 20px' }}>
              <div style={{ fontSize:36, marginBottom:10 }}>📍</div>
              <div style={{ fontWeight:600, marginBottom:6 }}>Click a Hotspot</div>
              <div style={{ fontSize:12, color:'var(--text-2)' }}>Select any crime zone on the map to view detailed incident data.</div>
            </div>
          )}

          {/* Active Zones List */}
          <div className="card" style={{ flex:1 }}>
            <div className="card-title" style={{ marginBottom:10 }}>
              Active Zones ({filtered.length}) — {totalIncidents} incidents
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:5, maxHeight:380, overflowY:'auto' }}>
              {[...filtered].sort((a,b) => b.count-a.count).map(p => (
                <div key={p.id}
                  style={{
                    display:'flex', alignItems:'center', justifyContent:'space-between',
                    padding:'8px 10px',
                    background: activePoint?.id===p.id ? 'var(--surface-3)' : 'var(--surface-2)',
                    borderRadius:6, cursor:'pointer', transition:'background 0.15s',
                    borderLeft:`2px solid ${SEV_COLORS[p.severity]}`,
                  }}
                  onClick={() => setActivePoint(activePoint?.id===p.id ? null : p)}
                >
                  <div>
                    <div style={{ fontSize:12, fontWeight:600 }}>{p.district}</div>
                    <div style={{ fontSize:10, color:'var(--text-3)' }}>{p.type} · {p.time}</div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ fontSize:14, fontWeight:700, color:SEV_COLORS[p.severity], fontVariantNumeric:'tabular-nums' }}>{p.count}</span>
                    <span className={`badge badge-${p.severity}`} style={{ fontSize:9 }}>{p.severity.slice(0,3).toUpperCase()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
