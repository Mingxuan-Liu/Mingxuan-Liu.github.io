# Global pet counter (optional)

The tally on `vanilla.html` already works without any of this: it lives in
`localStorage`, so it persists per browser. Deploy this Worker only if you want a
single number shared by everyone who visits.

It runs entirely on Cloudflare's free tier — no card, no charge:

- Workers: 100,000 requests/day
- Workers KV: 100,000 reads/day, **1,000 writes/day**, 1 GB storage

The site batches clicks and writes at most once every ~1.2 s, so the write limit is
the one to watch; a normal week of visitors will not come close.

## Deploy from the browser (no Node, no terminal)

This machine has no Node or npm, so the `wrangler` CLI is not an option. Everything
below is done by clicking in the Cloudflare dashboard.

1. Make a free account at <https://dash.cloudflare.com> — no payment details needed.

2. **Storage & Databases → KV → Create a namespace.** Call it `vanilla-counter`.

3. **Compute (Workers) → Create → Start with Hello World! →** name it
   `vanilla-counter` → **Deploy**.

4. On the Worker, click **Edit code**. Select everything in the editor, delete it,
   and paste the whole contents of [`worker.js`](worker.js). Click **Deploy**.

5. Go to the Worker's **Settings → Bindings → Add → KV namespace**:
   - Variable name: `COUNTER`  (this exact spelling — the code looks for `env.COUNTER`)
   - KV namespace: the one from step 2

   Click **Deploy** again so the binding takes effect.

6. Copy the Worker's URL from its overview page. It looks like
   `https://vanilla-counter.<your-subdomain>.workers.dev`.

Check it works by opening that URL in a tab — it should print `{"count":0}`.

## Switch it on

In `js/site.js`, change:

```js
var PET_API = '';
```

to your Worker URL:

```js
var PET_API = 'https://vanilla-counter.<your-subdomain>.workers.dev';
```

Commit and push. Leave it as `''` and the site keeps the per-browser tally, making
no external requests at all. If the Worker is ever unreachable the page silently
falls back to that tally, so nothing breaks either way.

`ORIGIN` at the top of `worker.js` restricts CORS to `https://mingxuan-liu.github.io`,
so the count cannot be incremented from another site. Change it if the site moves.

## If you would rather use the CLI

`wrangler.toml` is here for that. It needs Node, which you can install with
`brew install node`, then `wrangler login`, `wrangler kv namespace create COUNTER`
(paste the printed id into `wrangler.toml`), and `wrangler deploy`. The dashboard
route above does the same thing and skips the install.
