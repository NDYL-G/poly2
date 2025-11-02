
const META=document.getElementById('meta');const Q=document.getElementById('quote');const A=document.getElementById('author');
function setMeta(t){ META.textContent=t; }
async function j(u){ const r=await fetch(u,{cache:'no-store'}); if(!r.ok) throw new Error('HTTP '+r.status); return r.json(); }
function hourSlot(){ return Math.floor(Date.now()/3600000); }
function renderHourly(pool){
  if(!pool.length){ Q.textContent='No quotes.'; A.textContent=''; return; }
  const idx = hourSlot() % pool.length;
  const it = pool[idx];
  Q.textContent = `“${(it.q||'').trim()}”`;
  A.textContent = it.a ? `— ${it.a}` : '';
}
(async()=>{
  try{ const arr = await j('../data/quotes.json'); renderHourly(arr); setMeta('Data file'); } catch { setMeta('Missing data/quotes.json'); }
  const now=new Date(); document.getElementById('updated').textContent='Updated: '+now.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
})();
