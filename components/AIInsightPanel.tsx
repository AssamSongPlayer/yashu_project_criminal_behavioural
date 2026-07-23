interface AIInsightPanelProps {
  title?: string;
  riskScore?: number;
  riskLevel?: string;
  summary?: string;
  factors?: string[];
  recommendations?: string[];
  patterns?: string[];
  anomalies?: string[];
  raw?: string;
}

function getRiskColor(level?: string) {
  switch (level?.toUpperCase()) {
    case 'CRITICAL': return 'var(--red-light)';
    case 'HIGH':     return '#fb923c';
    case 'MEDIUM':   return '#facc15';
    case 'LOW':      return 'var(--green-light)';
    default:         return 'var(--cyan)';
  }
}

export default function AIInsightPanel({
  title = 'AI Analysis Result',
  riskScore,
  riskLevel,
  summary,
  factors,
  recommendations,
  patterns,
  anomalies,
  raw,
}: AIInsightPanelProps) {
  const color = getRiskColor(riskLevel);

  return (
    <div className="ai-panel animate-slide-up">
      <div className="ai-panel-header">
        <div className="ai-panel-badge">
          <span>✦</span>
          Gemini 2.5 Flash
        </div>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>{title}</span>
      </div>

      {riskScore !== undefined && (
        <div className="ai-risk-score">
          <div>
            <div className="ai-risk-number" style={{ color }}>{riskScore}</div>
            <div className="ai-risk-label">Risk Score / 100</div>
          </div>
          <div style={{ flex: 1 }}>
            {riskLevel && (
              <div style={{ marginBottom: 8 }}>
                <span className={`badge badge-${riskLevel.toLowerCase()}`}>{riskLevel}</span>
              </div>
            )}
            <div className="progress">
              <div
                className="progress-fill"
                style={{
                  width: `${riskScore}%`,
                  background: `linear-gradient(90deg, var(--green), ${color})`,
                }}
              />
            </div>
          </div>
        </div>
      )}

      {summary && (
        <div className="ai-panel-section">
          <div className="ai-panel-section-title">Summary</div>
          <div className="ai-panel-section-content">{summary}</div>
        </div>
      )}

      {factors && factors.length > 0 && (
        <div className="ai-panel-section">
          <div className="ai-panel-section-title">Key Factors</div>
          <ul style={{ paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 5 }}>
            {factors.map((f, i) => (
              <li key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 13, color: 'var(--text-2)' }}>
                <span style={{ color: 'var(--cyan)', marginTop: 2 }}>▸</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {patterns && patterns.length > 0 && (
        <div className="ai-panel-section">
          <div className="ai-panel-section-title">Identified Patterns</div>
          <ul style={{ paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 5 }}>
            {patterns.map((p, i) => (
              <li key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 13, color: 'var(--text-2)' }}>
                <span style={{ color: 'var(--purple-light)', marginTop: 2 }}>◆</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {anomalies && anomalies.length > 0 && (
        <div className="ai-panel-section">
          <div className="ai-panel-section-title">Anomalies Detected</div>
          <ul style={{ paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 5 }}>
            {anomalies.map((a, i) => (
              <li key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 13, color: 'var(--text-2)' }}>
                <span style={{ color: 'var(--red-light)', marginTop: 2 }}>!</span>
                <span>{a}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {recommendations && recommendations.length > 0 && (
        <div className="ai-panel-section">
          <div className="ai-panel-section-title">Recommendations</div>
          <ul style={{ paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 5 }}>
            {recommendations.map((r, i) => (
              <li key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 13, color: 'var(--text-2)' }}>
                <span style={{ color: 'var(--green-light)', marginTop: 2 }}>✓</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {raw && !summary && !factors && (
        <div className="ai-panel-section-content" style={{ whiteSpace: 'pre-wrap' }}>{raw}</div>
      )}
    </div>
  );
}
