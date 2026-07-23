'use client';

import { useState } from 'react';

type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';

interface AlertBannerProps {
  severity: Severity;
  title: string;
  message?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
}

const icons: Record<Severity, string> = {
  critical: '🔴',
  high:     '🟠',
  medium:   '🟡',
  low:      '🟢',
  info:     '🔵',
};

export default function AlertBanner({ severity, title, message, dismissible = true, onDismiss }: AlertBannerProps) {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  function handleDismiss() {
    setVisible(false);
    onDismiss?.();
  }

  return (
    <div className={`alert-banner alert-${severity}`}>
      <span className="alert-banner-icon">{icons[severity]}</span>
      <div className="alert-banner-content">
        <div className="alert-banner-title">{title}</div>
        {message && <div className="alert-banner-msg">{message}</div>}
      </div>
      {dismissible && (
        <button className="alert-banner-close" onClick={handleDismiss} aria-label="Dismiss">
          ×
        </button>
      )}
    </div>
  );
}
