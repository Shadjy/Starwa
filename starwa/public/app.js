const apiBase = '/api/v1/vacatures';

const state = {
  page: 1,
  limit: 10,
  q: '',
  dienstverband: '',
  actief: ''
};

const els = {
  rows: document.getElementById('rows'),
  q: document.getElementById('f-q'),
  dienstverband: document.getElementById('f-dienstverband'),
  actief: document.getElementById('f-actief'),
  prev: document.getElementById('btn-prev'),
  next: document.getElementById('btn-next'),
  page: document.getElementById('page-indicator'),
  btnNew: document.getElementById('btn-new'),
  modal: document.getElementById('modal'),
  backdrop: document.getElementById('backdrop'),
  btnClose: document.getElementById('btn-close'),
  btnCancel: document.getElementById('btn-cancel'),
  form: document.getElementById('form'),
  id: document.getElementById('f-id'),
  titel: document.getElementById('f-titel'),
  beschrijving: document.getElementById('f-beschrijving'),
  locatie: document.getElementById('f-locatie'),
  dienstverband2: document.getElementById('f-dienstverband2'),
  smin: document.getElementById('f-smin'),
  smax: document.getElementById('f-smax'),
  // tags handled via TagInput component
  btnSave: document.getElementById('btn-save'),
  toasts: document.getElementById('toasts')
};

// TagInput component (vanilla)
class TagInput {
  constructor(container) {
    this.container = container;
    this.listEl = container.querySelector('#f-tags-list');
    this.inputEl = container.querySelector('#f-tags-input');
    this.tags = [];
    this.bind();
    this.render();
  }
  bind() {
    this.inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault();
        this.addFromInput();
      } else if (e.key === 'Backspace' && this.inputEl.value === '' && this.tags.length) {
        // remove last chip
        this.tags.pop();
        this.render();
      }
    });
    this.inputEl.addEventListener('blur', () => this.addFromInput());
    this.listEl.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-index]');
      if (!btn) return;
      const idx = Number(btn.dataset.index);
      this.tags.splice(idx, 1);
      this.render();
      this.inputEl.focus();
    });
  }
  normalize(value) {
    return value.replace(/,/g, ' ').trim();
  }
  addFromInput() {
    const raw = this.inputEl.value.trim();
    if (!raw) return;
    // split by comma or whitespace groups
    const parts = raw.split(/[,\s]+/).map(s => s.trim()).filter(Boolean);
    for (const p of parts) {
      const v = this.normalize(p);
      if (v && !this.tags.includes(v)) this.tags.push(v);
    }
    this.inputEl.value = '';
    this.render();
  }
  render() {
    this.listEl.innerHTML = this.tags.map((t, i) => `
      <span class="chip">${escapeHtml(t)} <button type="button" class="remove" aria-label="Verwijder tag" data-index="${i}">×</button></span>
    `).join('');
  }
  getTags() { return [...this.tags]; }
  setTags(arr) { this.tags = Array.isArray(arr) ? arr.filter(Boolean) : []; this.render(); }
}

const tagInput = new TagInput(document.getElementById('f-tags'));

function toast(msg, type = 'success') {
  const div = document.createElement('div');
  div.className = `toast ${type}`;
  div.textContent = msg;
  els.toasts.appendChild(div);
  setTimeout(() => div.remove(), 2000);
}

function openModal() {
  els.modal.classList.add('active');
  els.backdrop.classList.add('active');
  els.modal.setAttribute('aria-hidden', 'false');
  // Set initial focus into the dialog for accessibility
  (els.titel || els.btnClose).focus();
}
function closeModal() {
  // Move focus out of the hidden region before hiding
  if (document.activeElement && els.modal.contains(document.activeElement)) {
    els.btnNew?.focus();
  }
  els.modal.classList.remove('active');
  els.backdrop.classList.remove('active');
  els.modal.setAttribute('aria-hidden', 'true');
}

function debounce(fn, wait) {
  let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait); };
}

async function fetchList() {
  const params = new URLSearchParams();
  if (state.q) params.set('q', state.q);
  if (state.dienstverband) params.set('dienstverband', state.dienstverband);
  if (state.actief !== '' && state.actief != null) params.set('actief', state.actief);
  params.set('page', state.page);
  params.set('limit', state.limit);
  const res = await fetch(`${apiBase}?${params.toString()}`);
  if (!res.ok) throw new Error('Laden mislukt');
  return res.json();
}

