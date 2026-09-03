import React, { useEffect, useRef, useState } from 'react'
import {
  createInitialFS,
  DEFAULT_CWD,
  pathString,
  executeCommand,
  createProcess,
  stepScheduler,
  killProcess,
} from '../logic/sandbox.js'
import { logCommand, logProcess, updateProgress, getProgress } from '../database.js'
import { COMMAND_CATALOG } from '../logic/commandCatalog.js'

const STATE_BADGE = {
  New: 'badge-dim',
  Ready: 'badge-cyan',
  Running: 'badge-green',
  Sleeping: 'badge-amber',
  Terminated: 'badge-dim',
  Killed: 'badge-red',
}

export default function Sandbox({ user }) {
  const [fs, setFs] = useState(() => createInitialFS())
  const [cwd, setCwd] = useState(DEFAULT_CWD)
  const [history, setHistory] = useState([
    { type: 'output', text: "Welcome to LinuxXplore Sandbox. Type 'help' to get started." },
  ])
  const [input, setInput] = useState('')
  const [catalogOpen, setCatalogOpen] = useState(false)
  const [catalogFilter, setCatalogFilter] = useState('All')
  const [selectedCommand, setSelectedCommand] = useState(COMMAND_CATALOG[0])
  const [processes, setProcesses] = useState([])
  const [nextPid, setNextPid] = useState(1001)
  const [timeline, setTimeline] = useState([])
  const [lastEvent, setLastEvent] = useState('No processes running yet. Try: ./cpu_intense &')
  const [tick, setTick] = useState(0)
  const sessionCounted = useRef(false)
  const scrollRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (!sessionCounted.current) {
      sessionCounted.current = true
      const p = getProgress(user.id)
      updateProgress(user.id, { sandboxSessions: (p.sandboxSessions || 0) + 1 })
    }
  }, [user.id])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [history])

  // Scheduler tick loop — runs while any process is Ready/Running/Sleeping/New
  useEffect(() => {
    const hasLive = processes.some((p) =>
      ['New', 'Ready', 'Running', 'Sleeping'].includes(p.state)
    )
    if (!hasLive) return
    const timer = setTimeout(() => {
      const { processes: updated, event, ganttEntry } = stepScheduler(processes)
      setProcesses(updated)
      setLastEvent(event)
      if (ganttEntry) {
        setTimeline((t) => [...t.slice(-29), { ...ganttEntry, tick }])
      }
      setTick((t) => t + 1)
      // log any newly terminated processes
      updated.forEach((p) => {
        if (p.state === 'Terminated' && p.terminatedAt) {
          const prevProc = processes.find((q) => q.pid === p.pid)
          if (prevProc && prevProc.state !== 'Terminated') {
            logProcess(user.id, {
              pid: p.pid,
              name: p.name,
              algorithm: p.algorithm,
              createdAt: p.createdAt,
              terminatedAt: p.terminatedAt,
              state: 'Terminated',
            })
          }
        }
      })
    }, 900)
    return () => clearTimeout(timer)
  }, [processes, tick, user.id])

  function pushLine(type, text) {
    setHistory((h) => [...h, { type, text }])
  }

  function handleSpawn(progName) {
    const pid = nextPid
    setNextPid((n) => n + 1)
    const proc = createProcess(progName, pid)
    setProcesses((procs) => [...procs, proc])
    logProcess(user.id, { pid, name: progName, algorithm: 'CFS', createdAt: Date.now(), state: 'New' })
    const p = getProgress(user.id)
    updateProgress(user.id, { processesCreated: (p.processesCreated || 0) + 1 })
  }

  function handleKill(pid) {
    setProcesses((procs) => killProcess(procs, pid))
    pushLine('output', `Process ${pid} killed.`)
    logProcess(user.id, { pid, name: '', algorithm: 'CFS', createdAt: Date.now(), terminatedAt: Date.now(), state: 'Killed' })
  }

  function runCommand(raw) {
    if (!raw.trim()) return
    pushLine('prompt', `${pathString(cwd)} $ ${raw}`)
    logCommand(user.id, raw)

    const ctx = { fs, cwd, processes, username: 'student' }
    const result = executeCommand(raw, ctx)

    if (result.clear) {
      setHistory([])
      return
    }
    if (result.newCwd) setCwd(result.newCwd)
    if (result.fsChanged) setFs({ ...fs })
    if (result.killPid) {
      setProcesses((procs) => killProcess(procs, result.killPid))
    }
    if (result.spawn) {
      handleSpawn(result.spawn)
    }
    if (result.output) {
      pushLine(result.output.startsWith('bash:') || result.output.includes('No such') ? 'error' : 'output', result.output)
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    runCommand(input)
    setInput('')
  }

  const alive = processes.filter((p) => p.state !== 'Terminated' && p.state !== 'Killed')
  const totalContextSwitches = processes.reduce((a, p) => a + p.contextSwitches, 0)
  const totalCpu = alive.reduce((a, p) => a + p.cpu, 0)
  const totalMem = alive.reduce((a, p) => a + p.memory, 0)
  const categories = ['All', ...new Set(COMMAND_CATALOG.map((item) => item.category))]
  const visibleCommands = COMMAND_CATALOG.filter((item) => catalogFilter === 'All' || item.category === catalogFilter)

  return (
    <div>
      <div className="page-header">
        <h1>Linux Sandbox</h1>
        <p>A simulated terminal with a virtual filesystem and a live simplified-CFS scheduler.</p>
        <button className="btn btn-sm" style={{ marginTop: 12 }} onClick={() => setCatalogOpen((open) => !open)}>
          {catalogOpen ? 'Hide command catalog' : 'Browse command catalog'}
        </button>
      </div>

      {catalogOpen && (
        <div className="card command-catalog" style={{ marginBottom: 16 }}>
          <div className="flex-between catalog-heading">
            <div>
              <h3 className="section-title" style={{ marginBottom: 4 }}>Command Catalog</h3>
              <p className="small muted">Study a command, load its example, then run it in the simulated terminal.</p>
            </div>
            <div className="btn-group">
              {categories.map((category) => (
                <button key={category} className={`btn btn-sm ${catalogFilter === category ? 'btn-primary' : ''}`} onClick={() => setCatalogFilter(category)}>
                  {category}
                </button>
              ))}
            </div>
          </div>
          <div className="catalog-grid">
            <div className="catalog-list">
              {visibleCommands.map((item) => (
                <button key={item.command} className={`catalog-item ${selectedCommand.command === item.command ? 'active' : ''}`} onClick={() => setSelectedCommand(item)}>
                  <strong>{item.command}</strong>
                  <span>{item.purpose}</span>
                </button>
              ))}
            </div>
            <div className="catalog-detail">
              <span className="badge badge-cyan">{selectedCommand.category}</span>
              <h3>{selectedCommand.command}</h3>
              <p>{selectedCommand.purpose}</p>
              <p className="small muted"><strong>Syntax:</strong> <span className="mono">{selectedCommand.syntax}</span></p>
              <div className="catalog-example mono">$ {selectedCommand.example}</div>
              <p className="small muted"><strong>Expected output:</strong> {selectedCommand.output}</p>
              <button className="btn btn-primary btn-sm" onClick={() => { setInput(selectedCommand.example); setCatalogOpen(false); inputRef.current?.focus() }}>
                Load example into terminal
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-2">
        <div className="card">
          <h3 className="section-title">Terminal</h3>
          <div className="terminal" ref={scrollRef}>
            {history.map((line, i) => (
              <div
                key={i}
                className={`terminal-line ${
                  line.type === 'prompt' ? 'terminal-prompt' : line.type === 'error' ? 'terminal-error' : 'terminal-output'
                }`}
              >
                {line.text}
              </div>
            ))}
          </div>
          <form onSubmit={handleSubmit} className="terminal-input-row">
            <span className="prompt-label">{pathString(cwd)} $</span>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              autoFocus
              spellCheck={false}
              placeholder="type a command… try: help"
            />
          </form>
          <div className="btn-group" style={{ marginTop: 10 }}>
            <button className="btn btn-sm" onClick={() => runCommand('./cpu_intense &')}>
              ./cpu_intense &amp;
            </button>
            <button className="btn btn-sm" onClick={() => runCommand('./io_bound &')}>
              ./io_bound &amp;
            </button>
            <button className="btn btn-sm" onClick={() => runCommand('./memory_test &')}>
              ./memory_test &amp;
            </button>
            <button className="btn btn-sm" onClick={() => runCommand('ps')}>
              ps
            </button>
            <button className="btn btn-sm" onClick={() => runCommand('top')}>
              top
            </button>
          </div>
        </div>

        <div className="card">
          <h3 className="section-title">Process table</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>PID</th>
                  <th>Name</th>
                  <th>State</th>
                  <th>CPU%</th>
                  <th>Mem</th>
                  <th>VRuntime</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {processes.length === 0 && (
                  <tr>
                    <td colSpan="7" className="muted">
                      No processes yet — spawn one from the terminal.
                    </td>
                  </tr>
                )}
                {processes.map((p) => (
                  <tr key={p.pid}>
                    <td className="mono">{p.pid}</td>
                    <td>{p.name}</td>
                    <td>
                      <span className={`badge ${STATE_BADGE[p.state]}`}>{p.state}</span>
                    </td>
                    <td>{p.cpu}%</td>
                    <td>{p.memory}MB</td>
                    <td className="mono">{p.vruntime.toFixed(1)}</td>
                    <td>
                      {p.state !== 'Terminated' && p.state !== 'Killed' && (
                        <button className="btn btn-sm btn-danger" onClick={() => handleKill(p.pid)}>
                          kill
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="grid grid-3" style={{ marginTop: 14 }}>
            <div className="stat-card">
              <div className="stat-value">{totalCpu}%</div>
              <div className="stat-label">Total CPU</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{totalMem}</div>
              <div className="stat-label">Total memory (MB)</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{totalContextSwitches}</div>
              <div className="stat-label">Context switches</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h3 className="section-title">Execution timeline</h3>
        {timeline.length === 0 ? (
          <p className="muted small">No scheduling activity yet.</p>
        ) : (
          <div className="gantt-track" style={{ minHeight: 30 }}>
            {timeline.map((t, i) => (
              <div
                key={i}
                className="gantt-block"
                title={`PID ${t.pid} ran ${t.run} tick(s)`}
                style={{
                  flexBasis: `${100 / timeline.length}%`,
                  background: ['#39d67e', '#4ce0d2', '#e0b64c', '#e0554c', '#8a7ce0'][t.pid % 5],
                }}
              >
                {t.pid}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h3 className="section-title">What just happened?</h3>
        <p style={{ margin: 0 }}>{lastEvent}</p>
      </div>
    </div>
  )
}
