(function(){
  const listEl = document.getElementById('list');
  const clearAll = document.getElementById('clearAll');
  const compare = document.getElementById('compare');
  const compareGrid = document.getElementById('compareGrid');

  const fmt = s => String(s||"").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  const getFavs = () => { try { return JSON.parse(localStorage.getItem('favorites')||'[]'); } catch { return []; } };
  const setFavs = (a) => localStorage.setItem('favorites', JSON.stringify(a));

  // This page shows only 'kandidaat' favorites
  let compareIds = new Set();

  function liWithIcon(text){
    const cleaned = String(text||"").replace(/^[\s•▫◻☐✅✔✖✗-]+/,'').trim();
    const isOk = /matcht|exact|overeen/i.test(cleaned) && !/anders|wijkt/i.test(cleaned);
    return `<li${isOk?' class="ok"':''}>${fmt(cleaned)}</li>`;
  }

  function render(){
    const favs = getFavs();
    const filtered = favs.filter(f => f.type==='kandidaat');
    if(!filtered.length){
      listEl.innerHTML = `<div class="card"><p>Nog geen favorieten. Ga terug en klik op <em>Favoriet</em> bij een kandidaat.</p></div>`;
      // keep comparison visible even if empty
      renderCompare();
      return;
    }
    // always refresh comparison panel
    renderCompare();
    listEl.innerHTML = filtered.map(f=>{
      const d = f.data;
      const head = `<strong>${fmt(d.name)}</strong> — ${fmt(d.currentTitle||d.desiredRole)}<div class=\"meta\">${fmt(d.locatie)} • ${fmt(d.uren)}u • ${fmt(d.sector)} • ${fmt(d.contractType||'-')}</div>`;
      const why = (d.why||[]).map(liWithIcon).join('');
      return `
        <article class=\"card\" data-id=\"${f.id}\">
          <div class=\"header\">
            <div>${head}</div>
            <span class=\"badge\">${fmt(d.score)}% match</span>
          </div>
          <div class=\"why\"><strong>Waarom deze score:</strong><ul>${why}</ul></div>
          <div class=\"actions\">
            <button class=\"secondary\" data-action=\"compare\">${compareIds.has(f.id)?'Uit vergelijking':'Vergelijk'}</button>
            <button class=\"remove\" data-action=\"remove\">Verwijder</button>
          </div>
        </article>`;
    }).join('');

    listEl.querySelectorAll('[data-action="remove"]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const id = btn.closest('.card').dataset.id;
        const newFavs = getFavs().filter(x=>x.id!==id);
        compareIds.delete(id);
        setFavs(newFavs);
        render();
      });
    });

    listEl.querySelectorAll('[data-action="compare"]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const id = btn.closest('.card').dataset.id;
        if(compareIds.has(id)) compareIds.delete(id); else compareIds.add(id);
        renderCompare();
        render(); // update button label
      });
    });
  }

  function renderCompare(){
    const favs = getFavs().filter(x=>x.type==='kandidaat' && compareIds.has(x.id));
    // Always show comparison; show placeholder when empty
    compare.hidden = false;
    if(!favs.length){
      compareGrid.innerHTML = `<div class=\"compare-col\"><em>Geen items geselecteerd voor vergelijking.</em><br><small>Klik op “Vergelijk” bij een favoriet om hier te tonen.</small></div>`;
      return;
    }
    compareGrid.innerHTML = favs.map(f=>{
      const d = f.data;
      const rows = [
        ['Naam', d.name],
        ['Rol', d.currentTitle||d.desiredRole],
        ['Locatie', d.locatie],
        ['Uren', d.uren+' u/wk'],
        ['Sector', d.sector],
        ['Contract', d.contractType||'-'],
        ['Score', d.score+'%']
      ].map(([k,v])=>`<tr><th>${fmt(k)}</th><td>${fmt(v)}</td></tr>`).join('');
      return `<div class=\"compare-col\"><table style=\"width:100%;border-collapse:separate;border-spacing:.25rem 0;\">
        <tbody>${rows}</tbody>
      </table></div>`;
    }).join('');
  }

  clearAll.addEventListener('click', ()=>{
    const keep = getFavs().filter(f => f.type !== 'kandidaat');
    setFavs(keep);
    compareIds.clear();
    render();
  });

  render(); // init
})();
