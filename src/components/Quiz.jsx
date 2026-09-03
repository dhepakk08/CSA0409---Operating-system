import React, { useState } from 'react'
import { saveQuizResult, getQuizResults } from '../database.js'

const QUIZZES = {
  scheduling: {
    title: 'CPU Scheduling',
    questions: [
      {
        q: 'Which scheduling algorithm can cause starvation of long processes?',
        options: ['FCFS', 'SJF (Shortest Job First)', 'Round Robin', 'None of these'],
        answer: 1,
        explain: 'SJF can starve long processes because shorter jobs keep getting prioritized ahead of them.',
      },
      {
        q: 'What does CFS stand for in Linux scheduling?',
        options: ['Central File System', 'Completely Fair Scheduler', 'Concurrent Fast Scheduler', 'Core Frequency Scaler'],
        answer: 1,
        explain: 'CFS = Completely Fair Scheduler, which aims to give each process a fair share of CPU time.',
      },
      {
        q: 'In Round Robin scheduling, what determines when a process is preempted?',
        options: ['Its priority', 'Its arrival time', 'The time quantum expiring', 'The process finishing I/O'],
        answer: 2,
        explain: 'Round Robin preempts a running process once its allotted time quantum (time slice) expires.',
      },
      {
        q: 'FCFS schedules processes based on:',
        options: ['Shortest burst time', 'Order of arrival', 'Priority number', 'Virtual runtime'],
        answer: 1,
        explain: 'FCFS (First Come First Served) runs processes strictly in the order they arrive.',
      },
      {
        q: 'In simplified CFS, which process is chosen to run next?',
        options: ['The one with the highest priority number', 'The one with the smallest virtual runtime', 'The one that arrived last', 'The one with the largest burst time'],
        answer: 1,
        explain: 'CFS always picks the runnable process with the smallest accumulated virtual runtime, keeping CPU time fair.',
      },
    ],
  },
  paging: {
    title: 'Memory & Paging',
    questions: [
      {
        q: 'What is a page fault?',
        options: [
          'When a page is found in memory',
          'When a requested page is not currently in a memory frame',
          'When the CPU crashes',
          'When a process finishes execution',
        ],
        answer: 1,
        explain: 'A page fault occurs when the requested page is not present in a physical frame and must be loaded.',
      },
      {
        q: 'FIFO page replacement evicts which page first?',
        options: ['The most recently used page', 'A random page', 'The oldest page loaded into memory', 'The largest page'],
        answer: 2,
        explain: 'FIFO (First In First Out) evicts the page that has been in memory the longest, regardless of usage.',
      },
      {
        q: 'LRU stands for:',
        options: ['Least Recently Used', 'Last Requested Unit', 'Longest Running Utility', 'Least Random Usage'],
        answer: 0,
        explain: 'LRU = Least Recently Used — it evicts the page that hasn\u2019t been accessed for the longest time.',
      },
      {
        q: 'Increasing the number of frames generally does what to the fault rate?',
        options: ['Always increases it', 'Has no effect', 'Generally decreases it', 'Immediately causes thrashing'],
        answer: 2,
        explain: 'With more frames available, more pages can stay resident in memory, generally reducing page faults.',
      },
    ],
  },
  race: {
    title: 'Algorithm Comparison',
    questions: [
      {
        q: 'Compared to FCFS, why might SJF give a lower average waiting time?',
        options: [
          'It runs jobs randomly',
          'Short jobs finish quickly, reducing the wait for the queue behind them',
          'It ignores arrival time',
          'It always runs the longest job first',
        ],
        answer: 1,
        explain: 'By running shorter jobs first, SJF minimizes the total time other processes wait behind long jobs.',
      },
      {
        q: 'Round Robin vs simplified CFS — what do they have in common?',
        options: [
          'Both guarantee zero context switches',
          'Both aim to share CPU time among processes rather than run one to completion',
          'Both are non-preemptive',
          'Both require exact burst time prediction',
        ],
        answer: 1,
        explain: 'Both RR and CFS are preemptive, time-sharing approaches designed to give every process a turn on the CPU.',
      },
    ],
  },
}

const DIFFICULTIES = ['All', 'Beginner', 'Intermediate', 'Advanced']

function questionDifficulty(index) {
  return DIFFICULTIES[(index % 3) + 1]
}

function buildQuestionBank() {
  return Object.entries(QUIZZES).flatMap(([topic, quiz]) =>
    quiz.questions.map((question, index) => ({ ...question, topic, difficulty: question.difficulty || questionDifficulty(index) }))
  )
}

function generateQuiz(topic, difficulty, count) {
  const available = buildQuestionBank().filter((question) => {
    const topicMatches = topic === 'All' || question.topic === topic
    const difficultyMatches = difficulty === 'All' || question.difficulty === difficulty
    return topicMatches && difficultyMatches
  })
  return [...available].sort(() => Math.random() - 0.5).slice(0, Math.max(1, Math.min(Number(count) || 1, available.length)))
}

