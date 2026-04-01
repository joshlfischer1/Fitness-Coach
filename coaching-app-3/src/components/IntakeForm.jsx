import React, { useState } from 'react';

const STEPS = ['Program', 'Schedule', 'Running', 'Strength', 'You'];

const DURATION_OPTIONS = ['4 weeks', '8 weeks', '12 weeks', '16 weeks', 'Custom'];
const MODE_OPTIONS = ['Run Only', 'Strength Only', 'Hybrid'];
const SPLIT_OPTIONS = ['Full Body', 'Upper-Lower', 'Push-Pull-Legs'];
const TIME_OPTIONS = ['30 min', '45 min', '60 min', '75 min', '90 min', '120 min'];
const EXPERIENCE_OPTIONS = ['Returning After Layoff', 'Beginner', 'Intermediate', 'Advanced'];
const RACE_OPTIONS = ['5K', '10K', 'Half Marathon', 'Marathon', 'Ultra', 'None'];
const GOAL_OPTIONS = ['Hypertrophy', 'Strength', 'Endurance'];
const DAYS_OPTIONS = ['2', '3', '4', '5', '6'];

function StepBar({ step }) {
  return (
    <div className="step-bar">
      {STEPS.map((s, i) => (
        <React.Fragment key={s}>
          <div className="step-item">
            <div className={`step-dot ${i < step ? 'done' : i === step ? 'active' : ''}`}>
              {i < step ? '✓' : i + 1}
            </div>
            <span className={`step-label ${i < step ? 'done' : i === step ? 'active' : ''}`}>{s}</span>
          </div>
          {i < STEPS.length - 1 && <div className={`step-line ${i < step ? 'done' : ''}`} />}
        </React.Fragment>
      ))}
    </div>
  );
}

function PillGroup({ options, value, onChange, multi = false }) {
  const toggle = (opt) => {
    if (multi) {
      const arr = Array.isArray(value) ? value : [];
      onChange(arr.includes(opt) ? arr.filter(v => v !== opt) : [...arr, opt]);
    } else {
      onChange(opt === value ? '' : opt);
    }
  };
  const isSelected = (opt) => multi ? (Array.isArray(value) && value.includes(opt)) : value === opt;
  return (
    <div className="pill-group">
      {options.map(opt => (
        <button key={opt} className={`pill ${isSelected(opt) ? 'selected' : ''}`} onClick={() => toggle(opt)} type="button">
          {opt}
        </button>
      ))}
    </div>
  );
}

function Toggle({ value, onChange, label, desc }) {
  return (
    <div className={`toggle-row ${value ? 'on' : ''}`} onClick={() => onChange(!value)}>
      <div className={`toggle-switch ${value ? 'on' : ''}`} />
      <div>
        <div className="toggle-label">{label}</div>
        {desc && <div className="toggle-desc">{desc}</div>}
      </div>
    </div>
  );
}

