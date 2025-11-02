
(function(){
  const statusEl = document.getElementById('status');
  const idxEl = document.getElementById('idx');
  const lenEl = document.getElementById('len');
  const srcEl = document.getElementById('src');
  const stage = document.getElementById('stage');

  const LS_PLAYLIST = 'vvx_playlist_v1';
  const LS_SETTINGS = 'vvx_settings_v1';
  const defaults = { dwellSeconds: 10, playlistUrl: 'data/playlist.json' };

  async function fetchJSON(url){
    const r = await fetch(url, { cache: 'no-store' });
    if (!r.ok) throw new Error('HTTP '+r.status);
    return r.json();
  }
  function getSettings(){ try{const raw=localStorage.getItem(LS_SETTINGS); if(raw) return JSON.parse(raw);}catch{} return {}; }
  function savePlaylist(pl){ try{ localStorage.setItem(LS_PLAYLIST, JSON.stringify(pl)); }catch{} }
  async function loadPlaylist(){
    try{ const raw=localStorage.getItem(LS_PLAYLIST); if(raw) return JSON.parse(raw); }catch{}
    const data = await fetchJSON(defaults.playlistUrl);
    savePlaylist(data); return data;
  }

  (async ()=>{
    statusEl.textContent = 'Loading playlist…';
    const playlist = await loadPlaylist();
    if(!Array.isArray(playlist)||!playlist.length){ statusEl.textContent='Empty playlist'; return; }
    lenEl.textContent = String(playlist.length);
    let i=0;
    const dwell = Math.max(3, Number(getSettings().dwellSeconds)||10) * 1000;

    async function showNext(){
      const item = playlist[i % playlist.length]; i++;
      idxEl.textContent = String(((i-1)%playlist.length)+1);
      const url = item.url || item;
      srcEl.textContent = url;
      statusEl.textContent = '';
      try { stage.src = url; } catch(e){ location.href = url; return; }
      setTimeout(showNext, dwell);
    }
    showNext();
  })().catch(e => statusEl.textContent = 'Error: '+(e.message||e));
})();
