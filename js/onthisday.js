
function hourSlot(){ return Math.floor(Date.now()/3600000); }
function pickOne(list){ if(!Array.isArray(list)||!list.length) return null; return list[hourSlot()%list.length]; }
async function j(u){ const r=await fetch(u,{cache:'no-store'}); if(!r.ok) throw new Error('HTTP '+r.status); return r.json(); }
function renderOne(item,el){
  if(!el) return; if(!item){ el.innerHTML='<li>—</li>'; return; }
  const year=(item.year||'').toString().trim();
  const text=(item.text||item.event||item.title||'').toString().trim();
  el.innerHTML = `<li>${year?`<strong>${year}</strong> — `:''}${text}</li>`;
}
(async()=>{
  try{
    const jdata = await j('../data/onthisday.json');
    renderOne(pickOne(jdata.events), document.getElementById('events'));
    renderOne(pickOne(jdata.births), document.getElementById('births'));
    renderOne(pickOne(jdata.deaths), document.getElementById('deaths'));
  }catch{ document.getElementById('events').innerHTML='<li>—</li>'; }
  const now=new Date(); document.getElementById('updated').textContent='Updated: '+now.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
})();
