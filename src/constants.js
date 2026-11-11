export const uid = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 7)

export const inputCls =
  'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 dark:border-slate-700 dark:bg-slate-800 dark:placeholder:text-slate-500'

export const PRIORITY = {
  high: {
    label: 'High',
    badge: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
    bar: 'bg-rose-500',
  },
  medium: {
    label: 'Medium',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
    bar: 'bg-amber-500',
  },
  low: {
    label: 'Low',
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
    bar: 'bg-emerald-500',
  },
}

export const CATEGORIES = [
  { id: 'Personal', emoji: '🏠' },
  { id: 'Work', emoji: '💼' },
  { id: 'Study', emoji: '📚' },
  { id: 'Health', emoji: '💪' },
  { id: 'Other', emoji: '✨' },
]

export const NOTE_COLORS = {
  default: {
    card: 'bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800',
    dot: 'bg-slate-300 dark:bg-slate-600',
  },
  yellow: {
    card: 'bg-amber-50 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/30',
    dot: 'bg-amber-400',
  },
  green: {
    card: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/30',
    dot: 'bg-emerald-400',
  },
  blue: {
    card: 'bg-sky-50 border-sky-200 dark:bg-sky-500/10 dark:border-sky-500/30',
    dot: 'bg-sky-400',
  },
  pink: {
    card: 'bg-pink-50 border-pink-200 dark:bg-pink-500/10 dark:border-pink-500/30',
    dot: 'bg-pink-400',
  },
  purple: {
    card: 'bg-violet-50 border-violet-200 dark:bg-violet-500/10 dark:border-violet-500/30',
    dot: 'bg-violet-400',
  },
}

// Days between today and an ISO date (YYYY-MM-DD). Negative = past.
export const dayDiff = (iso) => {
  const d = new Date(iso + 'T00:00:00')
  const t = new Date()
  t.setHours(0, 0, 0, 0)
  return Math.round((d - t) / 86400000)
}

export const dueInfo = (iso, done) => {
  if (!iso) return null
  const diff = dayDiff(iso)
  const nice = new Date(iso + 'T00:00:00').toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
  })
  const muted = 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
  if (done) return { label: nice, cls: muted }
  if (diff < 0)
    return { label: `Overdue · ${nice}`, cls: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300' }
  if (diff === 0)
    return { label: 'Today', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300' }
  if (diff === 1)
    return { label: 'Tomorrow', cls: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300' }
  return { label: nice, cls: muted }
}