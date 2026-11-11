import { useCallback, useRef, useState } from 'react'
import { ListTodo, StickyNote, Moon, Sun, Settings, Download, Upload, Smartphone } from 'lucide-react'
import Tasks from './components/Tasks'
import Notes from './components/Notes'
import useLocalStorage from './hooks/useLocalStorage'
import useTheme from './hooks/useTheme'
import useInstallPrompt from './hooks/useInstallPrompt'

const greeting = () => {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'
}

export default function App() {
  const [tab, setTab] = useState('tasks')
  const [tasks, setTasks] = useLocalStorage('tasks', [])
  const [notes, setNotes] = useLocalStorage('notes', [])
  const [theme, toggleTheme] = useTheme()
  const { canInstall, install } = useInstallPrompt()
  const [menu, setMenu] = useState(false)
  const [toast, setToast] = useState(null)
  const timer = useRef()
  const fileRef = useRef()

  const notify = useCallback((msg, undo) => {
    clearTimeout(timer.current)
    setToast({ msg, undo })
    timer.current = setTimeout(() => setToast(null), 4500)
  }, [])

  const exportData = () => {
    const data = { tasks, notes, exportedAt: new Date().toISOString() }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `todo-notes-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    setMenu(false)
  }

  const importData = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result)
        if (!Array.isArray(data.tasks) || !Array.isArray(data.notes)) throw new Error()
        setTasks(data.tasks)
        setNotes(data.notes)
        notify('Backup restored')
      } catch {
        notify('Invalid backup file')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
    setMenu(false)
  }

  const pending = tasks.filter((t) => !t.done).length
  const today = new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })

  const iconBtn =
    'grid h-11 w-11 place-items-center rounded-full bg-white text-slate-600 shadow-xs ring-1 ring-slate-200 transition active:scale-95 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-800'

  return (
    <div className="relative isolate min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* decorative background */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-indigo-400/20 blur-3xl" />
        <div className="absolute -left-32 top-1/2 h-96 w-96 rounded-full bg-fuchsia-400/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-2xl px-4 pb-36 pt-6">
        <header className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{greeting()} 👋</p>
            <h1 className="bg-linear-to-r from-indigo-600 to-fuchsia-500 bg-clip-text text-3xl font-extrabold text-transparent">
              Todo & Notes
            </h1>
            <p className="text-xs text-slate-400">{today}</p>
          </div>

          <div className="relative flex gap-2">
            <button onClick={toggleTheme} aria-label="Toggle theme" className={iconBtn}>
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button onClick={() => setMenu(!menu)} aria-label="Menu" className={iconBtn}>
              <Settings size={20} />
            </button>

            {menu && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setMenu(false)} />
                <div className="animate-pop absolute right-0 top-14 z-30 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-slate-800 dark:bg-slate-900">
                  {canInstall && (
                    <button
                      onClick={() => { install(); setMenu(false) }}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Smartphone size={18} /> Install app
                    </button>
                  )}
                  <button
                    onClick={exportData}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Download size={18} /> Export backup
                  </button>
                  <button
                    onClick={() => fileRef.current.click()}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Upload size={18} /> Import backup
                  </button>
                </div>
              </>
            )}
            <input ref={fileRef} type="file" accept="application/json" onChange={importData} className="hidden" />
          </div>
        </header>

        <main>
          {tab === 'tasks' ? (
            <Tasks tasks={tasks} setTasks={setTasks} notify={notify} />
          ) : (
            <Notes notes={notes} setNotes={setNotes} notify={notify} />
          )}
        </main>
      </div>

      {/* toast */}
      {toast && (
        <div className="animate-pop fixed inset-x-0 bottom-28 z-40 flex justify-center px-4">
          <div className="flex items-center gap-4 rounded-full bg-slate-900 py-2.5 pl-5 pr-3 text-sm text-white shadow-xl dark:bg-white dark:text-slate-900">
            <span>{toast.msg}</span>
            {toast.undo && (
              <button
                onClick={() => { toast.undo(); setToast(null) }}
                className="rounded-full bg-white/15 px-3 py-1 font-semibold dark:bg-slate-900/10"
              >
                Undo
              </button>
            )}
          </div>
        </div>
      )}

      {/* bottom navigation */}
      <nav className="fixed inset-x-0 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-30 flex justify-center">
        <div className="flex gap-1 rounded-full border border-slate-200 bg-white/80 p-1.5 shadow-xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
          {[
            { id: 'tasks', label: 'Tasks', icon: ListTodo, badge: pending },
            { id: 'notes', label: 'Notes', icon: StickyNote, badge: 0 },
          ].map(({ id, label, icon: Icon, badge }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition ${
                tab === id
                  ? 'bg-linear-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/30'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <Icon size={19} />
              {label}
              {badge > 0 && (
                <span className="rounded-full bg-white/25 px-2 text-xs">{badge}</span>
              )}
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}