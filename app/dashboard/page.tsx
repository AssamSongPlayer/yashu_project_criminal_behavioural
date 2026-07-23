'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import StatCard from '@/components/StatCard';
import ThreatGauge from '@/components/ThreatGauge';
import AlertBanner from '@/components/AlertBanner';
import { cacheGet, cacheSet } from '@/lib/cache';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

/* ─── Types ─── */
interface LiveStats {
  cases: number;
  threats: number;
  patterns: number;
  resolved: number;
  threatLevel: number;
  updatedAt: number;
}

interface ActivityEvent {
  id: string;
  time: string;
  type: string;
  detail: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
}

/* ─── Seed data ─── */
const INIT_STATS: LiveStats = {
  cases: 1247, threats: 89, patterns: 342, resolved: 1104,
  threatLevel: 72, updatedAt: Date.now(),
};

const EVENT_POOL: Omit<ActivityEvent, 'id' | 'time'>[] = [
  { type: 'Threat Alert',      detail: 'Brute force attempt blocked — 185.220.101.x', severity: 'critical' },
  { type: 'New Case',          detail: 'Case #1249 opened — Cybercrime suspect', severity: 'medium' },
  { type: 'Pattern Match',     detail: 'Temporal cluster identified in District 7', severity: 'high' },
  { type: 'Intrusion Blocked', detail: 'DDoS attempt from 203.0.113.0/24 neutralised', severity: 'critical' },
  { type: 'Assessment Done',   detail: 'Subject #4422 — Risk Score 78 (HIGH)', severity: 'high' },
  { type: 'Case Resolved',     detail: 'Case #1238 — Financial Fraud — Closed', severity: 'low' },
  { type: 'New Pattern',       detail: 'Anomaly spike: Sector 4 network 02:00–04:00', severity: 'medium' },
  { type: 'AI Update',         detail: 'Gemini 2.5 Flash model refreshed', severity: 'info' },
  { type: 'Access Violation',  detail: 'Unauthorised RDP attempt — HQ Server B', severity: 'high' },
  { type: 'Threat Cleared',    detail: 'Alert ALT-003 downgraded to LOW', severity: 'low' },
];

const THREAT_DATA = Array.from({ length: 30 }, (_, i) => ({
  day: `D${i + 1}`,
  threats: Math.floor(20 + Math.random() * 60),
  resolved: Math.floor(15 + Math.random() * 40),
}));

const CRIME_DIST = [
  { name: 'Cyber Intrusion', value: 35, color: '#00d4ff' },
  { name: 'Physical Break-in', value: 22, color: '#7c3aed' },
  { name: 'Financial Fraud', value: 18, color: '#f97316' },
  { name: 'Identity Theft', value: 15, color: '#eab308' },
  { name: 'Violent Crime', value: 10, color: '#ef4444' },
];

const WEEKLY = [
  { day: 'Mon', cases: 12 }, { day: 'Tue', cases: 19 },
  { day: 'Wed', cases: 8 },  { day: 'Thu', cases: 25 },
  { day: 'Fri', cases: 31 }, { day: 'Sat', cases: 14 },
  { day: 'Sun', cases: 7 },
];

const MODULE_STATS = [
  { name: 'Behaviour Assessment', uses: 487, color: '#00d4ff' },
  { name: 'Crime Mapping',        uses: 312, color: '#7c3aed' },
  { name: 'Intrusion Detection',  uses: 629, color: '#ef4444' },
  { name: 'Pattern Recognition',  uses: 241, color: '#f97316' },
  { name: 'Reports',              uses: 178, color: '#22c55e' },
];
const MAX_MODULE = Math.max(...MODULE_STATS.map(m => m.uses));

const sevBadge: Record<string, string> = {
  critical: 'badge badge-critical',
  high:     'badge badge-high',
  medium:   'badge badge-medium',
  low:      'badge badge-low',
  info:     'badge badge-info',
};

const RECENT_ALERTS = [
  { id: 'ALT-001', time: '09:41', type: 'Intrusion Detected', severity: 'critical', location: '192.168.1.45 → 10.0.0.1' },
  { id: 'ALT-002', time: '09:28', type: 'Pattern Match',      severity: 'high',     location: 'District 7 Cluster' },
  { id: 'ALT-003', time: '09:15', type: 'Behavioural Flag',   severity: 'high',     location: 'Subject ID: 4421' },
  { id: 'ALT-004', time: '08:52', type: 'Anomaly Spike',      severity: 'medium',   location: 'Sector 3 Network' },
  { id: 'ALT-005', time: '08:30', type: 'Access Violation',   severity: 'medium',   location: 'HQ Server Room B' },
];

/* ─── Custom Tooltip ─── */
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', fontSize: 12 }}>
      <div style={{ color: 'var(--text-3)', marginBottom: 4 }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} style={{ color: p.color || p.stroke || 'var(--text-1)', fontWeight: 600 }}>{p.name}: {p.value}</div>
      ))}
    </div>
  );
};

