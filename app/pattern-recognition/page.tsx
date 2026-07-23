'use client';

import { useState } from 'react';
import AIInsightPanel from '@/components/AIInsightPanel';
import LoadingSpinner from '@/components/LoadingSpinner';
import AlertBanner from '@/components/AlertBanner';
import { cacheGet, cacheSet } from '@/lib/cache';

const SAMPLE_DATA = `Date,CrimeType,Severity,District,Time,WeaponUsed,Resolved
2024-01-15,Robbery,High,District 3,02:30,Yes,No
2024-01-15,Burglary,Medium,District 7,14:45,No,Yes
2024-01-16,Assault,High,District 3,23:10,Yes,No
2024-01-16,CyberCrime,Critical,District 1,09:00,No,Yes
2024-01-17,Robbery,High,District 3,01:15,Yes,No
2024-01-17,Fraud,Medium,District 5,11:30,No,Yes
2024-01-18,Robbery,High,District 3,03:00,Yes,No
2024-01-18,Assault,Critical,District 2,22:45,Yes,No
2024-01-19,Burglary,Low,District 8,16:00,No,Yes
2024-01-19,CyberCrime,High,District 1,10:15,No,No
2024-01-20,Robbery,Critical,District 3,00:30,Yes,No
2024-01-20,Stalking,Medium,District 6,20:00,No,Yes`;

interface ClusterResult {
  id: string;
  name: string;
  size: number;
  description: string;
  dominantFeature: string;
  riskLevel: string;
}

interface PatternResult {
  totalPatterns: number;
  clusters: ClusterResult[];
  patterns: string[];
  anomalies: string[];
  temporalTrend: string;
  geographicConcentration: string;
  predictiveInsights: string[];
  summary: string;
  confidenceScore: number;
  recommendedActions: string[];
}

const DATA_TYPES = ['General Crime Data', 'Network Logs', 'Behavioural Records', 'Financial Transactions', 'Communication Intercepts', 'Surveillance Data'];

const clusterRiskColor: Record<string, string> = {
  CRITICAL: '#ef4444', HIGH: '#f97316', MEDIUM: '#eab308', LOW: '#22c55e',
};

