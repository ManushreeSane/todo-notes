import { useMemo, useState } from 'react'
import { Plus, Search, Pin, PinOff, Trash2, StickyNote } from 'lucide-react'
import Modal from './Modal'
import { NOTE_COLORS, uid, inputCls } from '../constants'

function NoteModal({ note, onSave, onDelete, onClose }) {
  const [form, setForm] = useState(note)
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const words = form.body.trim() ? form.body.trim().split(/\s+/).length : 0

  return (
    <Modal title={note.isNew ? 'New note' : 'Edit note'} onClose={onClose}>
      <div className="space-y-4">
        <input
          autoFocus
          value={form.title}
          onChange={(e) => set('title', e.target.value)}
          placeholder="Title"
          className={`${inputCls} text-lg font-semibold`}
        />
        <textarea
          value={form.body}
          onChange={(e) => set('body', e.target.value)}
          placeholder="Write something..."
          rows={9}
          className={inputCls}
        />

        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {Object.entries(NOTE_COLORS).map(([key, c]) => (
              <button
                key={key}
                onClick={() => set('color', key)}
                aria-label={`Color ${key}`}
                className={`h-8 w-8 rounded-full ${c.dot} transition ${
                  form.color === key ? 'scale-110 ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-900' : ''
                }`}
              />
            ))}
          </div>
          <button
            onClick={() => set('pinned', !form.pinned)}
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium ${
              form.pinned
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            {form.pinned ? <PinOff size={15} /> : <Pin size={15} />}
            {form.pinned ? 'Pinned' : 'Pin'}
          </button>
        </div>

        <p className="text-xs text-slate-400">
          {words} words · {form.body.length} characters
        </p>

        <div className="flex gap-2">
          <button
            onClick={() => onSave(form)}
            className="flex-1 rounded-2xl bg-linear-to-r from-indigo-600 to-violet-600 py-3.5 font-semibold text-white shadow-lg shadow-indigo-500/25 active:scale-[0.98]"
          >
            Save note
          </button>
          {!note.isNew && (
            <button
              onClick={() => onDelete(note)}
              aria-label="Delete note"
              className="grid w-14 place-items-center rounded-2xl bg-rose-50 text-rose-500 dark:bg-rose-500/10"
            >
              <Trash2 size={20} />
            </button>
          )}
        </div>
      </div>
    </Modal>
  )
}

function NoteCard({ n, onOpen }) {
  const color = NOTE_COLORS[n.color] || NOTE_COLORS.default
  return (
    <button
      onClick={() => onOpen(n)}
      className={`animate-fade-up mb-3 block w-full break-inside-avoid rounded-2xl border p-4 text-left shadow-xs transition hover:-translate-y-0.5 hover:shadow-md ${color.card}`}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="break-words font-semibold">{n.title || 'Untitled'}</h3>
        {n.pinned && <Pin size={14} className="mt-1 shrink-0 text-indigo-500" />}
      </div>
      {n.body && (
        <p className="mt-1 line-clamp-6 whitespace-pre-wrap break-words text-sm text-slate-600 dark:text-slate-300">
          {n.body}
        </p>
      )}
      <p className="mt-3 text-xs text-slate-400">
        {new Date(n.updated).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
      </p>
    </button>
  )
}

export default function Notes({ notes, setNotes, notify }) {
  const [query, setQuery] = useState('')
  const [modal, setModal] = useState(null)

  const list = useMemo(
    () => notes.map((n) => ({ color: 'default', pinned: false, updated: 0, ...n })),
    [notes]
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return list
      .filter((n) => !q || n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q))
      .sort((a, b) => b.updated - a.updated)
  }, [list, query])

  const pinned = filtered.filter((n) => n.pinned)
  const others = filtered.filter((n) => !n.pinned)

  const openNew = () =>
    setModal({ isNew: true, id: uid(), title: '', body: '', color: 'default', pinned: false })

  const save = (form) => {
    const { isNew, ...note } = form
    if (!note.title.trim() && !note.body.trim()) return setModal(null)
    note.updated = Date.now()
    setNotes(isNew ? [note, ...notes] : notes.map((n) => (n.id === note.id ? note : n)))
    setModal(null)
  }

  const remove = (note) => {
    const { isNew, ...clean } = note
    setNotes(notes.filter((n) => n.id !== clean.id))
    setModal(null)
    notify('Note deleted', () => setNotes((prev) => [clean, ...prev]))
  }

  const grid = (items) => <div className="columns-2 gap-3">{items.map((n) => <NoteCard key={n.id} n={n} onOpen={setModal} />)}</div>
  const heading = 'mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400'

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search notes"
            className={`${inputCls} pl-11`}
          />
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-1.5 rounded-2xl bg-indigo-600 px-5 font-semibold text-white shadow-md shadow-indigo-500/25 active:scale-95"
        >
          <Plus size={18} /> New
        </button>
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-16 text-slate-400">
          <StickyNote size={40} strokeWidth={1.5} />
          <span>No notes yet</span>
        </div>
      )}

      {pinned.length > 0 && (
        <section>
          <h2 className={heading}>Pinned</h2>
          {grid(pinned)}
        </section>
      )}

      {others.length > 0 && (
        <section>
          {pinned.length > 0 && <h2 className={heading}>Others</h2>}
          {grid(others)}
        </section>
      )}

      {modal && <NoteModal note={modal} onSave={save} onDelete={remove} onClose={() => setModal(null)} />}
    </div>
  )
}