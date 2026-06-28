const BASE = '/api'

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  })
  const isJson = res.headers.get('content-type')?.includes('application/json')
  const data = isJson ? await res.json().catch(() => null) : null
  if (!res.ok) {
    throw new Error(data?.message || data?.error || `Request failed (${res.status})`)
  }
  return data
}

export const api = {
  login: (phone, password) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ phone, password }) }),
  register: (phone, password, username) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify({ phone, password, username }) }),
  logout: () =>
    request('/auth/logout', { method: 'POST' }),
  me: () => request('/profile/me'),
  updateProfile: (updates) =>
  request('/profile/update', { method: 'POST', body: JSON.stringify(updates) }),
  shopItems: () => request('/shop/items'),
  buyTicket: () =>
    request('/shop/buy-ticket', { method: 'POST' }),
  leaderboard: (type) => request(`/leaderboard?type=${type}`),
  stats: () => request('/stats')
}