export default function PatternRecognitionPage() {
  const [dataInput, setDataInput] = useState(SAMPLE_DATA);
  const [dataType, setDataType] = useState(DATA_TYPES[0]);
  const [timeRange, setTimeRange] = useState('Last 30 Days');
  const [region, setRegion] = useState('All Districts');
  const [result, setResult] = useState<PatternResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleAnalyse() {
    setError('');
    if (!dataInput.trim() || dataInput.trim().length < 20) {
      setError('Please provide sufficient data for pattern recognition (minimum 20 characters).');
      return;
    }

    const cacheKey = `pattern_${btoa(dataInput.slice(0, 60)).replace(/[^a-z0-9]/gi, '')}`;
    const cached = cacheGet<PatternResult>(cacheKey);
    if (cached) { setResult(cached); return; }

    setLoading(true);
    try {
      const res = await fetch('/api/gemini/pattern', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataInput, dataType, timeRange, region }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Pattern analysis failed');
      setResult(data.result);
      cacheSet(cacheKey, data.result, 3_600_000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Pattern analysis failed. Check your API key in Settings.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-header-top">
          <div>
            <h1 className="page-title">Pattern Recognition</h1>
            <p className="page-subtitle">AI-powered cluster analysis and anomaly detection using Gemini 2.5 Flash</p>
          </div>
          <span className="page-badge">🔍 Pattern Analysis</span>
        </div>
      </div>

      {error && <AlertBanner severity="critical" title="Error" message={error} dismissible onDismiss={() => setError('')} />}

      <div className="grid-1-2">
        {/* Input Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div className="card-title-lg" style={{ marginBottom: 16 }}>Data Input</div>

            <div className="form-group">
              <label className="form-label">Data Type</label>
              <select className="form-input form-select"
                value={dataType} onChange={e => setDataType(e.target.value)}>
                {DATA_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Time Range</label>
                <select className="form-input form-select"
                  value={timeRange} onChange={e => setTimeRange(e.target.value)}>
                  {['Last 7 Days', 'Last 30 Days', 'Last 90 Days', 'Last Year', 'Custom'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Region</label>
                <select className="form-input form-select"
                  value={region} onChange={e => setRegion(e.target.value)}>
                  {['All Districts', 'District 1-4', 'District 5-8', 'District 9-12'].map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Data Input (CSV, JSON, or Plain Text)</label>
              <textarea
                className="form-input form-textarea mono"
                rows={12}
                value={dataInput}
                onChange={e => setDataInput(e.target.value)}
                placeholder="Paste your crime data here (CSV, JSON, or descriptive text)..."
              />
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleAnalyse} disabled={loading}>
                {loading ? <LoadingSpinner size="sm" text="Analysing..." /> : '🔍 Identify Patterns'}
              </button>
              <button className="btn btn-secondary" onClick={() => setDataInput(SAMPLE_DATA)} disabled={loading}>
                Load Sample
              </button>
            </div>
          </div>

          {/* Info panel */}
          <div className="card" style={{ background: 'var(--cyan-dim)', border: '1px solid var(--border-accent)' }}>
            <div style={{ fontSize: 12, color: 'var(--cyan)', fontWeight: 600, marginBottom: 8 }}>💡 Supported Data Formats</div>
            <ul style={{ fontSize: 12, color: 'var(--text-2)', paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 4 }}>
              <li>▸ CSV files with crime records</li>
              <li>▸ JSON incident reports</li>
              <li>▸ Plain text case descriptions</li>
              <li>▸ Network log entries</li>
              <li>▸ Behavioural observation notes</li>
            </ul>
          </div>
        </div>

        {/* Results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {loading && <div className="card"><LoadingSpinner fullPanel text="Identifying patterns and clusters..." /></div>}

          {!result && !loading && (
            <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300, gap: 12, textAlign: 'center' }}>
              <div style={{ fontSize: 48 }}>🔬</div>
              <div style={{ fontWeight: 600 }}>Awaiting Analysis</div>
              <div style={{ fontSize: 13, color: 'var(--text-2)', maxWidth: 280 }}>
                Paste your data in the input panel and click &quot;Identify Patterns&quot; to begin AI cluster analysis.
              </div>
            </div>
          )}

          {result && !loading && (
            <>
              {/* Confidence & Stats */}
              <div className="card">
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  {[
                    { label: 'Patterns Found', value: result.totalPatterns, color: 'var(--cyan)' },
                    { label: 'Clusters', value: result.clusters?.length || 0, color: 'var(--purple-light)' },
                    { label: 'Anomalies', value: result.anomalies?.length || 0, color: 'var(--red-light)' },
                    { label: 'AI Confidence', value: `${result.confidenceScore}%`, color: 'var(--green-light)' },
                  ].map(s => (
                    <div key={s.label} style={{ flex: 1, textAlign: 'center', padding: '12px', background: 'var(--surface-2)', borderRadius: 8 }}>
                      <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Clusters */}
              {result.clusters && result.clusters.length > 0 && (
                <div className="card">
                  <div className="card-title-lg" style={{ marginBottom: 14 }}>Identified Clusters</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {result.clusters.map((cluster) => {
                      const color = clusterRiskColor[cluster.riskLevel] || '#94a3b8';
                      return (
                        <div key={cluster.id} style={{
                          padding: '14px', background: 'var(--surface-2)', borderRadius: 8,
                          borderLeft: `3px solid ${color}`,
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color, fontWeight: 700 }}>{cluster.id}</span>
                              <span style={{ fontSize: 13, fontWeight: 600 }}>{cluster.name}</span>
                            </div>
                            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                              <span className={`badge badge-${cluster.riskLevel.toLowerCase()}`}>{cluster.riskLevel}</span>
                              <span style={{ fontSize: 11, color: 'var(--text-3)' }}>n={cluster.size}</span>
                            </div>
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 4 }}>{cluster.description}</div>
                          <div style={{ fontSize: 11, color, fontWeight: 500 }}>▸ {cluster.dominantFeature}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <AIInsightPanel
                title="Pattern Analysis"
                summary={result.summary}
                patterns={result.patterns}
                anomalies={result.anomalies}
                recommendations={result.recommendedActions}
              />

              {/* Temporal & Geographic */}
              {(result.temporalTrend || result.geographicConcentration) && (
                <div className="card">
                  <div className="card-title-lg" style={{ marginBottom: 12 }}>Spatial & Temporal Insights</div>
                  {result.temporalTrend && (
                    <div style={{ marginBottom: 12 }}>
                      <div className="text-xs text-muted mb-4">TEMPORAL TREND</div>
                      <p style={{ fontSize: 13, color: 'var(--text-2)' }}>{result.temporalTrend}</p>
                    </div>
                  )}
                  {result.geographicConcentration && (
                    <div>
                      <div className="text-xs text-muted mb-4">GEOGRAPHIC CONCENTRATION</div>
                      <p style={{ fontSize: 13, color: 'var(--text-2)' }}>{result.geographicConcentration}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Predictive Insights */}
              {result.predictiveInsights && result.predictiveInsights.length > 0 && (
                <div className="card" style={{ background: 'var(--purple-dim)', border: '1px solid rgba(124,58,237,0.2)' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--purple-light)', marginBottom: 10 }}>🔮 Predictive Insights</div>
                  {result.predictiveInsights.map((insight, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, fontSize: 13, color: 'var(--text-2)', marginBottom: 6 }}>
                      <span style={{ color: 'var(--purple-light)' }}>{i + 1}.</span>
                      <span>{insight}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
