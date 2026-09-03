// algorithms.js
// Core CPU scheduling + memory paging algorithms.
// Shared by Learning.jsx (manual simulators) and Sandbox.jsx (live process scheduling).

// ---------------- CPU SCHEDULING ----------------
// Process shape (input): { pid, name, arrival, burst, priority }
// Output gantt: [{ pid, name, start, end }]
// Output metrics: [{ pid, name, arrival, burst, completion, turnaround, waiting }]

function cloneProcs(procs) {
  return procs.map((p) => ({ ...p, remaining: p.burst }))
}

function buildMetrics(procs, completionMap) {
  return procs.map((p) => {
    const completion = completionMap[p.pid]
    const turnaround = completion - p.arrival
    const waiting = turnaround - p.burst
    return {
      pid: p.pid,
      name: p.name,
      arrival: p.arrival,
      burst: p.burst,
      completion,
      turnaround,
      waiting: Math.max(0, waiting),
    }
  })
}

export function runFCFS(processes) {
  const procs = [...processes].sort((a, b) => a.arrival - b.arrival || a.pid - b.pid)
  let time = 0
  const gantt = []
  const completionMap = {}
  for (const p of procs) {
    const start = Math.max(time, p.arrival)
    const end = start + p.burst
    gantt.push({ pid: p.pid, name: p.name, start, end })
    completionMap[p.pid] = end
    time = end
  }
  return { gantt, metrics: buildMetrics(processes, completionMap) }
}

export function runSJF(processes) {
  const procs = cloneProcs(processes)
  const done = new Set()
  let time = 0
  const gantt = []
  const completionMap = {}
  const n = procs.length
  while (done.size < n) {
    const available = procs.filter((p) => !done.has(p.pid) && p.arrival <= time)
    if (available.length === 0) {
      const next = procs
        .filter((p) => !done.has(p.pid))
        .sort((a, b) => a.arrival - b.arrival)[0]
      time = next.arrival
      continue
    }
    available.sort((a, b) => a.burst - b.burst || a.arrival - b.arrival)
    const p = available[0]
    const start = time
    const end = start + p.burst
    gantt.push({ pid: p.pid, name: p.name, start, end })
    completionMap[p.pid] = end
    time = end
    done.add(p.pid)
  }
  return { gantt, metrics: buildMetrics(processes, completionMap) }
}

export function runRR(processes, quantum = 2) {
  const procs = cloneProcs(processes).sort((a, b) => a.arrival - b.arrival)
  const queue = []
  let time = 0
  const gantt = []
  const completionMap = {}
  let idx = 0
  const n = procs.length
  const arrived = () => {
    while (idx < n && procs[idx].arrival <= time) {
      queue.push(procs[idx])
      idx++
    }
  }
  if (n > 0) {
    time = procs[0].arrival
  }
  arrived()
  let guard = 0
  while (queue.length > 0 && guard < 100000) {
    guard++
    const p = queue.shift()
    const run = Math.min(quantum, p.remaining)
    const start = time
    const end = start + run
    gantt.push({ pid: p.pid, name: p.name, start, end })
    time = end
    p.remaining -= run
    arrived()
    if (p.remaining > 0) {
      queue.push(p)
    } else {
      completionMap[p.pid] = end
    }
    if (queue.length === 0 && idx < n) {
      time = procs[idx].arrival
      arrived()
    }
  }
  return { gantt, metrics: buildMetrics(processes, completionMap) }
}

