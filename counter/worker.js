const SITE = 'https://mingxuan-liu.github.io';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_BATCH = 1000;

const CREATE_BATCHES = `
  CREATE TABLE IF NOT EXISTS pet_batches (
    seq INTEGER PRIMARY KEY,
    batch_id TEXT NOT NULL UNIQUE,
    total INTEGER NOT NULL CHECK (total >= 0)
  )`;
const READ_TOTAL = 'SELECT COALESCE((SELECT total FROM pet_batches ORDER BY seq DESC LIMIT 1), 0) AS count';
// Both the previous total and the new row belong to the same SQLite write.
// The unique receipt makes a retry harmless even if its first response was lost.
const ADD_BATCH = `
  INSERT INTO pet_batches (batch_id, total)
  VALUES (?, COALESCE((SELECT total FROM pet_batches ORDER BY seq DESC LIMIT 1), 0) + ?)
  ON CONFLICT (batch_id) DO NOTHING`;

const headers = {
  'Access-Control-Allow-Origin': SITE,
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Cache-Control': 'no-store',
  'Content-Type': 'application/json; charset=utf-8',
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers });
}

async function readOrAdd(db, batch) {
  const read = db.prepare(READ_TOTAL);
  if (!batch) return read.first();
  const add = db.prepare(ADD_BATCH).bind(batch.id.toLowerCase(), batch.by);
  const [, result] = await db.batch([add, read]);
  return result.results[0];
}

export default {
  async fetch(request, env) {
    if (new URL(request.url).pathname !== '/') return json({ error: 'Not found' }, 404);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
    if (!['GET', 'POST'].includes(request.method)) return json({ error: 'Method not allowed' }, 405);

    let batch;
    if (request.method === 'POST') {
      if (request.headers.get('Origin') !== SITE) return json({ error: 'Forbidden' }, 403);
      try {
        batch = await request.json();
      } catch {
        return json({ error: 'Invalid JSON' }, 400);
      }
      if (typeof batch?.id !== 'string' || !UUID.test(batch.id) ||
          !Number.isInteger(batch.by) || batch.by < 1 || batch.by > MAX_BATCH) {
        return json({ error: 'Invalid pet batch' }, 400);
      }
    }

    try {
      const db = env.COUNTER;
      try {
        return json(await readOrAdd(db, batch));
      } catch (error) {
        // D1 supplies the underlying SQL error on the message or its cause.
        if (!/no such table: pet_batches/i.test([error.message, error.cause?.message].join(' '))) throw error;
        await db.prepare(CREATE_BATCHES).run();
        return json(await readOrAdd(db, batch));
      }
    } catch {
      return json({ error: 'Counter temporarily unavailable' }, 503);
    }
  },
};
