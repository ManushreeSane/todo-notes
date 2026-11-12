
import {
  Flame,
  Timer,
  ListTodo,
  StickyNote,
  Check,
  ChevronRight,
  CalendarDays,
  Target,
  TrendingUp,
  Sparkles,
  Plus,
  Clock3
} from 'lucide-react'

import {
  PRIORITY,
  dueInfo,
  toISO,
  todayISO,
  fmtMinutes
} from '../constants'

const PRIO_ORDER = {
  high: 0,
  medium: 1,
  low: 2
}

const greeting = () => {
  const hour = new Date().getHours()

  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

function calcStreak(activity) {
  let streak = 0
  const date = new Date()

  if (!activity[toISO(date)]) {
    date.setDate(date.getDate() - 1)
  }

  while (activity[toISO(date)] > 0) {
    streak++
    date.setDate(date.getDate() - 1)
  }

  return streak
}

function Ring({ pct, size = 110, stroke = 10 }) {
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius

  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        className="-rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,.2)"
          strokeWidth={stroke}
        />

        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="white"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={
            circumference - (circumference * pct) / 100
          }
          className="transition-all duration-1000"
        />
      </svg>

      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <p className="text-2xl font-extrabold">
            {Math.round(pct)}%
          </p>
          <p className="text-[10px] text-white/70">Completed</p>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, detail, color }) {
  return (
    <div className="group rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 sm:p-5">
      <div className="flex items-center justify-between">
        <div className={`grid h-11 w-11 place-items-center rounded-2xl ${color}`}>
          <Icon size={21} />
        </div>

        <TrendingUp
          size={17}
          className="text-slate-300 transition group-hover:text-accent-500"
        />
      </div>

      <p className="mt-4 text-2xl font-extrabold tracking-tight">
        {value}
      </p>

      <p className="mt-1 text-sm font-semibold">
        {label}
      </p>

      {detail && (
        <p className="mt-1 text-xs text-slate-400">
          {detail}
        </p>
      )}
    </div>
  )
}

