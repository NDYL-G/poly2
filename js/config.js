// Configuration for optional Cloudflare Worker proxy.
// If you deploy the Worker from README, set WORKER_BASE to your worker URL.
// e.g. const WORKER_BASE = "https://your-worker.workers.dev";
// Leave as empty string to call APIs directly.
const WORKER_BASE = "";
// Optional RSS proxy you host: set to `${WORKER_BASE}/rss?url=` if you add the RSS route.
// Leave blank to use public AllOrigins.
const RSS_PROXY_BASE = "";
