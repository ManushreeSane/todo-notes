import { nextDue, uid } from '../constants'

// Shared by the Tasks page and the Home dashboard
export default function useTaskActions(tasks, setTasks, bump) {
  const toggle = (id) => {
    const t = tasks.find((x) => x.id === id)
    if (!t) return

    const done = !t.done
    let next = tasks.map((x) =>
      x.id === id ? { ...x, done, completedAt: done ? Date.now() : null } : x
    )

    // repeating task: create the next occurrence when completed
    if (done && t.repeat && t.repeat !== 'none') {
      next = [
        {
          ...t,
          id: uid(),
          done: false,
          completedAt: null,
          createdAt: Date.now(),
          due: nextDue(t.due, t.repeat),
          subtasks: (t.subtasks || []).map((s) => ({ ...s, done: false })),
        },
        ...next,
      ]
    }

    setTasks(next)
    bump(done ? 1 : -1)
  }

  return { toggle }
}