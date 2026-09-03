// Interactive OS learning algorithms used by AdvancedLearning.jsx.

export function allocateContiguous(blocks, request, algorithm) {
  const candidates = blocks.map((size, index) => ({ index, size })).filter((b) => sizeEnough(b.size, request))
  if (!candidates.length) return { blocks, selected: -1, message: `No free block can hold ${request} units.` }
  let selected = candidates[0]
  if (algorithm === 'Best Fit') selected = candidates.reduce((a, b) => (b.size < a.size ? b : a))
  if (algorithm === 'Worst Fit') selected = candidates.reduce((a, b) => (b.size > a.size ? b : a))
  const next = blocks.map((size, index) => (index === selected.index ? size - request : size))
  return { blocks: next, selected: selected.index, message: `${algorithm} selected block ${selected.index + 1}.` }
}

function sizeEnough(size, request) {
  return size >= request
}

export function contiguousFragmentation(blocks, requests) {
  const free = blocks.reduce((sum, block) => sum + block, 0)
  const largest = blocks.length ? Math.max(...blocks) : 0
  const allocated = requests.reduce((sum, request) => sum + request, 0)
  return {
    free,
    largest,
    external: Math.max(0, free - largest),
    internal: Math.max(0, allocated - requests.filter(Boolean).reduce((sum, request) => sum + request, 0)),
  }
}

export function allocateNonContiguous(blocks, request) {
  let remaining = request
  const allocation = blocks.map((block, index) => {
    const used = Math.min(block, remaining)
    remaining -= used
    return { index, used, free: block - used }
  })
  return { allocation, remaining, complete: remaining === 0 }
}

export function fixedPartitionAllocation(partitions, requests) {
  const remaining = partitions.map((size) => ({ size, process: null }))
  const assignments = []
  requests.forEach((request) => {
    const index = remaining.findIndex((partition) => !partition.process && partition.size >= request.size)
    if (index === -1) assignments.push({ ...request, partition: -1, internal: 0 })
    else {
      remaining[index].process = request.name
      assignments.push({ ...request, partition: index, internal: remaining[index].size - request.size })
    }
  })
  return { partitions: remaining, assignments, internal: assignments.reduce((sum, item) => sum + item.internal, 0), external: remaining.filter((item) => !item.process).reduce((sum, item) => sum + item.size, 0) }
}

export function variablePartitionAllocation(holes, requests) {
  const regions = holes.map((size, index) => ({ id: `H${index + 1}`, size, process: null }))
  const assignments = []
  requests.forEach((request) => {
    const index = regions.findIndex((region) => !region.process && region.size >= request.size)
    if (index === -1) assignments.push({ ...request, region: -1 })
    else {
      const region = regions[index]
      region.process = request.name
      assignments.push({ ...request, region: index, leftover: region.size - request.size })
    }
  })
  return { regions, assignments, external: regions.filter((region) => !region.process).reduce((sum, region) => sum + region.size, 0) }
}

export function pagingAddressTranslation(pages, pageSize, references) {
  return references.map((logical) => {
    const page = Math.floor(logical / pageSize)
    const offset = logical % pageSize
    const frame = pages[page]
    return { logical, page, offset, frame: frame === undefined ? null : frame, physical: frame === undefined ? null : frame * pageSize + offset }
  })
}

export function segmentationTranslation(segments, references) {
  return references.map(({ segment, offset }) => {
    const entry = segments[segment]
    const valid = Boolean(entry) && offset >= 0 && offset < entry.limit
    return { segment, offset, base: entry?.base ?? null, limit: entry?.limit ?? null, physical: valid ? entry.base + offset : null, valid }
  })
}

export function segmentedPagingTranslation(segmentTables, references, pageSize) {
  return references.map(({ segment, logical }) => {
    const page = Math.floor(logical / pageSize)
    const offset = logical % pageSize
    const table = segmentTables[segment] || []
    const frame = table[page]
    return { segment, logical, page, offset, frame: frame === undefined ? null : frame, physical: frame === undefined ? null : frame * pageSize + offset }
  })
}

export function bankerSafety(available, allocation, maximum) {
  const work = [...available]
  const finish = allocation.map(() => false)
  const need = maximum.map((row, i) => row.map((value, j) => value - allocation[i][j]))
  const sequence = []
  let changed = true
  while (changed) {
    changed = false
    for (let i = 0; i < allocation.length; i += 1) {
      if (finish[i] || need[i].some((value, j) => value > work[j])) continue
      for (let j = 0; j < work.length; j += 1) work[j] += allocation[i][j]
      finish[i] = true
      sequence.push(i)
      changed = true
    }
  }
  return { safe: finish.every(Boolean), sequence, need, work, finish }
}

