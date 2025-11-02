// Cache once per UTC day; show one item per section per hour (deterministic).
const statusEl = document.getElementById('status');
const E = document.getElementById('events');
const B = document.getElementById('births');
const D = document.getElementById('deaths');

const LS_KEY = 'otd_payload_v1';
const LS_TS  = 'otd_payload_ts_v1';

function setStatus(s){ if (statusEl) statusEl.textContent = s; }
function utcYMD(){
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}-${String(d.getUTCDate()).padStart(2,'0')}`;
}
function hourSlot(){ return Math.floor(Date.now() / (60*60*1000)); }

function loadCache(){
  try {
    const ts = localStorage.getItem(LS_TS);
    const raw = localStorage.getItem(LS_KEY);
    if (!ts || !raw) return null;
    if (ts !== utcYMD()) return null;
    return JSON.parse(raw);
  } catch { return null; }
}
function saveCache(obj){
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(obj));
    localStorage.setItem(LS_TS, utcYMD());
  } catch {}
}

async function fetchOTD() {
  if (typeof WORKER_BASE === "string" && WORKER_BASE.length > 0) {
    const r = await fetch(`${WORKER_BASE}/onthisday`, { cache: 'no-store' });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
  } else {
    const r = await fetch('https://today.zenquotes.io/api', { cache: 'no-store' });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
  }
}

function pickOne(list){
  if (!Array.isArray(list) || !list.length) return null;
  const idx = hourSlot() % list.length;
  return list[idx];
}

function renderOne(item, el){
  if (!el) return;
  if (!item) { el.innerHTML = '<li>—</li>'; return; }
  const year = (item.year || '').toString().trim();
  const text = (item.text || item.event || item.title || '').toString().trim();
  el.innerHTML = `<li>${year ? `<strong>${year}</strong> — ` : ''}${text}</li>`;
}

(async () => {
  setStatus('Loading…');
  let payload = loadCache();
  if (!payload) {
    try {
      payload = await fetchOTD();
      saveCache(payload);
      setStatus(`Cached for ${utcYMD()} (UTC)`);
    } catch (e) {
      setStatus(`Error: ${String(e.message || e)}`);
      payload = { events:[], births:[], deaths:[] };
    }
  } else {
    setStatus(`From cache ${utcYMD()} (UTC)`);
  }

  renderOne(pickOne(payload.events), E);
  renderOne(pickOne(payload.births), B);
  renderOne(pickOne(payload.deaths), D);

  const now = new Date();
  const msToMidnightUTC = (Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()+1) - now.getTime()) + 1000;
  setTimeout(async () => {
    try {
      const fresh = await fetchOTD();
      saveCache(fresh);
      renderOne(pickOne(fresh.events), E);
      renderOne(pickOne(fresh.births), B);
      renderOne(pickOne(fresh.deaths), D);
      setStatus(`Refreshed for ${utcYMD()} (UTC)`);
    } catch (e) {
      setStatus(`Refresh error: ${String(e.message || e)}`);
    }
  }, Math.max(5000, msToMidnightUTC));
})();
