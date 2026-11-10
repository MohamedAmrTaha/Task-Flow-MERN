import { Calendar } from 'lucide-react'

const PRIORITY = {
  low: 'bg-slate-100 text-slate-600',
  medium: 'bg-amber-100 text-amber-700',
  high: 'bg-red-100 text-red-700',
}

export default function TaskCard({ task, onClick }) {
  const overdue = task.dueDate && task.status !== 'done' && new Date(task.dueDate) < new Date()

  return (
    <div
      draggable
      onDragStart={(e) => e.dataTransfer.setData('text/plain', task._id)}
      onClick={onClick}
      className="cursor-grab rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition hover:shadow-md active:cursor-grabbing"
    >
      <p className="font-medium">{task.title}</p>
      {task.description && (
        <p className="mt-1 line-clamp-2 text-sm text-slate-500">{task.description}</p>
      )}
      <div className="mt-3 flex items-center justify-between text-xs">
        <span className={`rounded-full px-2 py-0.5 font-medium ${PRIORITY[task.priority]}`}>
          {task.priority}
        </span>
        {task.dueDate && (
          <span className={`flex items-center gap-1 ${overdue ? 'text-red-600' : 'text-slate-500'}`}>
            <Calendar size={12} /> {new Date(task.dueDate).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  )
}