export function scheduleAdvanced(processes, algorithm, mode, quantum = 2) {
  const input = processes.map((p) => ({ ...p, remaining: p.burst }))
  const gantt = []
  const completion = {}
  let time = 0
  const pending = () => input.filter((p) => p.remaining > 0 && p.arrival <= time)
  const push = (p, run) => {
    const last = gantt[gantt.length - 1]
    if (last && last.pid === p.pid && last.end === time) last.end += run
    else gantt.push({ pid: p.pid, name: p.name, start: time, end: time + run })
    time += run
    p.remaining -= run
    if (!p.remaining) completion[p.pid] = time
  }
  const preemptive = mode === 'Preemptive'
  if (algorithm === 'Round Robin') {
    const queue = []
    let cursor = 0
    const sorted = [...input].sort((a, b) => a.arrival - b.arrival || a.pid - b.pid)
    while (Object.keys(completion).length < input.length) {
      while (cursor < sorted.length && sorted[cursor].arrival <= time) queue.push(sorted[cursor++])
      if (!queue.length) { time = sorted[cursor].arrival; continue }
      const p = queue.shift()
      const run = Math.min(quantum, p.remaining)
      push(p, run)
      while (cursor < sorted.length && sorted[cursor].arrival <= time) queue.push(sorted[cursor++])
      if (p.remaining) queue.push(p)
    }
  } else {
    while (Object.keys(completion).length < input.length) {
      const available = pending().filter((p) => !completion[p.pid])
      if (!available.length) { time = Math.min(...input.filter((p) => !completion[p.pid]).map((p) => p.arrival)); continue }
      let chosen = available[0]
      if (algorithm === 'SJF') chosen = available.reduce((a, b) => (b.remaining < a.remaining ? b : a))
      if (algorithm === 'Priority') chosen = available.reduce((a, b) => (b.priority < a.priority ? b : a))
      const run = preemptive ? 1 : chosen.remaining
      push(chosen, run)
    }
  }
  const metrics = processes.map((p) => {
    const completionTime = completion[p.pid] || time
    const turnaround = completionTime - p.arrival
    return { ...p, completion: completionTime, turnaround, waiting: Math.max(0, turnaround - p.burst), response: Math.max(0, (gantt.find((g) => g.pid === p.pid)?.start || p.arrival) - p.arrival) }
  })
  return { gantt, metrics }
}

export function fileAllocation(type, fileBlocks, diskSize) {
  const used = Array(diskSize).fill(null)
  if (type === 'Contiguous') {
    const start = 2
    fileBlocks.forEach((block, offset) => { if (start + offset < diskSize) used[start + offset] = block })
  } else if (type === 'Linked') {
    fileBlocks.forEach((block, index) => { const position = 2 + index * 3; if (position < diskSize) used[position] = block })
  } else {
    used[2] = 'INDEX'
    fileBlocks.forEach((block, index) => { const position = 4 + index * 2; if (position < diskSize) used[position] = block })
  }
  return used
}

export function diskSchedule(requests, head, algorithm, direction = 'right', diskSize = 200) {
  const pending = [...requests]
  const left = pending.filter((r) => r < head).sort((a, b) => b - a)
  const right = pending.filter((r) => r >= head).sort((a, b) => a - b)
  let sequence = []
  if (algorithm === 'FCFS') sequence = pending
  if (algorithm === 'SSTF') {
    let current = head
    const rest = [...pending]
    while (rest.length) { const index = rest.reduce((best, value, i) => Math.abs(value - current) < Math.abs(rest[best] - current) ? i : best, 0); current = rest.splice(index, 1)[0]; sequence.push(current) }
  }
  if (algorithm === 'SCAN') sequence = direction === 'right' ? [...right, diskSize - 1, ...left] : [...left, 0, ...right]
  if (algorithm === 'C-SCAN') sequence = direction === 'right' ? [...right, diskSize - 1, 0, ...left.reverse()] : [...left, 0, diskSize - 1, ...right.reverse()]
  if (algorithm === 'LOOK') sequence = direction === 'right' ? [...right, ...left] : [...left, ...right]
  if (algorithm === 'C-LOOK') sequence = direction === 'right' ? [...right, ...left.reverse()] : [...left, ...right.reverse()]
  const path = [head, ...sequence]
  const movement = path.slice(1).map((value, index) => ({ from: path[index], to: value, distance: Math.abs(value - path[index]) }))
  return { sequence, path, movement, total: movement.reduce((sum, item) => sum + item.distance, 0) }
}

export function hybridSimulation(fileType, diskAlgorithm, requests, head) {
  const blocks = fileAllocation(fileType, ['F1', 'F2', 'F3', 'F4', 'F5', 'F6'], 40)
  const allocated = blocks.map((value, index) => value ? index : null).filter((value) => value !== null)
  const disk = diskSchedule([...new Set([...requests, ...allocated])], head, diskAlgorithm, 'right', 40)
  return { blocks, allocated, disk }
}
