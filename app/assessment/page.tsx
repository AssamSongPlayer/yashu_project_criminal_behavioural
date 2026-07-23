'use client';

import { useState, useEffect, useRef } from 'react';
import AIInsightPanel from '@/components/AIInsightPanel';
import LoadingSpinner from '@/components/LoadingSpinner';
import ThreatGauge from '@/components/ThreatGauge';
import AlertBanner from '@/components/AlertBanner';
import { cacheGet, cacheSet } from '@/lib/cache';

const BEHAVIORAL_INDICATORS = [
  'History of aggression', 'Social withdrawal', 'Substance abuse',
  'Prior threats made', 'Weapon possession', 'Financial instability',
  'Recent job loss', 'Domestic disputes', 'Erratic behaviour',
  'Obsessive fixation', 'Stalking tendencies', 'Digital harassment',
];

const ANALYSIS_STEPS = [
  { id: 1, label: 'Connecting to Gemini 2.5 Flash...' },
  { id: 2, label: 'Processing subject profile...' },
  { id: 3, label: 'Evaluating behavioural indicators...' },
  { id: 4, label: 'Computing risk score...' },
  { id: 5, label: 'Generating recommendations...' },
];

interface AssessmentResult {
  riskScore: number;
  riskLevel: string;
  summary: string;
  factors: string[];
  recommendations: string[];
  behaviouralProfile: string;
  recidivismProbability: number;
  threatCategory: string;
  confidenceLevel: number;
}

interface FormData {
  name: string; age: string; gender: string; priorOffenses: string;
  incidentType: string; location: string; description: string; indicators: string[];
}

const EMPTY_FORM: FormData = {
  name: '', age: '', gender: '', priorOffenses: '0',
  incidentType: '', location: '', description: '', indicators: [],
};

