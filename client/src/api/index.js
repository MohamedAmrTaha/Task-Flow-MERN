// ─────────────────────────────────────────────────────────────
// MOCK API (localStorage) — this file is what we replace with a
// real backend later. Every function is async and returns the
// same shape the real REST API will return, so no component
// needs to change when we swap it for fetch/axios calls.
//
// Planned endpoints:
//   POST   /api/auth/register        POST   /api/auth/login
//   GET    /api/auth/me
//   GET    /api/projects             POST   /api/projects
//   GET    /api/projects/:id         PATCH  /api/projects/:id
//   DELETE /api/projects/:id
//   GET    /api/projects/:id/tasks   POST   /api/projects/:id/tasks
//   PATCH  /api/tasks/:id            DELETE /api/tasks/:id
// ─────────────────────────────────────────────────────────────

const DB_KEY = 'taskflow-mock-db'
const TOKEN_KEY = 'taskflow-token'
const delay = (ms = 250) => new Promise((r) => setTimeout(r, ms))
const uid = () => Math.random().toString(16).slice(2, 10) + Date.now().toString(16)

function loadDb() {
  try {
    return JSON.parse(localStorage.getItem(DB_KEY)) ?? { users: [], projects: [], tasks: [] }
  } catch {
    return { users: [], projects: [], tasks: [] }
  }
}
const saveDb = (db) => localStorage.setItem(DB_KEY, JSON.stringify(db))

class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}

function currentUserId() {
  const token = localStorage.getItem(TOKEN_KEY)
  if (!token) throw new ApiError('Not authenticated', 401)
  return token.replace('mock-token-', '')
}

// ── Auth ─────────────────────────────────────────────────────
export const auth = {
  async register({ name, email, password }) {
    await delay()
    const db = loadDb()
    if (db.users.some((u) => u.email === email.toLowerCase()))
      throw new ApiError('Email already in use', 409)
    const user = { _id: uid(), name, email: email.toLowerCase(), password }
    db.users.push(user)
    saveDb(db)
    const token = 'mock-token-' + user._id
    return { token, user: { _id: user._id, name, email: user.email } }
  },

  async login({ email, password }) {
    await delay()
    const user = loadDb().users.find((u) => u.email === email.toLowerCase())
    if (!user || user.password !== password) throw new ApiError('Invalid email or password', 401)
    return {
      token: 'mock-token-' + user._id,
      user: { _id: user._id, name: user.name, email: user.email },
    }
  },

  async me() {
    await delay(100)
    const id = currentUserId()
    const user = loadDb().users.find((u) => u._id === id)
    if (!user) throw new ApiError('User not found', 401)
    return { _id: user._id, name: user.name, email: user.email }
  },
}

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
}

// ── Projects ─────────────────────────────────────────────────
export const projects = {
  async list() {
    await delay()
    const owner = currentUserId()
    const db = loadDb()
    return db.projects
      .filter((p) => p.owner === owner)
      .map((p) => {
        const t = db.tasks.filter((x) => x.project === p._id)
        return { ...p, taskCount: t.length, doneCount: t.filter((x) => x.status === 'done').length }
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  },

  async get(id) {
    await delay(150)
    const p = loadDb().projects.find((x) => x._id === id && x.owner === currentUserId())
    if (!p) throw new ApiError('Project not found', 404)
    return p
  },

  async create({ name, description, color }) {
    await delay()
    const db = loadDb()
    const project = {
      _id: uid(),
      owner: currentUserId(),
      name,
      description: description || '',
      color: color || 'indigo',
      createdAt: new Date().toISOString(),
    }
    db.projects.push(project)
    saveDb(db)
    return project
  },

  async update(id, data) {
    await delay()
    const db = loadDb()
    const p = db.projects.find((x) => x._id === id && x.owner === currentUserId())
    if (!p) throw new ApiError('Project not found', 404)
    Object.assign(p, data)
    saveDb(db)
    return p
  },

  async remove(id) {
    await delay()
    const db = loadDb()
    const owner = currentUserId()
    db.projects = db.projects.filter((x) => !(x._id === id && x.owner === owner))
    db.tasks = db.tasks.filter((t) => t.project !== id)
    saveDb(db)
  },
}

// ── Tasks ────────────────────────────────────────────────────
export const tasks = {
  // filters: { search, status, priority }
  async listByProject(projectId, filters = {}) {
    await delay(150)
    await projects.get(projectId) // ownership check
    const { search = '', status, priority } = filters
    return loadDb()
      .tasks.filter((t) => t.project === projectId)
      .filter((t) => !status || t.status === status)
      .filter((t) => !priority || t.priority === priority)
      .filter((t) => t.title.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  },

  async create(projectId, { title, description, status, priority, dueDate }) {
    await delay()
    await projects.get(projectId)
    const db = loadDb()
    const task = {
      _id: uid(),
      project: projectId,
      title,
      description: description || '',
      status: status || 'todo', // todo | in-progress | done
      priority: priority || 'medium', // low | medium | high
      dueDate: dueDate || null,
      createdAt: new Date().toISOString(),
    }
    db.tasks.push(task)
    saveDb(db)
    return task
  },

  async update(id, data) {
    await delay(150)
    const db = loadDb()
    const t = db.tasks.find((x) => x._id === id)
    if (!t) throw new ApiError('Task not found', 404)
    Object.assign(t, data)
    saveDb(db)
    return t
  },

  async remove(id) {
    await delay(150)
    const db = loadDb()
    db.tasks = db.tasks.filter((t) => t._id !== id)
    saveDb(db)
  },
}
