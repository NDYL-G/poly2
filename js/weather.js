
const updated = document.getElementById('updated');
const tC = document.getElementById('tC');
const tF = document.getElementById('tF');
const windMph = document.getElementById('windMph');
const windKmh = document.getElementById('windKmh');
const feelsC = document.getElementById('feelsC');
const hum = document.getElementById('hum');
const thermoObj = document.getElementById('thermo');
const windObj = document.getElementById('wind');
const windDeg = document.getElementById('windDeg');


async function svgReady(obj){
  return new Promise(res=>{
    if (obj.contentDocument) return res(obj.contentDocument);
    obj.addEventListener('load', ()=>res(obj.contentDocument));
  });
}

async function j(u){ const r=await fetch(u,{cache:'no-store'}); if(!r.ok) throw new Error('HTTP '+r.status); return r.json(); }
function c2f(c){ return (c*9/5)+32; }

function render(d){
  const c = d.current||{};
  const now = new Date();
  updated.textContent = 'Updated: ' + now.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});

  const temp = Number(c.temperature ?? d.tempC ?? 0);
  const feels = Number(c.feels_like ?? temp);
  const wind = Number(c.wind ?? 0);
  const humidity = Math.round(((c.humidity ?? 0)*100));

  tC.textContent = (temp).toFixed(0) + '°C';
  tF.textContent = (c2f(temp)).toFixed(0) + '°F';
  windMph.textContent = (wind*2.23694).toFixed(0);
  windKmh.textContent = (wind*3.6).toFixed(0);
  feelsC.textContent = feels.toFixed(0);
  hum.textContent = isFinite(humidity) ? humidity : '--';

  // thermometer fill (range -10 .. 30C scaled)
  const pct = Math.max(0, Math.min(1, (temp+10)/40 ));
  if (thermoObj){ svgReady(thermoObj).then(doc=>{ const col = doc.getElementById('column'); if(col){ const h = Math.round(10 + pct*110); const y = 130 - h; col.setAttribute('y', String(y)); col.setAttribute('height', String(h)); } }); }

  const deg = Number(c.wind_dir ?? d.wind_deg ?? 0);
  windDeg.textContent = isFinite(deg) ? deg.toFixed(0) : '--';
  if (windObj){ svgReady(windObj).then(doc=>{ const a = doc.getElementById('arrow'); if(a){ a.setAttribute('transform', `translate(80,80) rotate(${deg})`); } }); }

  // Forecast list
  const daily = d.daily||{};
  const t = daily.time||[]; const mn=daily.min||[]; const mx=daily.max||[];
  const fc = document.getElementById('forecast');
  if(t.length){
    fc.innerHTML = t.slice(0,5).map((day,i)=>`<div class="kv"><div class="key">${day}</div><div class="val">${(mn[i]??'--')}°C / ${(mx[i]??'--')}°C</div></div>`).join('');
  } else { fc.innerHTML = '<div class="muted">No forecast data</div>'; }
}

(async()=>{
  try{
    const data = await j('../data/weather.json');
    render(data);
  }catch(e){
    updated.textContent = 'Updated: error';
  }
})();
