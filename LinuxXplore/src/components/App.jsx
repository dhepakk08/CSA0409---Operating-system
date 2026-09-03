import React, { useEffect, useState } from 'react'
import {
  getSession,
  login,
  signup,
  logout,
  addTimeSpent,
  requestPasswordReset,
  resetPassword,
} from '../database.js'
import Layout from './Layout.jsx'
import Dashboard from './Dashboard.jsx'
import Learning from './Learning.jsx'
import Sandbox from './Sandbox.jsx'
import Quiz from './Quiz.jsx'
import Tutor from './Tutor.jsx'
import Analytics from './Analytics.jsx'

function AuthScreen({ onAuthed }) {
  const [mode, setMode] = useState('login')
  const [role, setRole] = useState('student')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [teacherAccessCode, setTeacherAccessCode] = useState('')
  const [resetCode, setResetCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [issuedResetCode, setIssuedResetCode] = useState('')
  const [info, setInfo] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [error, setError] = useState('')

  function switchMode(nextMode) {
    setMode(nextMode)
    setError('')
    setInfo('')
    setIssuedResetCode('')
    setResetCode('')
    setNewPassword('')
    setConfirmPassword('')
  }

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setInfo('')

    if (mode === 'login') {
      const res = login({ email, password })
      if (!res.ok) return setError(res.error)
      if (role === 'teacher' && res.user.role !== 'teacher') {
        return setError('This account is not a teacher account.')
      }
      if (role === 'student' && res.user.role !== 'student') {
        return setError('Please use Teacher sign-in for this account.')
      }
      onAuthed(res.user)
      return
    }

    if (mode === 'signup') {
      if (!name.trim()) return setError('Please enter your name.')
      if (!email.trim() || !password) return setError('Email and password are required.')
      if (password.length < 6) return setError('Use a password with at least 6 characters.')
      if (role === 'teacher' && !teacherAccessCode.trim()) {
        return setError('Teacher access code is required to create teacher accounts.')
      }
      const res = signup({ name, email, password, role, teacherAccessCode })
      if (!res.ok) return setError(res.error)
      onAuthed(res.user)
      return
    }

    if (!email.trim()) return setError('Enter your account email first.')
    if (!issuedResetCode) {
      const res = requestPasswordReset({ email, role })
      if (!res.ok) return setError(res.error)
      setIssuedResetCode(res.code)
      setInfo('Reset code generated. Enter the code and choose a new password.')
      return
    }

    if (!resetCode.trim()) return setError('Enter the reset code.')
    if (newPassword.length < 6) return setError('New password must be at least 6 characters.')
    if (newPassword !== confirmPassword) return setError('Password confirmation does not match.')
    const res = resetPassword({ email, role, code: resetCode, newPassword })
    if (!res.ok) return setError(res.error)
    setPassword('')
    setMode('login')
    setIssuedResetCode('')
    setResetCode('')
    setNewPassword('')
    setConfirmPassword('')
    setInfo('Password reset successful. Sign in with your new password.')
  }

  const authHeading =
    mode === 'login'
      ? `${role === 'teacher' ? 'Teacher' : 'Student'} sign in`
      : mode === 'signup'
        ? `Create ${role} account`
        : 'Reset password'

  const authButtonLabel =
    mode === 'login' ? 'Log in' : mode === 'signup' ? 'Create account' : issuedResetCode ? 'Reset password' : 'Send reset code'

  const isForgotMode = mode === 'forgot'

  function demoHint() {
    if (role !== 'teacher') {
      return 'Students can create accounts and access learning, quizzes, tutor, and progress tracking.'
    }
    return 'Teacher demo: teacher@linuxxplore.com / teacher123'
  }

  return (
    <div className="auth-shell">
      <div className="auth-card auth-card-modern">
        <div className="auth-hero">
          <div className="brand" style={{ padding: 0 }}><span className="brand-mark">$ LinuxXplore</span></div>
          <span className="auth-kicker">Operating systems learning lab</span>
          <h1>{role === 'teacher' ? 'Guide your class with confidence.' : 'Build your Linux intuition.'}</h1>
          <p>{role === 'teacher' ? 'Review class activity and identify where students need support.' : 'Practice scheduling, memory, processes, and files in a safe simulated environment.'}</p>
        </div>
        <div className="auth-body">
          <div className="auth-role-toggle" aria-label="Choose account role">
            <button
              type="button"
              className={role === 'student' ? 'active' : ''}
              onClick={() => {
                setRole('student')
                setError('')
                setInfo('')
              }}
            >
              Student
            </button>
            <button
              type="button"
              className={role === 'teacher' ? 'active' : ''}
              onClick={() => {
                setRole('teacher')
                setError('')
                setInfo('')
              }}
            >
              Teacher
            </button>
          </div>
          <div className="auth-toggle">
            <button type="button" className={mode === 'login' ? 'active' : ''} onClick={() => switchMode('login')}>
              Sign in
            </button>
            <button type="button" className={mode === 'signup' ? 'active' : ''} onClick={() => switchMode('signup')}>
              Create account
            </button>
            <button type="button" className={mode === 'forgot' ? 'active' : ''} onClick={() => switchMode('forgot')}>
              Forgot password
            </button>
          </div>
          <div className="auth-form-heading">
            <strong>{authHeading}</strong>
            <span className="small muted">Your activity stays in this browser.</span>
          </div>
        </div>
        {info && <div className="auth-info">{info}</div>}
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <div className="field">
              <label>Full name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ada Student" />
            </div>
          )}
          <div className="field">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          {(mode === 'login' || mode === 'signup') && (
            <div className="field">
              <label>Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
              />
              <label className="password-toggle">
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={(e) => setShowPassword(e.target.checked)}
                />{' '}
                Show password
              </label>
            </div>
          )}

          {mode === 'signup' && role === 'teacher' && (
            <div className="field">
              <label>Teacher access code</label>
              <input
                value={teacherAccessCode}
                onChange={(e) => setTeacherAccessCode(e.target.value)}
                placeholder="Institution-provided code"
              />
            </div>
          )}

          {isForgotMode && issuedResetCode && (
            <>
              <div className="field">
                <label>Reset code</label>
                <input
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  placeholder="6-digit code"
                />
              </div>
              <div className="field">
                <label>New password</label>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                />
              </div>
              <div className="field">
                <label>Confirm new password</label>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                />
                <label className="password-toggle">
                  <input
                    type="checkbox"
                    checked={showNewPassword}
                    onChange={(e) => setShowNewPassword(e.target.checked)}
                  />{' '}
                  Show new password
                </label>
              </div>
              <div className="reset-preview">
                Local demo code: <span className="mono">{issuedResetCode}</span>
              </div>
            </>
          )}

          <button className="btn btn-primary" type="submit" style={{ width: '100%' }}>
            {authButtonLabel}
          </button>
        </form>
        <div className="auth-hint">
          {demoHint()}
        </div>
      </div>
    </div>
  )
}

