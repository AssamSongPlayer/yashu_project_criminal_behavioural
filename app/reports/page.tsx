'use client';

import { useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const MONTHLY_DATA = MONTHS.map((month, i) => ({
  month,
  cases:    Math.floor(60 + Math.sin(i * 0.6) * 20 + Math.random() * 30),
  resolved: Math.floor(45 + Math.sin(i * 0.6) * 15 + Math.random() * 20),
  threats:  Math.floor(20 + Math.random() * 40),
}));

const CRIME_BY_TYPE = [
  { type: 'Cybercrime',       count: 312, color: '#00d4ff' },
  { type: 'Property Crime',   count: 245, color: '#7c3aed' },
  { type: 'Violent Crime',    count: 178, color: '#ef4444' },
  { type: 'Financial Fraud',  count: 204, color: '#f97316' },
  { type: 'Drug Offences',    count: 156, color: '#eab308' },
  { type: 'Other',            count: 89,  color: '#475569' },
];

const HEATMAP_DATA = Array.from({ length: 7 }, (_, day) =>
  Array.from({ length: 24 }, (_, hour) => ({
    day,
    hour,
    value: Math.floor(Math.random() * 10),
  }))
).flat();

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const RESOLUTION_RATE = [
  { name: 'Jan', rate: 72 }, { name: 'Feb', rate: 68 }, { name: 'Mar', rate: 75 },
  { name: 'Apr', rate: 80 }, { name: 'May', rate: 77 }, { name: 'Jun', rate: 83 },
  { name: 'Jul', rate: 85 }, { name: 'Aug', rate: 79 }, { name: 'Sep', rate: 82 },
  { name: 'Oct', rate: 88 }, { name: 'Nov', rate: 86 }, { name: 'Dec', rate: 91 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', fontSize: 12 }}>
      <div style={{ color: 'var(--text-3)', marginBottom: 4 }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} style={{ color: p.color || p.stroke, fontWeight: 600 }}>{p.name}: {p.value}</div>
      ))}
    </div>
  );
};

