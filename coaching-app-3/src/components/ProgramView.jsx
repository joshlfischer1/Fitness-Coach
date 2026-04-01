import React, { useState } from 'react';

function parseWeekContent(text) {
  // Split into day blocks
  const dayBlocks = [];
  const lines = text.split('\n');
  let current = null;

  for (const line of lines) {
    const dayMatch = line.match(/^DAY\s*(\d+)\s*[-–]\s*(.+?)\s*[-–]\s*(RUN|STRENGTH|COMBINED|REST|DELOAD)/i);
    if (dayMatch) {
      if (current) dayBlocks.push(current);
      current = {
        day: parseInt(dayMatch[1]),
        name: dayMatch[2].trim(),
        type: dayMatch[3].toUpperCase(),
        budget: '',
        content: [],
      };
    } else if (current) {
      if (line.match(/^BUDGET:/i)) {
        current.budget = line.replace(/^BUDGET:\s*/i, '').trim();
      } else if (line.trim() && line.trim() !== '---') {
        current.content.push(line);
      }
    }
  }
  if (current) dayBlocks.push(current);

  // If parsing fails, return raw
  if (dayBlocks.length === 0) {
    return [{ day: 1, name: 'Week', type: 'COMBINED', budget: '', content: [text], raw: true }];
  }
  return dayBlocks;
}

