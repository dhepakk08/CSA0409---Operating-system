// database.js
// Simulated database using localStorage. Real database -> localStorage (per MVP rules).

// Bumped keys to force a fresh local data start.
const DB_KEY = 'linuxxplore_db_v2'
const SESSION_KEY = 'linuxxplore_session_v2'
const TEACHER_ACCESS_CODE = 'LINUXXPLORE-TEACHER'

const DEFAULT_DB = {
  users: [
    {
      id: 'teacher-demo',
      role: 'teacher',
      name: 'Demo Teacher',
      email: 'teacher@linuxxplore.com',
      password: 'teacher123',
      createdAt: Date.now(),
    },
  ],
  progress: {}, // userId -> { scheduling, paging, race, sandbox, lastActive, timeSpentSec }
  quizResults: {}, // userId -> [{ quizId, score, total, pct, takenAt }]
  sandboxLogs: {}, // userId -> [{ command, ts }]
  processLogs: {}, // userId -> [{ pid, name, algorithm, createdAt, terminatedAt, state }]
  passwordResets: {}, // email -> { code, expiresAt, consumedAt, requestedAt }
}

function ensureUserDataBuckets(db, userId) {
  if (!db.progress[userId]) {
    db.progress[userId] = {
      scheduling: 0,
      paging: 0,
      race: 0,
      sandboxSessions: 0,
      processesCreated: 0,
      timeSpentSec: 0,
      lastActive: Date.now(),
    }
  }
  if (!db.quizResults[userId]) db.quizResults[userId] = []
  if (!db.sandboxLogs[userId]) db.sandboxLogs[userId] = []
  if (!db.processLogs[userId]) db.processLogs[userId] = []
}

function normalizeEmail(email) {
  return (email || '').trim().toLowerCase()
}

function normalizeDB(parsed) {
  const db = {
    users: Array.isArray(parsed?.users) ? parsed.users : [],
    progress: parsed?.progress && typeof parsed.progress === 'object' ? parsed.progress : {},
    quizResults: parsed?.quizResults && typeof parsed.quizResults === 'object' ? parsed.quizResults : {},
    sandboxLogs: parsed?.sandboxLogs && typeof parsed.sandboxLogs === 'object' ? parsed.sandboxLogs : {},
    processLogs: parsed?.processLogs && typeof parsed.processLogs === 'object' ? parsed.processLogs : {},
    passwordResets:
      parsed?.passwordResets && typeof parsed.passwordResets === 'object' ? parsed.passwordResets : {},
  }

  if (!db.users.find((u) => normalizeEmail(u.email) === 'teacher@linuxxplore.com')) {
    db.users.push(DEFAULT_DB.users[0])
  }

  db.users = db.users.map((user) => ({
    ...user,
    role: user.role === 'teacher' ? 'teacher' : 'student',
    email: normalizeEmail(user.email),
  }))

  db.users.forEach((u) => ensureUserDataBuckets(db, u.id))
  return db
}

function loadDB() {
  try {
    const raw = localStorage.getItem(DB_KEY)
    if (!raw) {
      localStorage.setItem(DB_KEY, JSON.stringify(DEFAULT_DB))
      return structuredCloneSafe(DEFAULT_DB)
    }
    const parsed = JSON.parse(raw)
    const normalized = normalizeDB(parsed)
    localStorage.setItem(DB_KEY, JSON.stringify(normalized))
    return normalized
  } catch (e) {
    localStorage.setItem(DB_KEY, JSON.stringify(DEFAULT_DB))
    return structuredCloneSafe(DEFAULT_DB)
  }
}

function structuredCloneSafe(obj) {
  return JSON.parse(JSON.stringify(obj))
}

function saveDB(db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db))
}

export function getDB() {
  return loadDB()
}

// ---------- Auth ----------

export function signup({ name, email, password, role = 'student', teacherAccessCode = '' }) {
  const db = loadDB()
  const normalizedEmail = normalizeEmail(email)
  const normalizedRole = role === 'teacher' ? 'teacher' : 'student'
  if (db.users.find((u) => normalizeEmail(u.email) === normalizedEmail)) {
    return { ok: false, error: 'An account with this email already exists.' }
  }
  if (normalizedRole === 'teacher' && teacherAccessCode.trim() !== TEACHER_ACCESS_CODE) {
    return { ok: false, error: 'Invalid teacher access code.' }
  }
  const user = {
    id: normalizedRole + '-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
    role: normalizedRole,
    name: name.trim(),
    email: normalizedEmail,
    password,
    createdAt: Date.now(),
  }
  db.users.push(user)
  ensureUserDataBuckets(db, user.id)
  saveDB(db)
  setSession(user)
  return { ok: true, user }
}

export function login({ email, password }) {
  const db = loadDB()
  const normalizedEmail = normalizeEmail(email)
  const user = db.users.find((u) => normalizeEmail(u.email) === normalizedEmail && u.password === password)
  if (!user) return { ok: false, error: 'Invalid email or password.' }
  setSession(user)
  return { ok: true, user }
}

