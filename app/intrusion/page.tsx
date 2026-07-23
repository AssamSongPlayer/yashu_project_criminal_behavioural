'use client';

import { useState } from 'react';
import AIInsightPanel from '@/components/AIInsightPanel';
import LoadingSpinner from '@/components/LoadingSpinner';
import AlertBanner from '@/components/AlertBanner';
import { cacheGet, cacheSet } from '@/lib/cache';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';

const INTRUSION_LOG = [
  { time: '09:42:11', ip: '185.220.101.47', port: 443, proto: 'HTTPS', severity: 'critical', msg: 'Repeated authentication failures - brute force pattern' },
  { time: '09:38:55', ip: '203.0.113.22', port: 22, proto: 'SSH', severity: 'high', msg: 'Port scan detected - 1024 ports swept in 3 seconds' },
  { time: '09:35:30', ip: '198.51.100.8', port: 8080, proto: 'HTTP', severity: 'high', msg: 'SQL injection attempt in request body' },
  { time: '09:30:18', ip: '10.0.0.45', port: 3389, proto: 'RDP', severity: 'medium', msg: 'Unusual RDP connection from internal host' },
  { time: '09:25:44', ip: '192.168.1.103', port: 53, proto: 'DNS', severity: 'medium', msg: 'DNS tunneling signature detected' },
  { time: '09:22:01', ip: '185.220.101.15', port: 80, proto: 'HTTP', severity: 'low', msg: 'Suspicious user agent string in HTTP header' },
  { time: '09:18:33', ip: '10.0.0.21', port: 445, proto: 'SMB', severity: 'low', msg: 'SMB enumeration detected on internal network' },
];

const TIMELINE_DATA = Array.from({ length: 24 }, (_, h) => ({
  hour: `${String(h).padStart(2, '0')}:00`,
  intrusions: Math.floor(Math.random() * 15),
  blocked: Math.floor(Math.random() * 12),
}));

interface IntrusionResult {
  riskScore: number;
  riskLevel: string;
  summary: string;
  intrusionType: string;
  patterns: string[];
  anomalies: string[];
  recommendations: string[];
  falsePositiveProbability: number;
  affectedSystems: string[];
  mitreTechniques: string[];
  immediateActions: string[];
}

const severityColor: Record<string, string> = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#22c55e',
};

