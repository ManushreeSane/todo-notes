
import { useEffect, useRef, useState } from 'react'
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Target,
  Coffee,
  Zap,
  Clock,
  CheckCircle2,
  CalendarDays,
  Volume2,
} from 'lucide-react'

import { todayISO, toISO, fmtMinutes } from '../constants'

const MODES = {
  focus: { label: 'Focus', icon: Target },
  short: { label: 'Short break', icon: Coffee },
  long: { label: 'Long break', icon: Coffee },
}

const FOCUS_OPTIONS = [15, 25, 45, 60]

const lengthFor = (mode, focusMin) =>
  (mode === 'focus' ? focusMin : mode === 'short' ? 5 : 15) * 60

const fmt = (seconds) =>
  `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(
    seconds % 60
  ).padStart(2, '0')}`

const beep = () => {
  try {
    const AudioContextClass =
      window.AudioContext || window.webkitAudioContext

    if (!AudioContextClass) return

    const ctx = new AudioContextClass()
    const oscillator = ctx.createOscillator()
    const gain = ctx.createGain()

    oscillator.connect(gain)
    gain.connect(ctx.destination)

    oscillator.frequency.value = 880
    gain.gain.setValueAtTime(0.2, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      ctx.currentTime + 0.8
    )

    oscillator.start()
    oscillator.stop(ctx.currentTime + 0.8)

    oscillator.onended = () => ctx.close()
  } catch {
    // Sound is optional.
  }
}

const systemNotify = async (title, body) => {
  try {
    if (
      'Notification' in window &&
      Notification.permission === 'granted'
    ) {
      new Notification(title, { body })
    }
  } catch {
    // Browser notifications are optional.
  }
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className={`mb-3 grid h-10 w-10 place-items-center rounded-xl ${color}`}>
        <Icon size={19} />
      </div>
      <p className="text-xl font-bold text-slate-900 dark:text-white">
        {value}
      </p>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        {label}
      </p>
    </div>
  )
}

