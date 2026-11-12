
/* ---------------- DATE HELPERS ---------------- */

export function toISO(date) {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export function todayISO() {
  return toISO(new Date())
}

export function fmtMinutes(minutes) {
  const total = Math.max(0, Number(minutes) || 0)
  const hours = Math.floor(total / 60)
  const mins = total % 60

  if (hours === 0) return `${mins} min`
  if (mins === 0) return `${hours} hr`

  return `${hours} hr ${mins} min`
}

/* ---------------- UNIQUE ID ---------------- */

export function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

/* ---------------- PRIORITIES ---------------- */

export const PRIORITY = {
  high: {
    label: 'High',
    bar: 'bg-rose-500',
    badge: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400'
  },
  medium: {
    label: 'Medium',
    bar: 'bg-amber-500',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400'
  },
  low: {
    label: 'Low',
    bar: 'bg-emerald-500',
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400'
  }
}

/* ---------------- TASK CATEGORIES ---------------- */

export const CATEGORIES = [
  { id: 'Personal', emoji: '👤' },
  { id: 'Work', emoji: '💼' },
  { id: 'Study', emoji: '📚' },
  { id: 'Health', emoji: '❤️' },
  { id: 'Shopping', emoji: '🛍️' },
  { id: 'Other', emoji: '📌' }
]

/* ---------------- REPEAT OPTIONS ---------------- */

export const REPEATS = [
  { id: 'none', label: 'Does not repeat' },
  { id: 'daily', label: 'Daily' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'monthly', label: 'Monthly' },
  { id: 'yearly', label: 'Yearly' }
]

/* ---------------- NOTE COLORS ---------------- */

export const NOTE_COLORS = {
  default: {
    dot: 'bg-slate-200 dark:bg-slate-600',
    card: 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900'
  },
  yellow: {
    dot: 'bg-yellow-300',
    card: 'border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950/40'
  },
  pink: {
    dot: 'bg-pink-300',
    card: 'border-pink-200 bg-pink-50 dark:border-pink-900 dark:bg-pink-950/40'
  },
  blue: {
    dot: 'bg-blue-300',
    card: 'border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/40'
  },
  green: {
    dot: 'bg-green-300',
    card: 'border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/40'
  },
  purple: {
    dot: 'bg-purple-300',
    card: 'border-purple-200 bg-purple-50 dark:border-purple-900 dark:bg-purple-950/40'
  }
}

/* ---------------- ACCENT COLORS ---------------- */

export const ACCENTS = {
  violet: '#8b5cf6',
  blue: '#3b82f6',
  pink: '#ec4899',
  green: '#10b981',
  orange: '#f97316',
  rose: '#f43f5e'
}

/* ---------------- DUE DATE INFORMATION ---------------- */

export function dueInfo(due, done = false) {
  if (!due || done) return null

  const today = todayISO()

  if (due < today) {
    return {
      label: 'Overdue',
      cls: 'bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400'
    }
  }

  if (due === today) {
    return {
      label: 'Today',
      cls: 'bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400'
    }
  }

  const date = new Date(`${due}T00:00:00`)

  return {
    label: date.toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'short'
    }),
    cls: 'bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400'
  }
}

/* ---------------- NEXT REPEATING TASK DATE ---------------- */

export function nextDue(due, repeat) {
  if (!due || !repeat || repeat === 'none') return ''

  const date = new Date(`${due}T00:00:00`)

  if (Number.isNaN(date.getTime())) return ''

  if (repeat === 'daily') {
    date.setDate(date.getDate() + 1)
  } else if (repeat === 'weekly') {
    date.setDate(date.getDate() + 7)
  } else if (repeat === 'monthly') {
    const day = date.getDate()
    date.setDate(1)
    date.setMonth(date.getMonth() + 1)

    const lastDay = new Date(
      date.getFullYear(),
      date.getMonth() + 1,
      0
    ).getDate()

    date.setDate(Math.min(day, lastDay))
  } else if (repeat === 'yearly') {
    const month = date.getMonth()
    const day = date.getDate()

    date.setFullYear(date.getFullYear() + 1)

    if (date.getMonth() !== month) {
      date.setDate(0)
    }
  } else {
    return ''
  }

  return toISO(date)
}

/* ---------------- QUICK TASK INPUT ---------------- */

export function parseQuick(value) {
  let text = value.trim()
  let priority = 'medium'
  let category = 'Personal'
  let due = ''

  const priorityMatch = text.match(/!(high|medium|low)\b/i)

  if (priorityMatch) {
    priority = priorityMatch[1].toLowerCase()
    text = text.replace(priorityMatch[0], '')
  }

  const categoryMatch = text.match(/#([a-z]+)/i)

  if (categoryMatch) {
    const found = CATEGORIES.find(
      (c) => c.id.toLowerCase() === categoryMatch[1].toLowerCase()
    )

    if (found) category = found.id

    text = text.replace(categoryMatch[0], '')
  }

  if (/\btoday\b/i.test(text)) {
    due = todayISO()
    text = text.replace(/\btoday\b/i, '')
  } else if (/\btomorrow\b/i.test(text)) {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    due = toISO(tomorrow)
    text = text.replace(/\btomorrow\b/i, '')
  }

  return {
    text: text.replace(/\s+/g, ' ').trim(),
    priority,
    category,
    due
  }
}

/* ---------------- COMMON INPUT STYLE ---------------- */

export const inputCls =
  'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/15 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500'
