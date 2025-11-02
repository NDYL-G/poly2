
const FEEDS=[
  {key:'breaking',label:'Breaking',data:'../data/news-breaking.json'},
  {key:'world',label:'World',data:'../data/news-world.json'},
  {key:'uk',label:'UK',data:'../data/news-uk.json'},
  {key:'cornwall',label:'Cornwall',data:'../data/news-cornwall.json'}
];
const tabs=document.getElementById('tabs'); const feed=document.getElementById('feed');
let current='breaking';
function buildTabs(){
  tabs.innerHTML='';
  FEEDS.forEach(f=>{
    const el=document.createElement('button');
    el.className='tab'+(f.key===current?' active':'');
    el.textContent=f.label;
    el.onclick=()=>{ current=f.key; document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active')); el.classList.add('active'); load(); };
    tabs.appendChild(el);
  });
}
async function j(u){ const r=await fetch(u,{cache:'no-store'}); if(!r.ok) throw new Error('HTTP '+r.status); return r.json(); }
function render(items){
  feed.innerHTML = (items||[]).slice(0,20).map(it=>`<li><a class="link" href="${it.link}" target="_blank" rel="noopener">${it.title}</a><div class="muted">${it.source||'BBC'} · ${it.pubDate||''}</div></li>`).join('');
  const now=new Date(); document.getElementById('updated').textContent='Updated: '+now.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
}
async function load(){
  const f=FEEDS.find(x=>x.key===current);
  try{ render(await j(f.data)); }catch{ feed.innerHTML='<li>Snapshot not found</li>'; }
}
buildTabs(); load();