export default function IntakeForm({ onComplete }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    duration: '',
    customWeeks: '',
    mode: '',
    runnerStrengthToggle: false,
    split: '',
    timePerDay: '',
    runningExperience: '',
    raceDistance: '',
    raceDate: '',
    strengthGoal: '',
    daysPerWeek: '',
    injuries: '',
    squat1rm: '',
    deadlift1rm: '',
    bench1rm: '',
    recentRaceTime: '',
    recentRaceDistance: '',
    easyPace: '',
    tempoPace: '',
  });

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const showRunning = form.mode === 'Run Only' || form.mode === 'Hybrid';
  const showStrength = form.mode === 'Strength Only' || form.mode === 'Hybrid';
  const showRunnerToggle = form.mode === 'Run Only' || form.mode === 'Hybrid';

  const canNext = () => {
    if (step === 0) return form.duration && form.mode;
    if (step === 1) return form.daysPerWeek && form.timePerDay && form.split;
    if (step === 2) return !showRunning || form.runningExperience;
    if (step === 3) return !showStrength || form.strengthGoal;
    return true;
  };

  const handleSubmit = () => {
    onComplete(form);
  };

  const buildSummary = () => {
    const lines = [];
    lines.push(`Program: ${form.duration}${form.duration === 'Custom' ? ` (${form.customWeeks} weeks)` : ''}`);
    lines.push(`Mode: ${form.mode}`);
    if (showRunnerToggle) lines.push(`Runner Strength Days: ${form.runnerStrengthToggle ? 'Yes' : 'No'}`);
    lines.push(`Split: ${form.split}`);
    lines.push(`Days/week: ${form.daysPerWeek}`);
    lines.push(`Time budget: ${form.timePerDay}`);
    if (showRunning) {
      lines.push(`Running level: ${form.runningExperience}`);
      if (form.raceDistance && form.raceDistance !== 'None') lines.push(`Goal race: ${form.raceDistance}${form.raceDate ? ` on ${form.raceDate}` : ''}`);
    }
    if (showStrength) lines.push(`Strength goal: ${form.strengthGoal}`);
    if (form.injuries) lines.push(`Limitations: ${form.injuries}`);
    return lines.join('\n');
  };

  return (
    <div>
      <div className="mb-24">
        <div className="page-title">Build Your Program</div>
        <div className="page-subtitle">Answer a few questions and we'll generate your custom training plan.</div>
      </div>

      <StepBar step={step} />

      <div className="card">
        <div className="card-body">

          {/* STEP 0 — PROGRAM */}
          {step === 0 && (
            <div>
              <div className="section-title">Step 1 of 5 — Program Setup</div>

              <div className="form-group mb-24">
                <label className="label">Program Duration</label>
                <PillGroup options={DURATION_OPTIONS} value={form.duration} onChange={v => set('duration', v)} />
                {form.duration === 'Custom' && (
                  <input className="input mt-8" type="number" placeholder="Number of weeks" value={form.customWeeks} onChange={e => set('customWeeks', e.target.value)} style={{ maxWidth: 200 }} />
                )}
              </div>

              <div className="form-group mb-24">
                <label className="label">Program Mode</label>
                <PillGroup options={MODE_OPTIONS} value={form.mode} onChange={v => set('mode', v)} />
              </div>

              {showRunnerToggle && (
                <div className="form-group">
                  <label className="label">Runner-Specific Strength Days</label>
                  <Toggle
                    value={form.runnerStrengthToggle}
                    onChange={v => set('runnerStrengthToggle', v)}
                    label="Include Runner Strength Days"
                    desc="Replaces 2 strength sessions with posterior chain, single-leg, and stability work optimized for running economy."
                  />
                </div>
              )}
            </div>
          )}

          {/* STEP 1 — SCHEDULE */}
          {step === 1 && (
            <div>
              <div className="section-title">Step 2 of 5 — Schedule</div>

              <div className="form-group mb-24">
                <label className="label">Days Available Per Week</label>
                <PillGroup options={DAYS_OPTIONS} value={form.daysPerWeek} onChange={v => set('daysPerWeek', v)} />
              </div>

              <div className="form-group mb-24">
                <label className="label">Time Budget Per Day</label>
                <PillGroup options={TIME_OPTIONS} value={form.timePerDay} onChange={v => set('timePerDay', v)} />
                <div className="text-xs text-muted mt-8">This is your total session time. On combined days, it's split between running and strength — not added together.</div>
              </div>

              <div className="form-group">
                <label className="label">Workout Split</label>
                <PillGroup options={SPLIT_OPTIONS} value={form.split} onChange={v => set('split', v)} />
                <div className="text-xs text-muted mt-8">
                  {form.daysPerWeek === '2' || form.daysPerWeek === '3' ? '💡 Full Body recommended for your schedule.' : ''}
                  {form.daysPerWeek === '4' ? '💡 Upper-Lower recommended for your schedule.' : ''}
                  {(form.daysPerWeek === '5' || form.daysPerWeek === '6') ? '💡 Push-Pull-Legs recommended for your schedule.' : ''}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 — RUNNING */}
          {step === 2 && (
            <div>
              <div className="section-title">Step 3 of 5 — Running</div>

              {showRunning ? (
                <>
                  <div className="form-group mb-24">
                    <label className="label">Running Experience Level</label>
                    <PillGroup options={EXPERIENCE_OPTIONS} value={form.runningExperience} onChange={v => set('runningExperience', v)} />
                    <div className="text-xs text-muted mt-8">
                      {form.runningExperience === 'Returning After Layoff' && '⚠️ Weeks 1–2 will be easy only regardless of mesocycle. No intensity until week 3+.'}
                      {form.runningExperience === 'Beginner' && '🏃 Walk/run intervals will be used before continuous running is introduced.'}
                    </div>
                  </div>

                  <div className="form-row mb-24">
                    <div className="form-group">
                      <label className="label">Goal Race Distance</label>
                      <PillGroup options={RACE_OPTIONS} value={form.raceDistance} onChange={v => set('raceDistance', v)} />
                    </div>
                    {form.raceDistance && form.raceDistance !== 'None' && (
                      <div className="form-group">
                        <label className="label">Target Race Date</label>
                        <input className="input" type="date" value={form.raceDate} onChange={e => set('raceDate', e.target.value)} />
                      </div>
                    )}
                  </div>

                  <hr className="divider" />
                  <div className="section-title">Current Benchmarks (optional)</div>

                  <div className="form-group mb-16">
                    <label className="label">Recent Race Result (used to calculate pace zones)</label>
                    <div className="form-row">
                      <input className="input" placeholder="e.g. 22:30" value={form.recentRaceTime} onChange={e => set('recentRaceTime', e.target.value)} />
                      <select className="select" value={form.recentRaceDistance} onChange={e => set('recentRaceDistance', e.target.value)}>
                        <option value="">Select distance</option>
                        <option>5K</option><option>10K</option><option>Half Marathon</option><option>Marathon</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="label">Easy Pace (min:sec/mile)</label>
                      <input className="input" placeholder="e.g. 9:30" value={form.easyPace} onChange={e => set('easyPace', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="label">Tempo Pace (min:sec/mile)</label>
                      <input className="input" placeholder="e.g. 7:45" value={form.tempoPace} onChange={e => set('tempoPace', e.target.value)} />
                    </div>
                  </div>
                </>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">🏋️</div>
                  <div className="empty-title">Strength Only Mode</div>
                  <div className="empty-desc">No running fields needed. Continue to the next step.</div>
                </div>
              )}
            </div>
          )}

          {/* STEP 3 — STRENGTH */}
          {step === 3 && (
            <div>
              <div className="section-title">Step 4 of 5 — Strength</div>

              {showStrength ? (
                <>
                  <div className="form-group mb-24">
                    <label className="label">Primary Strength Goal</label>
                    <PillGroup options={GOAL_OPTIONS} value={form.strengthGoal} onChange={v => set('strengthGoal', v)} />
                    <div className="text-xs text-muted mt-8">
                      {form.strengthGoal === 'Hypertrophy' && '8–12 reps @ RPE 7–8. Focus on muscle development.'}
                      {form.strengthGoal === 'Strength' && '3–5 reps @ RPE 8–9. Focus on maximal force output.'}
                      {form.strengthGoal === 'Endurance' && '15–20 reps @ RPE 6–7. Focus on muscular endurance.'}
                    </div>
                  </div>

                  <hr className="divider" />
                  <div className="section-title">Current Strength Benchmarks (optional)</div>
                  <div className="text-xs text-muted mb-16">Used to calibrate starting loads. Enter your working weight × reps or estimated 1RM.</div>

                  <div className="form-row three">
                    <div className="form-group">
                      <label className="label">Squat</label>
                      <input className="input" placeholder="e.g. 185 lb × 5" value={form.squat1rm} onChange={e => set('squat1rm', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="label">Deadlift</label>
                      <input className="input" placeholder="e.g. 225 lb × 5" value={form.deadlift1rm} onChange={e => set('deadlift1rm', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="label">Bench Press</label>
                      <input className="input" placeholder="e.g. 155 lb × 5" value={form.bench1rm} onChange={e => set('bench1rm', e.target.value)} />
                    </div>
                  </div>
                </>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">🏃</div>
                  <div className="empty-title">Run Only Mode</div>
                  <div className="empty-desc">No strength fields needed. Continue to the next step.</div>
                </div>
              )}
            </div>
          )}

          {/* STEP 4 — YOU */}
          {step === 4 && (
            <div>
              <div className="section-title">Step 5 of 5 — About You</div>

              <div className="form-group mb-24">
                <label className="label">Injuries, Limitations, or Movements to Avoid</label>
                <textarea
                  className="textarea"
                  placeholder="e.g. knee pain with deep squats, lower back flares up with heavy deadlifts, avoid high-impact plyometrics..."
                  value={form.injuries}
                  onChange={e => set('injuries', e.target.value)}
                />
                <div className="text-xs text-muted mt-8">The program will flag and regress any exercises that may aggravate these areas.</div>
              </div>

              <hr className="divider" />
              <div className="section-title">Program Summary</div>
              <div style={{ background: 'var(--paper-2)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px 18px' }}>
                <pre style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--ink-2)', whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
                  {buildSummary()}
                </pre>
              </div>
            </div>
          )}

        </div>

        <div style={{ padding: '20px 28px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button className="btn btn-secondary" onClick={() => setStep(s => s - 1)} disabled={step === 0}>
            ← Back
          </button>
          {step < STEPS.length - 1 ? (
            <button className="btn btn-primary" onClick={() => setStep(s => s + 1)} disabled={!canNext()}>
              Continue →
            </button>
          ) : (
            <button className="btn btn-primary btn-lg" onClick={handleSubmit}>
              Generate My Program →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
