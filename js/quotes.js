// Cache policy: fetch 50 quotes once per 24h (UTC); show exactly one quote per hour.
const META = document.getElementById('meta');
const Q = document.getElementById('quote');
const A = document.getElementById('author');

const LS_KEY = 'zenquotes_pool_v1';
const LS_TS  = 'zenquotes_pool_ts_v1';

function setMeta(t){ if (META) META.textContent = t; }
function utcYMD() {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}-${String(d.getUTCDate()).padStart(2,'0')}`;
}
function hourSlot() { return Math.floor(Date.now() / (60*60*1000)); }

function loadFromCache() {
  try {
    const ts = localStorage.getItem(LS_TS);
    const raw = localStorage.getItem(LS_KEY);
    if (!ts || !raw) return null;
    if (ts !== utcYMD()) return null;
    const obj = JSON.parse(raw);
    if (!Array.isArray(obj) || !obj.length) return null;
    return obj;
  } catch { return null; }
}

function saveToCache(arr) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(arr));
    localStorage.setItem(LS_TS, utcYMD());
  } catch {}
}

async function fetchQuotesDirect() {
  const url = `https://zenquotes.io/api/quotes`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (!Array.isArray(data)) throw new Error('Unexpected response');
  return data;
}

async function fetchQuotes() {
  if (typeof WORKER_BASE === "string" && WORKER_BASE.length > 0) {
    const r = await fetch(`${WORKER_BASE}/quotes`, { cache: 'no-store' });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
  }
  return fetchQuotesDirect();
}

async function ensurePool() {
  let pool = loadFromCache();
  if (pool) return pool;
  setMeta('Fetching quotes…');
  try {
    pool = await fetchQuotes();
    saveToCache(pool);
    setMeta(`Loaded ${pool.length} quotes · cache: ${utcYMD()} (UTC)`);
  } catch (e) {
    setMeta(`Error: ${String(e.message || e)}`);
    pool = [];
  }
  return pool;
}

function showHourly(pool) {
  if (!pool.length) {
    Q.textContent = 'No quotes available.';
    A.textContent = '';
    return;
  }
  const idx = hourSlot() % pool.length;
  const item = pool[idx];
  Q.textContent = `“${(item.q || '').trim()}”`;
  A.textContent = item.a ? `— ${item.a}` : '—';
  setMeta(`Showing quote ${idx+1}/${pool.length} · hour slot`);
}

(async () => {
  const pool = await ensurePool();
  showHourly(pool);
  const now = new Date();
  const msToMidnightUTC = (Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()+1) - now.getTime()) + 1000;
  setTimeout(async () => {
    const p = await ensurePool(); // will fetch new day once the date changes
    showHourly(p);
  }, Math.max(5000, msToMidnightUTC));
})();
