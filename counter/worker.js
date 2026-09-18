/**
 * Global "pet Vanilla" counter.
 *
 * GET  /  -> { "count": n }            read the running total
 * POST /?by=k -> { "count": n + k }    add k pets (k is clamped to 1..50)
 *
 * Runs on the Cloudflare Workers free tier. See README.md in this folder.
 */

const KEY = 'vanilla-pets';
const ORIGIN = 'https://mingxuan-liu.github.io';

function cors(extra) {
  return Object.assign({
    'Access-Control-Allow-Origin': ORIGIN,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Cache-Control': 'no-store',
    'Content-Type': 'application/json',
  }, extra || {});
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: cors() });
    }

    let count = parseInt(await env.COUNTER.get(KEY), 10) || 0;

    if (request.method === 'POST') {
      const by = parseInt(new URL(request.url).searchParams.get('by'), 10);
      count += Math.min(Math.max(Number.isFinite(by) ? by : 1, 1), 50);
      await env.COUNTER.put(KEY, String(count));
    } else if (request.method !== 'GET') {
      return new Response('{"error":"method not allowed"}', { status: 405, headers: cors() });
    }

    return new Response(JSON.stringify({ count }), { headers: cors() });
  },
};
