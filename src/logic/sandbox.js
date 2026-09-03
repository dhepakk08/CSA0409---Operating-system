// sandbox.js
// Virtual in-memory Linux filesystem + command parser + live process simulation.
// Real filesystem -> in-memory object. Real terminal -> command parser. Never executes real OS commands.

import { pickNextCFS } from './algorithms.js'

// ---------------- VIRTUAL FILESYSTEM ----------------

export function createInitialFS() {
  return {
    type: 'dir',
    name: '/',
    children: {
      home: {
        type: 'dir',
        name: 'home',
        children: {
          student: {
            type: 'dir',
            name: 'student',
            children: {
              'readme.txt': {
                type: 'file',
                name: 'readme.txt',
                content:
                  'Welcome to LinuxXplore Sandbox.\nTry: ls, mkdir, cat readme.txt, ./cpu_intense &, ps, top, kill <PID>',
              },
              notes: { type: 'dir', name: 'notes', children: {} },
            },
          },
        },
      },
      bin: {
        type: 'dir',
        name: 'bin',
        children: {
          cpu_intense: { type: 'file', name: 'cpu_intense', content: '[binary]', executable: true },
          io_bound: { type: 'file', name: 'io_bound', content: '[binary]', executable: true },
          memory_test: { type: 'file', name: 'memory_test', content: '[binary]', executable: true },
        },
      },
    },
  }
}

export const DEFAULT_CWD = ['home', 'student']

export function pathString(cwd) {
  return '/' + cwd.join('/')
}

function getNode(fs, pathArr) {
  let node = fs
  for (const part of pathArr) {
    if (!node.children || !node.children[part]) return null
    node = node.children[part]
  }
  return node
}

export function resolvePath(cwd, target) {
  if (!target || target === '.') return [...cwd]
  if (target === '~') return [...DEFAULT_CWD]
  let base = target.startsWith('/') ? [] : [...cwd]
  const parts = target.split('/').filter(Boolean)
  for (const part of parts) {
    if (part === '.') continue
    else if (part === '..') base.pop()
    else base.push(part)
  }
  return base
}

export function listDir(fs, cwd) {
  const node = getNode(fs, cwd)
  if (!node || node.type !== 'dir') return null
  return Object.values(node.children)
}

export function changeDir(fs, cwd, target) {
  const newPath = resolvePath(cwd, target)
  const node = getNode(fs, newPath)
  if (!node) return { ok: false, error: `cd: no such directory: ${target}` }
  if (node.type !== 'dir') return { ok: false, error: `cd: not a directory: ${target}` }
  return { ok: true, cwd: newPath }
}

export function makeDir(fs, cwd, name) {
  const node = getNode(fs, cwd)
  if (!node || node.type !== 'dir') return { ok: false, error: 'mkdir: invalid location' }
  if (node.children[name]) return { ok: false, error: `mkdir: cannot create directory '${name}': already exists` }
  node.children[name] = { type: 'dir', name, children: {} }
  return { ok: true }
}

export function readFile(fs, cwd, name) {
  const node = getNode(fs, cwd)
  if (!node || node.type !== 'dir') return { ok: false, error: 'cat: invalid location' }
  const target = node.children[name]
  if (!target) return { ok: false, error: `cat: ${name}: No such file or directory` }
  if (target.type !== 'file') return { ok: false, error: `cat: ${name}: Is a directory` }
  return { ok: true, content: target.content }
}

// ---------------- PROCESS FACTORY ----------------

const PROGRAM_PROFILES = {
  cpu_intense: { burst: 24, memory: 180, ioChance: 0.03, weight: 1 },
  io_bound: { burst: 16, memory: 60, ioChance: 0.35, weight: 1 },
  memory_test: { burst: 18, memory: 420, ioChance: 0.1, weight: 1 },
}

export function isKnownProgram(name) {
  return Object.prototype.hasOwnProperty.call(PROGRAM_PROFILES, name)
}