export function requestPasswordReset({ email, role }) {
  const db = loadDB()
  const normalizedEmail = normalizeEmail(email)
  const normalizedRole = role === 'teacher' ? 'teacher' : 'student'
  const user = db.users.find(
    (u) => normalizeEmail(u.email) === normalizedEmail && u.role === normalizedRole
  )
  if (!user) {
    return { ok: false, error: 'No account was found for this role and email.' }
  }

  const code = String(Math.floor(100000 + Math.random() * 900000))
  const now = Date.now()
  db.passwordResets[normalizedEmail] = {
    code,
    role: normalizedRole,
    requestedAt: now,
    expiresAt: now + 10 * 60 * 1000,
    consumedAt: null,
  }
  saveDB(db)

  // In this local-only MVP, return code directly because no email backend exists.
  return { ok: true, code, expiresInSec: 600 }
}

export function resetPassword({ email, role, code, newPassword }) {
  const db = loadDB()
  const normalizedEmail = normalizeEmail(email)
  const normalizedRole = role === 'teacher' ? 'teacher' : 'student'
  const reset = db.passwordResets[normalizedEmail]

  if (!reset || reset.role !== normalizedRole) {
    return { ok: false, error: 'No active reset request found for this account.' }
  }
  if (reset.consumedAt) {
    return { ok: false, error: 'This reset code has already been used.' }
  }
  if (Date.now() > reset.expiresAt) {
    return { ok: false, error: 'This reset code has expired. Request a new one.' }
  }
  if ((code || '').trim() !== reset.code) {
    return { ok: false, error: 'Invalid reset code.' }
  }

  const user = db.users.find(
    (u) => normalizeEmail(u.email) === normalizedEmail && u.role === normalizedRole
  )
  if (!user) {
    return { ok: false, error: 'Account not found.' }
  }

  user.password = newPassword
  reset.consumedAt = Date.now()
  saveDB(db)
  return { ok: true }
}

export function getTeacherAccessCodeHint() {
  return TEACHER_ACCESS_CODE
}

export function logout() {
  localStorage.removeItem(SESSION_KEY)
}

export function setSession(user) {
  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify({ id: user.id, role: user.role, name: user.name, email: user.email })
  )
}

export function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch (e) {
    return null
  }
}

// ---------- Progress ----------

export function getProgress(userId) {
  const db = loadDB()
  return (
    db.progress[userId] || {
      scheduling: 0,
      paging: 0,
      race: 0,
      sandboxSessions: 0,
      processesCreated: 0,
      timeSpentSec: 0,
      lastActive: Date.now(),
    }
  )
}

export function updateProgress(userId, patch) {
  const db = loadDB()
  if (!db.progress[userId]) {
    db.progress[userId] = {
      scheduling: 0,
      paging: 0,
      race: 0,
      sandboxSessions: 0,
      processesCreated: 0,
      timeSpentSec: 0,
      lastActive: Date.now(),
    }
  }
  db.progress[userId] = { ...db.progress[userId], ...patch, lastActive: Date.now() }
  saveDB(db)
  return db.progress[userId]
}

export function addTimeSpent(userId, seconds) {
  const db = loadDB()
  const p = db.progress[userId] || { timeSpentSec: 0 }
  p.timeSpentSec = (p.timeSpentSec || 0) + seconds
  p.lastActive = Date.now()
  db.progress[userId] = p
  saveDB(db)
}

// ---------- Quiz ----------

export function saveQuizResult(userId, result) {
  const db = loadDB()
  if (!db.quizResults[userId]) db.quizResults[userId] = []
  db.quizResults[userId].push({ ...result, takenAt: Date.now() })
  saveDB(db)
}

export function getQuizResults(userId) {
  const db = loadDB()
  return db.quizResults[userId] || []
}

// ---------- Sandbox / process logs ----------

export function logCommand(userId, command) {
  const db = loadDB()
  if (!db.sandboxLogs[userId]) db.sandboxLogs[userId] = []
  db.sandboxLogs[userId].push({ command, ts: Date.now() })
  saveDB(db)
}

export function getCommandLogs(userId) {
  const db = loadDB()
  return db.sandboxLogs[userId] || []
}

export function logProcess(userId, procEntry) {
  const db = loadDB()
  if (!db.processLogs[userId]) db.processLogs[userId] = []
  db.processLogs[userId].push(procEntry)
  saveDB(db)
}

export function getProcessLogs(userId) {
  const db = loadDB()
  return db.processLogs[userId] || []
}

// ---------- Teacher / class-wide ----------

export function getAllStudents() {
  const db = loadDB()
  return db.users.filter((u) => u.role === 'student')
}

export function getClassOverview() {
  const db = loadDB()
  const students = db.users.filter((u) => u.role === 'student')
  return students.map((s) => {
    const progress = db.progress[s.id] || {}
    const quizzes = db.quizResults[s.id] || []
    const procs = db.processLogs[s.id] || []
    const avgScore = quizzes.length
      ? Math.round(quizzes.reduce((a, q) => a + q.pct, 0) / quizzes.length)
      : 0
    return {
      id: s.id,
      name: s.name,
      email: s.email,
      createdAt: s.createdAt,
      progress,
      quizzesTaken: quizzes.length,
      avgScore,
      processesCreated: procs.length,
      lastActive: progress.lastActive || s.createdAt,
    }
  })
}