function getHeatColor(v: number) {
  if (v === 0) return 'rgba(255,255,255,0.03)';
  if (v <= 2)  return 'rgba(34,197,94,0.3)';
  if (v <= 5)  return 'rgba(234,179,8,0.4)';
  if (v <= 7)  return 'rgba(249,115,22,0.5)';
  return 'rgba(239,68,68,0.6)';
}

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState('Last 12 Months');
  const [showExportMenu, setShowExportMenu] = useState(false);

  const totals = {
    cases: MONTHLY_DATA.reduce((s, d) => s + d.cases, 0),
    resolved: MONTHLY_DATA.reduce((s, d) => s + d.resolved, 0),
    threats: MONTHLY_DATA.reduce((s, d) => s + d.threats, 0),
  };
  const resolutionRate = Math.round((totals.resolved / totals.cases) * 100);

  function handleExport(format: string) {
    setShowExportMenu(false);
    // Simulate export
    const data = JSON.stringify({ generated: new Date().toISOString(), totals, monthlyData: MONTHLY_DATA, crimeByType: CRIME_BY_TYPE }, null, 2);
    const blob = new Blob([data], { type: format === 'JSON' ? 'application/json' : 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cbami_report_${Date.now()}.${format.toLowerCase()}`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-header-top">
          <div>
            <h1 className="page-title">Reports & Analytics</h1>
            <p className="page-subtitle">Comprehensive intelligence analytics, trends, and exportable reports</p>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <select className="form-input form-select" style={{ width: 180 }}
              value={dateRange} onChange={e => setDateRange(e.target.value)}>
              {['Last 7 Days', 'Last 30 Days', 'Last 90 Days', 'Last 12 Months'].map(r => <option key={r}>{r}</option>)}
            </select>
            <div style={{ position: 'relative' }}>
              <button className="btn btn-secondary" onClick={() => setShowExportMenu(v => !v)}>
                📥 Export ▾
              </button>
              {showExportMenu && (
                <div style={{ position: 'absolute', right: 0, top: 42, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, padding: 6, zIndex: 10, minWidth: 140 }}>
                  {['JSON', 'CSV', 'TXT'].map(f => (
                    <button key={f} className="btn btn-ghost btn-sm w-full" style={{ justifyContent: 'flex-start' }}
                      onClick={() => handleExport(f)}>
                      Download {f}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid-4 mb-24">
        {[
          { label: 'Total Cases',      value: totals.cases,    icon: '📂', color: 'var(--cyan)' },
          { label: 'Resolved',         value: totals.resolved, icon: '✅', color: 'var(--green-light)' },
          { label: 'Threats Logged',   value: totals.threats,  icon: '⚠️', color: 'var(--orange)' },
          { label: 'Resolution Rate',  value: `${resolutionRate}%`, icon: '📊', color: 'var(--purple-light)' },
        ].map(s => (
          <div key={s.label} className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Monthly Trend */}
      <div className="card mb-24">
        <div className="card-header">
          <div className="card-title-lg">Monthly Case & Resolution Trend</div>
          <div style={{ display: 'flex', gap: 16, fontSize: 12 }}>
            <span style={{ color: '#00d4ff' }}>■ Cases</span>
            <span style={{ color: '#22c55e' }}>■ Resolved</span>
            <span style={{ color: '#ef4444' }}>■ Threats</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={MONTHLY_DATA}>
            <defs>
              <linearGradient id="g-cases" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="g-res" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-3)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: 'var(--text-3)' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="cases"    name="Cases"    stroke="#00d4ff" fill="url(#g-cases)" strokeWidth={2} />
            <Area type="monotone" dataKey="resolved" name="Resolved" stroke="#22c55e" fill="url(#g-res)"   strokeWidth={2} />
            <Area type="monotone" dataKey="threats"  name="Threats"  stroke="#ef4444" fill="none"           strokeWidth={1.5} strokeDasharray="4 2" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid-2 mb-24">
        {/* Crime by Type Bar */}
        <div className="card">
          <div className="card-header">
            <div className="card-title-lg">Cases by Crime Type</div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={CRIME_BY_TYPE} layout="vertical" barSize={14}>
              <XAxis type="number" tick={{ fontSize: 10, fill: 'var(--text-3)' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="type" width={110} tick={{ fontSize: 11, fill: 'var(--text-2)' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Cases" radius={[0, 4, 4, 0]}>
                {CRIME_BY_TYPE.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Resolution Rate Line */}
        <div className="card">
          <div className="card-header">
            <div className="card-title-lg">Resolution Rate (%)</div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={RESOLUTION_RATE}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-3)' }} axisLine={false} tickLine={false} />
              <YAxis domain={[50, 100]} tick={{ fontSize: 10, fill: 'var(--text-3)' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="rate" name="Resolution %" stroke="#22c55e" strokeWidth={2.5}
                dot={{ fill: '#22c55e', r: 3 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Crime Distribution Pie */}
      <div className="grid-2 mb-24">
        <div className="card">
          <div className="card-header"><div className="card-title-lg">Crime Type Distribution</div></div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={CRIME_BY_TYPE} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="count">
                {CRIME_BY_TYPE.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend formatter={(v) => <span style={{ color: 'var(--text-2)', fontSize: 11 }}>{v}</span>} iconSize={8} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Heatmap */}
        <div className="card">
          <div className="card-header">
            <div className="card-title-lg">Crime Heatmap (Day × Hour)</div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(25, 1fr)', gap: 2, minWidth: 500 }}>
              {/* Hour labels */}
              <div />
              {Array.from({ length: 24 }, (_, h) => (
                <div key={h} style={{ fontSize: 8, color: 'var(--text-3)', textAlign: 'center' }}>{h}</div>
              ))}
              {DAYS.map((day, dayIdx) => (
                <>
                  <div key={`d${dayIdx}`} style={{ fontSize: 10, color: 'var(--text-3)', display: 'flex', alignItems: 'center' }}>{day}</div>
                  {Array.from({ length: 24 }, (_, h) => {
                    const entry = HEATMAP_DATA.find(e => e.day === dayIdx && e.hour === h);
                    const v = entry?.value || 0;
                    return (
                      <div key={h}
                        title={`${day} ${h}:00 — ${v} incidents`}
                        style={{
                          height: 16,
                          borderRadius: 2,
                          background: getHeatColor(v),
                          cursor: 'default',
                        }}
                      />
                    );
                  })}
                </>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 12, fontSize: 10, color: 'var(--text-3)' }}>
              {[
                { label: 'None', color: 'rgba(255,255,255,0.03)' },
                { label: 'Low (1-2)', color: 'rgba(34,197,94,0.3)' },
                { label: 'Med (3-5)', color: 'rgba(234,179,8,0.4)' },
                { label: 'High (6-7)', color: 'rgba(249,115,22,0.5)' },
                { label: 'Critical (8+)', color: 'rgba(239,68,68,0.6)' },
              ].map(l => (
                <div key={l.label} style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                  <div style={{ width: 12, height: 12, borderRadius: 2, background: l.color }} />
                  {l.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
