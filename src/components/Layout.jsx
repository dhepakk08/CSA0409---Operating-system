import React from 'react'

const STUDENT_NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: '⌂' },
  { id: 'learning', label: 'Learning Modules', icon: '📚' },
  { id: 'sandbox', label: 'Linux Sandbox', icon: '⌨' },
  { id: 'quiz', label: 'Quizzes', icon: '✓' },
  { id: 'tutor', label: 'Tutor', icon: '?' },
  { id: 'analytics', label: 'My Progress', icon: '▤' },
]

const TEACHER_NAV = [{ id: 'analytics', label: 'Class Analytics', icon: '▤' }]

export default function Layout({ user, page, onNavigate, onLogout, children }) {
  const nav = user.role === 'teacher' ? TEACHER_NAV : STUDENT_NAV

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">$ LinuxXplore</span>
        </div>
        <ul className="nav-list">
          {nav.map((item) => (
            <li key={item.id}>
              <button
                className={`nav-item ${page === item.id ? 'active' : ''}`}
                onClick={() => onNavigate(item.id)}
              >
                <span aria-hidden="true">{item.icon}</span>
                {item.label}
              </button>
            </li>
          ))}
        </ul>
        <div className="sidebar-footer">
          <div className="user-chip">
            <strong>{user.name}</strong>
            {user.role === 'teacher' ? 'Teacher' : 'Student'}
          </div>
          <button className="logout-btn" onClick={onLogout}>
            Log out
          </button>
        </div>
      </aside>
      <main className="main-area">{children}</main>
    </div>
  )
}
