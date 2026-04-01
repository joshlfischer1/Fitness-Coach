import React, { useState } from 'react';

export default function ApiKeySetup({ onSave }) {
  const [key, setKey] = useState('');
  const [error, setError] = useState('');
  const [testing, setTesting] = useState(false);

  const handleSave = async () => {
    if (!key.trim()) { setError('Please enter your API key.'); return; }
    if (!key.trim().startsWith('AI')) { setError('Gemini API keys typically start with "AI". Double-check your key.'); return; }
    setTesting(true);
    setError('');
    // Basic validation — just save and let the first real call surface errors
    setTimeout(() => {
      setTesting(false);
      onSave(key.trim());
    }, 600);
  };

  return (
    <div className="setup-screen">
      <div className="setup-card">
        <div className="setup-eyebrow">Welcome</div>
        <h2>Hybrid Coach</h2>
        <p className="text-sm text-muted mt-8" style={{ marginBottom: 28, lineHeight: 1.6 }}>
          To generate your program, you need a free Gemini API key from Google AI Studio.
          Your key is stored only on this device and never sent anywhere except directly to Google.
        </p>

        <div style={{ background: 'var(--paper-2)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px 18px', marginBottom: 24 }}>
          <div className="section-title" style={{ marginBottom: 8 }}>How to get your key</div>
          <ol style={{ paddingLeft: 18, fontSize: '0.85rem', color: 'var(--ink-2)', lineHeight: 2 }}>
            <li>Go to <strong>aistudio.google.com</strong></li>
            <li>Click <strong>Get API Key</strong> in the left sidebar</li>
            <li>Click <strong>Create API key</strong></li>
            <li>Copy the key and paste it below</li>
          </ol>
        </div>

        <div className="form-group" style={{ marginBottom: 16 }}>
          <label className="label">Gemini API Key</label>
          <input
            className="input"
            type="password"
            placeholder="AIza..."
            value={key}
            onChange={e => { setKey(e.target.value); setError(''); }}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
          />
          {error && <div style={{ color: 'var(--warn)', fontSize: '0.8rem', marginTop: 6 }}>{error}</div>}
        </div>

        <button className="btn btn-primary btn-lg w-full" onClick={handleSave} disabled={testing}>
          {testing ? 'Saving...' : 'Save & Continue →'}
        </button>

        <p className="text-xs text-muted mt-16" style={{ textAlign: 'center', lineHeight: 1.5 }}>
          The free tier gives you 1,500 requests/day — more than enough for personal use.
        </p>
      </div>
    </div>
  );
}