export default function IntrusionPage() {
  const [form, setForm] = useState({ sourceIP: '', destIP: '', port: '', protocol: '', payload: '' });
  const [result, setResult] = useState<IntrusionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedLog, setSelectedLog] = useState<typeof INTRUSION_LOG[0] | null>(null);

  async function handleAnalyse(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const logEntries = INTRUSION_LOG.map(l => `[${l.time}] ${l.ip}:${l.port} (${l.proto}) - ${l.msg}`);
    const cacheKey = `intrusion_${form.sourceIP}_${form.port}`;
    const cached = cacheGet<IntrusionResult>(cacheKey);
    if (cached) { setResult(cached); return; }

    setLoading(true);
    try {
      const res = await fetch('/api/gemini/intrusion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, logEntries }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Analysis failed');
      setResult(data.result);
      cacheSet(cacheKey, data.result, 1_800_000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Intrusion analysis failed. Check your API key in Settings.');
    } finally {
      setLoading(false);
    }
  }

  function analyseLogEntry(entry: typeof INTRUSION_LOG[0]) {
    setSelectedLog(entry);
    setForm({ sourceIP: entry.ip, destIP: '10.0.0.1', port: String(entry.port), protocol: entry.proto, payload: entry.msg });
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', fontSize: 12 }}>
        <div style={{ color: 'var(--text-3)', marginBottom: 4 }}>{label}</div>
        {payload.map((p: any) => (
          <div key={p.name} style={{ color: p.color, fontWeight: 600 }}>{p.name}: {p.value}</div>
        ))}
      </div>
    );
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-top">
          <div>
            <h1 className="page-title">Intrusion Detection</h1>
            <p className="page-subtitle">AI-powered network & physical intrusion pattern analysis with MITRE ATT&CK mapping</p>
          </div>
          <span className="page-badge">🛡️ Threat Monitor</span>
        </div>
      </div>

      {error && <AlertBanner severity="critical" title="Error" message={error} dismissible onDismiss={() => setError('')} />}

      {/* Timeline Chart */}
      <div className="card mb-24">
        <div className="card-header">
          <div className="card-title-lg">Intrusion Timeline (Last 24 Hours)</div>
          <div style={{ display: 'flex', gap: 16, fontSize: 12 }}>
            <span style={{ color: '#ef4444' }}>■ Intrusions</span>
            <span style={{ color: '#22c55e' }}>■ Blocked</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={TIMELINE_DATA}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="hour" tick={{ fontSize: 9, fill: 'var(--text-3)' }} axisLine={false} tickLine={false} interval={3} />
            <YAxis tick={{ fontSize: 9, fill: 'var(--text-3)' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="intrusions" name="Intrusions" stroke="#ef4444" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="blocked" name="Blocked" stroke="#22c55e" strokeWidth={2} dot={false} strokeDasharray="4 2" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid-1-2">
        {/* Log Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div className="card-header">
              <div className="card-title-lg">Live Intrusion Feed</div>
              <span className="badge badge-critical" style={{ animation: 'pulse-glow 1s infinite' }}>LIVE</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {INTRUSION_LOG.map((entry, i) => (
                <div key={i}
                  className="log-entry"
                  style={{
                    cursor: 'pointer',
                    borderRadius: 6,
                    padding: '10px 8px',
                    background: selectedLog === entry ? 'var(--surface-2)' : 'transparent',
                    borderLeft: `2px solid ${severityColor[entry.severity]}`,
                    paddingLeft: 12,
                    marginBottom: 4,
                    borderBottom: 'none',
                  }}
                  onClick={() => analyseLogEntry(entry)}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="log-time">{entry.time}</span>
                      <span className="log-ip">{entry.ip}</span>
                      <span className={`badge badge-${entry.severity}`}>{entry.severity}</span>
                    </div>
                    <div className="log-msg">{entry.msg}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Manual Form */}
          <div className="card">
            <div className="card-title-lg" style={{ marginBottom: 14 }}>Manual Analysis Input</div>
            <form onSubmit={handleAnalyse}>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Source IP</label>
                  <input className="form-input mono" placeholder="0.0.0.0" value={form.sourceIP}
                    onChange={e => setForm(f => ({ ...f, sourceIP: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Destination IP</label>
                  <input className="form-input mono" placeholder="0.0.0.0" value={form.destIP}
                    onChange={e => setForm(f => ({ ...f, destIP: e.target.value }))} />
                </div>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Port</label>
                  <input className="form-input mono" placeholder="443" value={form.port}
                    onChange={e => setForm(f => ({ ...f, port: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Protocol</label>
                  <select className="form-input form-select" value={form.protocol}
                    onChange={e => setForm(f => ({ ...f, protocol: e.target.value }))}>
                    <option value="">Select protocol</option>
                    <option>HTTP</option>
                    <option>HTTPS</option>
                    <option>SSH</option>
                    <option>FTP</option>
                    <option>DNS</option>
                    <option>RDP</option>
                    <option>SMB</option>
                    <option>ICMP</option>
                    <option>TCP</option>
                    <option>UDP</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Payload / Notes</label>
                <textarea className="form-input form-textarea mono" rows={3}
                  placeholder="Paste payload snippet or notes..."
                  value={form.payload}
                  onChange={e => setForm(f => ({ ...f, payload: e.target.value }))} />
              </div>
              <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                {loading ? <LoadingSpinner size="sm" text="Scanning..." /> : '🔍 Analyse with Gemini AI'}
              </button>
            </form>
          </div>
        </div>

        {/* AI Result */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {loading && <div className="card"><LoadingSpinner fullPanel text="Analysing intrusion pattern..." /></div>}

          {!result && !loading && (
            <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300, gap: 12, textAlign: 'center' }}>
              <div style={{ fontSize: 48 }}>🛡️</div>
              <div style={{ fontWeight: 600 }}>No Analysis Yet</div>
              <div style={{ fontSize: 13, color: 'var(--text-2)', maxWidth: 260 }}>
                Click on a log entry or fill the form manually, then click Analyse to run Gemini AI analysis.
              </div>
            </div>
          )}

          {result && !loading && (
            <>
              <AIInsightPanel
                title="Intrusion Analysis"
                riskScore={result.riskScore}
                riskLevel={result.riskLevel}
                summary={result.summary}
                patterns={result.patterns}
                anomalies={result.anomalies}
                recommendations={result.immediateActions}
              />

              <div className="card">
                <div className="card-title" style={{ marginBottom: 12 }}>Attack Classification</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                  <span className="badge badge-info">{result.intrusionType}</span>
                  <span className="badge badge-neutral">False+ Prob: {result.falsePositiveProbability}%</span>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <div className="text-xs text-muted mb-8">MITRE ATT&CK Techniques</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {result.mitreTechniques?.map((t, i) => (
                      <span key={i} style={{ padding: '3px 8px', background: 'var(--purple-dim)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 4, fontSize: 11, color: 'var(--purple-light)' }}>{t}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted mb-8">Affected Systems</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {result.affectedSystems?.map((s, i) => (
                      <span key={i} className="badge badge-high">{s}</span>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
