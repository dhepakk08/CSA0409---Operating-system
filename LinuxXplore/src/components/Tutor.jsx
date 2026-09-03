import React, { useRef, useState, useEffect } from 'react'

const KNOWLEDGE_BASE = [
  {
    keywords: ['cfs', 'completely fair'],
    answer:
      'CFS (Completely Fair Scheduler) is Linux\u2019s default CPU scheduler. It tracks each process\u2019s "virtual runtime" and always picks the process with the smallest virtual runtime to run next, keeping CPU time fair across all processes.',
  },
  {
    keywords: ['round robin', 'rr', 'quantum'],
    answer:
      'Round Robin gives each process a fixed time slice (quantum). When the quantum expires, the process is preempted and moved to the back of the ready queue, and the next process runs. It\u2019s simple and fair for interactive workloads.',
  },
  {
    keywords: ['fcfs', 'first come first served', 'first-come'],
    answer:
      'FCFS (First Come First Served) runs processes strictly in the order they arrive, with no preemption. It\u2019s simple but can cause the "convoy effect" where short processes wait behind long ones.',
  },
  {
    keywords: ['sjf', 'shortest job'],
    answer:
      'SJF (Shortest Job First) always runs the process with the smallest burst time next. It minimizes average waiting time but can starve longer processes if short jobs keep arriving.',
  },
  {
    keywords: ['paging', 'page fault', 'page table'],
    answer:
      'Paging splits memory into fixed-size pages and frames. A page fault happens when a process accesses a page not currently loaded into a physical frame, forcing the OS to load it — possibly evicting another page first.',
  },
  {
    keywords: ['fifo'],
    answer:
      'FIFO page replacement evicts the oldest page in memory first, regardless of how often it\u2019s used. It\u2019s simple but can perform poorly if an old-but-frequently-used page gets evicted.',
  },
  {
    keywords: ['lru', 'least recently used'],
    answer:
      'LRU (Least Recently Used) evicts the page that hasn\u2019t been accessed for the longest time. It usually performs better than FIFO because it approximates which pages are actually "cold."',
  },
  {
    keywords: ['process', 'pid'],
    answer:
      'A process is a running instance of a program. Each process gets a unique PID (Process ID) and moves through states like New, Ready, Running, Sleeping (waiting on I/O), and Terminated as the OS schedules it.',
  },
  {
    keywords: ['context switch'],
    answer:
      'A context switch happens when the CPU stops running one process and starts running another. The OS saves the old process\u2019s state and loads the new one\u2019s — this has real overhead, which the Sandbox\u2019s "Reality View" visualizes.',
  },
  {
    keywords: ['filesystem', 'file system', 'directory', 'inode'],
    answer:
      'A Linux filesystem organizes files in a tree of directories starting at root (/). Everything — files, folders, devices — is represented as a path from that root. The Sandbox simulates this with an in-memory tree.',
  },
  {
    keywords: ['ls', 'cd', 'pwd', 'mkdir', 'cat', 'command', 'terminal', 'shell'],
    answer:
      'The Sandbox terminal supports common Linux commands: ls (list files), cd (change directory), pwd (show path), mkdir (make directory), cat (read file), ps/top (view processes), kill (end a process), and more. Type "help" in the Sandbox to see the full list.',
  },
  {
    keywords: ['starvation'],
    answer:
      'Starvation happens when a process never gets scheduled because other processes keep being prioritized ahead of it — a common risk with SJF or strict priority scheduling.',
  },
  {
    keywords: ['thrashing'],
    answer:
      'Thrashing happens when a system spends more time swapping pages in and out of memory than actually executing processes, usually because there isn\u2019t enough physical memory (frames) for the workload.',
  },
  {
    keywords: ['turnaround'],
    answer:
      'Turnaround time is the total time from when a process arrives to when it completes: completion time minus arrival time.',
  },
  {
    keywords: ['waiting time', 'waiting'],
    answer:
      'Waiting time is how long a process sits in the ready queue not running: turnaround time minus burst time.',
  },
  {
    keywords: ['burst'],
    answer:
      'Burst time is the amount of CPU time a process needs to complete its execution (excluding I/O wait).',
  },
  {
    keywords: ['virtual runtime', 'vruntime'],
    answer:
      'Virtual runtime (vruntime) is CFS\u2019s internal accounting of how much CPU time a process has effectively received. The scheduler always favors the process with the lowest vruntime, so it naturally balances out over time.',
  },
]

const FALLBACK =
  "I don't have a specific answer for that yet. Try asking about: scheduling (FCFS, SJF, Round Robin, CFS), paging (FIFO, LRU, page faults), processes, PIDs, context switching, or filesystem commands."

function findAnswer(question) {
  const q = question.toLowerCase()
  for (const entry of KNOWLEDGE_BASE) {
    if (entry.keywords.some((k) => q.includes(k))) {
      return entry.answer
    }
  }
  return FALLBACK
}

const SUGGESTIONS = [
  'What is CFS?',
  'Explain page faults',
  'What is a context switch?',
  'How does Round Robin work?',
]

export default function Tutor({ user }) {
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: "Hi! I'm the LinuxXplore Tutor. Ask me about scheduling, paging, processes, or filesystem commands.",
    },
  ])
  const [input, setInput] = useState('')
  const scrollRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages])

  function ask(text) {
    if (!text.trim()) return
    const answer = findAnswer(text)
    setMessages((m) => [...m, { role: 'user', text }, { role: 'bot', text: answer }])
    setInput('')
  }

  return (
    <div>
      <div className="page-header">
        <h1>Tutor</h1>
        <p>A simple keyword-based local tutor for Linux and OS concepts — no external AI involved.</p>
      </div>
      <div className="card">
        <div className="chat-window" ref={scrollRef}>
          {messages.map((m, i) => (
            <div key={i} className={`chat-bubble ${m.role}`}>
              {m.text}
            </div>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            ask(input)
          }}
          className="terminal-input-row"
          style={{ marginTop: 14 }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about scheduling, paging, processes…"
            style={{
              background: 'var(--bg-alt)',
              border: '1px solid var(--panel-border)',
              borderRadius: 'var(--radius)',
              padding: '9px 11px',
              color: 'var(--text)',
              fontFamily: 'var(--sans)',
            }}
          />
          <button className="btn btn-primary btn-sm" type="submit">
            Ask
          </button>
        </form>
        <div className="btn-group" style={{ marginTop: 12 }}>
          {SUGGESTIONS.map((s) => (
            <button key={s} className="btn btn-sm" onClick={() => ask(s)}>
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