function SessionCard({ day }) {
  const [open, setOpen] = useState(day.type !== 'REST');

  const typeColors = {
    RUN: 'run',
    STRENGTH: 'strength',
    COMBINED: 'combined',
    REST: 'rest',
    DELOAD: 'deload',
  };

  const typeEmoji = {
    RUN: '🏃',
    STRENGTH: '🏋️',
    COMBINED: '⚡',
    REST: '😴',
    DELOAD: '🔄',
  };

  const colorKey = typeColors[day.type] || 'rest';

  return (
    <div className="session-card">
      <div className={`session-header session-header-${colorKey}`} onClick={() => setOpen(o => !o)}>
        <div className="session-title">
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--ink-3)', minWidth: 50 }}>Day {day.day}</span>
          <span>{day.name}</span>
          <span className={`badge badge-${colorKey}`}>{typeEmoji[day.type]} {day.type}</span>
        </div>
        <div className="session-meta">
          {day.budget && <span>{day.budget}</span>}
          <span style={{ fontSize: '1rem', color: 'var(--ink-3)' }}>{open ? '▲' : '▼'}</span>
        </div>
      </div>
      {open && (
        <div className="session-body">
          <div className="program-text">
            {day.raw
              ? day.content[0]
              : day.content.join('\n')}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProgramView({ program, intake, onGenerateWeek, loading }) {
  const [activeWeek, setActiveWeek] = useState(0);

  const weeks = program.weeks || [];
  const currentWeek = weeks[activeWeek];

  const totalWeeks = parseInt(intake.duration) || parseInt(intake.customWeeks) || 8;
  const weekNumbers = Array.from({ length: totalWeeks }, (_, i) => i + 1);

  const isDeload = (w) => w % 4 === 0;
  const isTaper = (w) => {
    const dist = intake.raceDistance;
    if (!dist || dist === 'None') return false;
    const taperWeeks = { '5K': 1, '10K': 2, 'Half Marathon': 2, 'Marathon': 3, 'Ultra': 3 };
    const tw = taperWeeks[dist] || 0;
    return w > totalWeeks - tw;
  };

  const weekLabel = (w) => {
    if (isTaper(w)) return `Week ${w} · Taper`;
    if (isDeload(w)) return `Week ${w} · Deload`;
    const block = Math.ceil(w / 4);
    return `Week ${w} · Block ${block}`;
  };

  const handleGenerate = () => {
    const weekNum = activeWeek + 1;
    const prompt = buildWeekPrompt(weekNum, intake, weeks);
    onGenerateWeek(weekNum, prompt);
  };

  return (
    <div>
      <div className="week-header">
        <div>
          <div className="page-title">Your Program</div>
          <div className="page-subtitle">{intake.duration} · {intake.mode} · {intake.split}</div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {currentWeek && !loading && (
            <button className="btn btn-secondary text-sm" onClick={handleGenerate}>
              ↺ Regenerate Week
            </button>
          )}
        </div>
      </div>

      {/* Week tabs */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 24 }}>
        {weekNumbers.map((w, i) => {
          const generated = !!weeks[i];
          const active = activeWeek === i;
          return (
            <button
              key={w}
              onClick={() => setActiveWeek(i)}
              style={{
                padding: '6px 14px',
                borderRadius: 8,
                border: `1.5px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                background: active ? 'var(--accent)' : generated ? 'var(--paper)' : 'var(--paper-2)',
                color: active ? 'white' : generated ? 'var(--ink)' : 'var(--ink-3)',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                position: 'relative',
                opacity: generated ? 1 : 0.7,
              }}
            >
              {isTaper(w) ? '🏁' : isDeload(w) ? '🔄' : ''} W{w}
              {generated && !active && (
                <span style={{ position: 'absolute', top: -4, right: -4, width: 8, height: 8, background: 'var(--accent-2)', borderRadius: '50%', border: '1.5px solid white' }} />
              )}
            </button>
          );
        })}
      </div>

      {/* Week content */}
      <div className="card">
        <div className="card-header">
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem' }}>{weekLabel(activeWeek + 1)}</div>
            <div className="text-xs text-muted mt-4">
              {isDeload(activeWeek + 1) ? 'All loads at 60% of week 3. Volume reduced 40–50%.' : ''}
              {isTaper(activeWeek + 1) ? `Taper week — volume reduced, intensity preserved.` : ''}
            </div>
          </div>
          {!currentWeek && !loading && (
            <button className="btn btn-primary" onClick={handleGenerate}>
              Generate Week {activeWeek + 1} →
            </button>
          )}
        </div>
        <div className="card-body">
          {loading ? (
            <div className="loading-state">
              <div className="spinner" />
              <div className="loading-text">Building your week {activeWeek + 1} plan...</div>
            </div>
          ) : currentWeek ? (
            <div>
              {parseWeekContent(currentWeek).map((day, i) => (
                <SessionCard key={i} day={day} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <div className="empty-title">Week {activeWeek + 1} not yet generated</div>
              <div className="empty-desc">Click the button above to generate this week's training plan.</div>
              <button className="btn btn-primary" onClick={handleGenerate}>
                Generate Week {activeWeek + 1} →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function buildWeekPrompt(weekNum, intake, existingWeeks) {
  const totalWeeks = parseInt(intake.duration) || parseInt(intake.customWeeks) || 8;
  const block = Math.ceil(weekNum / 4);
  const weekInBlock = ((weekNum - 1) % 4) + 1;
  const isDeload = weekNum % 4 === 0;

  const prior = existingWeeks.slice(0, weekNum - 1).map((w, i) => `Week ${i + 1}:\n${w}`).join('\n\n');

  return `Generate the complete training plan for Week ${weekNum} of ${totalWeeks} based on this intake:

PROGRAM DETAILS:
- Duration: ${intake.duration}
- Mode: ${intake.mode}
- Runner Strength Days: ${intake.runnerStrengthToggle ? 'YES — replace 2 strength sessions with Runner Strength A/B' : 'NO — standard split only'}
- Split: ${intake.split}
- Days per week: ${intake.daysPerWeek}
- Time budget: ${intake.timePerDay}
- Running experience: ${intake.runningExperience || 'N/A'}
- Goal race: ${intake.raceDistance || 'None'}${intake.raceDate ? ` on ${intake.raceDate}` : ''}
- Strength goal: ${intake.strengthGoal || 'N/A'}
- Injuries/limitations: ${intake.injuries || 'None'}
- Squat: ${intake.squat1rm || 'Not provided'}
- Deadlift: ${intake.deadlift1rm || 'Not provided'}
- Bench: ${intake.bench1rm || 'Not provided'}
- Recent race: ${intake.recentRaceTime ? `${intake.recentRaceTime} ${intake.recentRaceDistance}` : 'Not provided'}
- Easy pace: ${intake.easyPace || 'Not provided'}
- Tempo pace: ${intake.tempoPace || 'Not provided'}

WEEK CONTEXT:
- This is Week ${weekNum}, Block ${block}, Week ${weekInBlock} of the block
- ${isDeload ? 'THIS IS A DELOAD WEEK — all loads at 60% of week 3. Volume reduced 40-50%.' : ''}
- Total program weeks: ${totalWeeks}

${prior ? `PRIOR WEEKS (for exercise rotation — do not repeat accessories):\n${prior}` : ''}

Generate all ${intake.daysPerWeek} training days plus rest days to fill the week. Use the exact DAY format specified in your instructions.`;
}
