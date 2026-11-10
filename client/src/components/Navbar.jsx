import { Link, useNavigate } from 'react-router-dom'
import { CheckSquare, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold text-indigo-600">
          <CheckSquare size={22} /> TaskFlow
        </Link>
        {user ? (
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-slate-600 sm:block">
              Hi, <b>{user.name}</b>
            </span>
            <button
              className="btn btn-ghost"
              onClick={() => {
                logout()
                navigate('/login')
              }}
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        ) : (
          <nav className="flex gap-2">
            <Link to="/login" className="btn btn-ghost">Login</Link>
            <Link to="/register" className="btn btn-primary">Sign up</Link>
          </nav>
        )}
      </div>
    </header>
  )
}
