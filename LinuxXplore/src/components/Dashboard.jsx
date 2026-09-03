import React from 'react'
import { getProgress, getQuizResults } from '../database.js'

function formatTime(sec) {
  if (!sec) return '0m'
  const m = Math.floor(sec / 60)
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  return `${h}h ${m % 60}m`
}

export default function Dashboard({ user, onNavigate }) {
  const progress = getProgress(user.id)
  const quizResults = getQuizResults(user.id)
  const quizAvg = quizResults.length
    ? Math.round(quizResults.reduce((a, q) => a + q.pct, 0) / quizResults.length)
    : 0

  const moduleProgress = [
    { key: 'scheduling', label: 'CPU Scheduling' },
    { key: 'paging', label: 'Memory & Paging' },
    { key: 'race', label: 'Algorithm Race' },
  ]
  const overall = Math.round(
    moduleProgress.reduce((a, m) => a + (progress[m.key] || 0), 0) / moduleProgress.length
  )

  const quickNav = [
    { id: 'learning', label: 'Learning Modules', desc: 'Scheduling, paging & algorithm race' },
    { id: 'sandbox', label: 'Linux Sandbox', desc: 'Run a simulated terminal & processes' },
    { id: 'quiz', label: 'Quizzes', desc: 'Test what you\u2019ve learned' },
    { id: 'tutor', label: 'Tutor', desc: 'Ask about OS concepts' },
  ]

  return (
    <div>
      <div className="page-header">
        <h1>Welcome back, {user.name.split(' ')[0]}</h1>
        <p>Here's where you left off in the Linux learning laboratory.</p>
      </div>

      <div className="grid grid-4">
        <div className="stat-card">
          <div className="stat-value">{overall}%</div>
          <div className="stat-label">Overall module progress</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{quizAvg}%</div>
          <div className="stat-label">Quiz average ({quizResults.length} taken)</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{progress.sandboxSessions || 0}</div>
          <div className="stat-label">Sandbox sessions</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{progress.processesCreated || 0}</div>
          <div className="stat-label">Processes created</div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h3 className="section-title">Module progress</h3>
        {moduleProgress.map((m) => (
          <div key={m.key} style={{ marginBottom: 14 }}>
            <div className="flex-between small" style={{ marginBottom: 6 }}>
              <span>{m.label}</span>
              <span className="muted">{progress[m.key] || 0}%</span>
            </div>
            <div className="progress-bar-track">
              <div className="progress-bar-fill" style={{ width: `${progress[m.key] || 0}%` }} />
            </div>
          </div>
        ))}
        <div className="small muted">Time spent learning: {formatTime(progress.timeSpentSec)}</div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h3 className="section-title">Jump back in</h3>
        <div className="grid grid-2">
          {quickNav.map((q) => (
            <button
              key={q.id}
              className="btn"
              style={{ textAlign: 'left', padding: 14 }}
              onClick={() => onNavigate(q.id)}
            >
              <div style={{ fontWeight: 600, marginBottom: 4 }}>{q.label}</div>
              <div className="small muted">{q.desc}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
