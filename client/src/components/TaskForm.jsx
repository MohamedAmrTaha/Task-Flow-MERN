import { useState } from 'react'

export default function TaskForm({ initial, onSubmit, onDelete, onCancel }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    ...initial,
    dueDate: initial?.dueDate ? initial.dueDate.slice(0, 10) : '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await onSubmit({ ...form, dueDate: form.dueDate || null })
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label">Title</label>
        <input className="input" required value={form.title} onChange={set('title')} autoFocus />
      </div>
      <div>
        <label className="label">Description</label>
        <textarea className="input" rows={3} value={form.description} onChange={set('description')} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Status</label>
          <select className="input" value={form.status} onChange={set('status')}>
            <option value="todo">To do</option>
            <option value="in-progress">In progress</option>
            <option value="done">Done</option>
          </select>
        </div>
        <div>
          <label className="label">Priority</label>
          <select className="input" value={form.priority} onChange={set('priority')}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>
      <div>
        <label className="label">Due date</label>
        <input type="date" className="input" value={form.dueDate} onChange={set('dueDate')} />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex items-center justify-between">
        {onDelete ? (
          <button type="button" className="btn btn-danger" onClick={onDelete}>Delete</button>
        ) : (
          <span />
        )}
        <div className="flex gap-2">
          <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
          <button className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
        </div>
      </div>
    </form>
  )
}
