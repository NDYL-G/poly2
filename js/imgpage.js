const meta = document.getElementById('meta');
const img = document.getElementById('img');

const LS_IMG = 'zen_img_dataurl_v1';
const LS_IMG_HOUR = 'zen_img_hour_v1';

function setMeta(t){ if (meta) meta.textContent = t; }
function hourKeyUTC(){
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}-${String(d.getUTCDate()).padStart(2,'0')}T${String(d.getUTCHours()).padStart(2,'0')}`;
}

function loadCached(){
  try {
    const hk = localStorage.getItem(LS_IMG_HOUR);
    const data = localStorage.getItem(LS_IMG);
    if (hk === hourKeyUTC() && data) return data;
  } catch {}
  return null;
}

function saveCached(dataUrl){
  try {
    localStorage.setItem(LS_IMG, dataUrl);
    localStorage.setItem(LS_IMG_HOUR, hourKeyUTC());
  } catch {}
}

async function fetchAsDataURL(url) {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const blob = await res.blob();
  if (blob.size > 1_500_000) {
    setMeta(`Large image (${(blob.size/1024).toFixed(0)} KB) — not cached`);
    return URL.createObjectURL(blob);
    }
  const reader = new FileReader();
  return await new Promise((resolve, reject) => {
    reader.onerror = () => reject(new Error('Reader error'));
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
}

async function ensureHourlyImage() {
  if (typeof WORKER_BASE === "string" && WORKER_BASE.length > 0) {
    img.src = `${WORKER_BASE}/image`;
    setMeta(`Worker cached · ${hourKeyUTC()} (UTC hour)`);
    return;
  }

  const cached = loadCached();
  if (cached) {
    img.src = cached;
    setMeta(`Cached · ${hourKeyUTC()} (UTC hour)`);
    return;
  }
  setMeta('Fetching image…');
  try {
    const dataUrlOrObjURL = await fetchAsDataURL('https://zenquotes.io/api/image');
    img.src = dataUrlOrObjURL;
    if (typeof dataUrlOrObjURL === 'string' && dataUrlOrObjURL.startsWith('data:')) {
      saveCached(dataUrlOrObjURL);
      setMeta(`Fetched & cached · ${hourKeyUTC()} (UTC hour)`);
    } else {
      setMeta(`Fetched (session) · ${hourKeyUTC()} (UTC hour)`);
    }
  } catch (e) {
    setMeta(`Error: ${String(e.message || e)}`);
  }
}

ensureHourlyImage();

const msToNextHour = (60 - new Date().getUTCMinutes())*60*1000 - new Date().getUTCSeconds()*1000 - new Date().getUTCMilliseconds() + 1000;
setTimeout(ensureHourlyImage, Math.max(5000, msToNextHour));
