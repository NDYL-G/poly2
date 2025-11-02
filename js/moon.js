

function pickMoonIcon(nameOrCode){
  const s = (''+(nameOrCode||'')).toLowerCase();
  if (s.includes('new')) return 'moon-new.svg';
  if (s.includes('first')) return 'moon-first_quarter.svg';
  if (s.includes('last') || s.includes('third')) return 'moon-last_quarter.svg';
  if (s.includes('full')) return 'moon-full.svg';
  if (s.includes('wax') && s.includes('cres')) return 'moon-waxing_crescent.svg';
  if (s.includes('wan') && s.includes('cres')) return 'moon-waning_crescent.svg';
  if (s.includes('wax') && s.includes('gibb')) return 'moon-waxing_gibbous.svg';
  if (s.includes('wan') && s.includes('gibb')) return 'moon-waning_gibbous.svg';
  // numeric fallback:
  const v = parseFloat(s);
  if (!isNaN(v)){
    if (v<0.12) return 'moon-new.svg';
    if (v<0.37) return 'moon-waxing_crescent.svg';
    if (v<0.62) return 'moon-first_quarter.svg';
    if (v<0.87) return 'moon-waxing_gibbous.svg';
    if (v<1.12) return 'moon-full.svg';
    if (v<1.37) return 'moon-waning_gibbous.svg';
    if (v<1.62) return 'moon-last_quarter.svg';
    return 'moon-waning_crescent.svg';
  }
  return 'moon-full.svg';
}

async function j(u){ const r=await fetch(u,{cache:'no-store'}); if(!r.ok) throw new Error('HTTP '+r.status); return r.json(); }
function render(d){
  const m = d.moon||d;
  const phaseStr = m.phase_name || m.phase || (m.phase_code ?? '-'); document.getElementById('phase').textContent = phaseStr; const icon = pickMoonIcon(phaseStr); const img = document.getElementById('moonIcon'); if (img) img.src = `../svg/${icon}`;
  document.getElementById('moonrise').textContent = m.moonrise || '-';
  document.getElementById('moonset').textContent = m.moonset || '-';
  const now=new Date(); document.getElementById('updated').textContent='Updated: '+now.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
}
(async()=>{
  try{ render(await j('../data/moon.json')); } catch { document.getElementById('updated').textContent='Updated: error'; }
})();
