import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CBAMI | Criminal Behaviour Assessment Mapping & Intrusion Identification',
  description: 'Advanced AI-powered criminal behaviour analysis using Gemini 2.5 Flash for pattern recognition, intrusion detection, and threat assessment.',
};

const features = [
  {
    icon: '🧠',
    title: 'AI Behaviour Assessment',
    desc: 'Deep psychological profiling using Gemini 2.5 Flash to evaluate risk scores, recidivism probability, and behavioural patterns.',
  },
  {
    icon: '🗺️',
    title: 'Crime Mapping',
    desc: 'Geo-spatial visualization of crime hotspots with real-time cluster analysis and temporal heatmaps.',
  },
  {
    icon: '🛡️',
    title: 'Intrusion Detection',
    desc: 'Network and physical intrusion analysis with MITRE ATT&CK technique classification and immediate response recommendations.',
  },
  {
    icon: '🔍',
    title: 'Pattern Recognition',
    desc: 'Multi-dimensional cluster analysis to identify hidden criminal patterns, trends, and behavioural anomalies.',
  },
  {
    icon: '📊',
    title: 'Intelligence Reports',
    desc: 'Comprehensive analytics dashboards with trend charts, risk distributions, and exportable intelligence briefs.',
  },
  {
    icon: '⚡',
    title: 'Real-Time Alerts',
    desc: 'Immediate notification system for critical threat detections with severity classification and escalation protocols.',
  },
];

const stats = [
  { value: '99.2%', label: 'Detection Accuracy' },
  { value: '2.5s',  label: 'Avg. Analysis Time' },
  { value: '50K+',  label: 'Cases Processed' },
  { value: '6',     label: 'AI Modules' },
];

export default function HomePage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-0)' }}>
      {/* Hero */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-grid" />

        <div className="hero-content">
          <div className="hero-tag">
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--cyan)', display: 'inline-block', animation: 'pulse-glow 2s infinite' }} />
            Powered by Gemini 2.5 Flash
          </div>

          <h1 className="hero-title">
            Criminal Behaviour<br />
            <span className="gradient-text">Assessment & Mapping</span><br />
            Intelligence System
          </h1>

          <p className="hero-desc">
            Next-generation AI platform for criminal behaviour profiling, intrusion identification,
            and pattern-based threat detection. Built for law enforcement and security professionals.
          </p>

          <div className="hero-actions">
            <Link href="/dashboard" className="btn btn-primary btn-lg">
              🚀 Open Dashboard
            </Link>
            <Link href="/assessment" className="btn btn-secondary btn-lg">
              🧠 Run Assessment
            </Link>
          </div>

          <div className="hero-stats">
            {stats.map((s) => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div className="hero-stat-value gradient-text">{s.value}</div>
                <div className="hero-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '80px 0', background: 'var(--bg-1)' }}>
        <div style={{ textAlign: 'center', marginBottom: 48, padding: '0 24px' }}>
          <div className="page-badge" style={{ display: 'inline-flex', marginBottom: 16 }}>System Modules</div>
          <h2 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.5px', marginBottom: 12 }}>
            AI-Powered Analysis Modules
          </h2>
          <p style={{ color: 'var(--text-2)', fontSize: 15, maxWidth: 540, margin: '0 auto' }}>
            Six specialized intelligence modules backed by Gemini 2.5 Flash for comprehensive criminal behaviour analysis.
          </p>
        </div>

        <div className="features-grid">
          {features.map((f) => (
            <div key={f.title} className="feature-card">
              <div className="feature-icon">{f.icon}</div>
              <div className="feature-title">{f.title}</div>
              <div className="feature-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section style={{
        padding: '60px 32px',
        textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(0,212,255,0.04), rgba(124,58,237,0.04))',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
      }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 12 }}>
          Ready to Analyse Threats?
        </h2>
        <p style={{ color: 'var(--text-2)', marginBottom: 28 }}>
          Enter your Gemini API key in Settings and start analysing immediately.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/settings" className="btn btn-secondary">⚙️ Configure API Key</Link>
          <Link href="/dashboard" className="btn btn-primary">View Dashboard →</Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '24px 32px', textAlign: 'center', color: 'var(--text-3)', fontSize: 12, borderTop: '1px solid var(--border)' }}>
        CBAMI System • Gemini 2.5 Flash • For Law Enforcement & Security Research Use Only
      </footer>
    </div>
  );
}
