import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FolderPlus, Pencil, Trash2 } from 'lucide-react'
import { projects as projectsApi } from '../api'
import Modal from '../components/Modal.jsx'
import ProjectForm, { COLORS } from '../components/ProjectForm.jsx'
import Spinner from '../components/Spinner.jsx'

export default function Dashboard() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modal, setModal] = useState(null) // null | { project? }

  async function load() {
    try {
      setItems(await projectsApi.list())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { load() }, [])

  async function handleSave(data) {
    if (modal.project) await projectsApi.update(modal.project._id, data)
    else await projectsApi.create(data)
    setModal(null)
    load()
  }

  async function handleDelete(p) {
    if (!confirm(`Delete "${p.name}" and all its tasks?`)) return
    await projectsApi.remove(p._id)
    load()
  }

  if (loading) return <Spinner />

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Your projects</h1>
          <p className="text-sm text-slate-500">{items.length} project(s)</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal({})}>
          <FolderPlus size={16} /> New project
        </button>
      </div>

      {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}

      {items.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-300 p-12 text-center text-slate-500">
          No projects yet. Create your first one!
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => {
            const pct = p.taskCount ? Math.round((p.doneCount / p.taskCount) * 100) : 0
            return (
              <div key={p._id} className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
                <div className={`h-2 ${COLORS[p.color]}`} />
                <Link to={`/projects/${p._id}`} className="block p-5">
                  <h2 className="text-lg font-semibold">{p.name}</h2>
                  <p className="mt-1 line-clamp-2 min-h-10 text-sm text-slate-500">
                    {p.description || 'No description'}
                  </p>
                  <div className="mt-4">
                    <div className="mb-1 flex justify-between text-xs text-slate-500">
                      <span>{p.doneCount}/{p.taskCount} tasks done</span>
                      <span>{pct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-100">
                      <div className={`h-1.5 rounded-full ${COLORS[p.color]}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </Link>
                <div className="absolute right-3 top-5 flex gap-1 opacity-0 transition group-hover:opacity-100">
                  <button className="btn btn-ghost !p-1.5" onClick={() => setModal({ project: p })} aria-label="Edit">
                    <Pencil size={15} />
                  </button>
                  <button className="btn btn-ghost !p-1.5 hover:!text-red-600" onClick={() => handleDelete(p)} aria-label="Delete">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {modal && (
        <Modal title={modal.project ? 'Edit project' : 'New project'} onClose={() => setModal(null)}>
          <ProjectForm initial={modal.project} onSubmit={handleSave} onCancel={() => setModal(null)} />
        </Modal>
      )}
    </>
  )
}