function QuizBlock({ quizId, quiz, onFinish }) {
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState(null)
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)

  const q = quiz.questions[current]

  function choose(idx) {
    if (selected !== null) return
    setSelected(idx)
    if (idx === q.answer) setScore((s) => s + 1)
  }

  function next() {
    if (current + 1 < quiz.questions.length) {
      setCurrent((c) => c + 1)
      setSelected(null)
    } else {
      setDone(true)
      const finalScore = score + (selected === q.answer ? 1 : 0)
      onFinish(finalScore, quiz.questions.length)
    }
  }

  function retake() {
    setCurrent(0)
    setSelected(null)
    setScore(0)
    setDone(false)
  }

  if (done) {
    const pct = Math.round((score / quiz.questions.length) * 100)
    return (
      <div className="card">
        <h3 className="section-title">{quiz.title} — Result</h3>
        <div className="stat-value">{pct}%</div>
        <p className="muted">
          You scored {score} / {quiz.questions.length}.
        </p>
        <button className="btn btn-primary" onClick={retake}>
          Retake quiz
        </button>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="flex-between">
        <h3 className="section-title" style={{ margin: 0 }}>{quiz.title}</h3>
        <span className="small muted">
          Question {current + 1} / {quiz.questions.length}
        </span>
      </div>
      <p style={{ marginTop: 14 }}>{q.q}</p>
      {q.options.map((opt, idx) => {
        let cls = 'quiz-option'
        if (selected !== null) {
          cls += ' disabled'
          if (idx === q.answer) cls += ' correct'
          else if (idx === selected) cls += ' incorrect'
        }
        return (
          <button key={idx} className={cls} onClick={() => choose(idx)}>
            {opt}
          </button>
        )
      })}
      {selected !== null && (
        <div style={{ marginTop: 10 }}>
          <p className="small muted">{q.explain}</p>
          <button className="btn btn-primary btn-sm" onClick={next}>
            {current + 1 < quiz.questions.length ? 'Next question' : 'See result'}
          </button>
        </div>
      )}
    </div>
  )
}

export default function Quiz({ user }) {
  const [activeQuiz, setActiveQuiz] = useState('scheduling')
  const [topic, setTopic] = useState('scheduling')
  const [difficulty, setDifficulty] = useState('All')
  const [questionCount, setQuestionCount] = useState(5)
  const [generatedQuiz, setGeneratedQuiz] = useState(null)
  const [generationError, setGenerationError] = useState('')
  const [key, setKey] = useState(0) // forces remount to reset quiz state on switch
  const results = getQuizResults(user.id)

  function handleFinish(score, total) {
    const pct = Math.round((score / total) * 100)
    saveQuizResult(user.id, { quizId: generatedQuiz?.id || activeQuiz, topic, difficulty, score, total, pct })
  }

  function switchQuiz(id) {
    setActiveQuiz(id)
    setTopic(id)
    setGeneratedQuiz(null)
    setKey((k) => k + 1)
  }

  function createQuiz() {
    const questions = generateQuiz(topic, difficulty, questionCount)
    if (!questions.length) {
      setGenerationError('No questions match that topic and difficulty. Try All topics or All difficulties.')
      return
    }
    setGenerationError('')
    setActiveQuiz('generated')
    setGeneratedQuiz({ id: `generated-${topic}-${Date.now()}`, title: `${topic === 'All' ? 'Mixed OS' : QUIZZES[topic].title} · ${difficulty}`, questions })
    setKey((k) => k + 1)
  }

  const recentByQuiz = {}
  results.forEach((r) => {
    recentByQuiz[r.quizId] = r
  })

  return (
    <div>
      <div className="page-header">
        <h1>Quizzes</h1>
        <p>Generate a focused quiz from the stored question bank and track each attempt.</p>
      </div>
      <div className="card quiz-generator">
        <div className="flex-between">
          <div><h3 className="section-title" style={{ marginBottom: 4 }}>Quiz Generation Module</h3><p className="small muted">Choose a topic, difficulty, and question count. The generator uses only available questions.</p></div>
          <span className="badge badge-cyan">{buildQuestionBank().length} questions available</span>
        </div>
        <div className="inline-fields" style={{ marginTop: 14 }}>
          <div className="field"><label>Topic</label><select value={topic} onChange={(e) => setTopic(e.target.value)}><option value="All">All topics</option>{Object.entries(QUIZZES).map(([id, quiz]) => <option key={id} value={id}>{quiz.title}</option>)}</select></div>
          <div className="field"><label>Difficulty</label><select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>{DIFFICULTIES.map((item) => <option key={item}>{item}</option>)}</select></div>
          <div className="field"><label>Question count</label><input type="number" min="1" max="11" value={questionCount} onChange={(e) => setQuestionCount(Math.max(1, Math.min(11, Number(e.target.value) || 1)))} /></div>
        </div>
        <button className="btn btn-primary" onClick={createQuiz}>Generate quiz</button>
        {generationError && <div className="auth-error" style={{ marginTop: 10 }}>{generationError}</div>}
      </div>
      <div className="tabs">
        {Object.entries(QUIZZES).map(([id, quiz]) => (
          <button key={id} className={`tab ${activeQuiz === id ? 'active' : ''}`} onClick={() => switchQuiz(id)}>
            {quiz.title}
            {recentByQuiz[id] && <span className="small muted"> ({recentByQuiz[id].pct}%)</span>}
          </button>
        ))}
      </div>
      <QuizBlock key={key} quizId={activeQuiz} quiz={generatedQuiz || QUIZZES[activeQuiz]} onFinish={handleFinish} />

      {results.length > 0 && (
        <div className="card" style={{ marginTop: 16 }}>
          <h3 className="section-title">Past attempts</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Quiz</th>
                  <th>Score</th>
                  <th>Percent</th>
                  <th>Taken</th>
                </tr>
              </thead>
              <tbody>
                {[...results].reverse().slice(0, 10).map((r, i) => (
                  <tr key={i}>
                    <td>{QUIZZES[r.quizId]?.title || r.quizId}</td>
                    <td>
                      {r.score}/{r.total}
                    </td>
                    <td>{r.pct}%</td>
                    <td className="small muted">{new Date(r.takenAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
