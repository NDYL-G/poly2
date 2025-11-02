# VVX411 News / Quotes / On-This-Day / Image (GitHub Pages bundle)

This bundle gives you four pages designed for the Polycom VVX411 rotation (e.g. every 10 seconds) while minimising API calls via localStorage caching and deterministic hourly selection.

## Structure
- `index.html` – landing with links
- `html/news.html` – BBC RSS (Breaking / World / UK / Cornwall)
- `html/quotes.html` – ZenQuotes 50 random quotes, one per hour, pool fetched once per UTC day
- `html/onthisday.html` – ZenQuotes Today API, payload fetched once per UTC day, one per section per hour
- `html/image.html` – ZenQuotes image, one per UTC hour (cached in localStorage as data URL), or via Worker
- `css/style.css`, `css/news.css`
- `js/*` including `config.js`

## GitHub Pages + CORS
ZenQuotes free tier may enforce CORS. To make everything 100% reliable from a static site, deploy the optional Cloudflare Worker below and set `WORKER_BASE` in `js/config.js`.

### Cloudflare Worker (copy–paste)
```js
// worker.js
export default {
  async fetch(req, env, ctx) {
    const url = new URL(req.url);
    const path = url.pathname;
    let upstream = null, ttl = 0;

    if (path === '/quotes') { upstream = 'https://zenquotes.io/api/quotes'; ttl = 86400; }
    else if (path === '/onthisday') { upstream = 'https://today.zenquotes.io/api'; ttl = 86400; }
    else if (path === '/image') { upstream = 'https://zenquotes.io/api/image'; ttl = 3600; }
    else if (path === '/rss') { const u = url.searchParams.get('url'); if (!u) return new Response('Missing url', {status:400}); upstream = u; ttl = 600; }
    else return new Response('Not found', { status: 404 });

    const cacheKey = new Request(upstream, { method: 'GET' });
    const cache = caches.default;
    let resp = await cache.match(cacheKey);
    if (!resp) {
      const upstreamResp = await fetch(upstream, { cf: { cacheTtl: ttl, cacheEverything: true } });
      resp = new Response(upstreamResp.body, { status: upstreamResp.status, headers: upstreamResp.headers });
      resp.headers.set('Cache-Control', `public, max-age=${ttl}`);
      resp.headers.set('Access-Control-Allow-Origin', '*');
      resp.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
      resp.headers.set('Access-Control-Allow-Headers', 'Content-Type');
      ctx && ctx.waitUntil && ctx.waitUntil(cache.put(cacheKey, resp.clone()));
    }
    return resp;
  }
}
```

After deployment, edit `js/config.js`:
```js
const WORKER_BASE = "https://your-worker.workers.dev";
const RSS_PROXY_BASE = `${WORKER_BASE}/rss?url=`;
```

## Attributions
- Quotes & images: ZenQuotes API – include a credit link in your site footer if on free tier.
- News feeds: BBC RSS.

---

Generated on: 2025-11-02T15:52:52.793871Z
