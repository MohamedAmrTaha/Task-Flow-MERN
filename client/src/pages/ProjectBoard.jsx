import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Plus, Search } from 'lucide-react'
import { projects as projectsApi, tasks as tasksApi } from '../api'
import Modal from '../components/Modal.jsx'
import Spinner from '../components/Spinner.jsx'
import TaskCard from '../components/TaskCard.jsx'
import TaskForm from '../components/TaskForm.jsx'

const COLUMNS = [
  { id: 'todo', label: 'To do', dot: 'bg-slate-400' },
  { id: 'in-progress', label: 'In progress', dot: 'bg-amber-500' },
  { id: 'done', label: 'Done', dot: 'bg-emerald-500' },
]

export default function ProjectBoard() {
  const { id } = useParams()
  const [project, setProject] = useState(null)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [priority, setPriority] = useState('')
  const [modal, setModal] = useState(null) // null | { task?, status? }
  const [dragOver, setDragOver] = useState(null)

  const loadTasks = useCallback(async () => {
    try {
      setItems(await tasksApi.listByProject(id, { search, priority }))
    } catch (err) {
      setError(err.message)
    }
  }, [id, search, priority])

  useEffect(() => {
    projectsApi.get(id).then(setProject).catch((e) => setError(e.message))
  }, [id])

  useEffect(() => {
    loadTasks().finally(() => setLoading(false))
  }, [loadTasks])

  async function handleSave(data) {
    if (modal.task) await tasksApi.update(modal.task._id, data)
    else await tasksApi.create(id, data)
    setModal(null)
    loadTasks()
  }

  async function handleDelete() {
    await tasksApi.remove(modal.task._id)
    setModal(null)
    loadTasks()
  }

  async function handleDrop(e, status) {
    e.preventDefault()
    setDragOver(null)
    const taskId = e.dataTransfer.getData('text/plain')
    const task = items.find((t) => t._id === taskId)
    if (!task || task.status === status) return
    // optimistic update, then persist
    setItems((prev) => prev.map((t) => (t._id === taskId ? { ...t, status } : t)))
    try {
      await tasksApi.update(taskId, { status })
    } catch {
      loadTasks()
    }
  }

  if (loading) return <Spinner />
  if (!project)
    return (
      <div className="text-center">
        <p className="mb-4 text-red-600">{error || 'Project not found'}</p>
        <Link to="/" className="btn btn-primary">Back to projects</Link>
      </div>
    )

  return (
    <>
      <Link to="/" className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800">
        <ArrowLeft size={14} /> All projects
      </Link>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{project.name}</h1>
          {project.description && <p className="text-sm text-slate-500">{project.description}</p>}
        </div>
        <button className="btn btn-primary" onClick={() => setModal({})}>
          <Plus size={16} /> New task
        </button>
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        <div className="relative min-w-52 flex-1 sm:max-w-xs">
          <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
          <input className="input !pl-9" placeholder="Search tasks…" value={search}
            onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="input !w-auto" value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="">All priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {COLUMNS.map((col) => {
          const colTasks = items.filter((t) => t.status === col.id)
          return (
            <section
              key={col.id}
              onDragOver={(e) => { e.preventDefault(); setDragOver(col.id) }}
              onDragLeave={() => setDragOver(null)}
              onDrop={(e) => handleDrop(e, col.id)}
              className={`min-h-64 rounded-2xl p-3 transition ${
                dragOver === col.id ? 'bg-indigo-50 ring-2 ring-indigo-300' : 'bg-slate-100'
              }`}
            >
              <div className="mb-3 flex items-center justify-between px-1">
                <h2 className="flex items-center gap-2 text-sm font-semibold">
                  <span className={`h-2.5 w-2.5 rounded-full ${col.dot}`} /> {col.label}
                  <span className="rounded-full bg-white px-2 text-xs text-slate-500">{colTasks.length}</span>
                </h2>
                <button className="btn btn-ghost !p-1" aria-label={`Add to ${col.label}`}
                  onClick={() => setModal({ status: col.id })}>
                  <Plus size={16} />
                </button>
              </div>
              <div className="space-y-2">
                {colTasks.map((t) => (
                  <TaskCard key={t._id} task={t} onClick={() => setModal({ task: t })} />
                ))}
              </div>
            </section>
          )
        })}
      </div>

      {modal && (
        <Modal title={modal.task ? 'Edit task' : 'New task'} onClose={() => setModal(null)}>
          <TaskForm
            initial={modal.task ?? { status: modal.status || 'todo' }}
            onSubmit={handleSave}
            onDelete={modal.task ? handleDelete : undefined}
            onCancel={() => setModal(null)}
          />
        </Modal>
      )}
    </>
  )
}