export default function AssessmentPage() {
  const [form, setForm] = useState<FormData>(() => {
    if (typeof window === 'undefined') return EMPTY_FORM;
    try { return JSON.parse(localStorage.getItem('cbami_assess_form') || 'null') ?? EMPTY_FORM; }
    catch { return EMPTY_FORM; }
  });

  const [result, setResult] = useState<AssessmentResult | null>(() => {
    if (typeof window === 'undefined') return null;
    try { return JSON.parse(localStorage.getItem('cbami_assess_result') || 'null'); }
    catch { return null; }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');
  const [step, setStep]     = useState(0); // current analysis step (1-based)
  const [history, setHistory] = useState<Array<{ form: FormData; result: AssessmentResult; ts: string }>>(() => {
    if (typeof window === 'undefined') return [];
    try { return JSON.parse(localStorage.getItem('cbami_assessments') || '[]'); }
    catch { return []; }
  });

  /* Persist form to localStorage on every change */
  useEffect(() => {
    if (typeof window !== 'undefined')
      localStorage.setItem('cbami_assess_form', JSON.stringify(form));
  }, [form]);

  /* Persist result */
  useEffect(() => {
    if (typeof window !== 'undefined' && result)
      localStorage.setItem('cbami_assess_result', JSON.stringify(result));
  }, [result]);

  function toggleIndicator(ind: string) {
    setForm(f => ({
      ...f,
      indicators: f.indicators.includes(ind)
        ? f.indicators.filter(i => i !== ind)
        : [...f.indicators, ind],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!form.description.trim() && form.indicators.length === 0) {
      setError('Please provide a description or select at least one behavioral indicator.');
      return;
    }

    const cacheKey = `assess_${btoa(JSON.stringify(form)).slice(0, 40)}`;
    const cached = cacheGet<AssessmentResult>(cacheKey);
    if (cached) { setResult(cached); return; }

    setLoading(true);
    setStep(0);

    // Animate through steps
    const stepMs = [600, 900, 800, 700, 500];
    let cumulative = 0;
    for (let i = 0; i < ANALYSIS_STEPS.length; i++) {
      cumulative += stepMs[i];
      const s = i + 1;
      setTimeout(() => setStep(s), cumulative);
    }

    try {
      const res = await fetch('/api/gemini/assess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name, age: form.age, gender: form.gender,
          priorOffenses: form.priorOffenses, incidentType: form.incidentType,
          location: form.location, description: form.description,
          behavioralIndicators: form.indicators,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Assessment failed');

      const r: AssessmentResult = data.result;
      setResult(r);
      cacheSet(cacheKey, r, 3_600_000);

      const entry = { form, result: r, ts: new Date().toLocaleString() };
      const updated = [entry, ...history].slice(0, 10);
      setHistory(updated);
      localStorage.setItem('cbami_assessments', JSON.stringify(updated));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed. Check your API key in Settings.');
    } finally {
      setLoading(false);
      setStep(0);
    }
  }

  function handleReset() {
    setForm(EMPTY_FORM);
    setResult(null);
    setError('');
    localStorage.removeItem('cbami_assess_form');
    localStorage.removeItem('cbami_assess_result');
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-header-top">
          <div>
            <h1 className="page-title">Behaviour Assessment</h1>
            <p className="page-subtitle">AI-powered criminal behaviour profiling and risk scoring via Gemini 2.5 Flash</p>
          </div>
          <span className="page-badge">🧠 AI Analysis</span>
        </div>
      </div>

      {error && <AlertBanner severity="critical" title="Error" message={error} dismissible onDismiss={() => setError('')} />}

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        {/* ── Form ── */}
        <div className="card">
          <div className="card-header">
            <div className="card-title-lg">Subject Profile</div>
            <button className="btn btn-ghost btn-sm" onClick={handleReset}>Reset</button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Name / Subject ID</label>
                <input className="form-input" placeholder="e.g. John Doe / SUB-4421"
                  value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Age</label>
                <input className="form-input" type="number" min="1" max="120" placeholder="Age"
                  value={form.age} onChange={e => setForm(f => ({ ...f, age: e.target.value }))} />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Gender</label>
                <select className="form-input form-select"
                  value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}>
                  <option value="">Select gender</option>
                  <option>Male</option><option>Female</option>
                  <option>Non-binary</option><option>Unknown</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Prior Offenses</label>
                <input className="form-input" type="number" min="0" placeholder="0"
                  value={form.priorOffenses} onChange={e => setForm(f => ({ ...f, priorOffenses: e.target.value }))} />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Incident Type</label>
                <select className="form-input form-select"
                  value={form.incidentType} onChange={e => setForm(f => ({ ...f, incidentType: e.target.value }))}>
                  <option value="">Select type</option>
                  {['Violent Crime','Property Crime','Cybercrime','Financial Fraud','Drug Offence','Domestic Violence','Stalking','Organised Crime','Terrorism Suspicion'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Location</label>
                <input className="form-input" placeholder="City / District / Address"
                  value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Behavioral Indicators ({form.indicators.length} selected)</label>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 }}>
                {BEHAVIORAL_INDICATORS.map(ind => (
                  <label key={ind} className="form-check">
                    <input type="checkbox"
                      checked={form.indicators.includes(ind)}
                      onChange={() => toggleIndicator(ind)} />
                    <span className="form-check-label">{ind}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Incident Description</label>
              <textarea className="form-input form-textarea" rows={4}
                placeholder="Describe the incident, observed behaviours, or any relevant context..."
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>

            <button type="submit" className="btn btn-primary w-full" disabled={loading} style={{ fontSize:14 }}>
              {loading
                ? <LoadingSpinner size="sm" text="Analysing with Gemini..." />
                : '🔍 Run AI Assessment'}
            </button>
          </form>
        </div>

        {/* ── Results ── */}
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

          {/* Multi-step progress */}
          {loading && (
            <div className="card">
              <div className="card-title" style={{ marginBottom:16 }}>Analysis Progress</div>
              <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                {ANALYSIS_STEPS.map(s => {
                  const isDone   = step > s.id;
                  const isActive = step === s.id;
                  return (
                    <div key={s.id} style={{
                      display:'flex', alignItems:'center', gap:10, padding:'9px 12px',
                      borderRadius:8, fontSize:13, transition:'all 0.4s',
                      background: isDone ? 'var(--green-dim)' : isActive ? 'var(--cyan-dim)' : 'transparent',
                      border: isDone ? '1px solid rgba(34,197,94,0.15)' : isActive ? '1px solid rgba(0,212,255,0.15)' : '1px solid transparent',
                      color: isDone ? 'var(--green-light)' : isActive ? 'var(--cyan)' : 'var(--text-3)',
                    }}>
                      <div style={{
                        width:20, height:20, borderRadius:'50%', flexShrink:0,
                        border:`1.5px solid ${isDone ? 'var(--green-light)' : isActive ? 'var(--cyan)' : 'var(--text-3)'}`,
                        display:'flex', alignItems:'center', justifyContent:'center',
                        fontSize:10, fontWeight:700,
                        background: isDone ? 'var(--green-dim)' : isActive ? 'var(--cyan-dim)' : 'transparent',
                      }}>
                        {isDone ? '✓' : isActive ? <div className="spinner" style={{width:10,height:10,borderWidth:1.5}}/> : s.id}
                      </div>
                      <span>{s.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {!result && !loading && (
            <div className="card" style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:280, gap:12, textAlign:'center' }}>
              <div style={{ fontSize:48 }}>🧠</div>
              <div style={{ fontWeight:600 }}>No Assessment Yet</div>
              <div style={{ fontSize:13, color:'var(--text-2)', maxWidth:260 }}>
                Fill in the subject profile and click Run AI Assessment to get a Gemini-powered risk analysis.
              </div>
            </div>
          )}

          {result && !loading && (
            <>
              <div className="card" style={{ display:'flex', gap:20, alignItems:'center' }}>
                <ThreatGauge value={result.riskScore} size={130} label="Risk Score" />
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:12, color:'var(--text-3)', marginBottom:6 }}>THREAT CATEGORY</div>
                  <div style={{ fontSize:15, fontWeight:600, marginBottom:10 }}>{result.threatCategory}</div>
                  <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:10 }}>
                    <span className={`badge badge-${result.riskLevel.toLowerCase()}`}>{result.riskLevel}</span>
                    <span className="badge badge-neutral">Confidence: {result.confidenceLevel}%</span>
                    <span className="badge badge-info">Recidivism: {result.recidivismProbability}%</span>
                  </div>
                  {/* Recidivism bar */}
                  <div style={{ fontSize:11, color:'var(--text-3)', marginBottom:4 }}>Recidivism Probability</div>
                  <div className="progress">
                    <div className="progress-fill" style={{
                      width:`${result.recidivismProbability}%`,
                      background: result.recidivismProbability > 70 ? 'var(--red)' : result.recidivismProbability > 40 ? 'var(--orange)' : 'var(--green)',
                    }}/>
                  </div>
                </div>
              </div>

              <AIInsightPanel
                title="Behaviour Assessment"
                riskScore={result.riskScore}
                riskLevel={result.riskLevel}
                summary={result.summary}
                factors={result.factors}
                recommendations={result.recommendations}
              />

              {result.behaviouralProfile && (
                <div className="card">
                  <div className="card-title" style={{ marginBottom:10 }}>Behavioural Profile</div>
                  <p style={{ fontSize:13, color:'var(--text-2)', lineHeight:1.8 }}>{result.behaviouralProfile}</p>
                </div>
              )}
            </>
          )}

          {/* History */}
          {history.length > 0 && (
            <div className="card">
              <div className="card-title" style={{ marginBottom:10 }}>Cached Assessments</div>
              <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
                {history.slice(0,6).map((h, i) => (
                  <div key={i}
                    style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 12px', background:'var(--surface-2)', borderRadius:7, cursor:'pointer', transition:'background 0.15s' }}
                    onClick={() => setResult(h.result)}
                  >
                    <div>
                      <div style={{ fontSize:13, fontWeight:500 }}>{h.form.name || 'Unknown Subject'}</div>
                      <div style={{ fontSize:10, color:'var(--text-3)' }}>{h.ts}</div>
                    </div>
                    <span className={`badge badge-${h.result.riskLevel.toLowerCase()}`}>{h.result.riskLevel}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
