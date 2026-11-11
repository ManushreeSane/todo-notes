import { useMemo, useState } from 'react'
import { Plus, Search, Pencil, Trash2, Check, Calendar, ListTodo } from 'lucide-react'
import Modal from './Modal'
import { PRIORITY, CATEGORIES, uid, dayDiff, dueInfo, inputCls } from '../constants'

const PRIO_ORDER = { high: 0, medium: 1, low: 2 }
const STATUS = ['all', 'active', 'done']

function ProgressCard({ tasks }) {
  const total = tasks.length
  const done = tasks.filter((t) => t.done).length
  const overdue = tasks.filter((t) => !t.done && t.due && dayDiff(t.due) < 0).length
  const today = tasks.filter((t) => !t.done && t.due && dayDiff(t.due) === 0).length
  const pct = total ? Math.round((done / total) * 100) : 0
  const R = 34
  const C = 2 * Math.PI * R

  return (
    <div className="animate-fade-up rounded-3xl bg-linear-to-br from-indigo-500 via-violet-500 to-fuchsia-500 p-5 text-white shadow-lg shadow-indigo-500/25">
      <div className="flex items-center gap-5">
        <div className="relative h-20 w-20 shrink-0">
          <svg viewBox="0 0 80 80" className="h-20 w-20 -rotate-90">
            <circle cx="40" cy="40" r={R} fill="none" stroke="rgba(255,255,255,.25)" strokeWidth="8" />
            <circle
              cx="40" cy="40" r={R} fill="none" stroke="white" strokeWidth="8" strokeLinecap="round"
              strokeDasharray={C} strokeDashoffset={C - (C * pct) / 100}
              className="transition-all duration-700"
            />
          </svg>
          <span className="absolute inset-0 grid place-items-center text-lg font-bold">{pct}%</span>
        </div>
        <div className="flex-1">
          <p className="text-sm text-white/80">Your progress</p>
          <p className="text-xl font-bold">{done} of {total} tasks done</p>
          <div className="mt-2 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-white/20 px-2.5 py-1">{today} due today</span>
            <span className="rounded-full bg-white/20 px-2.5 py-1">{overdue} overdue</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function TaskModal({ task, onSave, onClose }) {
  const [form, setForm] = useState(task)
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const submit = (e) => {
    e.preventDefault()
    if (!form.text.trim()) return
    onSave({ ...form, text: form.text.trim() })
  }

  const label = 'mb-2 block text-sm font-medium text-slate-500 dark:text-slate-400'

  return (
    <Modal title={task.isNew ? 'New task' : 'Edit task'} onClose={onClose}>
      <form onSubmit={submit} className="space-y-5">
        <input
          autoFocus
          value={form.text}
          onChange={(e) => set('text', e.target.value)}
          placeholder="What needs to be done?"
          className={inputCls}
        />

        <div>
          <span className={label}>Priority</span>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(PRIORITY).map(([key, p]) => (
              <button
                type="button"
                key={key}
                onClick={() => set('priority', key)}
                className={`rounded-xl border-2 py-2 text-sm font-medium transition ${
                  form.priority === key
                    ? `${p.badge} border-current`
                    : 'border-slate-200 text-slate-500 dark:border-slate-700 dark:text-slate-400'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className={label}>Category</span>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                type="button"
                key={c.id}
                onClick={() => set('category', c.id)}
                className={`rounded-full px-3.5 py-1.5 text-sm transition ${
                  form.category === c.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {c.emoji} {c.id}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className={label}>Due date</span>
          <div className="flex gap-2">
            <input
              type="date"
              value={form.due}
              onChange={(e) => set('due', e.target.value)}
              className={`${inputCls} dark:scheme-dark`}
            />
            {form.due && (
              <button
                type="button"
                onClick={() => set('due', '')}
                className="rounded-2xl bg-slate-100 px-4 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <button
          type="submit"
          className="w-full rounded-2xl bg-linear-to-r from-indigo-600 to-violet-600 py-3.5 font-semibold text-white shadow-lg shadow-indigo-500/25 active:scale-[0.98]"
        >
          {task.isNew ? 'Add task' : 'Save changes'}
        </button>
      </form>
    </Modal>
  )
}

export default function Tasks({ tasks, setTasks, notify }) {
  const [quick, setQuick] = useState('')
  const [status, setStatus] = useState('all')
  const [cat, setCat] = useState('all')
  const [sort, setSort] = useState('newest')
  const [query, setQuery] = useState('')
  const [modal, setModal] = useState(null)

  // fill defaults so older saved tasks keep working
  const list = useMemo(
    () => tasks.map((t) => ({ priority: 'medium', category: 'Personal', due: '', createdAt: 0, ...t })),
    [tasks]
  )

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return list
      .filter((t) => (status === 'all' ? true : status === 'active' ? !t.done : t.done))
      .filter((t) => cat === 'all' || t.category === cat)
      .filter((t) => !q || t.text.toLowerCase().includes(q))
      .sort((a, b) => {
        if (a.done !== b.done) return a.done ? 1 : -1
        if (sort === 'due') return (a.due || '9999').localeCompare(b.due || '9999')
        if (sort === 'priority') return PRIO_ORDER[a.priority] - PRIO_ORDER[b.priority]
        return b.createdAt - a.createdAt
      })
  }, [list, status, cat, query, sort])

  const quickAdd = (e) => {
    e.preventDefault()
    const text = quick.trim()
    if (!text) return
    setTasks([
      { id: uid(), text, done: false, priority: 'medium', category: 'Personal', due: '', createdAt: Date.now() },
      ...tasks,
    ])
    setQuick('')
  }

  const toggle = (id) => setTasks(tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)))

  const remove = (task) => {
    setTasks(tasks.filter((t) => t.id !== task.id))
    notify('Task deleted', () => setTasks((prev) => [task, ...prev]))
  }

  const clearDone = () => {
    const removed = tasks.filter((t) => t.done)
    if (!removed.length) return
    setTasks(tasks.filter((t) => !t.done))
    notify(`${removed.length} completed task(s) cleared`, () => setTasks((prev) => [...removed, ...prev]))
  }

  const save = (form) => {
    const { isNew, ...task } = form
    if (isNew) setTasks([{ ...task, id: uid(), done: false, createdAt: Date.now() }, ...tasks])
    else setTasks(tasks.map((t) => (t.id === task.id ? task : t)))
    setModal(null)
  }

  const openNew = () =>
    setModal({ isNew: true, text: quick, priority: 'medium', category: 'Personal', due: '' })

  return (
    <div className="space-y-4">
      <ProgressCard tasks={list} />

      {/* quick add */}
      <form onSubmit={quickAdd} className="flex gap-2">
        <div className="relative flex-1">
          <Plus size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={quick}
            onChange={(e) => setQuick(e.target.value)}
            placeholder="Add a task and press Enter"
            className={`${inputCls} pl-11`}
          />
        </div>
        <button
          type="submit"
          className="rounded-2xl bg-indigo-600 px-5 font-semibold text-white shadow-md shadow-indigo-500/25 active:scale-95"
        >
          Add
        </button>
      </form>
      <button onClick={openNew} className="-mt-2 text-sm font-medium text-indigo-600 dark:text-indigo-400">
        + Add with priority, category & due date
      </button>

      {/* search + sort */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tasks"
            className={`${inputCls} py-2.5 pl-11 text-sm`}
          />
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="rounded-2xl border border-slate-200 bg-white px-3 text-sm outline-none dark:border-slate-700 dark:bg-slate-800"
        >
          <option value="newest">Newest</option>
          <option value="due">Due date</option>
          <option value="priority">Priority</option>
        </select>
      </div>

      {/* status */}
      <div className="flex rounded-2xl bg-slate-200/70 p-1 dark:bg-slate-800">
        {STATUS.map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`flex-1 rounded-xl py-2 text-sm font-medium capitalize transition ${
              status === s
                ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-700 dark:text-white'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* categories */}
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
        {[{ id: 'all', emoji: '🗂️' }, ...CATEGORIES].map((c) => (
          <button
            key={c.id}
            onClick={() => setCat(c.id)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm capitalize transition ${
              cat === c.id
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'bg-white text-slate-600 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-800'
            }`}
          >
            {c.emoji} {c.id}
          </button>
        ))}
      </div>

      {/* list */}
      <ul className="space-y-2.5">
        {visible.length === 0 && (
          <li className="flex flex-col items-center gap-2 py-14 text-slate-400">
            <ListTodo size={40} strokeWidth={1.5} />
            <span>Nothing here yet</span>
          </li>
        )}

        {visible.map((t) => {
          const due = dueInfo(t.due, t.done)
          const emoji = CATEGORIES.find((c) => c.id === t.category)?.emoji
          return (
            <li
              key={t.id}
              className="animate-fade-up flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 pr-2 shadow-xs transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
            >
              <span className={`h-10 w-1 shrink-0 rounded-full ${PRIORITY[t.priority].bar} ${t.done ? 'opacity-30' : ''}`} />
              <button
                onClick={() => toggle(t.id)}
                aria-label="Toggle task"
                className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 transition ${
                  t.done
                    ? 'border-emerald-500 bg-emerald-500 text-white'
                    : 'border-slate-300 text-transparent hover:border-indigo-500 dark:border-slate-600'
                }`}
              >
                <Check size={16} strokeWidth={3} />
              </button>

              <div className="min-w-0 flex-1">
                <p className={`break-words font-medium ${t.done ? 'text-slate-400 line-through dark:text-slate-500' : ''}`}>
                  {t.text}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs">
                  <span className={`rounded-full px-2 py-0.5 font-medium ${PRIORITY[t.priority].badge}`}>
                    {PRIORITY[t.priority].label}
                  </span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {emoji} {t.category}
                  </span>
                  {due && (
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium ${due.cls}`}>
                      <Calendar size={11} /> {due.label}
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => setModal(t)}
                aria-label="Edit task"
                className="grid h-9 w-9 place-items-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800"
              >
                <Pencil size={17} />
              </button>
              <button
                onClick={() => remove(t)}
                aria-label="Delete task"
                className="grid h-9 w-9 place-items-center rounded-full text-slate-400 hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-500/10"
              >
                <Trash2 size={17} />
              </button>
            </li>
          )
        })}
      </ul>

      {list.some((t) => t.done) && (
        <div className="text-center">
          <button onClick={clearDone} className="text-sm font-medium text-rose-500">
            Clear completed tasks
          </button>
        </div>
      )}

      {modal && <TaskModal task={modal} onSave={save} onClose={() => setModal(null)} />}
    </div>
  )
}