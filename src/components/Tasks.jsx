
import { useMemo, useState } from 'react'
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Check,
  Calendar,
  ListTodo,
  ChevronDown,
  Repeat,
  X,
  Clock,
  Target,
  CircleCheck,
  Sparkles,
  SlidersHorizontal,
  AlertCircle,
} from 'lucide-react'

import Modal from './Modal'

import {
  PRIORITY,
  CATEGORIES,
  REPEATS,
  uid,
  dueInfo,
  parseQuick,
  inputCls,
  todayISO,
} from '../constants'

const PRIO_ORDER = { high: 0, medium: 1, low: 2 }
const STATUS = ['all', 'active', 'done']

const label =
  'mb-2 block text-sm font-semibold text-slate-600 dark:text-slate-300'

const defaultTask = {
  text: '',
  desc: '',
  priority: 'medium',
  category: 'Personal',
  due: '',
  repeat: 'none',
  subtasks: [],
}

// ---------------- Task creation / editing modal ----------------

function TaskModal({ task, onSave, onClose }) {
  const [form, setForm] = useState({
    ...defaultTask,
    ...task,
    subtasks: task.subtasks || [],
  })

  const [subText, setSubText] = useState('')

  const set = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  const addSub = () => {
    const value = subText.trim()
    if (!value) return

    set('subtasks', [
      ...form.subtasks,
      { id: uid(), text: value, done: false },
    ])

    setSubText('')
  }

  const submit = (e) => {
    e.preventDefault()

    if (!form.text.trim()) return

    const subtasks = subText.trim()
      ? [
          ...form.subtasks,
          { id: uid(), text: subText.trim(), done: false },
        ]
      : form.subtasks

    onSave({
      ...form,
      text: form.text.trim(),
      desc: form.desc.trim(),
      subtasks,
    })
  }

  return (
    <Modal
      title={task.isNew ? 'Create a new task' : 'Edit your task'}
      onClose={onClose}
    >
      <form onSubmit={submit} className="space-y-5">

        <div>
          <label className={label}>Task title</label>
          <input
            autoFocus
            required
            value={form.text}
            onChange={(e) => set('text', e.target.value)}
            placeholder="What do you need to do?"
            className={inputCls}
          />
        </div>

        <div>
          <label className={label}>Description</label>
          <textarea
            value={form.desc}
            onChange={(e) => set('desc', e.target.value)}
            placeholder="Add some details about this task..."
            rows={3}
            className={inputCls}
          />
        </div>

        <div>
          <label className={label}>Priority</label>

          <div className="grid grid-cols-3 gap-2">
            {Object.entries(PRIORITY).map(([key, priority]) => (
              <button
                type="button"
                key={key}
                onClick={() => set('priority', key)}
                className={`rounded-xl border-2 py-2.5 text-sm font-semibold transition ${
                  form.priority === key
                    ? `${priority.badge} border-current`
                    : 'border-slate-200 text-slate-500 dark:border-slate-700 dark:text-slate-400'
                }`}
              >
                {priority.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className={label}>Category</label>

          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((category) => (
              <button
                type="button"
                key={category.id}
                onClick={() => set('category', category.id)}
                className={`rounded-full px-3.5 py-2 text-sm font-medium transition ${
                  form.category === category.id
                    ? 'bg-accent-600 text-white shadow-md shadow-accent-500/20'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {category.emoji} {category.id}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className={label}>Due date</label>
            <input
              type="date"
              min={todayISO()}
              value={form.due}
              onChange={(e) => set('due', e.target.value)}
              className={`${inputCls} dark:scheme-dark`}
            />
          </div>

          <div>
            <label className={label}>Repeat task</label>
            <select
              value={form.repeat}
              onChange={(e) => set('repeat', e.target.value)}
              className={inputCls}
            >
              {REPEATS.map((repeat) => (
                <option key={repeat.id} value={repeat.id}>
                  {repeat.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className={label}>Subtasks</label>

          {form.subtasks.length > 0 && (
            <ul className="mb-3 space-y-2">
              {form.subtasks.map((subtask) => (
                <li
                  key={subtask.id}
                  className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5 dark:bg-slate-800/70"
                >
                  <button
                    type="button"
                    onClick={() =>
                      set(
                        'subtasks',
                        form.subtasks.map((item) =>
                          item.id === subtask.id
                            ? { ...item, done: !item.done }
                            : item
                        )
                      )
                    }
                    className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 ${
                      subtask.done
                        ? 'border-emerald-500 bg-emerald-500 text-white'
                        : 'border-slate-300 text-transparent dark:border-slate-600'
                    }`}
                  >
                    <Check size={12} strokeWidth={3} />
                  </button>

                  <span
                    className={`flex-1 break-words text-sm ${
                      subtask.done
                        ? 'text-slate-400 line-through'
                        : 'text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    {subtask.text}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      set(
                        'subtasks',
                        form.subtasks.filter((item) => item.id !== subtask.id)
                      )
                    }
                    className="text-slate-400 hover:text-rose-500"
                    aria-label="Remove subtask"
                  >
                    <X size={16} />
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="flex gap-2">
            <input
              value={subText}
              onChange={(e) => setSubText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addSub()
                }
              }}
              placeholder="Add a smaller step..."
              className={`${inputCls} py-2.5 text-sm`}
            />

            <button
              type="button"
              onClick={addSub}
              className="rounded-xl bg-slate-100 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-white"
            >
              Add
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="w-full rounded-2xl bg-gradient-to-r from-accent-600 to-accent-500 py-3.5 font-bold text-white shadow-lg shadow-accent-500/25 transition hover:opacity-90 active:scale-[0.98]"
        >
          {task.isNew ? 'Create task' : 'Save changes'}
        </button>
      </form>
    </Modal>
  )
}

// ---------------- Task card ----------------

function TaskItem({ task, onToggle, onEdit, onRemove, onSub }) {
  const [open, setOpen] = useState(false)

  const due = dueInfo(task.due, task.done)
  const category = CATEGORIES.find((item) => item.id === task.category)
  const priority = PRIORITY[task.priority] || PRIORITY.medium

  const subtasks = task.subtasks || []
  const hasSubs = subtasks.length > 0
  const subDone = subtasks.filter((item) => item.done).length
  const progress = hasSubs ? (subDone / subtasks.length) * 100 : 0

  return (
    <li className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900">

      <div className="flex items-center gap-3 p-3 sm:p-4">

        <span
          className={`h-12 w-1 shrink-0 rounded-full ${
            priority.bar
          } ${task.done ? 'opacity-30' : ''}`}
        />

        <button
          onClick={() => onToggle(task.id)}
          aria-label={task.done ? 'Mark as active' : 'Complete task'}
          className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 transition ${
            task.done
              ? 'border-emerald-500 bg-emerald-500 text-white'
              : 'border-slate-300 text-transparent hover:border-accent-500 dark:border-slate-600'
          }`}
        >
          <Check size={15} strokeWidth={3} />
        </button>

        <div className="min-w-0 flex-1">

          <p
            className={`break-words font-semibold ${
              task.done
                ? 'text-slate-400 line-through dark:text-slate-500'
                : 'text-slate-800 dark:text-white'
            }`}
          >
            {task.text}
          </p>

          {task.desc && (
            <p className="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
              {task.desc}
            </p>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">

            <span
              className={`rounded-full px-2.5 py-1 font-semibold ${priority.badge}`}
            >
              {priority.label}
            </span>

            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {category?.emoji || '📌'} {task.category}
            </span>

            {due && (
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-medium ${due.cls}`}
              >
                <Calendar size={11} />
                {due.label}
              </span>
            )}

            {task.repeat && task.repeat !== 'none' && (
              <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2.5 py-1 font-medium capitalize text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
                <Repeat size={11} />
                {task.repeat}
              </span>
            )}

            {hasSubs && (
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {subDone}/{subtasks.length} steps
              </span>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-0.5">

          {hasSubs && (
            <button
              onClick={() => setOpen(!open)}
              aria-label="Show subtasks"
              className="grid h-9 w-9 place-items-center rounded-full text-slate-400 transition hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ChevronDown
                size={18}
                className={`transition ${open ? 'rotate-180' : ''}`}
              />
            </button>
          )}

          <button
            onClick={() => onEdit(task)}
            aria-label="Edit task"
            className="grid h-9 w-9 place-items-center rounded-full text-slate-400 transition hover:bg-accent-50 hover:text-accent-600 dark:hover:bg-slate-800"
          >
            <Pencil size={16} />
          </button>

          <button
            onClick={() => onRemove(task)}
            aria-label="Delete task"
            className="grid h-9 w-9 place-items-center rounded-full text-slate-400 transition hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-500/10"
          >
            <Trash2 size={17} />
          </button>
        </div>
      </div>

      {hasSubs && (
        <div className="h-1 bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full bg-accent-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {open && hasSubs && (
        <ul className="space-y-2 border-t border-slate-100 p-4 pl-8 dark:border-slate-800 sm:pl-16">
          {subtasks.map((subtask) => (
            <li key={subtask.id} className="flex items-center gap-2.5 text-sm">

              <button
                onClick={() => onSub(task.id, subtask.id)}
                aria-label="Toggle subtask"
                className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 ${
                  subtask.done
                    ? 'border-emerald-500 bg-emerald-500 text-white'
                    : 'border-slate-300 text-transparent dark:border-slate-600'
                }`}
              >
                <Check size={12} strokeWidth={3} />
              </button>

              <span
                className={
                  subtask.done
                    ? 'text-slate-400 line-through'
                    : 'text-slate-700 dark:text-slate-300'
                }
              >
                {subtask.text}
              </span>
            </li>
          ))}
        </ul>
      )}
    </li>
  )
}

// ---------------- Summary card ----------------

function SummaryCard({ title, value, icon: Icon, color, description }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {value}
          </p>
          <p className="mt-1 text-xs text-slate-400">{description}</p>
        </div>

        <div className={`grid h-11 w-11 place-items-center rounded-2xl ${color}`}>
          <Icon size={21} />
        </div>
      </div>
    </div>
  )
}

// ---------------- Main tasks page ----------------

export default function Tasks({ tasks = [], setTasks, toggle, notify }) {
  const [quick, setQuick] = useState('')
  const [status, setStatus] = useState('all')
  const [cat, setCat] = useState('all')
  const [sort, setSort] = useState('newest')
  const [query, setQuery] = useState('')
  const [modal, setModal] = useState(null)

  const list = useMemo(
    () =>
      tasks.map((task) => ({
        ...defaultTask,
        createdAt: 0,
        ...task,
        subtasks: task.subtasks || [],
      })),
    [tasks]
  )

  const completed = list.filter((task) => task.done).length
  const active = list.length - completed
  const highPriority = list.filter(
    (task) => !task.done && task.priority === 'high'
  ).length

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()

    return list
      .filter((task) =>
        status === 'all'
          ? true
          : status === 'active'
            ? !task.done
            : task.done
      )
      .filter((task) => cat === 'all' || task.category === cat)
      .filter(
        (task) =>
          !q ||
          (task.text || '').toLowerCase().includes(q) ||
          (task.desc || '').toLowerCase().includes(q) ||
          (task.category || '').toLowerCase().includes(q)
      )
      .sort((a, b) => {
        if (a.done !== b.done) return a.done ? 1 : -1

        if (sort === 'due') {
          return (a.due || '9999').localeCompare(b.due || '9999')
        }

        if (sort === 'priority') {
          return PRIO_ORDER[a.priority] - PRIO_ORDER[b.priority]
        }

        if (sort === 'alphabetical') {
          return a.text.localeCompare(b.text)
        }

        return (b.createdAt || 0) - (a.createdAt || 0)
      })
  }, [list, status, cat, query, sort])

  // Quick task creation
  const quickAdd = (e) => {
    e.preventDefault()

    const parsed = parseQuick(quick)
    if (!parsed.text?.trim()) return

    setTasks((previous) => [
      {
        ...defaultTask,
        ...parsed,
        id: uid(),
        done: false,
        createdAt: Date.now(),
      },
      ...previous,
    ])

    setQuick('')
    notify?.('Task added successfully')
  }

  // Delete task with undo option
  const remove = (task) => {
    setTasks((previous) => previous.filter((item) => item.id !== task.id))

    notify?.('Task deleted', () =>
      setTasks((previous) => [task, ...previous])
    )
  }

  // Clear completed tasks
  const clearDone = () => {
    const removed = tasks.filter((task) => task.done)

    if (!removed.length) return

    setTasks((previous) => previous.filter((task) => !task.done))

    notify?.(`${removed.length} completed task(s) cleared`, () =>
      setTasks((previous) => [...removed, ...previous])
    )
  }

  // Toggle a subtask
  const toggleSub = (taskId, subtaskId) => {
    setTasks((previous) =>
      previous.map((task) =>
        task.id === taskId
          ? {
              ...task,
              subtasks: (task.subtasks || []).map((subtask) =>
                subtask.id === subtaskId
                  ? { ...subtask, done: !subtask.done }
                  : subtask
              ),
            }
          : task
      )
    )
  }

  // Save a new or edited task
  const save = (form) => {
    const { isNew, ...task } = form

    if (isNew) {
      setTasks((previous) => [
        {
          ...defaultTask,
          ...task,
          id: uid(),
          done: false,
          createdAt: Date.now(),
        },
        ...previous,
      ])
      notify?.('New task created')
    } else {
      setTasks((previous) =>
        previous.map((item) =>
          item.id === task.id ? { ...item, ...task } : item
        )
      )
      notify?.('Task updated')
    }

    setModal(null)
    setQuick('')
  }

  const openNew = () => {
    const parsed = parseQuick(quick)

    setModal({
      ...defaultTask,
      ...parsed,
      isNew: true,
    })
  }

  return (
    <div className="space-y-6">

      {/* Page heading */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-accent-100 text-accent-600 dark:bg-accent-500/15 dark:text-accent-400">
              <ListTodo size={22} />
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              My Tasks
            </h2>
          </div>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Plan your day, track progress and get things done.
          </p>
        </div>

        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 rounded-xl bg-accent-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-accent-500/20 transition hover:bg-accent-700 active:scale-95"
        >
          <Plus size={18} />
          New task
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">

        <SummaryCard
          title="Total tasks"
          value={list.length}
          icon={ListTodo}
          color="bg-accent-100 text-accent-600 dark:bg-accent-500/15 dark:text-accent-400"
          description="All your tasks"
        />

        <SummaryCard
          title="In progress"
          value={active}
          icon={Clock}
          color="bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400"
          description="Still to complete"
        />

        <SummaryCard
          title="Completed"
          value={completed}
          icon={CircleCheck}
          color="bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400"
          description="Tasks finished"
        />

        <SummaryCard
          title="High priority"
          value={highPriority}
          icon={Target}
          color="bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400"
          description="Needs your attention"
        />
      </div>

      {/* Quick add */}
      <div className="rounded-2xl border border-accent-100 bg-gradient-to-br from-accent-50 to-white p-4 dark:border-accent-500/20 dark:from-accent-500/10 dark:to-slate-900 sm:p-5">
        <div className="mb-3 flex items-center gap-2">
          <Sparkles size={18} className="text-accent-600 dark:text-accent-400" />
          <h3 className="font-semibold text-slate-800 dark:text-white">
            Quick add task
          </h3>
        </div>

        <form onSubmit={quickAdd} className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Plus
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={quick}
              onChange={(e) => setQuick(e.target.value)}
              placeholder="Try: Submit report tomorrow !high #work"
              className={`${inputCls} pl-11`}
            />
          </div>

          <button
            type="submit"
            disabled={!quick.trim()}
            className="rounded-xl bg-accent-600 px-6 py-3 font-semibold text-white shadow-md transition hover:bg-accent-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Add task
          </button>
        </form>

        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          Tip: Use your existing quick-add format to include priority,
          category and due date.
        </p>

        <button
          onClick={openNew}
          className="mt-3 text-sm font-semibold text-accent-600 hover:text-accent-700 dark:text-accent-400"
        >
          + Add details, subtasks and repeat settings
        </button>
      </div>

      {/* Search and sort */}
      <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 sm:p-4">

        <div className="flex items-center gap-2">
          <SlidersHorizontal
            size={18}
            className="text-slate-500 dark:text-slate-400"
          />

          <h3 className="font-semibold text-slate-800 dark:text-white">
            Find your tasks
          </h3>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by task, description or category..."
              className={`${inputCls} py-2.5 pl-11 text-sm`}
            />
          </div>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            <option value="newest">Newest first</option>
            <option value="due">Due date</option>
            <option value="priority">Priority</option>
            <option value="alphabetical">Alphabetical</option>
          </select>
        </div>

        {/* Status filters */}
        <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
          {STATUS.map((item) => {
            const count =
              item === 'all'
                ? list.length
                : item === 'active'
                  ? active
                  : completed

            return (
              <button
                key={item}
                onClick={() => setStatus(item)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold capitalize transition ${
                  status === item
                    ? 'bg-white text-accent-600 shadow-sm dark:bg-slate-700 dark:text-white'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {item}
                <span className="rounded-full bg-slate-200/80 px-2 py-0.5 text-xs dark:bg-slate-600">
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Category filters */}
        <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {[{ id: 'all', emoji: '🗂️' }, ...CATEGORIES].map((category) => (
            <button
              key={category.id}
              onClick={() => setCat(category.id)}
              className={`shrink-0 rounded-full px-3.5 py-2 text-sm font-medium capitalize transition ${
                cat === category.id
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              {category.emoji} {category.id}
            </button>
          ))}
        </div>
      </div>

      {/* Task list heading */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white">
            Your task list
          </h3>

          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Showing {visible.length} of {list.length} tasks
          </p>
        </div>

        {list.some((task) => task.done) && (
          <button
            onClick={clearDone}
            className="text-sm font-semibold text-rose-500 transition hover:text-rose-600"
          >
            Clear completed
          </button>
        )}
      </div>

      {/* Tasks */}
      <ul className="space-y-3">
        {visible.length === 0 && (
          <li className="flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-14 text-center dark:border-slate-700 dark:bg-slate-900">
            <div className="mb-3 grid h-16 w-16 place-items-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
              {query ? (
                <Search size={30} />
              ) : (
                <ListTodo size={32} />
              )}
            </div>

            <h3 className="font-semibold text-slate-800 dark:text-white">
              {query ? 'No matching tasks' : 'No tasks found'}
            </h3>

            <p className="mt-1 max-w-xs text-sm text-slate-500 dark:text-slate-400">
              {query
                ? 'Try a different search term or change your filters.'
                : 'Add a new task and start organizing your day.'}
            </p>

            {!query && (
              <button
                onClick={openNew}
                className="mt-4 rounded-xl bg-accent-600 px-4 py-2 text-sm font-semibold text-white"
              >
                Create your first task
              </button>
            )}
          </li>
        )}

        {visible.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onToggle={toggle}
            onEdit={setModal}
            onRemove={remove}
            onSub={toggleSub}
          />
        ))}
      </ul>

      {/* Completed tasks footer */}
      {completed > 0 && (
        <div className="flex items-center justify-center gap-2 rounded-xl bg-emerald-50 py-3 text-sm font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
          <AlertCircle size={16} />
          You have completed {completed} task{completed !== 1 ? 's' : ''}.
          Great work!
        </div>
      )}

      {/* Add / edit modal */}
      {modal && (
        <TaskModal
          task={modal}
          onSave={save}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}