export function createProcess(name, pid) {
  const profile = PROGRAM_PROFILES[name] || { burst: 12, memory: 50, ioChance: 0.1, weight: 1 }
  return {
    pid,
    name,
    state: 'New',
    cpu: 0,
    memory: profile.memory,
    algorithm: 'CFS',
    vruntime: 0,
    weight: profile.weight,
    burst: profile.burst,
    remaining: profile.burst,
    ioChance: profile.ioChance,
    contextSwitches: 0,
    sleepTicks: 0,
    createdAt: Date.now(),
    terminatedAt: null,
  }
}

// ---------------- LIVE SCHEDULER STEP ----------------
// One "tick" of the simplified CFS scheduler across all live processes.
// Mutates and returns a new processes array plus a human-readable event description.

export function stepScheduler(processes) {
  const procs = processes.map((p) => ({ ...p }))

  // wake sleeping processes probabilistically
  for (const p of procs) {
    if (p.state === 'Sleeping') {
      p.sleepTicks -= 1
      if (p.sleepTicks <= 0) {
        p.state = 'Ready'
      }
    }
    if (p.state === 'New') p.state = 'Ready'
  }

  const runnable = procs.filter((p) => p.state === 'Ready' || p.state === 'Running')
  if (runnable.length === 0) {
    return { processes: procs, event: 'CPU idle — no runnable processes.', ganttEntry: null }
  }

  const chosen = pickNextCFS(runnable)
  if (!chosen) {
    return { processes: procs, event: 'CPU idle — no runnable processes.', ganttEntry: null }
  }

  for (const p of procs) {
    if (p.state === 'Running' && p.pid !== chosen.pid) {
      p.state = 'Ready'
    }
  }

  const target = procs.find((p) => p.pid === chosen.pid)
  const wasRunning = target.state === 'Running'
  target.state = 'Running'
  if (!wasRunning) target.contextSwitches += 1

  const sliceLen = 2
  const run = Math.min(sliceLen, target.remaining)
  target.remaining -= run
  target.vruntime += run / (target.weight || 1)
  target.cpu = Math.min(100, Math.round((run / sliceLen) * 100))

  let event = `PID ${target.pid} (${target.name}) ran for ${run} tick(s) [vruntime=${target.vruntime.toFixed(
    1
  )}].`

  // random chance of going to sleep (I/O wait) if not finished
  if (target.remaining > 0 && Math.random() < target.ioChance) {
    target.state = 'Sleeping'
    target.sleepTicks = 2 + Math.floor(Math.random() * 2)
    event += ` It then blocked on I/O and is sleeping for ${target.sleepTicks} tick(s).`
  } else if (target.remaining <= 0) {
    target.state = 'Terminated'
    target.terminatedAt = Date.now()
    target.cpu = 0
    event += ` Process ${target.pid} completed and terminated.`
  } else {
    target.state = 'Ready'
  }

  // idle-decay cpu% for non-running processes
  for (const p of procs) {
    if (p.pid !== target.pid && (p.state === 'Ready' || p.state === 'Sleeping')) {
      p.cpu = 0
    }
  }

  return { processes: procs, event, ganttEntry: { pid: target.pid, name: target.name, run } }
}

export function killProcess(processes, pid) {
  return processes.map((p) =>
    p.pid === pid && p.state !== 'Terminated'
      ? { ...p, state: 'Killed', terminatedAt: Date.now(), cpu: 0 }
      : p
  )
}

// ---------------- COMMAND PARSER ----------------

export const HELP_TEXT = `Available commands:
  ls                 list directory contents
  cd <dir>           change directory
  pwd                print working directory
  mkdir <name>       create a directory
  cat <file>         show file contents
  echo <text>        print text
  clear              clear the terminal
  ps                 list processes
  top                live process/resource view
  kill <PID>         kill a running process
  ./program &        run a simulated program in background
                       (cpu_intense, io_bound, memory_test)
  whoami             show current user
  date               show current date/time
  help               show this help text`

