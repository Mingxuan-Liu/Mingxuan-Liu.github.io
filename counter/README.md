# Global pet counter (optional)

The page tally works without this: it lives in `localStorage`, so it persists per
browser. Deploy this Worker only if you want a single number shared by everyone.

It runs entirely on Cloudflare's free tier — no card, no charge:

- Workers: 100,000 requests/day
- Workers KV: 100,000 reads/day, **1,000 writes/day**, 1 GB storage

The site batches clicks and writes at most once every ~1.2 s, so the write limit
is the one to watch; a normal week of visitors will not come close.

## Deploy

```bash
npm install -g wrangler
wrangler login
cd counter
wrangler kv namespace create COUNTER     # paste the printed id into wrangler.toml
wrangler deploy
```

`wrangler deploy` prints a URL like `https://vanilla-counter.<you>.workers.dev`.

## Switch it on

In `js/site.js`, set:

```js
var PET_API = 'https://vanilla-counter.<you>.workers.dev';
```

Leave it as `''` and the site keeps the per-browser tally. If the Worker is ever
unreachable the page silently falls back to that tally, so nothing breaks.

`ORIGIN` in `worker.js` restricts CORS to the live site; change it if the site moves.
