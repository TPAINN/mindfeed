import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const source = (await readFile(new URL('../src/api/client.js', import.meta.url), 'utf8'))
  .replace('import.meta.env.VITE_API_URL', 'undefined')
const { api } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`)
globalThis.localStorage = { getItem: () => null }
let calls = 0
globalThis.fetch = async () => {
  calls++
  return new Response('{"message":"Unavailable"}', { status: 503 })
}
await assert.rejects(api.post('/bookmark/1'), { message: 'Unavailable', status: 503 })
assert.equal(calls, 1, 'A failed toggle must never be retried automatically')

globalThis.fetch = async () => new Response(null, { status: 204 })
assert.equal(await api.delete('/bookmark/1'), null)

globalThis.fetch = async () => {
  calls++
  return new Response('{"message":"Unauthorized"}', { status: 401 })
}
calls = 0
await assert.rejects(api.get('/bookmarks'), { status: 401 })
assert.equal(calls, 1, 'A client error must not be retried')

let expired = 0
globalThis.localStorage.getItem = () => 'expired-token'
globalThis.window = { dispatchEvent: event => { if (event.type === 'mf:session-expired') expired++ } }
await assert.rejects(api.get('/bookmarks'), { status: 401 })
assert.equal(expired, 1, 'An expired protected session must return the user to sign-in')
await assert.rejects(api.post('/api/users/login', {}), { status: 401 })
assert.equal(expired, 1, 'Bad login credentials must not invalidate another session')
console.log('API checks passed: no write retries, 204 supported, 401 stops immediately, session expiry handled.')

calls = 0
globalThis.fetch = async () => { calls++; throw new DOMException('Timed out', 'AbortError') }
await assert.rejects(api.get('/feed'), { name: 'AbortError' })
assert.equal(calls, 1, 'A timeout must not start another minute-long attempt')
console.log('Timeout check passed: one cold-start window, no repeated wait.')
