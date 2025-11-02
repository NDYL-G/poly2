// BBC RSS via proxy, cached in localStorage for 30 minutes.
const FEEDS = [
  { key: "breaking", label: "Breaking", url: "https://feeds.bbci.co.uk/news/rss.xml" },
  { key: "world",    label: "World",    url: "https://feeds.bbci.co.uk/news/world/rss.xml" },
  { key: "uk",       label: "UK",       url: "https://feeds.bbci.co.uk/news/uk/rss.xml" },
  { key: "cornwall", label: "Cornwall", url: "https://feeds.bbci.co.uk/news/england/cornwall/rss.xml" },
];

function computeProxyURL(u){
  if (typeof RSS_PROXY_BASE === "string" && RSS_PROXY_BASE.length > 0) {
    return RSS_PROXY_BASE + encodeURIComponent(u);
  }
  return `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`;
}

const tabs = document.getElementById('tabs');
const feedEl = document.getElementById('feed');
const statusEl = document.getElementById('status');

let currentKey = localStorage.getItem('newsTab') || 'breaking';
const TTL_MS = 30 * 60 * 1000;

function fmtDate(d) {
  try { const dt = new Date(d); if (!isNaN(dt)) return dt.toLocaleString(); } catch(e){}
  return d || '';
}
function setStatus(msg){ if (statusEl) statusEl.textContent = msg; }
function lsKey(k){ return `rss_cache_${k}_v1`; }
function lsTsKey(k){ return `rss_cache_ts_${k}_v1`; }

function buildTabs() {
  tabs.innerHTML = '';
  FEEDS.forEach(f => {
    const btn = document.createElement('button');
    btn.className = 'tab' + (f.key === currentKey ? ' active' : '');
    btn.textContent = f.label;
    btn.onclick = () => {
      currentKey = f.key;
      localStorage.setItem('newsTab', currentKey);
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      btn.classList.add('active');
      loadFeed();
    };
    tabs.appendChild(btn);
  });
}

function loadCache(k){
  try {
    const ts = parseInt(localStorage.getItem(lsTsKey(k)) || '0', 10);
    if (!ts) return null;
    if (Date.now() - ts > TTL_MS) return null;
    const raw = localStorage.getItem(lsKey(k));
    if (!raw) return null;
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return null;
    return arr;
  } catch { return null; }
}

function saveCache(k, arr){
  try {
    localStorage.setItem(lsKey(k), JSON.stringify(arr));
    localStorage.setItem(lsTsKey(k), String(Date.now()));
  } catch {}
}

async function fetchRSS(url) {
  const res = await fetch(computeProxyURL(url), { cache: 'no-store' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

function parseRSS(xmlText) {
  const parser = new DOMParser();
  const xml = parser.parseFromString(xmlText, "text/xml");
  const items = Array.from(xml.querySelectorAll("item"));
  return items.map(it => ({
    title: it.querySelector("title")?.textContent?.trim() || '',
    link: it.querySelector("link")?.textContent?.trim() || '#',
    pubDate: it.querySelector("pubDate")?.textContent?.trim() || '',
    source: xml.querySelector("channel > title")?.textContent?.trim() || 'BBC',
  }));
}

function render(items){
  feedEl.innerHTML = (items.slice(0, 20)).map(it => `
    <li>
      <a class="item-title" href="${it.link}" target="_blank" rel="noopener">${it.title}</a>
      <div class="item-meta">${it.source} · ${fmtDate(it.pubDate)}</div>
    </li>
  `).join('');
}

async function loadFeed() {
  const cfg = FEEDS.find(f => f.key === currentKey) || FEEDS[0];
  const cached = loadCache(cfg.key);
  if (cached) {
    render(cached);
    const ts = parseInt(localStorage.getItem(lsTsKey(cfg.key)) || '0',10);
    setStatus(`${cfg.label} · cached · ${new Date(ts).toLocaleTimeString()}`);
    if (Date.now() - ts > TTL_MS * 0.8) { refresh(cfg); }
    return;
  }
  setStatus(`Loading ${cfg.label}…`);
  await refresh(cfg);
}

async function refresh(cfg){
  try {
    const xml = await fetchRSS(cfg.url);
    const items = parseRSS(xml);
    saveCache(cfg.key, items);
    render(items);
    setStatus(`${cfg.label} · updated ${new Date().toLocaleTimeString()}`);
  } catch (e) {
    feedEl.innerHTML = `<li>Failed to load feed. ${String(e.message || e)}</li>`;
    setStatus('Error');
  }
}

buildTabs();
loadFeed();
