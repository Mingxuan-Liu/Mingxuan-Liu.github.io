# Vanilla’s shared pet counter

The English and Chinese Vanilla pages share one total. The Cloudflare Worker records each batch of pets in D1 under a random receipt ID. SQLite adds the batch to the latest total in one write. A repeated receipt leaves the total unchanged. Reading the newest row gives the total without scanning the history.

## Free deployment

Use the account’s **Workers Free** plan, a `workers.dev` address, and one D1 database. Workers Free includes 100,000 requests per day. D1 Free includes 5 million rows read and 100,000 rows written per day across the account. Daily quota exhaustion pauses service until the next UTC day. Storage has a separate cap. [Workers limits](https://developers.cloudflare.com/workers/platform/limits/) · [D1 pricing and quota behavior](https://developers.cloudflare.com/d1/platform/pricing/)

1. In the Cloudflare dashboard, create a D1 database named `vanilla-pets`.
2. In Workers & Pages, create a Worker named `vanilla-counter`. Deploy the module in [worker.js](worker.js).
3. Under the Worker’s bindings, add the D1 database as **COUNTER** and deploy. The first request creates the table in the bound database.
4. Open the Worker’s HTTPS address. A fresh database returns `{"count":0}`. Configure both website editions to use the same Worker address.

For subsequent CLI deployments, run `npx wrangler deploy` from this directory. [wrangler.toml](wrangler.toml) points to the existing database so the total survives releases.

## Interface

- `GET /` returns `{"count":n}` with the latest committed total.
- `POST /` accepts a JSON body with a UUID `id` and an integer `by` from 1 through 1000. The website sends the JSON as `text/plain` and reuses the same receipt and quantity when retrying. Successful submissions return the current total, including any pets already recorded from that receipt.
- Browser writes use the website’s origin, `https://mingxuan-liu.github.io`. The endpoint is public. An origin check prevents other web pages from submitting via a visitor’s browser.
