// ─────────────────────────────────────────────────────────────
// API client: a thin wrapper over fetch for the TaskFlow REST API.
// In development Vite proxies /api to http://localhost:5000
// (see vite.config.js), so there are no CORS issues.
//
// Endpoints:
//   POST   /api/auth/register        POST   /api/auth/login
//   GET    /api/auth/me
//   GET    /api/projects             POST   /api/projects
//   GET    /api/projects/:id         PATCH  /api/projects/:id
//   DELETE /api/projects/:id
//   GET    /api/projects/:id/tasks   POST   /api/projects/:id/tasks
//   PATCH  /api/tasks/:id            DELETE /api/tasks/:id
// ─────────────────────────────────────────────────────────────

const TOKEN_KEY = 'taskflow-token'

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
}

class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}

async function request(path, { method = 'GET', body } = {}) {
  const token = tokenStore.get()
  const res = await fetch(`/api${path}`, {
    method,
    headers: {
      ...(body && { 'Content-Type': 'application/json' }),
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  if (res.status === 204) return null // DELETE success: no body
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new ApiError(data.message || 'Something went wrong', res.status)
  return data
}

// ── Auth ─────────────────────────────────────────────────────
export const auth = {
  register: ({ name, email, password }) =>
    request('/auth/register', { method: 'POST', body: { name, email, password } }),
  login: ({ email, password }) =>
    request('/auth/login', { method: 'POST', body: { email, password } }),
  me: () => request('/auth/me'),
}

// ── Projects ─────────────────────────────────────────────────
export const projects = {
  list: () => request('/projects'),
  get: (id) => request(`/projects/${id}`),
  create: ({ name, description, color }) =>
    request('/projects', { method: 'POST', body: { name, description, color } }),
  update: (id, data) => request(`/projects/${id}`, { method: 'PATCH', body: data }),
  remove: (id) => request(`/projects/${id}`, { method: 'DELETE' }),
}

// ── Tasks ────────────────────────────────────────────────────
export const tasks = {
  // filters: { search, status, priority }
  listByProject(projectId, filters = {}) {
    const params = new URLSearchParams()
    for (const [key, value] of Object.entries(filters)) {
      if (value) params.set(key, value) // skips "", undefined, null
    }
    const qs = params.toString()
    return request(`/projects/${projectId}/tasks${qs ? `?${qs}` : ''}`)
  },
  create: (projectId, { title, description, status, priority, dueDate }) =>
    request(`/projects/${projectId}/tasks`, {
      method: 'POST',
      body: { title, description, status, priority, dueDate },
    }),
  update: (id, data) => request(`/tasks/${id}`, { method: 'PATCH', body: data }),
  remove: (id) => request(`/tasks/${id}`, { method: 'DELETE' }),
}