// Simplified CFS: pick process with smallest virtual runtime among arrived,
// run it for a fixed slice (or remaining, whichever smaller), vruntime += slice/weight.
// weight derived from priority (1 = normal weight 1, higher priority number = lower weight/nice).
export function runCFS(processes, slice = 2) {
  const procs = cloneProcs(processes).map((p) => ({
    ...p,
    vruntime: 0,
    weight: p.priority ? 1 / p.priority : 1,
  }))
  let time = procs.length ? Math.min(...procs.map((p) => p.arrival)) : 0
  const gantt = []
  const completionMap = {}
  let remainingCount = procs.length
  let guard = 0
  while (remainingCount > 0 && guard < 100000) {
    guard++
    const available = procs.filter((p) => p.remaining > 0 && p.arrival <= time)
    if (available.length === 0) {
      const next = procs
        .filter((p) => p.remaining > 0)
        .sort((a, b) => a.arrival - b.arrival)[0]
      time = next.arrival
      continue
    }
    available.sort((a, b) => a.vruntime - b.vruntime || a.arrival - b.arrival)
    const p = available[0]
    const run = Math.min(slice, p.remaining)
    const start = time
    const end = start + run
    gantt.push({ pid: p.pid, name: p.name, start, end })
    time = end
    p.remaining -= run
    p.vruntime += run / p.weight
    if (p.remaining <= 0) {
      completionMap[p.pid] = end
      remainingCount--
    }
  }
  return { gantt, metrics: buildMetrics(processes, completionMap) }
}

export function runScheduler(algorithm, processes, options = {}) {
  switch (algorithm) {
    case 'FCFS':
      return runFCFS(processes)
    case 'SJF':
      return runSJF(processes)
    case 'RR':
      return runRR(processes, options.quantum || 2)
    case 'CFS':
      return runCFS(processes, options.slice || 2)
    default:
      return runFCFS(processes)
  }
}

export function computeAverages(metrics) {
  if (!metrics.length) return { avgWaiting: 0, avgTurnaround: 0, avgCompletion: 0 }
  const avgWaiting = metrics.reduce((a, m) => a + m.waiting, 0) / metrics.length
  const avgTurnaround = metrics.reduce((a, m) => a + m.turnaround, 0) / metrics.length
  const avgCompletion = metrics.reduce((a, m) => a + m.completion, 0) / metrics.length
  return {
    avgWaiting: round2(avgWaiting),
    avgTurnaround: round2(avgTurnaround),
    avgCompletion: round2(avgCompletion),
  }
}

function round2(n) {
  return Math.round(n * 100) / 100
}

// ---------------- MEMORY PAGING ----------------
// referenceString: array of page numbers (ints)
// frames: number of physical frames (1-10)
// Output: { events: [{page, frames: [...], hit: bool}], hits, faults, faultRate }

export function runFIFO(referenceString, frames) {
  const memory = []
  const events = []
  let hits = 0
  let faults = 0
  for (const page of referenceString) {
    if (memory.includes(page)) {
      hits++
      events.push({ page, frames: [...memory], hit: true })
    } else {
      faults++
      if (memory.length >= frames) {
        memory.shift()
      }
      memory.push(page)
      events.push({ page, frames: [...memory], hit: false })
    }
  }
  return { events, hits, faults, faultRate: round2((faults / referenceString.length) * 100) }
}

export function runLRU(referenceString, frames) {
  const memory = [] // most-recently-used at end
  const events = []
  let hits = 0
  let faults = 0
  for (const page of referenceString) {
    const pos = memory.indexOf(page)
    if (pos !== -1) {
      hits++
      memory.splice(pos, 1)
      memory.push(page)
      events.push({ page, frames: [...memory], hit: true })
    } else {
      faults++
      if (memory.length >= frames) {
        memory.shift() // evict least recently used (front)
      }
      memory.push(page)
      events.push({ page, frames: [...memory], hit: false })
    }
  }
  return { events, hits, faults, faultRate: round2((faults / referenceString.length) * 100) }
}

export function runPaging(algorithm, referenceString, frames) {
  return algorithm === 'LRU' ? runLRU(referenceString, frames) : runFIFO(referenceString, frames)
}

export function randomReferenceString(length = 12, maxPage = 6) {
  const arr = []
  for (let i = 0; i < length; i++) {
    arr.push(Math.floor(Math.random() * maxPage))
  }
  return arr
}

// ---------------- SANDBOX LIVE SCHEDULER (simplified CFS tick) ----------------
// Given a list of live process objects with { remaining, vruntime, weight, state },
// pick the next one to run for a tick and return its pid, mutating vruntime/remaining.

export function pickNextCFS(processes) {
  const runnable = processes.filter((p) => p.state === 'Ready' || p.state === 'Running')
  if (runnable.length === 0) return null
  runnable.sort((a, b) => a.vruntime - b.vruntime)
  return runnable[0]
}
