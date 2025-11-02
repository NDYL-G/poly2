
async function j(u){ const r=await fetch(u,{cache:'no-store'}); if(!r.ok) throw new Error('HTTP '+r.status); return r.json(); }
function render(d){
  const s = d.sun||d;
  document.getElementById('sunrise').textContent = s.sunrise||'-';
  document.getElementById('sunset').textContent = s.sunset||'-';
  document.getElementById('daylen').textContent = s.day_length||'-';
  const now=new Date(); document.getElementById('updated').textContent='Updated: '+now.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
}
(async()=>{
  try{ render(await j('../data/sun.json')); } catch { document.getElementById('updated').textContent='Updated: error'; }
})();
