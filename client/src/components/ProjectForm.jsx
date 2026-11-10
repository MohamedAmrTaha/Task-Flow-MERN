import { useState } from 'react'

export const COLORS = {
  indigo: 'bg-indigo-500',
  emerald: 'bg-emerald-500',
  rose: 'bg-rose-500',
  amber: 'bg-amber-500',
  sky: 'bg-sky-500',
  violet: 'bg-violet-500',
}

export default function ProjectForm({ initial, onSubmit, onCancel }) {
  const [form, setForm] = useState({ name: '', description: '', color: 'indigo', ...initial })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await onSubmit(form)
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label">Name</label>
        <input className="input" required value={form.name} onChange={set('name')} autoFocus />
      </div>
      <div>
        <label className="label">Description</label>
        <textarea className="input" rows={3} value={form.description} onChange={set('description')} />
      </div>
      <div>
        <label className="label">Color</label>
        <div className="flex gap-2">
          {Object.entries(COLORS).map(([name, cls]) => (
            <button
              type="button"
              key={name}
              aria-label={name}
              onClick={() => setForm({ ...form, color: name })}
              className={`h-8 w-8 rounded-full ${cls} ${
                form.color === name ? 'ring-2 ring-offset-2 ring-slate-700' : ''
              }`}
            />
          ))}
        </div>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex justify-end gap-2">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
        <button className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
      </div>
    </form>
  )
}
