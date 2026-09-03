import React, { useMemo, useState } from 'react'
import {
  runScheduler,
  computeAverages,
  runPaging,
  randomReferenceString,
} from '../logic/algorithms.js'
import { updateProgress, getProgress } from '../database.js'
import {
  MemoryManagement,
  DeadlockSimulation,
  SchedulingModes,
  FileAllocationSimulation,
  DiskSchedulingSimulation,
  HybridSimulation,
} from './AdvancedLearning.jsx'
import MemoryManagementAdvanced, { FragmentationSimulation } from './AdvancedMemory.jsx'
import { EnhancedDiskScheduling, EnhancedHybrid } from './AdvancedDisk.jsx'

const GANTT_COLORS = ['#39d67e', '#4ce0d2', '#e0b64c', '#e0554c', '#8a7ce0', '#e08cc4', '#6fd6e0']

function colorFor(pid) {
  return GANTT_COLORS[pid % GANTT_COLORS.length]
}

function insertContextSwitches(gantt, overhead = 1) {
  const out = []
  let cursor = 0
  for (let i = 0; i < gantt.length; i++) {
    const block = gantt[i]
    const shifted = { ...block, start: cursor, end: cursor + (block.end - block.start) }
    out.push(shifted)
    cursor = shifted.end
    const next = gantt[i + 1]
    if (next && next.pid !== block.pid) {
      out.push({ pid: 'CS', name: 'context switch', start: cursor, end: cursor + overhead, cs: true })
      cursor += overhead
    }
  }
  return out
}

function Gantt({ gantt, reality }) {
  const displayGantt = reality ? insertContextSwitches(gantt) : gantt
  const totalEnd = displayGantt.length ? displayGantt[displayGantt.length - 1].end : 1
  return (
    <div className="gantt-row">
      <div className="gantt-label">{reality ? 'Reality' : 'Model'}</div>
      <div className="gantt-track">
        {displayGantt.map((b, i) => (
          <div
            key={i}
            className="gantt-block"
            title={b.cs ? 'context switch overhead' : `${b.name} (${b.start}-${b.end})`}
            style={{
              flexBasis: `${((b.end - b.start) / totalEnd) * 100}%`,
              background: b.cs ? '#3a4448' : colorFor(typeof b.pid === 'number' ? b.pid : 0),
              color: b.cs ? '#7c9691' : '#04140a',
            }}
          >
            {b.cs ? '' : `${b.name} ${b.start}-${b.end}`}
          </div>
        ))}
      </div>
    </div>
  )
}