export function executeCommand(raw, ctx) {
  const trimmed = raw.trim()
  if (!trimmed) return { output: '' }
  const parts = trimmed.split(/\s+/)
  const cmd = parts[0]
  const args = parts.slice(1)

  if (cmd === 'help') return { output: HELP_TEXT }
  if (cmd === 'clear') return { output: '', clear: true }
  if (cmd === 'pwd') return { output: pathString(ctx.cwd) }
  if (cmd === 'whoami') return { output: ctx.username || 'student' }
  if (cmd === 'date') return { output: new Date().toString() }

  if (cmd === 'ls') {
    const entries = listDir(ctx.fs, ctx.cwd)
    if (!entries) return { output: 'ls: cannot access directory' }
    if (entries.length === 0) return { output: '' }
    return {
      output: entries
        .map((e) => (e.type === 'dir' ? e.name + '/' : e.name))
        .join('  '),
    }
  }

  if (cmd === 'cd') {
    const res = changeDir(ctx.fs, ctx.cwd, args[0] || '~')
    if (!res.ok) return { output: res.error }
    return { output: '', newCwd: res.cwd }
  }

  if (cmd === 'mkdir') {
    if (!args[0]) return { output: 'mkdir: missing operand' }
    const res = makeDir(ctx.fs, ctx.cwd, args[0])
    return { output: res.ok ? '' : res.error, fsChanged: res.ok }
  }

  if (cmd === 'cat') {
    if (!args[0]) return { output: 'cat: missing operand' }
    const res = readFile(ctx.fs, ctx.cwd, args[0])
    return { output: res.ok ? res.content : res.error }
  }

  if (cmd === 'echo') {
    return { output: args.join(' ') }
  }

  if (cmd === 'ps') {
    const alive = ctx.processes.filter((p) => p.state !== 'Terminated' && p.state !== 'Killed')
    if (alive.length === 0) return { output: 'PID   NAME            STATE' }
    const header = 'PID   NAME            STATE'
    const rows = alive.map(
      (p) => `${String(p.pid).padEnd(6)}${p.name.padEnd(16)}${p.state}`
    )
    return { output: [header, ...rows].join('\n') }
  }

  if (cmd === 'top') {
    if (ctx.processes.length === 0) return { output: 'No processes running.' }
    const header = 'PID   NAME            STATE       CPU%   MEM(MB)  VRUNTIME'
    const rows = ctx.processes.map(
      (p) =>
        `${String(p.pid).padEnd(6)}${p.name.padEnd(16)}${p.state.padEnd(12)}${String(
          p.cpu
        ).padEnd(7)}${String(p.memory).padEnd(9)}${p.vruntime.toFixed(1)}`
    )
    return { output: [header, ...rows].join('\n') }
  }

  if (cmd === 'kill') {
    const pid = parseInt(args[0], 10)
    if (!pid) return { output: 'kill: usage: kill <PID>' }
    const exists = ctx.processes.find((p) => p.pid === pid)
    if (!exists) return { output: `kill: (${pid}): No such process` }
    if (exists.state === 'Terminated' || exists.state === 'Killed')
      return { output: `kill: (${pid}): process already ended` }
    return { output: `Process ${pid} killed.`, killPid: pid }
  }

  if (cmd.startsWith('./')) {
    const progName = cmd.slice(2)
    const background = args.includes('&')
    if (!isKnownProgram(progName)) {
      return { output: `bash: ${cmd}: No such file or directory` }
    }
    if (!background) {
      return { output: `${cmd}: run with '&' to launch in background, e.g. ${cmd} &` }
    }
    return { output: `[started] ${progName}`, spawn: progName }
  }

  return { output: `${cmd}: command not found. Type 'help' for a list of commands.` }
}
