'use client';

import { useEffect, useState, useRef } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  trend?: { value: number; label: string };
  color?: 'cyan' | 'red' | 'green' | 'orange' | 'purple';
  subtitle?: string;
  live?: boolean; // show pulsing live dot
  updated?: number; // timestamp — triggers flash when changed
}

const colorMap = {
  cyan:   { bg: 'var(--cyan-dim)',   icon: 'var(--cyan)',        glow: 'rgba(0,212,255,0.15)' },
  red:    { bg: 'var(--red-dim)',    icon: 'var(--red-light)',   glow: 'rgba(239,68,68,0.15)' },
  green:  { bg: 'var(--green-dim)', icon: 'var(--green-light)', glow: 'rgba(34,197,94,0.15)' },
  orange: { bg: 'var(--orange-dim)',icon: 'var(--orange)',       glow: 'rgba(249,115,22,0.15)' },
  purple: { bg: 'var(--purple-dim)',icon: 'var(--purple-light)', glow: 'rgba(124,58,237,0.15)' },
};

function useCountUp(target: number, duration = 1200): number {
  const [count, setCount] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const startValRef = useRef(0);

  useEffect(() => {
    const startVal = startValRef.current;
    startRef.current = null;

    const animate = (ts: number) => {
      if (!startRef.current) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(startVal + (target - startVal) * eased));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        startValRef.current = target;
      }
    };

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, duration]);

  return count;
}

function AnimatedValue({ raw, color, updated }: { raw: string | number; color: string; updated?: number }) {
  const [flash, setFlash] = useState(false);
  const prevUpdated = useRef(updated);

  // Extract numeric portion for count-up
  const str = String(raw);
  const numMatch = str.match(/^([^0-9]*)(\d[\d,.]*)(.*)$/);
  const prefix  = numMatch?.[1] ?? '';
  const numStr  = (numMatch?.[2] ?? '').replace(/,/g, '');
  const suffix  = numMatch?.[3] ?? '';
  const numVal  = parseFloat(numStr);
  const isNum   = !isNaN(numVal) && numStr !== '';

  const animated = useCountUp(isNum ? numVal : 0);

  useEffect(() => {
    if (updated && updated !== prevUpdated.current) {
      prevUpdated.current = updated;
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 600);
      return () => clearTimeout(t);
    }
  }, [updated]);

  const displayVal = isNum
    ? prefix + (numVal >= 1000 ? animated.toLocaleString() : animated) + suffix
    : str;

  return (
    <div
      className="stat-card-value"
      style={{
        transition: 'color 0.4s',
        color: flash ? color : 'var(--text-1)',
      }}
    >
      {displayVal}
    </div>
  );
}

export default function StatCard({ title, value, icon, trend, color = 'cyan', subtitle, live, updated }: StatCardProps) {
  const c = colorMap[color];
  const trendUp   = trend && trend.value > 0;
  const trendDown = trend && trend.value < 0;

  return (
    <div className="stat-card" style={{ overflow: 'hidden' }}>
      {/* Background glow */}
      <div
        className="stat-card-glow"
        style={{ background: `radial-gradient(ellipse at 0% 0%, ${c.glow}, transparent 65%)` }}
      />

      {/* Top row: icon + live badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div
          className="stat-card-icon"
          style={{ background: c.bg, color: c.icon, fontSize: 18, margin: 0 }}
        >
          {icon}
        </div>
        {live && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, fontWeight: 700, color: 'var(--green-light)', letterSpacing: 0.5 }}>
            <div className="status-dot dot-green" style={{ width: 6, height: 6 }} />
            LIVE
          </div>
        )}
      </div>

      <AnimatedValue raw={value} color={c.icon} updated={updated} />
      <div className="stat-card-label">{title}</div>

      {subtitle && <div className="text-xs text-muted mt-4">{subtitle}</div>}

      {trend && (
        <div className={`stat-card-trend ${trendUp ? 'up' : trendDown ? 'down' : 'neutral'}`} style={{ marginTop: 10 }}>
          <span>{trendUp ? '▲' : trendDown ? '▼' : '→'}</span>
          <span>{Math.abs(trend.value)}% {trend.label}</span>
        </div>
      )}

      {/* Animated bottom border */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, transparent, ${c.icon}, transparent)`,
        opacity: 0.3,
      }} />
    </div>
  );
}
