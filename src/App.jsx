
import { useCallback, useRef, useState } from 'react'
import {
  LayoutDashboard,
  ListTodo,
  StickyNote,
  Timer,
  CalendarDays,
  Settings as Cog,
  Moon,
  Sun,
  Sparkles,
  Menu,
  X,
  CheckCircle2
} from 'lucide-react'

import Dashboard from './components/Dashboard'
import Tasks from './components/Tasks'
import Notes from './components/Notes'
import Focus from './components/Focus'
import Calendar from './components/Calendar'
import Settings from './components/Settings'

import useLocalStorage from './hooks/useLocalStorage'
import useTheme from './hooks/useTheme'
import useInstallPrompt from './hooks/useInstallPrompt'
import useTaskActions from './hooks/useTaskActions'

import { todayISO } from './constants'

const TABS = [
  { id: 'home', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'tasks', label: 'My Tasks', icon: ListTodo },
  { id: 'calendar', label: 'Calendar', icon: CalendarDays },
  { id: 'notes', label: 'My Notes', icon: StickyNote },
  { id: 'focus', label: 'Focus Timer', icon: Timer }
]

export default function App() {
  const [tab, setTab] = useState('home')

  const [tasks, setTasks] = useLocalStorage('tasks', [])
  const [notes, setNotes] = useLocalStorage('notes', [])
  const [activity, setActivity] = useLocalStorage('activity', {})
  const [focus, setFocus] = useLocalStorage('focus', {})
  const [name, setName] = useLocalStorage('name', '')
  const [goal, setGoal] = useLocalStorage('goal', 5)

  const { theme, toggle: toggleTheme, accent, setAccent } = useTheme()
  const { canInstall, install } = useInstallPrompt()

  const [showSettings, setShowSettings] = useState(false)
  const [mobileMenu, setMobileMenu] = useState(false)
  const [toast, setToast] = useState(null)

  const timer = useRef(null)
  const fileRef = useRef(null)

  const notify = useCallback((msg, undo) => {
    if (timer.current) clearTimeout(timer.current)

    setToast({ msg, undo })

    timer.current = setTimeout(() => {
      setToast(null)
    }, 4500)
  }, [])

  const bump = useCallback((delta) => {
    setActivity((previous) => {
      const key = todayISO()

      return {
        ...previous,
        [key]: Math.max(0, (previous[key] || 0) + delta)
      }
    })
  }, [setActivity])

  const { toggle } = useTaskActions(tasks, setTasks, bump)

  const exportData = () => {
    const data = {
      tasks,
      notes,
      activity,
      focus,
      name,
      goal,
      exportedAt: new Date().toISOString()
    }

    const blob = new Blob(
      [JSON.stringify(data, null, 2)],
      { type: 'application/json' }
    )

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = `taskflow-backup-${todayISO()}.json`
    link.click()

    URL.revokeObjectURL(url)
    notify('Backup downloaded successfully')
  }

  const importData = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()

    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result)

        if (!Array.isArray(data.tasks) || !Array.isArray(data.notes)) {
          throw new Error('Invalid backup')
        }

        setTasks(data.tasks)
        setNotes(data.notes)

        if (data.activity) setActivity(data.activity)
        if (data.focus) setFocus(data.focus)
        if (typeof data.name === 'string') setName(data.name)
        if (typeof data.goal === 'number') setGoal(data.goal)

        notify('Backup restored successfully')
      } catch {
        notify('Invalid backup file')
      }
    }

    reader.readAsText(file)
    event.target.value = ''
    setShowSettings(false)
  }

  const resetAll = () => {
    if (!confirm('Delete ALL tasks, notes and statistics? This cannot be undone.')) {
      return
    }

    setTasks([])
    setNotes([])
    setActivity({})
    setFocus({})

    setShowSettings(false)
    notify('All data cleared')
  }

  const pending = tasks.filter((task) => !task.done).length
  const completed = tasks.filter((task) => task.done).length

  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  const openTab = (id) => {
    setTab(id)
    setMobileMenu(false)
  }

  const currentTab = TABS.find((item) => item.id === tab)

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-white">

      {/* Background decoration */}
      <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">
        <div className="absolute -right-40 -top-40 h-[450px] w-[450px] rounded-full bg-accent-400/15 blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 h-[450px] w-[450px] rounded-full bg-purple-400/10 blur-[120px]" />
      </div>

      <div className="relative z-10 flex min-h-screen">

        {/* Desktop sidebar */}
        <aside className="hidden w-64 shrink-0 border-r border-slate-200/70 bg-white/75 px-5 py-7 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/75 lg:flex lg:flex-col">

          <div className="mb-10 flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-accent-600 to-purple-500 text-white shadow-lg shadow-accent-500/25">
              <CheckCircle2 size={25} />
            </div>

            <div>
              <h1 className="text-lg font-extrabold tracking-tight">
                TaskFlow
              </h1>
              <p className="text-xs text-slate-400">Plan your day better</p>
            </div>
          </div>

          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
            Workspace
          </p>

          <nav className="space-y-2">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => openTab(id)}
                className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-semibold transition-all ${
                  tab === id
                    ? 'bg-gradient-to-r from-accent-600 to-purple-500 text-white shadow-lg shadow-accent-500/20'
                    : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                }`}
              >
                <Icon size={19} />
                {label}

                {id === 'tasks' && pending > 0 && (
                  <span className={`ml-auto rounded-full px-2 py-0.5 text-xs ${
                    tab === id
                      ? 'bg-white/20 text-white'
                      : 'bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400'
                  }`}>
                    {pending}
                  </span>
                )}
              </button>
            ))}
          </nav>

          <div className="mt-auto rounded-3xl bg-gradient-to-br from-accent-600 to-purple-600 p-5 text-white shadow-xl">
            <Sparkles size={25} className="mb-3" />
            <h3 className="font-bold">Stay productive!</h3>
            <p className="mt-1 text-xs leading-5 text-white/80">
              Small steps every day lead to big results.
            </p>
            <div className="mt-4 rounded-xl bg-white/15 px-3 py-2 text-xs">
              {completed} tasks completed
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="min-w-0 flex-1">

          {/* Top header */}
          <header className="sticky top-0 z-20 border-b border-slate-200/60 bg-white/75 px-4 py-4 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/75 sm:px-7 lg:px-10">

            <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setMobileMenu(!mobileMenu)}
                  className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-white lg:hidden"
                  aria-label="Open navigation"
                >
                  {mobileMenu ? <X size={20} /> : <Menu size={20} />}
                </button>

                <div>
                  <p className="text-xs text-slate-400">{today}</p>
                  <h2 className="text-lg font-extrabold sm:text-xl">
                    {tab === 'home'
                      ? `Welcome${name ? `, ${name}` : ' back'}! 👋`
                      : currentTab?.label || 'TaskFlow'}
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="hidden rounded-full bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 sm:block">
                  <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-emerald-500" />
                  {pending} pending
                </div>

                <button
                  onClick={toggleTheme}
                  aria-label="Toggle theme"
                  className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:scale-105 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                >
                  {theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
                </button>

                <button
                  onClick={() => setShowSettings(true)}
                  aria-label="Settings"
                  className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:scale-105 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                >
                  <Cog size={19} />
                </button>
              </div>
            </div>

            {/* Mobile menu */}
            {mobileMenu && (
              <nav className="mx-auto mt-4 max-w-7xl space-y-2 lg:hidden">
                {TABS.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => openTab(id)}
                    className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold ${
                      tab === id
                        ? 'bg-accent-600 text-white'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-300'
                    }`}
                  >
                    <Icon size={18} />
                    {label}
                  </button>
                ))}
              </nav>
            )}
          </header>

          {/* Pages */}
          <main className="mx-auto max-w-7xl px-4 py-7 pb-28 sm:px-7 sm:py-9 lg:px-10 lg:pb-10">

            {tab === 'home' && (
              <div className="animate-fade-up">
                <Dashboard
                  tasks={tasks}
                  notes={notes}
                  activity={activity}
                  focus={focus}
                  goal={goal}
                  name={name}
                  toggle={toggle}
                  goTab={setTab}
                />
              </div>
            )}

            {tab === 'tasks' && (
              <div className="animate-fade-up">
                <Tasks
                  tasks={tasks}
                  setTasks={setTasks}
                  toggle={toggle}
                  notify={notify}
                />
              </div>
            )}

            {tab === 'calendar' && (
              <div className="animate-fade-up">
                <Calendar
                  tasks={tasks}
                  toggle={toggle}
                />
              </div>
            )}

            {tab === 'notes' && (
              <div className="animate-fade-up">
                <Notes
                  notes={notes}
                  setNotes={setNotes}
                  notify={notify}
                />
              </div>
            )}

            {tab === 'focus' && (
              <div className="animate-fade-up">
                <Focus
                  tasks={tasks}
                  focus={focus}
                  setFocus={setFocus}
                  notify={notify}
                />
              </div>
            )}

          </main>
        </div>
      </div>

      {/* Backup input */}
      <input
        ref={fileRef}
        type="file"
        accept="application/json"
        onChange={importData}
        className="hidden"
      />

      {/* Settings modal */}
      {showSettings && (
        <Settings
          theme={theme}
          toggleTheme={toggleTheme}
          accent={accent}
          setAccent={setAccent}
          name={name}
          setName={setName}
          goal={goal}
          setGoal={setGoal}
          canInstall={canInstall}
          install={install}
          onExport={exportData}
          onImport={() => fileRef.current?.click()}
          onReset={resetAll}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* Toast notification */}
      {toast && (
        <div className="animate-pop fixed inset-x-0 bottom-24 z-50 flex justify-center px-4 lg:bottom-8">
          <div className="flex items-center gap-4 rounded-2xl border border-slate-700 bg-slate-900 px-5 py-3 text-sm text-white shadow-2xl">
            <span>{toast.msg}</span>

            {toast.undo && (
              <button
                onClick={() => {
                  toast.undo()
                  setToast(null)
                }}
                className="rounded-lg bg-white/15 px-3 py-1.5 font-bold hover:bg-white/25"
              >
                Undo
              </button>
            )}
          </div>
        </div>
      )}

      {/* Mobile bottom navigation */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 px-2 pb-[env(safe-area-inset-bottom)] pt-2 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/95 lg:hidden">
        <div className="mx-auto flex max-w-lg justify-around">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => openTab(id)}
              className={`flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl py-2 text-[10px] font-semibold transition ${
                tab === id
                  ? 'text-accent-600 dark:text-accent-400'
                  : 'text-slate-400'
              }`}
            >
              <div className={`rounded-xl p-2 ${
                tab === id
                  ? 'bg-accent-100 dark:bg-accent-500/15'
                  : ''
              }`}>
                <Icon size={20} />
              </div>
              {label.replace('My ', '')}
            </button>
          ))}
        </div>
      </nav>

    </div>
  )
}
