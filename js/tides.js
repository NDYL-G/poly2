
const upd = document.getElementById('updated');
const list = document.getElementById('tides');
const station = document.getElementById('station');
async function j(u){ const r=await fetch(u,{cache:'no-store'}); if(!r.ok) throw new Error('HTTP '+r.status); return r.json(); }
function render(data){
  if(data.station) station.textContent = data.station;
  const items = data.tides || data.items || [];
  list.innerHTML = items.slice(0,8).map(it=>`<li>${it.time} — <strong>${it.type}</strong> ${it.height!=null?('· '+it.height+' m'):''}</li>`).join('');
  const now=new Date(); document.getElementById('updated').textContent='Updated: '+now.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
}
(async()=>{
  try{ render(await j('../data/tides.json')); } catch { document.getElementById('updated').textContent='Updated: error'; }
})();
