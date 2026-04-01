import React, { useState, useCallback } from 'react';
import './index.css';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useGemini } from './hooks/useGemini';
import ApiKeySetup from './components/ApiKeySetup';
import IntakeForm from './components/IntakeForm';
import ProgramView from './components/ProgramView';
import PaceCalculator from './components/PaceCalculator';
import SessionLog from './components/SessionLog';

const NAV = [
  { id: 'program', label: 'My Program', icon: '📋' },
  { id: 'paces', label: 'Pace Calculator', icon: '⏱' },
  { id: 'log', label: 'Session Log', icon: '📓' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
];

export default function App() {
  const [apiKey, setApiKey] = useLocalStorage('hc_api_key', '');
  const [intake, setIntake] = useLocalStorage('hc_intake', null);
  const [weeks, setWeeks] = useLocalStorage('hc_weeks', []);
  const [paces, setPaces] = useLocalStorage('hc_paces', {});
  const [logs, setLogs] = useLocalStorage('hc_logs', []);
  const [nav, setNav] = useState('program');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { generate } = useGemini(apiKey);

  // ── GENERATE WEEK — must be above any early returns (Rules of Hooks) ──
  const handleGenerateWeek = useCallback(async (weekNum, prompt) => {
    setLoading(true);
    setError('');
    try {
      const result = await generate(prompt);
      setWeeks(prev => {
        const updated = [...prev];
        updated[weekNum - 1] = result;
        return updated;
      });
    } catch (e) {
      const msg = e?.message || String(e);
      setError(`Generation failed: ${msg}. Check your API key in Settings.`);
      console.error('Generation error:', e);
    } finally {
      setLoading(false);
    }
  }, [generate, setWeeks]);

  // ── SESSION LOG ──
  const addLog = (entry) => setLogs(prev => [entry, ...prev]);
  const deleteLog = (id) => setLogs(prev => prev.filter(l => l.id !== id));

  // ── API KEY GATE ──
  if (!apiKey) return <ApiKeySetup onSave={setApiKey} />;

  // ── INTAKE GATE ──
  if (!intake) {
    return (
      <div className="app-shell">
        <aside className="sidebar">
          <div className="sidebar-logo">
            <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 4 }}>Hybrid</div>
            <h1>Coach</h1>
          </div>
        </aside>
        <main className="main-content">
          <IntakeForm onComplete={data => { setIntake(data); setWeeks([]); }} />
        </main>
      </div>
    );
  }

  // ── RESET ──
  const handleReset = () => {
    if (window.confirm('This will clear your program and start over. Are you sure?')) {
      setIntake(null);
      setWeeks([]);
      setError('');
    }
  };

  return (
    <div className="app-shell">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 4 }}>Hybrid</div>
          <h1>Coach</h1>
          <span>{intake.mode} · {intake.duration}</span>
        </div>

        <nav>
          {NAV.map(item => (
            <button key={item.id} className={`nav-item ${nav === item.id ? 'active' : ''}`} onClick={() => setNav(item.id)}>
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div style={{ marginTop: 'auto', padding: '16px 24px', borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--ink-3)', marginBottom: 8, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Program
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--ink-2)', lineHeight: 1.7 }}>
            <div>{intake.split}</div>
            <div>{intake.daysPerWeek} days/wk · {intake.timePerDay}</div>
            {intake.raceDistance && intake.raceDistance !== 'None' && (
              <div style={{ color: 'var(--run)', fontWeight: 500 }}>🏁 {intake.raceDistance}</div>
            )}
          </div>
          <button className="btn btn-secondary mt-16" style={{ width: '100%', fontSize: '0.78rem', padding: '8px' }} onClick={handleReset}>
            ↺ New Program
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="main-content">
        {error && (
          <div style={{ background: 'var(--warn-light)', border: '1px solid var(--warn)', borderRadius: 10, padding: '12px 18px', marginBottom: 20, fontSize: '0.85rem', color: 'var(--warn)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>⚠️ {error}</span>
            <button onClick={() => setError('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--warn)', fontWeight: 700 }}>×</button>
          </div>
        )}

        {nav === 'program' && (
          <ProgramView
            program={{ weeks }}
            intake={intake}
            onGenerateWeek={handleGenerateWeek}
            loading={loading}
          />
        )}

        {nav === 'paces' && (
          <PaceCalculator
            intake={intake}
            paces={paces}
            onPacesChange={setPaces}
          />
        )}

        {nav === 'log' && (
          <SessionLog
            logs={logs}
            onAddLog={addLog}
            onDeleteLog={deleteLog}
            hasInjuries={!!intake.injuries}
          />
        )}

        {nav === 'settings' && (
          <div>
            <div className="page-title">Settings</div>
            <div className="page-subtitle">Manage your app preferences.</div>

            <div className="card mt-24 mb-24">
              <div className="card-header">
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>API Key</div>
              </div>
              <div className="card-body">
                <div className="form-group mb-16">
                  <label className="label">Gemini API Key</label>
                  <input className="input" type="password" value={apiKey} onChange={e => setApiKey(e.target.value)} />
                  <div className="text-xs text-muted mt-8">Stored only on this device. Never sent anywhere except directly to Google.</div>
                </div>
              </div>
            </div>

            <div className="card mb-24">
              <div className="card-header">
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>Current Program</div>
              </div>
              <div className="card-body">
                <div style={{ background: 'var(--paper-2)', borderRadius: 8, padding: '14px 16px', fontSize: '0.85rem', color: 'var(--ink-2)', lineHeight: 2, marginBottom: 16 }}>
                  <div><strong>Mode:</strong> {intake.mode}</div>
                  <div><strong>Duration:</strong> {intake.duration}</div>
                  <div><strong>Split:</strong> {intake.split}</div>
                  <div><strong>Days/week:</strong> {intake.daysPerWeek}</div>
                  <div><strong>Time budget:</strong> {intake.timePerDay}</div>
                  {intake.runnerStrengthToggle && <div><strong>Runner Strength:</strong> Enabled</div>}
                  {intake.injuries && <div><strong>Limitations:</strong> {intake.injuries}</div>}
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="btn btn-secondary" onClick={handleReset}>Start New Program</button>
                  <button className="btn btn-secondary" onClick={() => {
                    if (window.confirm('Clear all generated weeks? Your intake data will be kept.')) setWeeks([]);
                  }}>Clear Generated Weeks</button>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>Data</div>
              </div>
              <div className="card-body">
                <div className="text-sm text-muted mb-16">All data is stored locally on this device only.</div>
                <button className="btn btn-secondary" style={{ color: 'var(--warn)', borderColor: 'var(--warn)' }} onClick={() => {
                  if (window.confirm('Delete ALL app data including your program, logs, and API key? This cannot be undone.')) {
                    localStorage.clear();
                    window.location.reload();
                  }
                }}>
                  Delete All Data
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
