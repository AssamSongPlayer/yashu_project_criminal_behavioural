interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullPanel?: boolean;
}

export default function LoadingSpinner({ size = 'md', text, fullPanel = false }: LoadingSpinnerProps) {
  const sizeClass = size === 'sm' ? 'spinner-sm' : size === 'lg' ? 'spinner-lg' : '';

  if (fullPanel) {
    return (
      <div className="spinner-wrap" style={{ minHeight: 200 }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* Outer ring */}
          <div
            style={{
              position: 'absolute',
              width: 60,
              height: 60,
              borderRadius: '50%',
              border: '1px solid rgba(0,212,255,0.1)',
              animation: 'rotate 3s linear infinite reverse',
            }}
          />
          <div className={`spinner ${sizeClass}`} />
        </div>
        {text && <div className="spinner-text">{text}</div>}
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Processing with Gemini 2.5 Flash...</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <div className={`spinner ${sizeClass}`} />
      {text && <span style={{ fontSize: 13, color: 'var(--text-3)' }}>{text}</span>}
    </div>
  );
}
