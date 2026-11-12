
import { useMemo, useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  CheckCircle2,
  Circle,
  Clock3,
  ListTodo,
  Plus,
} from 'lucide-react'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function dateKey(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getTaskTitle(task) {
  return task.text || task.title || task.name || 'Untitled task'
}

export default function Calendar({ tasks = [], toggle = () => {} }) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date()
    return new Date(today.getFullYear(), today.getMonth(), 1)
  })

  const [selectedDate, setSelectedDate] = useState(() => dateKey(new Date()))

  const today = dateKey(new Date())

  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()

  const monthName = currentMonth.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay()
    const totalDays = new Date(year, month + 1, 0).getDate()
    const previousMonthDays = new Date(year, month, 0).getDate()

    const cells = []

    for (let i = 0; i < firstDay; i++) {
      const day = previousMonthDays - firstDay + i + 1
      cells.push({
        date: new Date(year, month - 1, day),
        current: false,
      })
    }

    for (let day = 1; day <= totalDays; day++) {
      cells.push({
        date: new Date(year, month, day),
        current: true,
      })
    }

    while (cells.length % 7 !== 0) {
      const day = cells.length - firstDay - totalDays + 1
      cells.push({
        date: new Date(year, month + 1, day),
        current: false,
      })
    }

    return cells
  }, [year, month])

  const tasksByDate = useMemo(() => {
    const grouped = {}

    tasks.forEach((task) => {
      if (!task.due) return

      const key = String(task.due).slice(0, 10)

      if (!grouped[key]) grouped[key] = []
      grouped[key].push(task)
    })

    return grouped
  }, [tasks])

  const selectedTasks = tasksByDate[selectedDate] || []

  const completedCount = selectedTasks.filter((task) => task.done).length
  const pendingCount = selectedTasks.length - completedCount

  const changeMonth = (amount) => {
    setCurrentMonth((previous) =>
      new Date(previous.getFullYear(), previous.getMonth() + amount, 1)
    )
  }

  const goToToday = () => {
    const now = new Date()
    setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1))
    setSelectedDate(dateKey(now))
  }

  const selectedDateLabel = new Date(
    `${selectedDate}T00:00:00`
  ).toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="space-y-6 pb-8">
      {/* Page heading */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-violet-600 dark:text-violet-400">
            <CalendarDays size={17} />
            YOUR SCHEDULE
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Calendar
          </h1>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Plan your days and keep track of your deadlines.
          </p>
        </div>

        <button
          onClick={goToToday}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          Today
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500 dark:text-slate-400">
              Total scheduled
            </span>
            <ListTodo className="text-violet-500" size={20} />
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">
            {tasks.filter((task) => task.due).length}
          </p>
          <p className="mt-1 text-xs text-slate-400">Tasks with deadlines</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500 dark:text-slate-400">
              Pending tasks
            </span>
            <Clock3 className="text-amber-500" size={20} />
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">
            {tasks.filter((task) => task.due && !task.done).length}
          </p>
          <p className="mt-1 text-xs text-slate-400">Still to complete</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500 dark:text-slate-400">
              Completed
            </span>
            <CheckCircle2 className="text-emerald-500" size={20} />
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">
            {tasks.filter((task) => task.due && task.done).length}
          </p>
          <p className="mt-1 text-xs text-slate-400">Finished scheduled tasks</p>
        </div>
      </div>

      {/* Calendar and selected date tasks */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 xl:col-span-2 dark:border-slate-800 dark:bg-slate-900">
          {/* Month navigation */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {monthName}
              </h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Select a date to view its tasks
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => changeMonth(-1)}
                aria-label="Previous month"
                className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <ChevronLeft size={19} />
              </button>

              <button
                onClick={() => changeMonth(1)}
                aria-label="Next month"
                className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <ChevronRight size={19} />
              </button>
            </div>
          </div>

          {/* Weekday headings */}
          <div className="mb-2 grid grid-cols-7">
            {WEEKDAYS.map((day) => (
              <div
                key={day}
                className="py-2 text-center text-xs font-bold text-slate-400"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar dates */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {calendarDays.map(({ date, current }, index) => {
              const key = dateKey(date)
              const dayTasks = tasksByDate[key] || []
              const isToday = key === today
              const isSelected = key === selectedDate

              return (
                <button
                  key={`${key}-${index}`}
                  onClick={() => setSelectedDate(key)}
                  className={`relative flex min-h-16 flex-col items-center justify-start rounded-xl p-1.5 transition sm:min-h-24 sm:p-2 ${
                    isSelected
                      ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20'
                      : isToday
                        ? 'bg-violet-50 text-violet-700 ring-1 ring-violet-300 dark:bg-violet-950/50 dark:text-violet-300 dark:ring-violet-800'
                        : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
                  } ${!current ? 'opacity-35' : ''}`}
                >
                  <span className={`text-sm font-semibold ${isToday && !isSelected ? 'font-extrabold' : ''}`}>
                    {date.getDate()}
                  </span>

                  {dayTasks.length > 0 && (
                    <div className="mt-2 flex flex-wrap justify-center gap-1">
                      {dayTasks.slice(0, 3).map((task, taskIndex) => (
                        <span
                          key={task.id || taskIndex}
                          className={`h-1.5 w-1.5 rounded-full ${
                            isSelected
                              ? 'bg-white'
                              : task.done
                                ? 'bg-emerald-500'
                                : 'bg-violet-500'
                          }`}
                        />
                      ))}
                    </div>
                  )}

                  {dayTasks.length > 3 && (
                    <span className="mt-1 text-[9px]">+{dayTasks.length - 3}</span>
                  )}
                </button>
              )
            })}
          </div>

          <div className="mt-5 flex flex-wrap gap-4 border-t border-slate-100 pt-4 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-violet-500" />
              Pending task
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              Completed task
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-violet-200 ring-1 ring-violet-400" />
              Today
            </span>
          </div>
        </section>

        {/* Selected date tasks */}
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">
              Selected date
            </p>
            <h2 className="mt-2 text-lg font-bold text-slate-900 dark:text-white">
              {selectedDateLabel}
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {selectedTasks.length} scheduled task(s)
            </p>
          </div>

          <div className="mb-4 grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-amber-50 p-3 dark:bg-amber-950/30">
              <p className="text-xs text-amber-700 dark:text-amber-300">Pending</p>
              <p className="mt-1 text-xl font-bold text-amber-800 dark:text-amber-200">
                {pendingCount}
              </p>
            </div>
            <div className="rounded-xl bg-emerald-50 p-3 dark:bg-emerald-950/30">
              <p className="text-xs text-emerald-700 dark:text-emerald-300">Done</p>
              <p className="mt-1 text-xl font-bold text-emerald-800 dark:text-emerald-200">
                {completedCount}
              </p>
            </div>
          </div>

          {selectedTasks.length === 0 ? (
            <div className="flex min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 px-4 text-center dark:border-slate-700">
              <div className="mb-3 rounded-2xl bg-violet-50 p-3 dark:bg-violet-950/40">
                <CalendarDays className="text-violet-500" size={25} />
              </div>
              <p className="font-semibold text-slate-700 dark:text-slate-200">
                No tasks scheduled
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Tasks with this due date will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedTasks.map((task, index) => (
                <div
                  key={task.id || index}
                  className="flex items-start gap-3 rounded-2xl border border-slate-100 p-3 dark:border-slate-800"
                >
                  <button
                    onClick={() => toggle(task.id)}
                    aria-label={task.done ? 'Mark as pending' : 'Complete task'}
                    className="mt-0.5 shrink-0"
                  >
                    {task.done ? (
                      <CheckCircle2 className="text-emerald-500" size={20} />
                    ) : (
                      <Circle className="text-slate-400" size={20} />
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <p className={`break-words text-sm font-semibold ${
                      task.done
                        ? 'text-slate-400 line-through'
                        : 'text-slate-800 dark:text-slate-100'
                    }`}>
                      {getTaskTitle(task)}
                    </p>
                    <p className="mt-1 text-xs capitalize text-slate-400">
                      {task.priority || 'Normal'} priority
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