export default function Dashboard({
  tasks,
  notes,
  activity,
  focus,
  goal,
  name,
  toggle,
  goTab
}) {
  const today = todayISO()

  const open = tasks.filter((task) => !task.done)
  const completed = tasks.filter((task) => task.done)

  const dueToday = open.filter(
    (task) => task.due === today
  ).length

  const overdue = open.filter(
    (task) => task.due && task.due < today
  ).length

  const doneToday = activity[today] || 0
  const safeGoal = Math.max(1, Number(goal) || 1)

  const pct = Math.min(
    100,
    (doneToday / safeGoal) * 100
  )

  const streak = calcStreak(activity)
  const focusToday = focus[today]?.minutes || 0

  const week = Array.from({ length: 7 }, (_, index) => {
    const date = new Date()

    date.setDate(date.getDate() - (6 - index))

    const key = toISO(date)

    return {
      key,
      label: date.toLocaleDateString(undefined, {
        weekday: 'short'
      }),
      count: activity[key] || 0,
      isToday: index === 6
    }
  })

  const max = Math.max(
    1,
    ...week.map((day) => day.count)
  )

  const weekTotal = week.reduce(
    (sum, day) => sum + day.count,
    0
  )

  const upcoming = [...open]
    .sort((a, b) => {
      return (
        (a.due || '9999').localeCompare(b.due || '9999') ||
        PRIO_ORDER[a.priority || 'medium'] -
          PRIO_ORDER[b.priority || 'medium']
      )
    })
    .slice(0, 5)

  const tiles = [
    {
      icon: Flame,
      label: 'Day streak',
      value: `${streak} days`,
      detail: 'Keep your momentum',
      color: 'bg-orange-100 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400'
    },
    {
      icon: Timer,
      label: 'Focus time',
      value: fmtMinutes(focusToday),
      detail: 'Time invested today',
      color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400'
    },
    {
      icon: ListTodo,
      label: 'Open tasks',
      value: open.length,
      detail: 'Tasks remaining',
      color: 'bg-accent-100 text-accent-600 dark:bg-accent-500/15 dark:text-accent-400'
    },
    {
      icon: StickyNote,
      label: 'My notes',
      value: notes.length,
      detail: 'Ideas and reminders',
      color: 'bg-pink-100 text-pink-600 dark:bg-pink-500/15 dark:text-pink-400'
    }
  ]

  return (
    <div className="space-y-6">

      {/* Welcome banner */}
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-accent-600 via-accent-600 to-purple-700 p-6 text-white shadow-xl shadow-accent-500/20 sm:p-8">

        <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full border-[35px] border-white/10" />
        <div className="pointer-events-none absolute -bottom-24 right-24 h-52 w-52 rounded-full bg-white/10 blur-2xl" />

        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-4">

            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold backdrop-blur">
                <Sparkles size={14} />
                Your productivity space
              </div>

              <p className="text-sm text-white/75">
                {greeting()}{name ? `, ${name}` : ''} 👋
              </p>

              <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
                Make today count.
              </h1>

              <p className="mt-2 max-w-sm text-sm leading-6 text-white/75">
                Organize your tasks, capture your ideas and focus on what matters.
              </p>
            </div>

            <Ring pct={pct} />
          </div>

          <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3">

            <div className="rounded-2xl bg-white/15 p-3 backdrop-blur">
              <p className="text-xs text-white/70">Daily goal</p>
              <p className="mt-1 text-xl font-bold">
                {doneToday}/{safeGoal}
              </p>
            </div>

            <div className="rounded-2xl bg-white/15 p-3 backdrop-blur">
              <p className="text-xs text-white/70">Due today</p>
              <p className="mt-1 text-xl font-bold">
                {dueToday}
              </p>
            </div>

            <div className="col-span-2 rounded-2xl bg-white/15 p-3 backdrop-blur sm:col-span-1">
              <p className="text-xs text-white/70">Overdue</p>
              <p className="mt-1 text-xl font-bold">
                {overdue}
              </p>
            </div>

          </div>

          {pct >= 100 && (
            <div className="mt-4 rounded-2xl bg-white/15 px-4 py-3 text-sm font-semibold">
              🎉 Amazing! You've reached your daily goal.
            </div>
          )}
        </div>
      </section>

      {/* Statistics */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold">
              Your overview
            </h2>
            <p className="text-xs text-slate-400">
              Your productivity at a glance
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          {tiles.map((tile) => (
            <StatCard
              key={tile.label}
              {...tile}
            />
          ))}
        </div>
      </section>

      {/* Weekly activity */}
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">

        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="font-bold">Weekly activity</h2>
            <p className="mt-1 text-xs text-slate-400">
              Completed tasks over the last 7 days
            </p>
          </div>

          <div className="rounded-xl bg-accent-50 px-3 py-2 text-xs font-bold text-accent-600 dark:bg-accent-500/10 dark:text-accent-400">
            {weekTotal} completed
          </div>
        </div>

        <div className="flex h-40 items-end gap-3">
          {week.map((day) => (
            <div
              key={day.key}
              className="flex h-full flex-1 flex-col items-center gap-2"
            >
              <span className="text-xs font-semibold text-slate-400">
                {day.count || ''}
              </span>

              <div className="flex w-full flex-1 items-end">
                <div
                  className={`w-full rounded-t-xl transition-all duration-700 ${
                    day.isToday
                      ? 'bg-gradient-to-t from-accent-700 to-accent-400'
                      : 'bg-accent-100 dark:bg-accent-500/25'
                  }`}
                  style={{
                    height: `${Math.max(6, (day.count / max) * 100)}%`
                  }}
                />
              </div>

              <span
                className={`text-[11px] ${
                  day.isToday
                    ? 'font-extrabold text-accent-600'
                    : 'text-slate-400'
                }`}
              >
                {day.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Upcoming tasks */}
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">

        <div className="mb-5 flex items-center justify-between gap-2">
          <div>
            <h2 className="font-bold">Upcoming tasks</h2>
            <p className="mt-1 text-xs text-slate-400">
              Stay on top of your priorities
            </p>
          </div>

          <button
            onClick={() => goTab('tasks')}
            className="flex items-center gap-1 rounded-xl bg-accent-50 px-3 py-2 text-xs font-bold text-accent-600 transition hover:bg-accent-100 dark:bg-accent-500/10 dark:text-accent-400"
          >
            View all
            <ChevronRight size={15} />
          </button>
        </div>

        {upcoming.length === 0 ? (
          <div className="rounded-2xl bg-slate-50 py-10 text-center dark:bg-slate-800/50">
            <Check size={30} className="mx-auto text-emerald-500" />
            <p className="mt-3 font-semibold">
              You're all caught up!
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Add a task to get started.
            </p>

            <button
              onClick={() => goTab('tasks')}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-accent-600 px-4 py-2 text-xs font-bold text-white"
            >
              <Plus size={15} />
              Add task
            </button>
          </div>
        ) : (
          <ul className="space-y-3">
            {upcoming.map((task) => {
              const due = dueInfo(task.due, false)
              const priority = PRIORITY[
                task.priority || 'medium'
              ] || PRIORITY.medium

              return (
                <li
                  key={task.id}
                  className="group flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3 transition hover:border-accent-200 hover:bg-accent-50/40 dark:border-slate-800 dark:bg-slate-800/50 dark:hover:border-accent-500/40"
                >
                  <button
                    onClick={() => toggle(task.id)}
                    aria-label={`Complete ${task.text}`}
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 border-slate-300 text-transparent transition hover:border-accent-500 hover:bg-accent-500 hover:text-white dark:border-slate-600"
                  >
                    <Check size={15} strokeWidth={3} />
                  </button>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">
                      {task.text}
                    </p>

                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <span className="flex items-center gap-1 text-[11px] text-slate-400">
                        <span className={`h-2 w-2 rounded-full ${priority.bar}`} />
                        {priority.label}
                      </span>

                      {due && (
                        <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${due.cls}`}>
                          {due.label}
                        </span>
                      )}
                    </div>
                  </div>

                  <ChevronRight
                    size={17}
                    className="shrink-0 text-slate-300 transition group-hover:text-accent-500"
                  />
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {/* Quick actions */}
      <section className="grid grid-cols-2 gap-3">

        <button
          onClick={() => goTab('tasks')}
          className="group flex items-center gap-3 rounded-3xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-accent-100 text-accent-600 dark:bg-accent-500/15 dark:text-accent-400">
            <ListTodo size={21} />
          </div>

          <div>
            <p className="text-sm font-bold">Tasks</p>
            <p className="text-[11px] text-slate-400">Manage tasks</p>
          </div>

          <ChevronRight size={16} className="ml-auto text-slate-300" />
        </button>

        <button
          onClick={() => goTab('notes')}
          className="group flex items-center gap-3 rounded-3xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-pink-100 text-pink-600 dark:bg-pink-500/15 dark:text-pink-400">
            <StickyNote size={21} />
          </div>

          <div>
            <p className="text-sm font-bold">Notes</p>
            <p className="text-[11px] text-slate-400">Save ideas</p>
          </div>

          <ChevronRight size={16} className="ml-auto text-slate-300" />
        </button>
      </section>

      <p className="pb-2 text-center text-xs text-slate-400">
        One step at a time. Keep moving forward ✨
      </p>

    </div>
  )
}
