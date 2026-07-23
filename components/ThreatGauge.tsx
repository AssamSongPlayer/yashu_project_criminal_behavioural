'use client';

interface ThreatGaugeProps {
  value: number; // 0–100
  size?: number;
  label?: string;
}

function getColor(v: number) {
  if (v >= 80) return '#ef4444';
  if (v >= 60) return '#f97316';
  if (v >= 40) return '#eab308';
  return '#22c55e';
}

function getLabel(v: number) {
  if (v >= 80) return 'CRITICAL';
  if (v >= 60) return 'HIGH';
  if (v >= 40) return 'MEDIUM';
  return 'LOW';
}

export default function ThreatGauge({ value, size = 140, label }: ThreatGaugeProps) {
  const r = 52;
  const cx = 70;
  const cy = 70;
  const circumference = 2 * Math.PI * r;
  // Use only top 270° (start at 225°, sweep 270°)
  const startAngle = 225;
  const sweepDeg = 270;
  const progress = Math.min(100, Math.max(0, value));
  const dashOffset = circumference * (1 - (progress / 100) * (sweepDeg / 360));
  const color = getColor(progress);
  const levelLabel = getLabel(progress);

  // Convert angle for SVG: 0° = 3 o'clock; we need to offset
  const startRad = ((startAngle - 90) * Math.PI) / 180;
  const totalRad = (sweepDeg * Math.PI) / 180;

  // Track arc background
  const trackDash = circumference * (sweepDeg / 360);
  const trackOffset = circumference * (1 - sweepDeg / 360);

  return (
    <div className="threat-gauge-wrap" style={{ width: size }}>
      {label && <div className="threat-gauge-label">{label}</div>}
      <svg width={size} height={size} viewBox="0 0 140 140">
        {/* Background track */}
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke="var(--surface-3)"
          strokeWidth="10"
          strokeDasharray={`${trackDash} ${circumference - trackDash}`}
          strokeDashoffset={-trackOffset * 0.5}
          strokeLinecap="round"
          transform={`rotate(${startAngle - 90} ${cx} ${cy})`}
        />
        {/* Value arc */}
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeDasharray={`${circumference * (progress / 100) * (sweepDeg / 360)} ${circumference}`}
          strokeDashoffset={-circumference * 0}
          strokeLinecap="round"
          transform={`rotate(${startAngle - 90} ${cx} ${cy})`}
          style={{
            filter: `drop-shadow(0 0 8px ${color})`,
            transition: 'stroke-dasharray 1s ease, stroke 0.3s ease',
          }}
        />
        {/* Center value */}
        <text x={cx} y={cy - 6} textAnchor="middle" fill={color} fontSize="28" fontWeight="700" fontFamily="Space Grotesk, sans-serif">
          {progress}
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" fill="var(--text-3)" fontSize="10" fontFamily="Space Grotesk, sans-serif" letterSpacing="1">
          {levelLabel}
        </text>
      </svg>
    </div>
  );
}