const STUDENT_PAGES = ['dashboard', 'learning', 'sandbox', 'quiz', 'tutor', 'analytics']
const TEACHER_PAGES = ['analytics']

export default function App() {
  const [user, setUser] = useState(() => getSession())
  const [page, setPage] = useState('dashboard')

  useEffect(() => {
    if (!user) return
    const interval = setInterval(() => {
      addTimeSpent(user.id, 15)
    }, 15000)
    return () => clearInterval(interval)
  }, [user])

  useEffect(() => {
    if (!user) return
    const allowedPages = user.role === 'teacher' ? TEACHER_PAGES : STUDENT_PAGES
    if (!allowedPages.includes(page)) {
      setPage(user.role === 'teacher' ? 'analytics' : 'dashboard')
    }
  }, [page, user])

  function handleAuthed(u) {
    setUser({ id: u.id, role: u.role, name: u.name, email: u.email })
    setPage('dashboard')
  }

  function handleLogout() {
    logout()
    setUser(null)
    setPage('dashboard')
  }

  if (!user) {
    return <AuthScreen onAuthed={handleAuthed} />
  }

  let content
  if (user.role === 'teacher') {
    content = page === 'analytics' || page === 'dashboard' ? <Analytics user={user} /> : <Analytics user={user} />
  } else {
    switch (page) {
      case 'dashboard':
        content = <Dashboard user={user} onNavigate={setPage} />
        break
      case 'learning':
        content = <Learning user={user} />
        break
      case 'sandbox':
        content = <Sandbox user={user} />
        break
      case 'quiz':
        content = <Quiz user={user} />
        break
      case 'tutor':
        content = <Tutor user={user} />
        break
      case 'analytics':
        content = <Analytics user={user} />
        break
      default:
        content = <Dashboard user={user} onNavigate={setPage} />
    }
  }

  return (
    <Layout user={user} page={page} onNavigate={setPage} onLogout={handleLogout}>
      {content}
    </Layout>
  )
}
