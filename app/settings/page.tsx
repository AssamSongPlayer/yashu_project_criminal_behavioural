'use client';

import { useState, useEffect } from 'react';
import AlertBanner from '@/components/AlertBanner';
import { cacheClear, getCacheKeys, getCacheSizeKB } from '@/lib/cache';
import useLocalStorage from '@/hooks/useLocalStorage';

interface Settings {
  apiKey: string;
  model: string;
  riskThreshold: number;
  autoAnalyse: boolean;
  alertsEnabled: boolean;
  criticalAlerts: boolean;
  highAlerts: boolean;
  dataRetentionDays: number;
  language: string;
  timezone: string;
}

const DEFAULT_SETTINGS: Settings = {
  apiKey: '',
  model: 'gemini-2.5-flash',
  riskThreshold: 60,
  autoAnalyse: true,
  alertsEnabled: true,
  criticalAlerts: true,
  highAlerts: true,
  dataRetentionDays: 30,
  language: 'en',
  timezone: 'UTC',
};

export default function SettingsPage() {
  const { value: settings, setValue: setSettings } = useLocalStorage<Settings>('settings', DEFAULT_SETTINGS);
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const [cacheKeys, setCacheKeys] = useState<string[]>([]);
  const [cacheSizeKB, setCacheSizeKB] = useState(0);
  const [cacheCleared, setCacheCleared] = useState(false);

  useEffect(() => {
    setCacheKeys(getCacheKeys());
    setCacheSizeKB(getCacheSizeKB());
  }, []);

  function handleSave() {
    // settings are auto-saved via useLocalStorage, just show feedback
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function handleClearCache() {
    cacheClear();
    // Also clear assessment history
    localStorage.removeItem('cbami_assessments');
    setCacheKeys([]);
    setCacheSizeKB(0);
    setCacheCleared(true);
    setTimeout(() => setCacheCleared(false), 3000);
  }

  function updateField<K extends keyof Settings>(key: K, value: Settings[K]) {
    setSettings(prev => ({ ...prev, [key]: value }));
  }

  const maskedKey = settings.apiKey
    ? settings.apiKey.slice(0, 6) + '••••••••••••••••' + settings.apiKey.slice(-4)
    : '';

  return (
    <div>
      <div className="page-header">
        <div className="page-header-top">
          <div>
            <h1 className="page-title">Settings</h1>
            <p className="page-subtitle">Configure API keys, analysis parameters, and system preferences</p>
          </div>
          <button className="btn btn-primary" onClick={handleSave}>
            {saved ? '✅ Saved!' : '💾 Save Settings'}
          </button>
        </div>
      </div>

      {saved && <AlertBanner severity="low" title="Settings saved" message="Your configuration has been saved to localStorage." dismissible />}
      {cacheCleared && <AlertBanner severity="info" title="Cache cleared" message="All cached analysis results have been removed." dismissible />}

      <div className="grid-2">
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* API Configuration */}
          <div className="card">
            <div className="settings-section-title">🔑 API Configuration</div>

            <div className="settings-row">
              <div className="settings-row-info">
                <div className="settings-row-title">Gemini API Key</div>
                <div className="settings-row-desc">Your Google AI Studio API key for Gemini 2.5 Flash</div>
              </div>
            </div>
            <div className="form-group" style={{ marginTop: 10 }}>
              <div style={{ position: 'relative' }}>
                <input
                  className="form-input mono"
                  type={showKey ? 'text' : 'password'}
                  value={settings.apiKey}
                  onChange={e => updateField('apiKey', e.target.value)}
                  placeholder="AIza••••••••••••••••••••••••••••••••••••••"
                />
                <button
                  onClick={() => setShowKey(v => !v)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', fontSize: 14 }}
                >
                  {showKey ? '🙈' : '👁️'}
                </button>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 6 }}>
                Get your free API key at{' '}
                <a href="https://aistudio.google.com" target="_blank" rel="noopener noreferrer"
                  style={{ color: 'var(--cyan)', textDecoration: 'none' }}>
                  aistudio.google.com
                </a>
              </div>
            </div>

            <div className="settings-row" style={{ marginTop: 8 }}>
              <div className="settings-row-info">
                <div className="settings-row-title">AI Model</div>
                <div className="settings-row-desc">Gemini model used for all analyses</div>
              </div>
              <select className="form-input form-select" style={{ width: 180 }}
                value={settings.model} onChange={e => updateField('model', e.target.value)}>
                <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
              </select>
            </div>

            {/* Connection Test */}
            <div style={{ marginTop: 12, padding: '10px 14px', background: 'var(--surface-2)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className={`status-dot ${settings.apiKey ? 'dot-green' : 'dot-gray'}`} />
              <span style={{ fontSize: 12, color: settings.apiKey ? 'var(--green-light)' : 'var(--text-3)' }}>
                {settings.apiKey ? 'API key configured — ready for analysis' : 'No API key configured'}
              </span>
            </div>
          </div>

          {/* Analysis Parameters */}
          <div className="card">
            <div className="settings-section-title">⚙️ Analysis Parameters</div>

            <div className="settings-row">
              <div className="settings-row-info">
                <div className="settings-row-title">Risk Alert Threshold</div>
                <div className="settings-row-desc">Alert triggers when risk score exceeds this value</div>
              </div>
              <span style={{ fontSize: 16, fontWeight: 700, color: settings.riskThreshold >= 80 ? 'var(--red-light)' : settings.riskThreshold >= 60 ? 'var(--orange)' : 'var(--green-light)', minWidth: 36, textAlign: 'right' }}>
                {settings.riskThreshold}
              </span>
            </div>
            <div style={{ padding: '8px 0 16px' }}>
              <input type="range" className="form-range" min={10} max={100} step={5}
                value={settings.riskThreshold}
                onChange={e => updateField('riskThreshold', parseInt(e.target.value))} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-3)', marginTop: 4 }}>
                <span>Low (10)</span>
                <span>Medium (50)</span>
                <span>High (80)</span>
                <span>Max (100)</span>
              </div>
            </div>

            <div className="settings-row">
              <div className="settings-row-info">
                <div className="settings-row-title">Auto-Analyse</div>
                <div className="settings-row-desc">Automatically analyse new log entries</div>
              </div>
              <label className="form-toggle">
                <input type="checkbox" checked={settings.autoAnalyse}
                  onChange={e => updateField('autoAnalyse', e.target.checked)} />
                <div className="form-toggle-slider" />
              </label>
            </div>

            <div className="settings-row">
              <div className="settings-row-info">
                <div className="settings-row-title">Data Retention</div>
                <div className="settings-row-desc">Days to retain analysis results in cache</div>
              </div>
              <select className="form-input form-select" style={{ width: 100 }}
                value={settings.dataRetentionDays}
                onChange={e => updateField('dataRetentionDays', parseInt(e.target.value))}>
                {[7, 14, 30, 60, 90].map(d => <option key={d} value={d}>{d}d</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Notifications */}
          <div className="card">
            <div className="settings-section-title">🔔 Alert Configuration</div>

            {[
              { key: 'alertsEnabled' as const, title: 'Enable Alerts', desc: 'Show alert banners for detected threats' },
              { key: 'criticalAlerts' as const, title: 'Critical Alert Notifications', desc: 'Notify on CRITICAL severity threats' },
              { key: 'highAlerts' as const, title: 'High Alert Notifications', desc: 'Notify on HIGH severity threats' },
            ].map(item => (
              <div key={item.key} className="settings-row">
                <div className="settings-row-info">
                  <div className="settings-row-title">{item.title}</div>
                  <div className="settings-row-desc">{item.desc}</div>
                </div>
                <label className="form-toggle">
                  <input type="checkbox" checked={settings[item.key] as boolean}
                    onChange={e => updateField(item.key, e.target.checked)} />
                  <div className="form-toggle-slider" />
                </label>
              </div>
            ))}
          </div>

          {/* Regional */}
          <div className="card">
            <div className="settings-section-title">🌐 Regional Settings</div>

            <div className="settings-row">
              <div className="settings-row-info">
                <div className="settings-row-title">Language</div>
              </div>
              <select className="form-input form-select" style={{ width: 140 }}
                value={settings.language} onChange={e => updateField('language', e.target.value)}>
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
              </select>
            </div>

            <div className="settings-row">
              <div className="settings-row-info">
                <div className="settings-row-title">Timezone</div>
              </div>
              <select className="form-input form-select" style={{ width: 140 }}
                value={settings.timezone} onChange={e => updateField('timezone', e.target.value)}>
                {['UTC', 'UTC+5:30', 'UTC-5', 'UTC-8', 'UTC+1', 'UTC+8'].map(tz => (
                  <option key={tz}>{tz}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Cache Management */}
          <div className="card">
            <div className="settings-section-title">🗄️ Cache Management</div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
              <div style={{ padding: '12px', background: 'var(--surface-2)', borderRadius: 8, textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--cyan)' }}>{cacheKeys.length}</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>Cached Results</div>
              </div>
              <div style={{ padding: '12px', background: 'var(--surface-2)', borderRadius: 8, textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--purple-light)' }}>{cacheSizeKB} KB</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>Storage Used</div>
              </div>
            </div>

            {cacheKeys.length > 0 && (
              <div style={{ marginBottom: 12, maxHeight: 100, overflowY: 'auto', padding: '8px', background: 'var(--surface-2)', borderRadius: 6 }}>
                {cacheKeys.map(k => (
                  <div key={k} style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-3)', padding: '2px 0' }}>
                    {k}
                  </div>
                ))}
              </div>
            )}

            <button className="btn btn-danger w-full" onClick={handleClearCache}>
              🗑️ Clear All Cache
            </button>
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 6, textAlign: 'center' }}>
              Clears all cached AI analyses from localStorage
            </div>
          </div>

          {/* About */}
          <div className="card" style={{ background: 'linear-gradient(135deg, var(--cyan-dim), var(--purple-dim))', border: '1px solid rgba(0,212,255,0.15)' }}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10, color: 'var(--text-1)' }}>CBAMI System</div>
            <div style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.8 }}>
              <div>Version: <strong style={{ color: 'var(--cyan)' }}>1.0.0</strong></div>
              <div>AI Engine: <strong style={{ color: 'var(--cyan)' }}>Gemini 2.5 Flash</strong></div>
              <div>Built with: <strong>Next.js 15 + TypeScript</strong></div>
              <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text-3)' }}>
                For law enforcement and security research use only. All analysis is AI-assisted and should be verified by qualified professionals.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
