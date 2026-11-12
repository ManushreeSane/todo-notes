
import { useMemo, useState } from 'react'
import {
  Plus,
  Search,
  Pin,
  PinOff,
  Trash2,
  StickyNote,
  Tag,
  Clock,
  FileText,
  X,
  Pencil,
  Sparkles,
} from 'lucide-react'

import Modal from './Modal'

import { NOTE_COLORS, uid, inputCls } from '../constants'

// ---------------- Note editor modal ----------------

function NoteModal({ note, onSave, onDelete, onClose }) {
  const [form, setForm] = useState({
    title: '',
    body: '',
    color: 'default',
    pinned: false,
    tags: [],
    ...note,
  })

  const [tagText, setTagText] = useState('')

  const set = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  const words = form.body.trim()
    ? form.body.trim().split(/\s+/).length
    : 0

  const addTags = () => {
    const newTags = tagText
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean)

    if (!newTags.length) return

    set(
      'tags',
      [...new Set([...(form.tags || []), ...newTags])]
    )

    setTagText('')
  }

  const removeTag = (tagToRemove) => {
    set(
      'tags',
      form.tags.filter((tag) => tag !== tagToRemove)
    )
  }

  const submit = (e) => {
    e.preventDefault()

    if (!form.title.trim() && !form.body.trim()) {
      onClose()
      return
    }

    onSave({
      ...form,
      title: form.title.trim(),
      body: form.body.trim(),
    })
  }

  return (
    <Modal
      title={note.isNew ? 'Create a new note' : 'Edit your note'}
      onClose={onClose}
    >
      <form onSubmit={submit} className="space-y-5">

        {/* Title */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-600 dark:text-slate-300">
            Note title
          </label>

          <input
            autoFocus
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            placeholder="Give your note a title..."
            className={`${inputCls} text-lg font-semibold`}
          />
        </div>

        {/* Body */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-600 dark:text-slate-300">
            Your note
          </label>

          <textarea
            value={form.body}
            onChange={(e) => set('body', e.target.value)}
            placeholder="Start writing your thoughts..."
            rows={9}
            className={`${inputCls} resize-y leading-7`}
          />
        </div>

        {/* Tags */}
        <div>
          <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
            <Tag size={15} />
            Tags
          </label>

          <div className="flex gap-2">
            <input
              value={tagText}
              onChange={(e) => setTagText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addTags()
                }
              }}
              placeholder="Study, Work, Ideas..."
              className={`${inputCls} py-2.5 text-sm`}
            />

            <button
              type="button"
              onClick={addTags}
              className="rounded-xl bg-slate-100 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-white"
            >
              Add
            </button>
          </div>

          {form.tags?.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {form.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 rounded-full bg-accent-100 px-3 py-1 text-xs font-semibold text-accent-700 dark:bg-accent-500/15 dark:text-accent-300"
                >
                  #{tag}

                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    aria-label={`Remove ${tag} tag`}
                  >
                    <X size={13} />
                  </button>
                </span>
              ))}
            </div>
          )}

          <p className="mt-2 text-xs text-slate-400">
            You can add multiple tags separated by commas.
          </p>
        </div>

        {/* Note colors */}
        <div>
          <label className="mb-3 block text-sm font-semibold text-slate-600 dark:text-slate-300">
            Note color
          </label>

          <div className="flex flex-wrap gap-3">
            {Object.entries(NOTE_COLORS).map(([key, color]) => (
              <button
                key={key}
                type="button"
                onClick={() => set('color', key)}
                aria-label={`Choose ${key} color`}
                className={`h-9 w-9 rounded-full ${color.dot} transition ${
                  form.color === key
                    ? 'scale-110 ring-2 ring-accent-500 ring-offset-2 dark:ring-offset-slate-900'
                    : 'hover:scale-110'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Pin option */}
        <button
          type="button"
          onClick={() => set('pinned', !form.pinned)}
          className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${
            form.pinned
              ? 'bg-accent-600 text-white'
              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          {form.pinned ? <PinOff size={16} /> : <Pin size={16} />}
          {form.pinned ? 'Remove from pinned' : 'Pin this note'}
        </button>

        {/* Word count */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>{words} words</span>
          <span>{form.body.length} characters</span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 rounded-xl bg-gradient-to-r from-accent-600 to-accent-500 py-3.5 font-bold text-white shadow-lg shadow-accent-500/20 transition hover:opacity-90 active:scale-[0.98]"
          >
            {note.isNew ? 'Create note' : 'Save changes'}
          </button>

          {!note.isNew && (
            <button
              type="button"
              onClick={() => onDelete(note)}
              aria-label="Delete note"
              className="grid w-14 place-items-center rounded-xl bg-rose-50 text-rose-500 transition hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20"
            >
              <Trash2 size={20} />
            </button>
          )}
        </div>
      </form>
    </Modal>
  )
}

// ---------------- Note card ----------------

function NoteCard({ note, onOpen }) {
  const color = NOTE_COLORS[note.color] || NOTE_COLORS.default

  const date = note.updated
    ? new Date(note.updated)
    : note.createdAt
      ? new Date(note.createdAt)
      : null

  return (
    <article
      className={`group relative mb-4 break-inside-avoid overflow-hidden rounded-2xl border p-4 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg ${color.card}`}
    >
      <button
        type="button"
        onClick={() => onOpen(note)}
        aria-label={`Open note ${note.title || 'Untitled'}`}
        className="absolute inset-0 z-0"
      />

      <div className="relative z-10 pointer-events-none">

        <div className="mb-3 flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${color.dot}`} />

            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Note
            </span>
          </div>

          {note.pinned && (
            <Pin
              size={15}
              className="shrink-0 text-accent-600 dark:text-accent-400"
            />
          )}
        </div>

        <h3 className="break-words text-base font-bold text-slate-800 dark:text-white">
          {note.title || 'Untitled note'}
        </h3>

        {note.body && (
          <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600 dark:text-slate-300">
            {note.body}
          </p>
        )}

        {note.tags?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {note.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-white/60 px-2 py-1 text-[10px] font-semibold text-slate-600 dark:bg-slate-900/40 dark:text-slate-300"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-4 flex items-center justify-between border-t border-slate-300/30 pt-3 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <Clock size={12} />
            {date
              ? date.toLocaleDateString(undefined, {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })
              : 'No date'}
          </span>

          <span className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
            <Pencil size={12} />
            Edit
          </span>
        </div>
      </div>
    </article>
  )
}

// ---------------- Notes page ----------------

export default function Notes({ notes = [], setNotes, notify }) {
  const [query, setQuery] = useState('')
  const [modal, setModal] = useState(null)
  const [showPinnedOnly, setShowPinnedOnly] = useState(false)

  // Add defaults for older notes
  const list = useMemo(
    () =>
      notes.map((note) => ({
        color: 'default',
        pinned: false,
        updated: 0,
        tags: [],
        ...note,
        tags: Array.isArray(note.tags) ? note.tags : [],
      })),
    [notes]
  )

  const pinnedCount = list.filter((note) => note.pinned).length

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()

    return list
      .filter((note) => !showPinnedOnly || note.pinned)
      .filter((note) => {
        if (!q) return true

        return (
          (note.title || '').toLowerCase().includes(q) ||
          (note.body || '').toLowerCase().includes(q) ||
          (note.tags || []).some((tag) =>
            tag.toLowerCase().includes(q)
          )
        )
      })
      .sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
        return (b.updated || 0) - (a.updated || 0)
      })
  }, [list, query, showPinnedOnly])

  const pinned = filtered.filter((note) => note.pinned)
  const others = filtered.filter((note) => !note.pinned)

  // Create note
  const openNew = () => {
    setModal({
      isNew: true,
      id: uid(),
      title: '',
      body: '',
      color: 'default',
      pinned: false,
      tags: [],
    })
  }

  // Save note
  const save = (form) => {
    const { isNew, ...note } = form

    if (!note.title.trim() && !note.body.trim()) {
      setModal(null)
      return
    }

    const updatedNote = {
      ...note,
      updated: Date.now(),
    }

    if (isNew) {
      setNotes((previous) => [updatedNote, ...previous])
      notify?.('Note created successfully')
    } else {
      setNotes((previous) =>
        previous.map((item) =>
          item.id === updatedNote.id ? updatedNote : item
        )
      )
      notify?.('Note updated successfully')
    }

    setModal(null)
  }

  // Delete note with undo
  const remove = (note) => {
    const { isNew, ...cleanNote } = note

    setNotes((previous) =>
      previous.filter((item) => item.id !== cleanNote.id)
    )

    setModal(null)

    notify?.('Note deleted', () =>
      setNotes((previous) => [cleanNote, ...previous])
    )
  }

  // Masonry-style note layout
  const grid = (items) => (
    <div className="columns-1 gap-4 sm:columns-2 xl:columns-3">
      {items.map((note) => (
        <NoteCard
          key={note.id}
          note={note}
          onOpen={setModal}
        />
      ))}
    </div>
  )

  return (
    <div className="space-y-6">

      {/* Heading */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-accent-100 text-accent-600 dark:bg-accent-500/15 dark:text-accent-400">
              <StickyNote size={22} />
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              My Notes
            </h2>
          </div>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Keep your ideas, thoughts and important information together.
          </p>
        </div>

        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 rounded-xl bg-accent-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-accent-500/20 transition hover:bg-accent-700 active:scale-95"
        >
          <Plus size={18} />
          New note
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">

        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <FileText size={17} />
            <span className="text-sm">Total notes</span>
          </div>

          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {list.length}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <Pin size={17} />
            <span className="text-sm">Pinned notes</span>
          </div>

          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {pinnedCount}
          </p>
        </div>

        <div className="col-span-2 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:col-span-1">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <Tag size={17} />
            <span className="text-sm">Tagged notes</span>
          </div>

          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {list.filter((note) => note.tags.length > 0).length}
          </p>
        </div>
      </div>

      {/* Search and filters */}
      <div className="rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 sm:p-4">

        <div className="flex flex-col gap-3 sm:flex-row">

          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search titles, content or tags..."
              className={`${inputCls} py-3 pl-11`}
            />
          </div>

          <button
            onClick={() => setShowPinnedOnly(!showPinnedOnly)}
            className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${
              showPinnedOnly
                ? 'bg-accent-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            <Pin size={16} />
            {showPinnedOnly ? 'Showing pinned' : 'Pinned only'}
          </button>
        </div>
      </div>

      {/* Note list heading */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white">
            Your collection
          </h3>

          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {filtered.length} note{filtered.length !== 1 ? 's' : ''} found
          </p>
        </div>

        <div className="flex items-center gap-1 text-xs font-medium text-slate-400">
          <Sparkles size={14} />
          Organized by recent activity
        </div>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-16 text-center dark:border-slate-700 dark:bg-slate-900">

          <div className="mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-accent-50 text-accent-500 dark:bg-accent-500/10">
            {query ? <Search size={30} /> : <StickyNote size={32} />}
          </div>

          <h3 className="font-bold text-slate-800 dark:text-white">
            {query
              ? 'No matching notes'
              : showPinnedOnly
                ? 'No pinned notes'
                : 'Your notes are waiting'}
          </h3>

          <p className="mt-2 max-w-xs text-sm text-slate-500 dark:text-slate-400">
            {query
              ? 'Try another keyword or clear your search.'
              : showPinnedOnly
                ? 'Pin a note to keep it easy to find here.'
                : 'Create your first note to save your ideas and important information.'}
          </p>

          {!query && !showPinnedOnly && (
            <button
              onClick={openNew}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-accent-600 px-4 py-2.5 text-sm font-semibold text-white"
            >
              <Plus size={17} />
              Create your first note
            </button>
          )}
        </div>
      )}

      {/* Pinned notes */}
      {pinned.length > 0 && (
        <section>
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
            <Pin size={15} className="text-accent-500" />
            Pinned notes
          </h3>

          {grid(pinned)}
        </section>
      )}

      {/* Other notes */}
      {others.length > 0 && (
        <section>
          {pinned.length > 0 && (
            <h3 className="mb-3 text-sm font-bold text-slate-700 dark:text-slate-200">
              Other notes
            </h3>
          )}

          {grid(others)}
        </section>
      )}

      {/* Editor */}
      {modal && (
        <NoteModal
          note={modal}
          onSave={save}
          onDelete={remove}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}
