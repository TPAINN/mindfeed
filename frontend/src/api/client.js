const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// Render free tier cold-starts can take ~30s — generous timeout, then retry.
const TIMEOUT_MS   = 25000
const RETRIES      = 2
const RETRY_DELAYS = [1500, 4000]

function getToken() {
  return localStorage.getItem('mf_token')
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms))

async function attempt(path, options) {
  const token = getToken()
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(`${BASE}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }))
      const e = new Error(err.message || 'Request failed')
      e.status = res.status
      throw e
    }
    return await res.json()
  } finally {
    clearTimeout(timer)
  }
}

async function request(path, options = {}) {
  let lastErr
  for (let i = 0; i <= RETRIES; i++) {
    try {
      return await attempt(path, options)
    } catch (err) {
      lastErr = err
      // 4xx is a real answer (bad creds, not found) — don't retry those.
      const retryable = !err.status || err.status >= 500
      if (!retryable || i === RETRIES) break
      await sleep(RETRY_DELAYS[i] ?? 4000)
    }
  }
  throw lastErr
}

export const api = {
  get:    (path)       => request(path),
  post:   (path, body) => request(path, { method: 'POST',   body: JSON.stringify(body) }),
  patch:  (path, body) => request(path, { method: 'PATCH',  body: JSON.stringify(body) }),
  delete: (path)       => request(path, { method: 'DELETE' }),
}

// Local calendar date (YYYY-MM-DD) — the backend keys feeds on this so the
// feed flips at the user's midnight, not UTC midnight.
export function localDate() {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