function MetricsTable({ metrics }) {
  const avg = computeAverages(metrics)
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>PID</th>
            <th>Name</th>
            <th>Arrival</th>
            <th>Burst</th>
            <th>Completion</th>
            <th>Turnaround</th>
            <th>Waiting</th>
          </tr>
        </thead>
        <tbody>
          {metrics.map((m) => (
            <tr key={m.pid}>
              <td>{m.pid}</td>
              <td>{m.name}</td>
              <td>{m.arrival}</td>
              <td>{m.burst}</td>
              <td>{m.completion}</td>
              <td>{m.turnaround}</td>
              <td>{m.waiting}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="small muted" style={{ marginTop: 8 }}>
        Avg waiting: {avg.avgWaiting} · Avg turnaround: {avg.avgTurnaround} · Avg completion:{' '}
        {avg.avgCompletion}
      </div>
    </div>
  )
}

const DEFAULT_PROCESSES = [
  { pid: 1, name: 'P1', arrival: 0, burst: 6, priority: 1 },
  { pid: 2, name: 'P2', arrival: 1, burst: 3, priority: 2 },
  { pid: 3, name: 'P3', arrival: 2, burst: 8, priority: 1 },
  { pid: 4, name: 'P4', arrival: 3, burst: 4, priority: 3 },
]

function ProcessEditor({ processes, setProcesses }) {
  function updateField(idx, field, value) {
    const copy = processes.map((p) => ({ ...p }))
    copy[idx][field] = field === 'name' ? value : Number(value) || 0
    setProcesses(copy)
  }
  function addProcess() {
    const nextPid = Math.max(0, ...processes.map((p) => p.pid)) + 1
    setProcesses([
      ...processes,
      { pid: nextPid, name: `P${nextPid}`, arrival: 0, burst: 4, priority: 1 },
    ])
  }
  function removeProcess(idx) {
    setProcesses(processes.filter((_, i) => i !== idx))
  }
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Arrival</th>
            <th>Burst</th>
            <th>Priority</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {processes.map((p, idx) => (
            <tr key={p.pid}>
              <td>
                <input
                  style={{ width: 60 }}
                  value={p.name}
                  onChange={(e) => updateField(idx, 'name', e.target.value)}
                />
              </td>
              <td>
                <input
                  type="number"
                  style={{ width: 55 }}
                  value={p.arrival}
                  onChange={(e) => updateField(idx, 'arrival', e.target.value)}
                />
              </td>
              <td>
                <input
                  type="number"
                  style={{ width: 55 }}
                  value={p.burst}
                  onChange={(e) => updateField(idx, 'burst', e.target.value)}
                />
              </td>
              <td>
                <input
                  type="number"
                  style={{ width: 55 }}
                  value={p.priority}
                  onChange={(e) => updateField(idx, 'priority', e.target.value)}
                />
              </td>
              <td>
                <button className="btn btn-sm btn-danger" onClick={() => removeProcess(idx)}>
                  ✕
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button className="btn btn-sm" style={{ marginTop: 10 }} onClick={addProcess}>
        + Add process
      </button>
    </div>
  )
}

function SchedulingTab({ user }) {
  const [processes, setProcesses] = useState(DEFAULT_PROCESSES)
  const [algorithm, setAlgorithm] = useState('FCFS')
  const [quantum, setQuantum] = useState(2)
  const [view, setView] = useState('model')

  const result = useMemo(() => {
    if (processes.length === 0) return { gantt: [], metrics: [] }
    return runScheduler(algorithm, processes, { quantum, slice: 2 })
  }, [processes, algorithm, quantum])

  function markComplete() {
    const p = getProgress(user.id)
    updateProgress(user.id, { scheduling: Math.max(p.scheduling || 0, 60) })
  }

  return (
    <div>
      <div className="grid grid-2">
        <div className="card">
          <h3 className="section-title">Processes</h3>
          <ProcessEditor processes={processes} setProcesses={setProcesses} />
        </div>
        <div className="card">
          <h3 className="section-title">Algorithm</h3>
          <div className="field">
            <label>Scheduling algorithm</label>
            <select value={algorithm} onChange={(e) => { setAlgorithm(e.target.value); markComplete() }}>
              <option value="FCFS">FCFS — First Come First Served</option>
              <option value="SJF">SJF — Shortest Job First</option>
              <option value="RR">Round Robin</option>
              <option value="CFS">Simplified CFS</option>
            </select>
          </div>
          {algorithm === 'RR' && (
            <div className="field">
              <label>Time quantum</label>
              <input type="number" min="1" value={quantum} onChange={(e) => setQuantum(Number(e.target.value) || 1)} />
            </div>
          )}
          <div className="field">
            <label>View</label>
            <div className="btn-group">
              <button className={`btn btn-sm ${view === 'model' ? 'btn-primary' : ''}`} onClick={() => setView('model')}>
                Model View
              </button>
              <button className={`btn btn-sm ${view === 'reality' ? 'btn-primary' : ''}`} onClick={() => setView('reality')}>
                Reality View
              </button>
            </div>
          </div>
          <p className="small muted">
            {view === 'model'
              ? 'Model View shows the idealized textbook timeline with zero-cost switching.'
              : 'Reality View adds context-switch overhead between different processes, like a real OS scheduler.'}
          </p>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h3 className="section-title">Gantt chart</h3>
        {result.gantt.length ? <Gantt gantt={result.gantt} reality={view === 'reality'} /> : <p className="muted">Add at least one process.</p>}
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h3 className="section-title">Metrics</h3>
        {result.metrics.length ? <MetricsTable metrics={result.metrics} /> : <p className="muted">No data yet.</p>}
      </div>
    </div>
  )
}

function PagingTab({ user }) {
  const [refString, setRefString] = useState('1,2,3,4,1,2,5,1,2,3,4,5')
  const [frames, setFrames] = useState(3)
  const [algorithm, setAlgorithm] = useState('FIFO')
  const [kernelInterference, setKernelInterference] = useState(false)

  const parsedRef = useMemo(() => {
    const arr = refString
      .split(',')
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n))
    if (kernelInterference && arr.length > 0) {
      // simulate occasional OS/kernel interference injecting an unrelated page access
      const withInterference = []
      arr.forEach((p) => {
        withInterference.push(p)
        if (Math.random() < 0.15) {
          withInterference.push(100 + Math.floor(Math.random() * 5)) // kernel page
        }
      })
      return withInterference
    }
    return arr
  }, [refString, kernelInterference])

  const result = useMemo(() => {
    if (parsedRef.length === 0) return { events: [], hits: 0, faults: 0, faultRate: 0 }
    return runPaging(algorithm, parsedRef, frames)
  }, [parsedRef, frames, algorithm])

  function randomize() {
    setRefString(randomReferenceString(12, 6).join(','))
  }

  function markComplete() {
    const p = getProgress(user.id)
    updateProgress(user.id, { paging: Math.max(p.paging || 0, 60) })
  }

  return (
    <div>
      <div className="grid grid-2">
        <div className="card">
          <h3 className="section-title">Reference string & frames</h3>
          <div className="field">
            <label>Page reference string (comma separated)</label>
            <input value={refString} onChange={(e) => { setRefString(e.target.value); markComplete() }} />
          </div>
          <div className="inline-fields">
            <div className="field">
              <label>Frames (1–10)</label>
              <input
                type="number"
                min="1"
                max="10"
                value={frames}
                onChange={(e) => setFrames(Math.max(1, Math.min(10, Number(e.target.value) || 1)))}
              />
            </div>
            <div className="field">
              <label>Algorithm</label>
              <select value={algorithm} onChange={(e) => setAlgorithm(e.target.value)}>
                <option value="FIFO">FIFO</option>
                <option value="LRU">LRU</option>
              </select>
            </div>
          </div>
          <div className="btn-group">
            <button className="btn btn-sm" onClick={randomize}>
              Randomize string
            </button>
            <label className="small" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input
                type="checkbox"
                checked={kernelInterference}
                onChange={(e) => setKernelInterference(e.target.checked)}
              />
              Simulate kernel interference
            </label>
          </div>
        </div>
        <div className="card">
          <h3 className="section-title">Result summary</h3>
          <div className="grid grid-2">
            <div className="stat-card">
              <div className="stat-value">{result.hits}</div>
              <div className="stat-label">Page hits</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{result.faults}</div>
              <div className="stat-label">Page faults</div>
            </div>
          </div>
          <p className="small muted" style={{ marginTop: 12 }}>
            Fault rate: {result.faultRate}%{kernelInterference ? ' — includes simulated kernel page interference.' : ''}
          </p>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h3 className="section-title">Frame timeline</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Step</th>
                <th>Page</th>
                <th>Frames</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              {result.events.map((ev, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>{ev.page}</td>
                  <td className="mono">{ev.frames.join(', ')}</td>
                  <td>
                    <span className={`badge ${ev.hit ? 'badge-green' : 'badge-red'}`}>
                      {ev.hit ? 'HIT' : 'FAULT'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function RaceTab({ user }) {
  const [processes, setProcesses] = useState(DEFAULT_PROCESSES)
  const [quantum, setQuantum] = useState(2)
  const algorithms = ['FCFS', 'SJF', 'RR', 'CFS']

  const results = useMemo(() => {
    if (processes.length === 0) return {}
    const out = {}
    for (const algo of algorithms) {
      out[algo] = runScheduler(algo, processes, { quantum, slice: 2 })
    }
    return out
  }, [processes, quantum])

  function markComplete() {
    const p = getProgress(user.id)
    updateProgress(user.id, { race: Math.max(p.race || 0, 60) })
  }

  return (
    <div>
      <div className="card">
        <h3 className="section-title">Workload</h3>
        <ProcessEditor processes={processes} setProcesses={setProcesses} />
        <div className="field" style={{ maxWidth: 200, marginTop: 12 }}>
          <label>RR quantum</label>
          <input type="number" min="1" value={quantum} onChange={(e) => { setQuantum(Number(e.target.value) || 1); markComplete() }} />
        </div>
      </div>

      {algorithms.map((algo) => {
        const r = results[algo]
        if (!r) return null
        const avg = computeAverages(r.metrics)
        return (
          <div className="card" key={algo} style={{ marginTop: 16 }}>
            <div className="flex-between">
              <h3 className="section-title" style={{ margin: 0 }}>{algo}</h3>
              <span className="small muted">
                avg waiting {avg.avgWaiting} · avg turnaround {avg.avgTurnaround}
              </span>
            </div>
            <div style={{ marginTop: 10 }}>
              <Gantt gantt={r.gantt} reality={false} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function Learning({ user }) {
  const [tab, setTab] = useState('scheduling')
  return (
    <div>
      <div className="page-header">
        <h1>Learning Modules</h1>
        <p>Interactive simulators for CPU scheduling, memory paging, and algorithm comparison.</p>
      </div>
      <div className="tabs">
        <button className={`tab ${tab === 'scheduling' ? 'active' : ''}`} onClick={() => setTab('scheduling')}>
          Scheduling
        </button>
        <button className={`tab ${tab === 'paging' ? 'active' : ''}`} onClick={() => setTab('paging')}>
          Memory & Paging
        </button>
        <button className={`tab ${tab === 'race' ? 'active' : ''}`} onClick={() => setTab('race')}>
          Algorithm Race
        </button>
        <button className={`tab ${tab === 'memory' ? 'active' : ''}`} onClick={() => setTab('memory')}>
          MMU / Memory
        </button>
        <button className={`tab ${tab === 'fragmentation' ? 'active' : ''}`} onClick={() => setTab('fragmentation')}>
          Fragmentation Lab
        </button>
        <button className={`tab ${tab === 'deadlock' ? 'active' : ''}`} onClick={() => setTab('deadlock')}>
          Deadlocks
        </button>
        <button className={`tab ${tab === 'modes' ? 'active' : ''}`} onClick={() => setTab('modes')}>
          Scheduling Modes
        </button>
        <button className={`tab ${tab === 'files' ? 'active' : ''}`} onClick={() => setTab('files')}>
          File Allocation
        </button>
        <button className={`tab ${tab === 'disk' ? 'active' : ''}`} onClick={() => setTab('disk')}>
          Disk Scheduling
        </button>
        <button className={`tab ${tab === 'hybrid' ? 'active' : ''}`} onClick={() => setTab('hybrid')}>
          Hybrid System
        </button>
      </div>
      {tab === 'scheduling' && <SchedulingTab user={user} />}
      {tab === 'paging' && <PagingTab user={user} />}
      {tab === 'race' && <RaceTab user={user} />}
      {tab === 'memory' && <MemoryManagementAdvanced user={user} />}
      {tab === 'fragmentation' && <FragmentationSimulation user={user} />}
      {tab === 'deadlock' && <DeadlockSimulation user={user} />}
      {tab === 'modes' && <SchedulingModes user={user} />}
      {tab === 'files' && <FileAllocationSimulation user={user} />}
      {tab === 'disk' && <EnhancedDiskScheduling user={user} />}
      {tab === 'hybrid' && <EnhancedHybrid user={user} />}
    </div>
  )
}