function nowTime() {
  return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

let eventCounter = 0;
function makeEvent(): ActivityEvent {
  const tpl = EVENT_POOL[Math.floor(Math.random() * EVENT_POOL.length)];
  return { ...tpl, id: `evt-${++eventCounter}`, time: nowTime() };
}

/* ─── Component ─── */
export default function DashboardPage() {
  const [clock, setClock] = useState('');
  const [stats, setStats] = useState<LiveStats>(() => cacheGet<LiveStats>('dash_stats') ?? INIT_STATS);
  const [activity, setActivity] = useState<ActivityEvent[]>(() => {
    return Array.from({ length: 5 }, makeEvent);
  });
  const [chartData]   = useState({ threats: THREAT_DATA, dist: CRIME_DIST, weekly: WEEKLY });
  const [dismissAlert, setDismissAlert] = useState(false);
  const [newEventId, setNewEventId] = useState('');
  const statsRef = useRef(stats);
  statsRef.current = stats;

  /* Clock */
  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  /* Live stats updates every 5 s */
  useEffect(() => {
    const id = setInterval(() => {
      setStats(prev => {
        const next: LiveStats = {
          cases:       prev.cases + Math.floor(Math.random() * 3),
          threats:     Math.max(40, prev.threats + (Math.random() > 0.45 ? 1 : -1)),
          patterns:    prev.patterns + (Math.random() > 0.6 ? 1 : 0),
          resolved:    prev.resolved + Math.floor(Math.random() * 2),
          threatLevel: Math.min(100, Math.max(30, prev.threatLevel + (Math.random() > 0.5 ? 1 : -1))),
          updatedAt:   Date.now(),
        };
        cacheSet('dash_stats', next, 86_400_000);
        return next;
      });
    }, 5000);
    return () => clearInterval(id);
  }, []);

  /* Activity feed: new event every 7 s */
  useEffect(() => {
    const id = setInterval(() => {
      const evt = makeEvent();
      setNewEventId(evt.id);
      setActivity(prev => [evt, ...prev].slice(0, 12));
    }, 7000);
    return () => clearInterval(id);
  }, []);

  const resolutionPct = Math.round((stats.resolved / Math.max(1, stats.cases)) * 100);

  return (
    <div>
      {/* ── Header ── */}
      <div className="page-header">
        <div className="page-header-top">
          <div>
            <h1 className="page-title">Command Dashboard</h1>
            <p className="page-subtitle">Real-time criminal intelligence and threat monitoring</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 20, fontWeight: 700, color: 'var(--cyan)', letterSpacing: 2 }}>{clock}</div>
              <div style={{ fontSize: 10, color: 'var(--text-3)', letterSpacing: 1 }}>SYSTEM TIME</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: 'var(--green-dim)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 20, fontSize: 11, color: 'var(--green-light)', fontWeight: 600 }}>
              <div className="status-dot dot-green" />
              System Operational
            </div>
          </div>
        </div>
      </div>

      {!dismissAlert && (
        <AlertBanner
          severity="critical"
          title="Active Threat Detected"
          message="3 high-severity intrusion patterns identified in Sector 7. Immediate review recommended."
          dismissible
          onDismiss={() => setDismissAlert(true)}
        />
      )}

      {/* ── Stat Cards ── */}
      <div className="grid-4 mb-24">
        <StatCard title="Active Cases"    value={stats.cases}    icon="📂" color="cyan"   live updated={stats.updatedAt} trend={{ value: 8, label: 'this week' }} />
        <StatCard title="Threats Detected" value={stats.threats} icon="🚨" color="red"    live updated={stats.updatedAt} trend={{ value: 12, label: 'today' }} />
        <StatCard title="Patterns Found"  value={stats.patterns} icon="🔍" color="purple" live updated={stats.updatedAt} trend={{ value: 5, label: 'this month' }} />
        <StatCard title="Resolved Cases"  value={stats.resolved} icon="✅" color="green"  live updated={stats.updatedAt} trend={{ value: 3, label: 'resolution rate' }} />
      </div>

      {/* ── Row 1: Trend Chart + Gauge ── */}
      <div className="grid-2-1 mb-24">
        <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
          {/* Scan line effect */}
          <div style={{
            position: 'absolute', left: 0, right: 0, height: 1, zIndex: 1, pointerEvents: 'none',
            background: 'linear-gradient(90deg,transparent,var(--cyan),transparent)',
            animation: 'scan-line 4s linear infinite', opacity: 0.4,
          }} />
          <div className="card-header">
            <div className="card-title">Threat Detection Trend (30 Days)</div>
            <span style={{ display:'flex', alignItems:'center', gap:5, fontSize:10, fontWeight:700, color:'var(--red-light)', letterSpacing:0.5 }}>
              <div className="status-dot dot-red" style={{width:6,height:6}}/>LIVE
            </span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData.threats}>
              <defs>
                <linearGradient id="g-t" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="g-r" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'var(--text-3)' }} axisLine={false} tickLine={false} interval={4} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text-3)' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="threats"  name="Threats"  stroke="#ef4444" fill="url(#g-t)" strokeWidth={2} />
              <Area type="monotone" dataKey="resolved" name="Resolved" stroke="#22c55e" fill="url(#g-r)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card" style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:12 }}>
          <div className="card-title">Overall Threat Level</div>
          <ThreatGauge value={stats.threatLevel} size={160} />
          <div style={{ width:'100%' }}>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'var(--text-3)', marginBottom:6 }}>
              <span>Resolution Rate</span>
              <span style={{ color:'var(--green-light)', fontWeight:700 }}>{resolutionPct}%</span>
            </div>
            <div className="progress">
              <div className="progress-fill" style={{ width:`${resolutionPct}%`, background:'linear-gradient(90deg,var(--cyan),var(--green))' }} />
            </div>
          </div>
          <div style={{ fontSize:11, color:'var(--text-3)', textAlign:'center' }}>Auto-updates every 5s</div>
        </div>
      </div>

      {/* ── Row 2: Charts + Activity Feed ── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 340px', gap:16, marginBottom:24 }}>
        {/* Pie */}
        <div className="card">
          <div className="card-header"><div className="card-title">Crime Type Distribution</div></div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={chartData.dist} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                {chartData.dist.map((e,i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend formatter={(v) => <span style={{color:'var(--text-2)',fontSize:11}}>{v}</span>} iconSize={8} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar */}
        <div className="card">
          <div className="card-header"><div className="card-title">Cases This Week</div></div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData.weekly} barSize={22}>
              <XAxis dataKey="day" tick={{fontSize:11,fill:'var(--text-3)'}} axisLine={false} tickLine={false} />
              <YAxis tick={{fontSize:10,fill:'var(--text-3)'}} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="cases" name="Cases" radius={[4,4,0,0]}>
                {chartData.weekly.map((_,i) => <Cell key={i} fill={`hsl(${195+i*15},80%,${55-i*2}%)`} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Live Activity Feed */}
        <div className="card" style={{ display:'flex', flexDirection:'column', overflow:'hidden' }}>
          <div className="card-header" style={{ marginBottom:12 }}>
            <div className="card-title">Live Activity</div>
            <span style={{ display:'flex', alignItems:'center', gap:5, fontSize:10, fontWeight:700, color:'var(--red-light)' }}>
              <div className="status-dot dot-red" style={{width:6,height:6}}/>LIVE
            </span>
          </div>
          <div style={{ flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:0 }}>
            {activity.map((evt, idx) => (
              <div key={evt.id} style={{
                padding: '9px 0',
                borderBottom: '1px solid var(--border-subtle)',
                animation: idx === 0 && evt.id === newEventId ? 'slide-in 0.35s ease' : 'none',
              }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3 }}>
                  <span className={sevBadge[evt.severity]} style={{ fontSize:9 }}>{evt.severity.toUpperCase()}</span>
                  <span style={{ fontSize:10, color:'var(--text-3)', fontFamily:'JetBrains Mono,monospace', marginLeft:'auto' }}>{evt.time}</span>
                </div>
                <div style={{ fontSize:12, fontWeight:600, color:'var(--text-1)' }}>{evt.type}</div>
                <div style={{ fontSize:11, color:'var(--text-2)', marginTop:1 }}>{evt.detail}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Row 3: Module Health + Alerts Table ── */}
      <div className="grid-2 mb-24">
        {/* Module Usage */}
        <div className="card">
          <div className="card-header">
            <div className="card-title-lg">Module Usage</div>
            <span className="badge badge-info">This Month</span>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {MODULE_STATS.map(m => (
              <div key={m.name}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                  <span style={{ fontSize:13, color:'var(--text-2)' }}>{m.name}</span>
                  <span style={{ fontSize:13, fontWeight:700, color:m.color }}>{m.uses.toLocaleString()}</span>
                </div>
                <div className="progress">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${(m.uses/MAX_MODULE)*100}%`,
                      background: `linear-gradient(90deg,${m.color}88,${m.color})`,
                      transition: 'width 1.5s ease',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Alerts Table */}
        <div className="card">
          <div className="card-header">
            <div className="card-title-lg">Recent Alerts</div>
            <span className="badge badge-critical" style={{ animation:'pulse-glow 1.5s infinite' }}>
              {RECENT_ALERTS.filter(a=>a.severity==='critical').length} Critical
            </span>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Time</th>
                  <th>Type</th>
                  <th>Severity</th>
                </tr>
              </thead>
              <tbody>
                {RECENT_ALERTS.map(a => (
                  <tr key={a.id}>
                    <td><span className="mono" style={{color:'var(--cyan)',fontSize:12}}>{a.id}</span></td>
                    <td><span className="mono">{a.time}</span></td>
                    <td style={{color:'var(--text-1)',fontWeight:500,fontSize:13}}>{a.type}</td>
                    <td><span className={sevBadge[a.severity]}>{a.severity.toUpperCase()}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
