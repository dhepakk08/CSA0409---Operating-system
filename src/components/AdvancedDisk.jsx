import React, { useMemo, useState } from 'react'
import { diskSchedule, fileAllocation } from '../logic/advancedAlgorithms.js'

const parse = (value) => value.split(',').map((item) => Number(item.trim())).filter((item) => Number.isFinite(item))
const algorithms = ['FCFS', 'SSTF', 'SCAN', 'C-SCAN', 'LOOK', 'C-LOOK']

function MovementTrack({ path, max, step }) {
  const current = path[Math.min(step, path.length - 1)] || 0
  const completed = path.slice(0, Math.min(step + 1, path.length))
  return <div className="movement-panel"><div className="movement-axis"><span>0</span><span>{Math.round(max / 2)}</span><span>{max}</span></div><div className="movement-line">{completed.slice(1).map((position, index) => <div key={index} className="movement-leg" style={{ left: `${(completed[index] / max) * 100}%`, width: `${Math.abs(position - completed[index]) / max * 100}%`, transform: position < completed[index] ? 'scaleX(-1)' : undefined }} />)}<div className="movement-head" style={{ left: `${(current / max) * 100}%` }} /><div className="movement-current">{current}</div>{path.slice(1).map((position, index) => <div key={index} className={`movement-request ${index < step ? 'visited' : ''}`} style={{ left: `${(position / max) * 100}%` }} />)}</div></div>
}

function StepPlayback({ result, max }) {
  const [step, setStep] = useState(0)
  const movement = result.movement[Math.max(0, step - 1)]
  return <><MovementTrack path={result.path} max={max} step={step} /><div className="movement-status"><strong>{step === 0 ? `Head starts at track ${result.path[0]}.` : `Step ${step}: moved from ${movement.from} to ${movement.to}.`}</strong><span className="small muted">{step === result.path.length - 1 ? 'All requests served.' : `${result.path.length - 1 - step} requests remain.`}</span></div><div className="btn-group" style={{ marginTop: 14 }}><button className="btn btn-sm" disabled={step === 0} onClick={() => setStep(Math.max(0, step - 1))}>Previous movement</button><button className="btn btn-primary btn-sm" disabled={step >= result.path.length - 1} onClick={() => setStep(Math.min(result.path.length - 1, step + 1))}>Move head</button><button className="btn btn-sm" onClick={() => setStep(0)}>Reset playback</button></div></>
}

export function EnhancedDiskScheduling() {
  const [algorithm, setAlgorithm] = useState('FCFS')
  const [head, setHead] = useState(53)
  const [requests, setRequests] = useState('98,183,37,122,14,124,65,67')
  const [direction, setDirection] = useState('right')
  const result = useMemo(() => diskSchedule(parse(requests), head, algorithm, direction), [requests, head, algorithm, direction])
  return <div><div className="card"><div className="inline-fields"><div className="field"><label>Request queue</label><input value={requests} onChange={(event) => setRequests(event.target.value)} /></div><div className="field"><label>Initial head</label><input type="number" value={head} onChange={(event) => setHead(Math.max(0, Math.min(199, Number(event.target.value) || 0)))} /></div><div className="field"><label>Algorithm</label><select value={algorithm} onChange={(event) => setAlgorithm(event.target.value)}>{algorithms.map((item) => <option key={item}>{item}</option>)}</select></div></div><div className="btn-group"><button className={`btn btn-sm ${direction === 'left' ? 'btn-primary' : ''}`} onClick={() => setDirection('left')}>Initial direction: left</button><button className={`btn btn-sm ${direction === 'right' ? 'btn-primary' : ''}`} onClick={() => setDirection('right')}>Initial direction: right</button></div></div><div className="card" style={{ marginTop: 16 }}><div className="flex-between"><h3 className="section-title" style={{ margin: 0 }}>Animated head movement</h3><span className="badge badge-cyan">{algorithm}</span></div><StepPlayback result={result} max={200} /></div><div className="card" style={{ marginTop: 16 }}><h3 className="section-title">Seek analysis</h3><p className="mono">{result.path.join(' -> ')}</p><div className="grid grid-3"><div className="stat-card"><div className="stat-value">{result.total}</div><div className="stat-label">Total seek distance</div></div><div className="stat-card"><div className="stat-value">{result.sequence.length}</div><div className="stat-label">Requests served</div></div><div className="stat-card"><div className="stat-value">{result.sequence.length ? (result.total / result.sequence.length).toFixed(1) : 0}</div><div className="stat-label">Average seek</div></div></div><div className="table-wrap" style={{ marginTop: 14 }}><table><thead><tr><th>Step</th><th>From</th><th>To</th><th>Distance</th></tr></thead><tbody>{result.movement.map((item, index) => <tr key={index}><td>{index + 1}</td><td>{item.from}</td><td>{item.to}</td><td>{item.distance}</td></tr>)}</tbody></table></div></div></div>
}

export function EnhancedHybrid() {
  const [fileType, setFileType] = useState('Contiguous')
  const [algorithm, setAlgorithm] = useState('SSTF')
  const [head, setHead] = useState(10)
  const fileBlocks = useMemo(() => fileAllocation(fileType, ['F1', 'F2', 'F3', 'F4', 'F5', 'F6'], 40), [fileType])
  const allocated = fileBlocks.map((value, index) => value ? index : null).filter((value) => value !== null)
  const result = useMemo(() => diskSchedule(allocated, head, algorithm, 'right', 40), [allocated, head, algorithm])
  return <div><div className="card"><div className="inline-fields"><div className="field"><label>File allocation</label><select value={fileType} onChange={(event) => setFileType(event.target.value)}><option>Contiguous</option><option>Linked</option><option>Indexed</option></select></div><div className="field"><label>Disk scheduler</label><select value={algorithm} onChange={(event) => setAlgorithm(event.target.value)}>{algorithms.map((item) => <option key={item}>{item}</option>)}</select></div><div className="field"><label>Current head</label><input type="number" value={head} onChange={(event) => setHead(Math.max(0, Math.min(39, Number(event.target.value) || 0)))} /></div></div><p className="small muted">The file allocator produces physical blocks first. The disk scheduler then chooses the order in which those blocks are visited.</p></div><div className="card" style={{ marginTop: 16 }}><h3 className="section-title">Physical file placement</h3><div className="allocation-track">{fileBlocks.map((block, index) => <div key={index} className={`allocation-block ${block ? 'filled' : 'free'}`} style={{ flex: 1 }}>{block || index}</div>)}</div><p className="small muted">File blocks: {allocated.join(', ')}</p></div><div className="card" style={{ marginTop: 16 }}><h3 className="section-title">Playback: file blocks accessed by the disk</h3><StepPlayback result={result} max={40} /></div><div className="card" style={{ marginTop: 16 }}><h3 className="section-title">Subsystem relationship</h3><div className="timeline-list"><div className="timeline-item active">1. {fileType} allocation decides where file data is placed.</div><div className="timeline-item active">2. The disk queue contains those physical block locations.</div><div className="timeline-item active">3. {algorithm} chooses the next head movement and determines seek cost.</div></div></div></div>
}
