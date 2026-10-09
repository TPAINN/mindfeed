const { test, after } = require('node:test');
const assert = require('node:assert/strict');

process.env.NODE_ENV = 'production';
process.env.FRONTEND_URL = 'https://mindfeed.example/';
const app = require('../server');
const server = app.listen(0, '127.0.0.1');
after(() => server.close());

async function request(path, options = {}) {
  if (!server.listening) await new Promise(resolve => server.once('listening', resolve));
  return fetch(`http://127.0.0.1:${server.address().port}${path}`, options);
}

test('production accepts the configured frontend origin', async () => {
  const res = await request('/api/status', { headers: { Origin: 'https://mindfeed.example' } });
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('access-control-allow-origin'), 'https://mindfeed.example');
  assert.equal((await res.json()).status, 'ok');
});

test('production rejects unrelated hosted applications and localhost', async () => {
  for (const origin of ['https://attacker.vercel.app', 'https://attacker.netlify.app', 'https://attacker.onrender.com', 'http://localhost:5173']) {
    const res = await request('/api/status', { headers: { Origin: origin } });
    assert.equal(res.status, 403);
    assert.equal(res.headers.get('access-control-allow-origin'), null);
    assert.deepEqual(await res.json(), { message: 'Origin not allowed' });
  }
});

test('unknown API routes return JSON instead of HTML', async () => {
  const res = await request('/api/missing');
  assert.equal(res.status, 404);
  assert.deepEqual(await res.json(), { message: 'Endpoint not found' });
});

test('malformed JSON produces a client error without a stack trace', async () => {
  const res = await request('/api/users/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{invalid' });
  assert.equal(res.status, 400);
  const body = await res.json();
  assert.ok(body.message);
  assert.equal(body.stack, undefined);
});
