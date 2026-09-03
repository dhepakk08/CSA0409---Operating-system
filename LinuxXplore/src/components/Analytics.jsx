import React from 'react'
import { getProgress, getQuizResults, getProcessLogs, getClassOverview } from '../database.js'

function formatTime(sec) {
  if (!sec) return '0m'
  const m = Math.floor(sec / 60)
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  return `${h}h ${m % 60}m`
}

function StudentAnalytics({ user }) {
  const progress = getProgress(user.id)
  const quizResults = getQuizResults(user.id)
  const processLogs = getProcessLogs(user.id)

  return (
    <div>
      <div className="page-header">
        <h1>My Progress</h1>
        <p>Your learning history across LinuxXplore.</p>
      </div>

      <div className="grid grid-4">
        <div className="stat-card">
          <div className="stat-value">{quizResults.length}</div>
          <div className="stat-label">Quizzes taken</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{progress.sandboxSessions || 0}</div>
          <div className="stat-label">Sandbox sessions</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{progress.processesCreated || 0}</div>
          <div className="stat-label">Processes created</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{formatTime(progress.timeSpentSec)}</div>
          <div className="stat-label">Time spent</div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h3 className="section-title">Quiz history</h3>
        {quizResults.length === 0 ? (
          <p className="muted small">No quizzes taken yet.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Quiz</th>
                  <th>Score</th>
                  <th>Percent</th>
                  <th>Taken</th>
                </tr>
              </thead>
              <tbody>
                {[...quizResults].reverse().map((r, i) => (
                  <tr key={i}>
                    <td>{r.quizId}</td>
                    <td>
                      {r.score}/{r.total}
                    </td>
                    <td>{r.pct}%</td>
                    <td className="small muted">{new Date(r.takenAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h3 className="section-title">Sandbox process history</h3>
        {processLogs.length === 0 ? (
          <p className="muted small">No processes created yet.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>PID</th>
                  <th>Name</th>
                  <th>State</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {[...processLogs].reverse().slice(0, 20).map((p, i) => (
                  <tr key={i}>
                    <td className="mono">{p.pid}</td>
                    <td>{p.name || '—'}</td>
                    <td>
                      <span className="badge badge-dim">{p.state}</span>
                    </td>
                    <td className="small muted">{new Date(p.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function TeacherAnalytics() {
  const students = getClassOverview()
  const classAvg = students.length
    ? Math.round(students.reduce((a, s) => a + s.avgScore, 0) / students.length)
    : 0
  const totalProcesses = students.reduce((a, s) => a + s.processesCreated, 0)

  return (
    <div>
      <div className="page-header">
        <h1>Class Analytics</h1>
        <p>Overview of students who have registered and used LinuxXplore.</p>
      </div>

      <div className="grid grid-4">
        <div className="stat-card">
          <div className="stat-value">{students.length}</div>
          <div className="stat-label">Registered students</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{classAvg}%</div>
          <div className="stat-label">Class quiz average</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{totalProcesses}</div>
          <div className="stat-label">Total sandbox processes</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {students.reduce((a, s) => a + s.quizzesTaken, 0)}
          </div>
          <div className="stat-label">Total quizzes taken</div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h3 className="section-title">Student progress</h3>
        {students.length === 0 ? (
          <p className="muted small">
            No students have registered yet. Once students sign up and use the app, they'll appear here.
          </p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Email</th>
                  <th>Quizzes</th>
                  <th>Avg score</th>
                  <th>Processes</th>
                  <th>Last active</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id}>
                    <td>{s.name}</td>
                    <td className="small muted">{s.email}</td>
                    <td>{s.quizzesTaken}</td>
                    <td>
                      <span
                        className={`badge ${
                          s.avgScore >= 70 ? 'badge-green' : s.avgScore >= 40 ? 'badge-amber' : 'badge-red'
                        }`}
                      >
                        {s.avgScore}%
                      </span>
                    </td>
                    <td>{s.processesCreated}</td>
                    <td className="small muted">{new Date(s.lastActive).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h3 className="section-title">Insights</h3>
        <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.8 }}>
          <li>
            {students.filter((s) => s.quizzesTaken === 0).length} student(s) haven't attempted a quiz yet.
          </li>
          <li>
            {students.filter((s) => s.processesCreated === 0).length} student(s) haven't used the Sandbox yet.
          </li>
          <li>
            {students.filter((s) => s.avgScore < 50 && s.quizzesTaken > 0).length} student(s) are scoring below 50%
            on average and may need extra support.
          </li>
        </ul>
      </div>
    </div>
  )
}

export default function Analytics({ user }) {
  return user.role === 'teacher' ? <TeacherAnalytics /> : <StudentAnalytics user={user} />
}