function renderRows(items) {
  els.rows.innerHTML = items.map(item => {
    const status = item.actief ? '<span class="badge success">Actief</span>' : '<span class="badge">Inactief</span>';
    return `
      <tr>
        <td>${escapeHtml(item.titel)}</td>
        <td>${escapeHtml(item.locatie)}</td>
        <td><span class="badge">${escapeHtml(item.dienstverband)}</span></td>
        <td>${status}</td>
        <td>
          <div class="table-actions">
            <button class="btn secondary" data-action="edit" data-id="${item.id}">Bewerken</button>
            <button class="btn secondary" data-action="toggle" data-id="${item.id}">${item.actief ? 'Deactiveer' : 'Activeer'}</button>
            <button class="btn ghost" data-action="delete" data-id="${item.id}">Verwijder</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function updatePager(page, total, limit) {
  const pages = Math.max(1, Math.ceil(total / limit));
  els.page.textContent = `Pagina ${page} van ${pages}`;
  els.prev.disabled = page <= 1;
  els.next.disabled = page >= pages;
}

async function refresh() {
  const { data, total, page, limit } = await fetchList();
  renderRows(data);
  updatePager(page, total, limit);
}

function readForm() {
  const tagsArr = tagInput.getTags();
  const tags = tagsArr.length ? tagsArr : null;
  return {
    werkgever_id: 1,
    titel: els.titel.value,
    beschrijving: els.beschrijving.value,
    locatie: els.locatie.value,
    dienstverband: els.dienstverband2.value,
    salaris_min: els.smin.value ? Number(els.smin.value) : null,
    salaris_max: els.smax.value ? Number(els.smax.value) : null,
    tags
  };
}

function fillForm(v) {
  els.id.value = v.id;
  els.titel.value = v.titel || '';
  els.beschrijving.value = v.beschrijving || '';
  els.locatie.value = v.locatie || '';
  els.dienstverband2.value = v.dienstverband || 'fulltime';
  els.smin.value = v.salaris_min ?? '';
  els.smax.value = v.salaris_max ?? '';
  tagInput.setTags(Array.isArray(v.tags) ? v.tags : []);
}

async function fetchById(id) {
  const res = await fetch(`${apiBase}/${id}`);
  if (!res.ok) throw new Error('Niet gevonden');
  return res.json();
}

// Events
els.q.addEventListener('input', debounce(() => { state.q = els.q.value; state.page = 1; refresh().catch(() => toast('Zoeken mislukt', 'error')); }, 250));
els.dienstverband.addEventListener('change', () => { state.dienstverband = els.dienstverband.value; state.page = 1; refresh().catch(() => toast('Filter mislukt', 'error')); });
els.actief.addEventListener('change', () => { state.actief = els.actief.value; state.page = 1; refresh().catch(() => toast('Filter mislukt', 'error')); });
els.prev.addEventListener('click', () => { if (state.page > 1) { state.page--; refresh().catch(() => toast('Laden mislukt', 'error')); } });
els.next.addEventListener('click', () => { state.page++; refresh().catch(() => toast('Laden mislukt', 'error')); });

els.btnNew.addEventListener('click', () => { els.form.reset(); els.id.value = ''; tagInput.setTags([]); openModal(); });
els.btnClose.addEventListener('click', closeModal);
els.btnCancel.addEventListener('click', closeModal);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
els.backdrop.addEventListener('click', (e) => { if (e.target === els.backdrop) closeModal(); });

els.rows.addEventListener('click', async (e) => {
  const btn = e.target.closest('button[data-action]');
  if (!btn) return;
  const { action, id } = btn.dataset;
  if (action === 'edit') {
    try {
      const v = await fetchById(id);
      fillForm(v);
      openModal();
    } catch {
      toast('Laden van vacature mislukt', 'error');
    }
  } else if (action === 'toggle') {
    try {
      const v = await fetchById(id);
      const res = await fetch(`${apiBase}/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ actief: v.actief ? 0 : 1 }) });
      if (!res.ok) throw new Error();
      toast('Status bijgewerkt');
      refresh();
    } catch {
      toast('Status bijwerken mislukt', 'error');
    }
  } else if (action === 'delete') {
    if (!confirm('Weet je zeker dat je deze vacature wilt verwijderen?')) return;
    try {
      const res = await fetch(`${apiBase}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      toast('Verwijderd');
      refresh();
    } catch {
      toast('Verwijderen mislukt', 'error');
    }
  }
});

els.form.addEventListener('submit', async (e) => {
  e.preventDefault();
  els.btnSave.disabled = true; els.btnSave.textContent = 'Opslaan...';
  const payload = readForm();
  const id = els.id.value;
  try {
    const res = await fetch(id ? `${apiBase}/${id}` : apiBase, {
      method: id ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.status === 422) { toast('Validatiefout', 'error'); return; }
    if (!res.ok) throw new Error();
    toast('Opgeslagen');
    closeModal();
    refresh();
  } catch {
    toast('Opslaan mislukt', 'error');
  } finally {
    els.btnSave.disabled = false; els.btnSave.textContent = 'Opslaan';
  }
});

function escapeHtml(s) { const d = document.createElement('div'); d.textContent = s ?? ''; return d.innerHTML; }

refresh().catch(() => toast('Laden mislukt', 'error'));
