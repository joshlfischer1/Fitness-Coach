import React, { useState } from 'react';

const SESSION_TYPES = ['Easy Run', 'Tempo Run', 'Interval Run', 'Long Run', 'Upper Strength', 'Lower Strength', 'Runner Strength A', 'Runner Strength B', 'Combined', 'Rest/Recovery'];
const SYMPTOM_OPTIONS = ['N/A', 'Improved', 'Same', 'Worse'];

function FatiguePicker({ value, onChange }) {
  return (
    <div>
      <div className="fatigue-row">
        {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
          <div
            key={n}
            className={`fatigue-pip ${n <= value ? `filled f${n}` : ''}`}
            onClick={() => onChange(n)}
            title={`Fatigue ${n}`}
          />
        ))}
        <span style={{ fontSize: '0.8rem', color: 'var(--ink-3)', marginLeft: 8 }}>{value || 0}/10</span>
      </div>
    </div>
  );
}

function LogEntry({ entry, onDelete }) {
  const typeColors = {
    'Easy Run': 'run', 'Tempo Run': 'run', 'Interval Run': 'run', 'Long Run': 'run',
    'Upper Strength': 'strength', 'Lower Strength': 'strength',
    'Runner Strength A': 'strength', 'Runner Strength B': 'strength',
    'Combined': 'combined', 'Rest/Recovery': 'rest',
  };
  const color = typeColors[entry.sessionType] || 'rest';

  return (
    <div className="log-entry">
      <div className="log-date">
        {new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
      </div>
      <div className="log-details">
        <div className="log-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {entry.sessionType}
          <span className={`badge badge-${color}`} style={{ fontSize: '0.65rem' }}>{color.toUpperCase()}</span>
        </div>
        <div className="log-meta">
          {entry.miles && <span>🏃 {entry.miles} mi</span>}
          {entry.fatigue && <span>⚡ Fatigue {entry.fatigue}/10</span>}
          {entry.symptomStatus && entry.symptomStatus !== 'N/A' && (
            <span style={{ color: entry.symptomStatus === 'Improved' ? 'var(--combined)' : entry.symptomStatus === 'Worse' ? 'var(--warn)' : 'var(--ink-3)' }}>
              🩹 Symptoms: {entry.symptomStatus}
            </span>
          )}
          {entry.prs && <span>🏆 PR: {entry.prs}</span>}
        </div>
        {entry.notes && <div style={{ fontSize: '0.8rem', color: 'var(--ink-2)', marginTop: 6, fontStyle: 'italic' }}>{entry.notes}</div>}
      </div>
      <button onClick={() => onDelete(entry.id)} style={{ background: 'none', border: 'none', color: 'var(--ink-4)', cursor: 'pointer', fontSize: '1rem', padding: '4px 8px' }} title="Delete">×</button>
    </div>
  );
}

export default function SessionLog({ logs, onAddLog, onDeleteLog, hasInjuries }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    sessionType: '',
    miles: '',
    fatigue: 0,
    prs: '',
    symptomStatus: 'N/A',
    notes: '',
    week: '',
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleAdd = () => {
    if (!form.date || !form.sessionType) return;
    onAddLog({ ...form, id: Date.now() });
    setForm({ date: new Date().toISOString().split('T')[0], sessionType: '', miles: '', fatigue: 0, prs: '', symptomStatus: 'N/A', notes: '', week: '' });
    setShowForm(false);
  };

  // Fatigue warnings
  const recentHighFatigue = logs.slice(0, 3).filter(l => l.fatigue >= 8).length;
  const showFatigueWarning = recentHighFatigue >= 3;

  return (
    <div>
      <div className="week-header">
        <div>
          <div className="page-title">Session Log</div>
          <div className="page-subtitle">Track every session. Adaptations trigger automatically.</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(s => !s)}>
          {showForm ? '✕ Cancel' : '+ Log Session'}
        </button>
      </div>

      {showFatigueWarning && (
        <div style={{ background: 'var(--warn-light)', border: '1px solid var(--warn)', borderRadius: 10, padding: '14px 18px', marginBottom: 20, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <span style={{ fontSize: '1.2rem' }}>⚠️</span>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--warn)', fontSize: '0.9rem' }}>High fatigue detected</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--ink-2)', marginTop: 3 }}>
              3 consecutive sessions with fatigue ≥ 8. Your next week's volume should be reduced by 20%.
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="card mb-24">
          <div className="card-header">
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>Log a Session</div>
          </div>
          <div className="card-body">
            <div className="form-row mb-16">
              <div className="form-group">
                <label className="label">Date</label>
                <input className="input" type="date" value={form.date} onChange={e => set('date', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="label">Program Week</label>
                <input className="input" type="number" placeholder="e.g. 1" value={form.week} onChange={e => set('week', e.target.value)} />
              </div>
            </div>

            <div className="form-group mb-16">
              <label className="label">Session Type</label>
              <div className="pill-group">
                {SESSION_TYPES.map(t => (
                  <button key={t} className={`pill ${form.sessionType === t ? 'selected' : ''}`} onClick={() => set('sessionType', t)} type="button" style={{ fontSize: '0.8rem' }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-row mb-16">
              <div className="form-group">
                <label className="label">Miles Run (if applicable)</label>
                <input className="input" type="number" step="0.1" placeholder="0.0" value={form.miles} onChange={e => set('miles', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="label">Strength PRs (if applicable)</label>
                <input className="input" placeholder="e.g. Hip thrust 185 lb × 8" value={form.prs} onChange={e => set('prs', e.target.value)} />
              </div>
            </div>

            <div className="form-group mb-16">
              <label className="label">Fatigue Level (1 = fresh, 10 = destroyed)</label>
              <FatiguePicker value={form.fatigue} onChange={v => set('fatigue', v)} />
            </div>

            {hasInjuries && (
              <div className="form-group mb-16">
                <label className="label">Symptom Status</label>
                <div className="pill-group">
                  {SYMPTOM_OPTIONS.map(o => (
                    <button key={o} className={`pill ${form.symptomStatus === o ? 'selected' : ''}`} onClick={() => set('symptomStatus', o)} type="button">
                      {o}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="form-group mb-24">
              <label className="label">Notes</label>
              <textarea className="textarea" placeholder="How did it feel? Any movement issues? Anything to flag?" value={form.notes} onChange={e => set('notes', e.target.value)} style={{ minHeight: 64 }} />
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAdd} disabled={!form.date || !form.sessionType}>Save Session</button>
            </div>
          </div>
        </div>
      )}

      {logs.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">📓</div>
            <div className="empty-title">No sessions logged yet</div>
            <div className="empty-desc">Start logging your sessions to track fatigue, PRs, and injury symptoms. Adaptation rules trigger automatically.</div>
          </div>
        </div>
      ) : (
        <div>
          <div className="text-xs text-muted mb-16" style={{ letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 600 }}>
            {logs.length} session{logs.length !== 1 ? 's' : ''} logged
          </div>
          {logs.map(log => (
            <LogEntry key={log.id} entry={log} onDelete={onDeleteLog} />
          ))}
        </div>
      )}
    </div>
  );
}
