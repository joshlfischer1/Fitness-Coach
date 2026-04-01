import React, { useState, useEffect } from 'react';

function parsePace(str) {
  if (!str) return null;
  const match = str.match(/^(\d+):(\d{2})$/);
  if (!match) return null;
  return parseInt(match[1]) * 60 + parseInt(match[2]);
}

function formatPace(seconds) {
  if (!seconds || seconds <= 0) return '--:--';
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function addSeconds(paceStr, secs) {
  const base = parsePace(paceStr);
  if (!base) return '--:--';
  return formatPace(base + secs);
}

// Very rough VDOT-based threshold pace from race time + distance
function estimateThresholdFromRace(timeStr, distance) {
  if (!timeStr || !distance) return null;
  const match = timeStr.match(/^(\d+):(\d{2})$/);
  if (!match) return null;
  const totalSec = parseInt(match[1]) * 60 + parseInt(match[2]);
  const distanceMiles = { '5K': 3.107, '10K': 6.214, 'Half Marathon': 13.11, 'Marathon': 26.22 };
  const miles = distanceMiles[distance];
  if (!miles) return null;
  const paceSec = totalSec / miles;
  // Threshold ≈ race pace + adjustment (rough: 5K pace + 30s, 10K pace + 15s, HM pace + 5s, marathon pace - 10s)
  const adj = { '5K': 30, '10K': 15, 'Half Marathon': 5, 'Marathon': -10 };
  return formatPace(paceSec + (adj[distance] || 20));
}

export default function PaceCalculator({ intake, paces, onPacesChange }) {
  const [localPaces, setLocalPaces] = useState({
    easy: paces?.easy || intake?.easyPace || '',
    tempo: paces?.tempo || intake?.tempoPace || '',
    interval: paces?.interval || '',
    longRun: paces?.longRun || '',
    raceGoal: paces?.raceGoal || '',
    raceTime: paces?.raceTime || intake?.recentRaceTime || '',
    raceDistance: paces?.raceDistance || intake?.recentRaceDistance || '',
  });

  const set = (k, v) => setLocalPaces(p => ({ ...p, [k]: v }));

  useEffect(() => {
    onPacesChange(localPaces);
  }, [localPaces]);

  const threshold = localPaces.tempo || estimateThresholdFromRace(localPaces.raceTime, localPaces.raceDistance);

  const derived = {
    easy: localPaces.easy || (threshold ? addSeconds(threshold, 105) : '--:--'),
    longRun: localPaces.longRun || (threshold ? addSeconds(threshold, 90) : '--:--'),
    tempo: localPaces.tempo || threshold || '--:--',
    marathon: threshold ? addSeconds(threshold, -10) : '--:--',
    interval: localPaces.interval || (threshold ? addSeconds(threshold, -30) : '--:--'),
  };

  return (
    <div>
      <div className="mb-24">
        <div className="page-title">Pace Calculator</div>
        <div className="page-subtitle">Enter a race result or your known paces. All zones update automatically.</div>
      </div>

      <div className="card mb-24">
        <div className="card-header">
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>Recent Race or Time Trial</div>
        </div>
        <div className="card-body">
          <div className="form-row">
            <div className="form-group">
              <label className="label">Race Time (mm:ss or h:mm:ss)</label>
              <input className="input" placeholder="e.g. 22:30" value={localPaces.raceTime} onChange={e => set('raceTime', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="label">Race Distance</label>
              <select className="select" value={localPaces.raceDistance} onChange={e => set('raceDistance', e.target.value)}>
                <option value="">Select distance</option>
                <option>5K</option><option>10K</option><option>Half Marathon</option><option>Marathon</option>
              </select>
            </div>
          </div>
          {threshold && (
            <div style={{ marginTop: 12, padding: '10px 14px', background: 'var(--accent-light)', borderRadius: 8, fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 500 }}>
              Estimated threshold pace: <strong>{threshold} /mile</strong>
            </div>
          )}
        </div>
      </div>

      <div className="card mb-24">
        <div className="card-header">
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>Derived Pace Zones</div>
          <div className="text-xs text-muted">Based on race result or manual input below</div>
        </div>
        <div className="card-body">
          <div className="pace-grid">
            <div className="pace-cell" style={{ borderTop: '3px solid var(--run)' }}>
              <div className="pace-cell-label">Easy</div>
              <div className="pace-cell-value">{derived.easy}</div>
              <div className="pace-cell-sub">/mile · conversational</div>
            </div>
            <div className="pace-cell" style={{ borderTop: '3px solid var(--combined)' }}>
              <div className="pace-cell-label">Long Run</div>
              <div className="pace-cell-value">{derived.longRun}</div>
              <div className="pace-cell-sub">/mile · aerobic base</div>
            </div>
            <div className="pace-cell" style={{ borderTop: '3px solid var(--amber)' }}>
              <div className="pace-cell-label">Tempo</div>
              <div className="pace-cell-value">{derived.tempo}</div>
              <div className="pace-cell-sub">/mile · comfortably hard</div>
            </div>
            <div className="pace-cell" style={{ borderTop: '3px solid var(--strength)' }}>
              <div className="pace-cell-label">Interval</div>
              <div className="pace-cell-value">{derived.interval}</div>
              <div className="pace-cell-sub">/mile · 5K effort</div>
            </div>
            <div className="pace-cell" style={{ borderTop: '3px solid var(--accent)' }}>
              <div className="pace-cell-label">Marathon</div>
              <div className="pace-cell-value">{derived.marathon}</div>
              <div className="pace-cell-sub">/mile · race pace</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>Override Paces Manually</div>
        </div>
        <div className="card-body">
          <div className="form-row three">
            <div className="form-group">
              <label className="label">Easy Pace</label>
              <input className="input" placeholder="mm:ss" value={localPaces.easy} onChange={e => set('easy', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="label">Tempo Pace</label>
              <input className="input" placeholder="mm:ss" value={localPaces.tempo} onChange={e => set('tempo', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="label">Interval Pace</label>
              <input className="input" placeholder="mm:ss" value={localPaces.interval} onChange={e => set('interval', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="label">Long Run Pace</label>
              <input className="input" placeholder="mm:ss" value={localPaces.longRun} onChange={e => set('longRun', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="label">Race Goal Pace</label>
              <input className="input" placeholder="mm:ss" value={localPaces.raceGoal} onChange={e => set('raceGoal', e.target.value)} />
            </div>
          </div>
          <div className="text-xs text-muted mt-16">Manual entries override calculated zones. Run workouts in your program reference these values.</div>
        </div>
      </div>
    </div>
  );
}
