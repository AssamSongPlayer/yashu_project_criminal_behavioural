'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  section?: string;
  badge?: number; // live alert badge
}

/* ─── SVG Icons ─── */
const Icon = ({ d, viewBox = '0 0 24 24' }: { d: React.ReactNode; viewBox?: string }) => (
  <svg className="sidebar-icon" viewBox={viewBox} fill="none" stroke="currentColor" strokeWidth="1.8">{d}</svg>
);

const icons = {
  home:    <Icon d={<><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/></>} />,
  dash:    <Icon d={<><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>} />,
  assess:  <Icon d={<><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></>} />,
  map:     <Icon d={<><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/></>} />,
  shield:  <Icon d={<><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></>} />,
  pattern: <Icon d={<><circle cx="6" cy="6" r="2"/><circle cx="18" cy="6" r="2"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="18" r="2"/><circle cx="12" cy="12" r="3"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="6" y1="8" x2="6" y2="16"/><line x1="18" y1="8" x2="18" y2="16"/><line x1="8" y1="18" x2="16" y2="18"/></>} />,
  reports: <Icon d={<><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="3" y1="20" x2="21" y2="20"/></>} />,
  settings:<Icon d={<><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></>} />,
};

const NAV: NavItem[] = [
  { href: '/',                    label: 'Home',                icon: icons.home,    section: 'Main' },
  { href: '/dashboard',           label: 'Dashboard',           icon: icons.dash,    badge: 3 },
  { href: '/assessment',          label: 'Behaviour Assessment',icon: icons.assess,  section: 'Analysis' },
  { href: '/mapping',             label: 'Crime Mapping',       icon: icons.map },
  { href: '/intrusion',           label: 'Intrusion Detection', icon: icons.shield,  badge: 7 },
  { href: '/pattern-recognition', label: 'Pattern Recognition', icon: icons.pattern },
  { href: '/reports',             label: 'Reports & Analytics', icon: icons.reports, section: 'Intelligence' },
  { href: '/settings',            label: 'Settings',            icon: icons.settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [alertCount, setAlertCount] = useState(10);

  /* Simulate live alert count ticking */
  useEffect(() => {
    const id = setInterval(() => {
      setAlertCount(n => n + (Math.random() > 0.7 ? 1 : 0));
    }, 8000);
    return () => clearInterval(id);
  }, []);

  let section = '';

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-badge">
          <span style={{ width:6, height:6, borderRadius:'50%', background:'var(--cyan)', display:'inline-block', animation:'pulse-glow 2s infinite' }} />
          AI Powered
        </div>
        <div className="sidebar-logo-title">CBAMI</div>
        <div className="sidebar-logo-sub">Criminal Behaviour Analysis System</div>
      </div>

      {/* Live alert count */}
      <div style={{
        margin: '0 12px',
        padding: '10px 14px',
        background: 'rgba(239,68,68,0.08)',
        border: '1px solid rgba(239,68,68,0.18)',
        borderRadius: 8,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        fontSize: 12,
      }}>
        <div className="status-dot dot-red" />
        <span style={{ color: 'var(--text-2)', flex: 1 }}>Active Alerts</span>
        <span style={{ fontWeight: 800, color: 'var(--red-light)', fontSize: 16 }}>{alertCount}</span>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        {NAV.map((item) => {
          const showSec = item.section && item.section !== section;
          if (item.section) section = item.section;
          const isActive = pathname === item.href;

          return (
            <div key={item.href}>
              {showSec && <div className="sidebar-section-label">{item.section}</div>}
              <Link href={item.href} className={`sidebar-link ${isActive ? 'active' : ''}`}>
                {item.icon}
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.badge && !isActive && (
                  <div className="sidebar-alert-badge">{item.badge}</div>
                )}
              </Link>
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-status">
          <div className="sidebar-status-dot" />
          <span>System Operational</span>
        </div>
        <div style={{ marginTop: 8 }}>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:10, color:'var(--text-muted)', marginBottom:5 }}>
            <span>API Status</span>
            <span style={{ color:'var(--green-light)' }}>● Connected</span>
          </div>
          <div className="progress" style={{ height:3 }}>
            <div className="progress-fill" style={{ width:'87%', background:'linear-gradient(90deg,var(--cyan),var(--green))', transition:'width 2s ease' }} />
          </div>
          <div style={{ fontSize:9, color:'var(--text-muted)', marginTop:4 }}>Gemini 2.5 Flash • v1.0.0</div>
        </div>
      </div>
    </aside>
  );
}