export default function Focus({ tasks, focus, setFocus, notify }) {
  const [mode, setMode] = useState('focus')
  const [focusMin, setFocusMin] = useState(25)
  const [left, setLeft] = useState(25 * 60)
  const [running, setRunning] = useState(false)
  const [taskId, setTaskId] = useState('')

  const endAt = useRef(0)
  const latest = useRef({ mode, focusMin, focus })

  latest.current = { mode, focusMin, focus }

  const total = lengthFor(mode, focusMin)
  const pct = total ? Math.min(100, ((total - left) / total) * 100) : 0

  // Accurate countdown, even if the browser temporarily slows the timer.
  useEffect(() => {
    if (!running) return

    const finish = () => {
      const { mode: currentMode, focusMin: minutes, focus: currentFocus } =
        latest.current

      setRunning(false)
      beep()

      if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200])
      }

      if (currentMode === 'focus') {
        const key = todayISO()
        const previousSessions = currentFocus[key]?.sessions || 0

        setFocus((previous) => {
          const current = previous[key] || {
            minutes: 0,
            sessions: 0,
          }

          return {
            ...previous,
            [key]: {
              minutes: current.minutes + minutes,
              sessions: current.sessions + 1,
            },
          }
        })

        const nextMode =
          (previousSessions + 1) % 4 === 0 ? 'long' : 'short'

        notify?.('Focus session complete! 🎉')
        systemNotify(
          'Focus session complete!',
          'Great work! Time to take a break.'
        )

        setMode(nextMode)
        setLeft(lengthFor(nextMode, minutes))
      } else {
        notify?.('Break over — ready to focus?')
        systemNotify('Break over', 'Ready for another focus session?')

        setMode('focus')
        setLeft(lengthFor('focus', minutes))
      }
    }

    const interval = setInterval(() => {
      const remaining = Math.max(
        0,
        Math.ceil((endAt.current - Date.now()) / 1000)
      )

      setLeft(remaining)

      if (remaining <= 0) {
        clearInterval(interval)
        finish()
      }
    }, 250)

    return () => clearInterval(interval)
  }, [running, setFocus, notify])

  // Update browser tab title while the timer is running.
  useEffect(() => {
    document.title = running
      ? `${fmt(left)} · ${MODES[mode].label}`
      : 'TaskFlow'

    return () => {
      document.title = 'TaskFlow'
    }
  }, [running, left, mode])

  const switchMode = (newMode, minutes = focusMin) => {
    setRunning(false)
    setMode(newMode)
    setFocusMin(minutes)
    setLeft(lengthFor(newMode, minutes))
  }

  const toggleRun = () => {
    if (running) {
      const remaining = Math.max(
        0,
        Math.ceil((endAt.current - Date.now()) / 1000)
      )

      setLeft(remaining)
      setRunning(false)
      return
    }

    if (left <= 0) {
      setLeft(total)
      endAt.current = Date.now() + total * 1000
    } else {
      endAt.current = Date.now() + left * 1000
    }

    if (
      'Notification' in window &&
      Notification.permission === 'default'
    ) {
      Notification.requestPermission()
    }

    setRunning(true)
  }

  const resetTimer = () => {
    setRunning(false)
    setLeft(total)
  }

  const skipMode = () => {
    if (mode === 'focus') {
      switchMode('short')
    } else {
      switchMode('focus')
    }
  }

  const today = focus[todayISO()] || {
    minutes: 0,
    sessions: 0,
  }

  const weekMinutes = Array.from({ length: 7 }, (_, index) => {
    const date = new Date()
    date.setDate(date.getDate() - index)
    return focus[toISO(date)]?.minutes || 0
  }).reduce((sum, value) => sum + value, 0)

  const activeTasks = tasks.filter((task) => !task.done)
  const current = activeTasks.find((task) => task.id === taskId)

  const size = 250
  const stroke = 12
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius

  const ringColor =
    mode === 'focus' ? 'text-accent-500' : 'text-emerald-500'

  const progressColor =
    mode === 'focus' ? 'from-accent-500 to-accent-700' : 'from-emerald-400 to-emerald-600'

  const ModeIcon = MODES[mode].icon

  return (
    <div className="space-y-6">

      {/* Page heading */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent-100 text-accent-600 dark:bg-accent-500/15 dark:text-accent-400">
              <Zap size={21} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Focus Room
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Stay focused, take breaks, and get things done.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Productivity mode
        </div>
      </div>

      {/* Timer section */}
      <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-7">

          {/* Mode selector */}
          <div className="mb-7 flex rounded-2xl bg-slate-100 p-1 dark:bg-slate-800">
            {Object.entries(MODES).map(([key, item]) => (
              <button
                key={key}
                onClick={() => switchMode(key)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-2 py-3 text-xs font-semibold transition sm:text-sm ${
                  mode === key
                    ? 'bg-white text-accent-600 shadow-sm dark:bg-slate-700 dark:text-white'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Timer ring */}
          <div className="flex flex-col items-center">
            <div
              className="relative"
              style={{ width: size, height: size, maxWidth: '100%' }}
            >
              <svg
                width="100%"
                height="100%"
                viewBox={`0 0 ${size} ${size}`}
                className={`-rotate-90 ${ringColor}`}
              >
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  strokeWidth={stroke}
                  className="stroke-slate-100 dark:stroke-slate-800"
                />

                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={stroke}
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={
                    circumference - (circumference * pct) / 100
                  }
                  className="transition-all duration-500"
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
                  <ModeIcon size={17} />
                  {MODES[mode].label}
                </div>

                <span className="text-5xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-6xl">
                  {fmt(left)}
                </span>

                <span className="mt-2 text-xs text-slate-400">
                  {running
                    ? mode === 'focus'
                      ? 'Stay in the zone'
                      : 'Take a little rest'
                    : 'Ready when you are'}
                </span>
              </div>
            </div>

            {/* Current task */}
            {current && mode === 'focus' && (
              <div className="mt-3 flex max-w-full items-center gap-2 rounded-full bg-accent-50 px-4 py-2 text-sm font-medium text-accent-700 dark:bg-accent-500/10 dark:text-accent-300">
                <Target size={15} />
                <span className="truncate">{current.text}</span>
              </div>
            )}

            {/* Timer controls */}
            <div className="mt-7 flex items-center gap-5">
              <button
                onClick={resetTimer}
                aria-label="Reset timer"
                className="grid h-12 w-12 place-items-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200 active:scale-95 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                <RotateCcw size={20} />
              </button>

              <button
                onClick={toggleRun}
                aria-label={running ? 'Pause timer' : 'Start timer'}
                className={`grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br ${progressColor} text-white shadow-xl transition hover:scale-105 active:scale-95`}
              >
                {running ? (
                  <Pause size={31} />
                ) : (
                  <Play size={31} className="ml-1" />
                )}
              </button>

              <button
                onClick={skipMode}
                aria-label="Skip timer mode"
                className="grid h-12 w-12 place-items-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200 active:scale-95 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                <SkipForward size={20} />
              </button>
            </div>

            <p className="mt-4 text-xs text-slate-400">
              {running ? 'Timer is running' : 'Press play to begin'}
            </p>
          </div>
        </div>

        {/* Timer settings */}
        <div className="space-y-5">

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex items-center gap-2">
              <Clock size={19} className="text-accent-500" />
              <h2 className="font-bold text-slate-900 dark:text-white">
                Timer settings
              </h2>
            </div>

            <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">
              Choose your focus duration.
            </p>

            <div className="grid grid-cols-2 gap-2">
              {FOCUS_OPTIONS.map((minutes) => (
                <button
                  key={minutes}
                  disabled={running}
                  onClick={() => switchMode('focus', minutes)}
                  className={`rounded-xl border px-3 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                    focusMin === minutes
                      ? 'border-accent-500 bg-accent-50 text-accent-700 dark:bg-accent-500/10 dark:text-accent-300'
                      : 'border-slate-200 text-slate-600 hover:border-accent-300 dark:border-slate-700 dark:text-slate-300'
                  }`}
                >
                  {minutes} minutes
                </button>
              ))}
            </div>

            <div className="mt-5 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/70">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">
                  Current session
                </span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {focusMin} min
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${progressColor} transition-all`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Task selection */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-3 flex items-center gap-2">
              <CheckCircle2 size={19} className="text-emerald-500" />
              <h2 className="font-bold text-slate-900 dark:text-white">
                Focus task
              </h2>
            </div>

            <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">
              Select what you want to work on.
            </p>

            <select
              value={taskId}
              onChange={(event) => setTaskId(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 outline-none focus:border-accent-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="">No task selected</option>
              {activeTasks.map((task) => (
                <option key={task.id} value={task.id}>
                  {task.text}
                </option>
              ))}
            </select>

            {current && (
              <p className="mt-3 text-xs text-emerald-600 dark:text-emerald-400">
                Your focus session is linked to this task.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Productivity statistics */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <CalendarDays size={19} className="text-accent-500" />
          <h2 className="font-bold text-slate-900 dark:text-white">
            Your productivity
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatCard
            icon={CheckCircle2}
            label="Sessions completed today"
            value={today.sessions}
            color="bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
          />

          <StatCard
            icon={Clock}
            label="Focus time today"
            value={fmtMinutes(today.minutes)}
            color="bg-accent-100 text-accent-600 dark:bg-accent-500/10 dark:text-accent-400"
          />

          <StatCard
            icon={Zap}
            label="Focus time this week"
            value={fmtMinutes(weekMinutes)}
            color="bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
          />
        </div>
      </div>

      {/* Focus tips */}
      <div className="rounded-3xl border border-accent-200 bg-gradient-to-r from-accent-50 to-white p-5 dark:border-accent-500/20 dark:from-accent-500/10 dark:to-slate-900">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent-100 text-accent-600 dark:bg-accent-500/20 dark:text-accent-300">
            <Volume2 size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">
              Your focus tip
            </h3>
            <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
              Work on one task at a time. After four completed focus sessions,
              enjoy a longer 15-minute break. Keep notifications enabled if
              you want browser alerts when a session ends.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
