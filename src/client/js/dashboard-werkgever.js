document.addEventListener('DOMContentLoaded', () => {
  // API base detection: use same origin if on :3000, else fallback to localhost:3000 (for Live Server on :5500)
  const API_BASE = (typeof window !== 'undefined' && window.STARWA_API_BASE)
    ? window.STARWA_API_BASE
    : (location.port === '3000' ? '' : `${location.protocol}//${location.hostname}:3000`)
  const go = (path) => { window.location.href = path }

  // Profiel navigatie
  const profileTriggers = [
    ...document.querySelectorAll('a[href$="profiel.html"]'),
    ...document.querySelectorAll('[data-link="profiel"]'),
    ...document.querySelectorAll('#goProfile'),
  ]
  profileTriggers.forEach(el => {
    if (el.tagName && el.tagName.toLowerCase() === 'a') el.setAttribute('href', '/profiel')
    el.addEventListener('click', (e) => {
      if (!el.tagName || el.tagName.toLowerCase() !== 'a') e.preventDefault()
      go('/profiel')
    })
  })

  // Kandidaten (werkgever) => naar candidates-pagina
  const candidatesTriggers = [
    ...document.querySelectorAll('[data-link="candidates"]'),
    ...document.querySelectorAll('a[href$="candidates.html"]'),
    ...document.querySelectorAll('#goCandidates'),
  ]
  candidatesTriggers.forEach(el => {
    const target = '/pages/candidates.html'
    if (el.tagName && el.tagName.toLowerCase() === 'a') el.setAttribute('href', target)
    el.addEventListener('click', (e) => {
      if (!el.tagName || el.tagName.toLowerCase() !== 'a') e.preventDefault()
      go(target)
    })
  })

  // Berichten
  const messagesTriggers = [
    ...document.querySelectorAll('[data-link="berichten"]'),
    ...document.querySelectorAll('a[href$="berichten.html"]'),
    ...document.querySelectorAll('#goBerichten'),
  ]
  messagesTriggers.forEach(el => {
    if (el.tagName && el.tagName.toLowerCase() === 'a') el.setAttribute('href', '/berichten')
    el.addEventListener('click', (e) => {
      if (!el.tagName || el.tagName.toLowerCase() !== 'a') e.preventDefault()
      go('/berichten')
    })
  })

  // Berichtenlijst (eigen berichten)
  const messagesContainer = document.querySelector('.card.messages .card-content')
  const formatTimeAgo = (dateStr) => {
    const d = new Date(dateStr)
    const diffMs = Date.now() - d.getTime()
    const mins = Math.floor(diffMs / 60000)
    if (Number.isNaN(mins)) return ''
    if (mins < 1) return 'zojuist'
    if (mins < 60) return `${mins} min geleden`
    const h = Math.floor(mins / 60)
    if (h < 24) return `${h} uur geleden`
    const dgs = Math.floor(h / 24)
    return `${dgs} dag${dgs === 1 ? '' : 'en'} geleden`
  }
  const renderMessages = (items = []) => {
    if (!messagesContainer) return
    messagesContainer.innerHTML = ''
    if (!items.length) {
      const p = document.createElement('p')
      p.textContent = 'Geen berichten'
      messagesContainer.appendChild(p)
      return
    }
    items.forEach(msg => {
      const el = document.createElement('div')
      el.className = 'message'
      el.innerHTML = `
        <h3>${msg.title || 'Bericht'}</h3>
        <p>${msg.body || ''}</p>
        <span class="time">${formatTimeAgo(msg.created_at || msg.createdAt)}</span>
      `
      el.addEventListener('click', () => go('/berichten'))
      messagesContainer.appendChild(el)
    })
  }
  const loadMessages = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/berichten?limit=3`, { credentials: 'include' })
      if (!res.ok) throw new Error('not_ok')
      const data = await res.json()
      renderMessages(Array.isArray(data.items) ? data.items : [])
    } catch (err) {
      renderMessages([])
    }
  }

  // Kandidaten (card) – laad een beknopt overzicht met live seekers
  const candContainer = document.querySelector('.card.candidates .card-content')
  const renderCandidates = (items = []) => {
    if (!candContainer) return
    candContainer.innerHTML = ''
    if (!items.length) {
      const empty = document.createElement('div')
      empty.className = 'candidate'
      empty.textContent = 'Nog geen kandidaten gevonden.'
      candContainer.appendChild(empty)
      return
    }
    items.forEach(c => {
      const el = document.createElement('div')
      el.className = 'candidate'
      el.dataset.id = c.id
      const name = c.name || (c.email ? c.email.split('@')[0] : 'Kandidaat')
      el.innerHTML = `
        <h3>${name}</h3>
        <p>Rol: - • Locatie: -</p>
        <span class="badge">0% match</span>
      `
      el.addEventListener('click', () => go('/pages/candidates.html'))
      candContainer.appendChild(el)
    })
  }
  const loadCandidates = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/candidates?limit=3`, { credentials: 'include' })
      if (!res.ok) throw new Error('Kon kandidaten niet laden')
      const data = await res.json()
      renderCandidates(Array.isArray(data.items) ? data.items : [])
    } catch (err) {
      renderCandidates([])
    }
  }
  loadMessages()

  // Item click feedback (optioneel toast)
  const toastContainer = document.getElementById('toasts')
  const showToast = (text, type = '') => {
    if (!toastContainer) return
    const el = document.createElement('div')
    el.className = `toast ${type}`.trim()
    el.textContent = text
    toastContainer.appendChild(el)
    setTimeout(() => el.remove(), 2500)
  }

  document.querySelectorAll('.candidate').forEach(c => {
    c.addEventListener('click', () => showToast('Kandidaat geopend'))
  })
  document.querySelectorAll('.message').forEach(m => {
    m.addEventListener('click', () => showToast('Bericht geopend'))
  })

  // Vacatures laden en tonen
  const vacList = document.getElementById('vacanciesList')
  const refreshBtn = document.getElementById('refreshVacatures')
  const logoutBtn = document.getElementById('logoutBtn')
  const userIdBadge = document.getElementById('userIdBadge')
  const vacanciesCount = document.getElementById('vacanciesCount')
  // Company modal elements
  const companyModal = document.getElementById('companyModal')
  const companyBackdrop = document.getElementById('companyModalBackdrop')
  const openCompanyBtn = document.getElementById('openCompanyModal')
  const closeCompanyBtn = document.getElementById('closeCompanyModal')
  const cancelCompanyBtn = document.getElementById('cancelCompany')
  const companyForm = document.getElementById('companyForm')
  const companyBody = companyModal?.querySelector('.panel-body')
  const companyFooter = companyModal?.querySelector('.panel-footer')

  const renderVacancies = (items = []) => {
    if (!vacList) return
    vacList.innerHTML = ''
    if (!items.length) {
      const empty = document.createElement('div')
      empty.className = 'vacancy'
      empty.textContent = 'Nog geen vacatures gevonden.'
      vacList.appendChild(empty)
      return
    }
    items.forEach(v => {
      const el = document.createElement('div')
      el.className = 'vacancy'
      el.dataset.id = v.id
      el.innerHTML = `
        <h3>${v.functietitel || 'Onbekende functie'}</h3>
        <div class="meta">${v.locatie || '—'} • ${v.dienstverband || '—'} • ${v.uren_per_week ?? '—'}u p/w</div>
        ${Array.isArray(v.vaardigheden) && v.vaardigheden.length ? `<div class="skills">${v.vaardigheden.slice(0,6).map(s => `<span class='badge'>${s}</span>`).join('')}</div>` : ''}
      `
      el.addEventListener('click', async () => {
        try {
          const id = el.dataset.id
          const res = await fetch(`${API_BASE}/api/vacatures/${id}`, { credentials: 'include' })
          if (!res.ok) throw new Error('Kon vacature niet laden')
          const data = await res.json()
          const v = data.item || {}
          // Fill form for editing
          document.getElementById('vacatureId').value = v.id
          document.getElementById('functietitel').value = v.functietitel || ''
          document.getElementById('categorie').value = v.categorie || ''
          document.getElementById('locatie').value = v.locatie || ''
          document.getElementById('dienstverband').value = v.dienstverband || ''
          document.getElementById('uren').value = v.uren_per_week ?? ''
          document.getElementById('salarisMin').value = v.salaris_min ?? ''
          document.getElementById('salarisMax').value = v.salaris_max ?? ''
          document.getElementById('opleiding').value = v.opleidingsniveau || ''
          document.getElementById('ervaring').value = v.ervaring_jaren ?? ''
          document.getElementById('omschrijving').value = v.omschrijving || ''
          document.getElementById('startdatum').value = v.startdatum || ''
          document.getElementById('posities').value = v.posities ?? ''
          document.getElementById('contractduur').value = v.contractduur || ''
          document.getElementById('contactpersoon').value = v.contactpersoon || ''
          const titleEl = document.getElementById('vacModalTitle')
          if (titleEl) titleEl.textContent = 'Vacature bewerken'
          const isActiveEl = document.getElementById('isActive')
          if (isActiveEl) isActiveEl.checked = !(v.is_active === 0)

          // Skills
          skills.splice(0, skills.length)
          if (Array.isArray(v.vaardigheden)) skills.push(...v.vaardigheden)
          renderSkills()

          // Show delete button in edit mode
          const delBtn = document.getElementById('deleteVacature')
          delBtn.hidden = false
          if (saveBtn) saveBtn.textContent = 'Bijwerken'

          // Open modal
          openModal()
        } catch (err) {
          showToast(err.message || 'Kon vacature niet laden', 'error')
        }
      })
      vacList.appendChild(el)

      // Voeg status-badge en actief/pauzeer-knop toe
      try {
        const meta = el.querySelector('.meta')
        if (meta) {
          const status = (v.is_active === 0) ? 'Gepauzeerd' : 'Actief'
          const badge = document.createElement('span')
          badge.className = 'badge ' + ((v.is_active === 0) ? 'error' : 'success')
          badge.title = status
          badge.textContent = status
          meta.insertBefore(badge, meta.firstChild)
          meta.insertBefore(document.createTextNode(' '), badge.nextSibling)
        }
      } catch {}
      const actions = document.createElement('div')
      actions.className = 'actions'
      actions.style.cssText = 'margin-top:8px; display:flex; gap:8px; flex-wrap:wrap;'
      const toggleBtn = document.createElement('button')
      toggleBtn.type = 'button'
      toggleBtn.className = 'btn-toggle'
      toggleBtn.dataset.action = 'toggle'
      toggleBtn.textContent = (v.is_active === 0) ? 'Activeer' : 'Pauzeer'
      toggleBtn.addEventListener('click', async (e) => {
        e.preventDefault(); e.stopPropagation()
        const id = el.dataset.id
        try {
          const desired = (v.is_active === 0) ? 1 : 0
          const res = await fetch(`${API_BASE}/api/vacatures/${id}/active`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ is_active: desired })
          })
          if (!res.ok) {
            const err = await res.json().catch(() => ({}))
            throw new Error(err?.error || `Fout (${res.status})`)
          }
          showToast(desired ? 'Vacature geactiveerd' : 'Vacature gepauzeerd', 'success')
          loadVacancies()
        } catch (err) {
          showToast(err.message || 'Kon status niet wijzigen', 'error')
        }
      })
      actions.appendChild(toggleBtn)
      el.appendChild(actions)
    })
  }

  const loadVacancies = async () => {
    try {
      if (refreshBtn) { refreshBtn.disabled = true; refreshBtn.textContent = 'Vernieuwen…' }
      const res = await fetch(`${API_BASE}/api/vacatures?limit=50&mine=1`, { credentials: 'include' })
      if (!res.ok) throw new Error('Fout bij laden vacatures')
      const data = await res.json()
      const items = Array.isArray(data.items) ? data.items : []
      renderVacancies(items)
      if (vacanciesCount) vacanciesCount.textContent = String(items.length)
    } catch (err) {
      showToast(err.message || 'Kon vacatures niet laden', 'error')
    }
    finally {
      if (refreshBtn) { refreshBtn.disabled = false; refreshBtn.textContent = 'Vernieuwen' }
    }
  }

  refreshBtn?.addEventListener('click', () => loadVacancies())
  loadVacancies()
  loadCandidates()

  // Huidige gebruiker tonen (debug) en logout
  const loadMe = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/me`, { credentials: 'include' })
      if (!res.ok) return
      const data = await res.json()
      const u = data.user
      if (u?.bedrijfsnaam && document.getElementById('profileName')) {
        document.getElementById('profileName').textContent = u.bedrijfsnaam
      }
      if (userIdBadge && u?.id) {
        userIdBadge.textContent = `Employer ID: ${u.id}`
        userIdBadge.hidden = false
      }
    } catch {}
  }
  loadMe()

  // Company modal helpers with accessibility + sticky shadow
  let lastFocusCompany = null
  const focusFirstCompany = () => {
    const first = document.getElementById('cp_bedrijfsnaam') || companyModal?.querySelector('input,select,textarea,button')
    first?.focus?.()
  }
  const updateCompanyFooterShadow = () => { if (companyFooter && companyBody) companyFooter.classList.toggle('elevated', companyBody.scrollTop > 0) }
  const handleEscCompany = (e) => { if (e.key === 'Escape') closeCompany() }
  const openCompany = () => {
    lastFocusCompany = document.activeElement
    document.body.classList.add('modal-open')
    companyModal?.classList.add('active')
    companyModal?.setAttribute('aria-hidden', 'false')
    companyBackdrop?.classList.add('active')
    setTimeout(focusFirstCompany, 10)
    updateCompanyFooterShadow()
    companyBody?.addEventListener('scroll', updateCompanyFooterShadow)
    document.addEventListener('keydown', handleEscCompany)
  }
  const closeCompany = () => {
    document.body.classList.remove('modal-open')
    companyModal?.classList.remove('active')
    companyModal?.setAttribute('aria-hidden', 'true')
    companyBackdrop?.classList.remove('active')
    companyBody?.removeEventListener('scroll', updateCompanyFooterShadow)
    companyFooter?.classList.remove('elevated')
    document.removeEventListener('keydown', handleEscCompany)
    lastFocusCompany?.focus?.()
  }
  openCompanyBtn?.addEventListener('click', openCompany)
  closeCompanyBtn?.addEventListener('click', closeCompany)
  cancelCompanyBtn?.addEventListener('click', (e) => { e.preventDefault(); closeCompany() })
  companyBackdrop?.addEventListener('click', closeCompany)

  const fillCompanyForm = (p = {}) => {
    const set = (id, val='') => { const el = document.getElementById(id); if (el) el.value = val || '' }
    set('cp_bedrijfsnaam', p.bedrijfsnaam)
    set('cp_kvk', p.kvk_nummer)
    set('cp_sector', p.sector)
    set('cp_grootte', p.bedrijfs_grootte)
    set('cp_locatie', p.locatie_adres)
    set('cp_website', p.website)
    set('cp_slogan', p.slogan)
    set('cp_beschrijving', p.beschrijving)
    set('cp_cultuur', p.cultuur)
    set('cp_contact_naam', p.contactpersoon_naam)
    set('cp_contact_email', p.contact_email)
  }

  const loadCompany = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/company/me`, { credentials: 'include' })
      if (!res.ok) return
      const data = await res.json()
      const p = data.profile
      if (p) fillCompanyForm(p)
      if (p?.bedrijfsnaam && document.getElementById('profileName')) {
        document.getElementById('profileName').textContent = p.bedrijfsnaam
      }
    } catch {}
  }

  openCompanyBtn?.addEventListener('click', () => loadCompany())

  // Open bedrijfsprofiel door op de profielkaart te klikken
  const profileCardEl = document.getElementById('profileCard')
  profileCardEl?.addEventListener('click', (e) => {
    e.preventDefault()
    loadCompany().finally(() => openCompany())
  })

  companyForm?.addEventListener('submit', async (e) => {
    e.preventDefault()
    const payload = {
      bedrijfsnaam: document.getElementById('cp_bedrijfsnaam')?.value?.trim(),
      kvk_nummer: document.getElementById('cp_kvk')?.value?.trim(),
      sector: document.getElementById('cp_sector')?.value?.trim(),
      bedrijfs_grootte: document.getElementById('cp_grootte')?.value?.trim(),
      locatie_adres: document.getElementById('cp_locatie')?.value?.trim(),
      website: document.getElementById('cp_website')?.value?.trim(),
      slogan: document.getElementById('cp_slogan')?.value?.trim(),
      beschrijving: document.getElementById('cp_beschrijving')?.value?.trim(),
      cultuur: document.getElementById('cp_cultuur')?.value?.trim(),
      contactpersoon_naam: document.getElementById('cp_contact_naam')?.value?.trim(),
      contact_email: document.getElementById('cp_contact_email')?.value?.trim(),
    }
    if (!payload.bedrijfsnaam) { showToast('Bedrijfsnaam is verplicht', 'error'); return }
    try {
      const res = await fetch(`${API_BASE}/api/company`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error || `Fout (${res.status})`)
      }
      showToast('Profiel opgeslagen', 'success')
      if (payload.bedrijfsnaam && document.getElementById('profileName')) {
        document.getElementById('profileName').textContent = payload.bedrijfsnaam
      }
      closeCompany()
    } catch (err) {
      showToast(err.message || 'Kon profiel niet opslaan', 'error')
    }
  })

  const doLogout = async (e) => {
    e?.preventDefault()
    try {
      await fetch(`${API_BASE}/api/auth/logout`, { method: 'POST', credentials: 'include' })
    } catch {}
    const target = (location.port === '3000') ? '/' : '/pages/inlog-aanmeld.html'
    window.location.href = target
  }
  logoutBtn?.addEventListener('click', doLogout)

  // Vacature maken modal
  const modal = document.getElementById('vacModal')
  const backdrop = document.getElementById('vacModalBackdrop')
  const openBtn = document.getElementById('openVacatureModal')
  const closeBtn = document.getElementById('closeVacatureModal')
  const cancelBtn = document.getElementById('cancelVacature')
  const form = document.getElementById('vacatureForm')
  const saveBtn = document.getElementById('saveVacature')
  const resetVacatureForm = () => {
    try {
      form?.reset()
      const idEl = document.getElementById('vacatureId')
      if (idEl) idEl.value = ''
      const isActiveEl = document.getElementById('isActive')
      if (isActiveEl) isActiveEl.checked = true
      const delBtn = document.getElementById('deleteVacature')
      if (delBtn) delBtn.hidden = true
      if (saveBtn) saveBtn.textContent = 'Opslaan'
      skills.splice(0, skills.length)
      renderSkills()
    } catch {}
  };
  const vacBody = modal?.querySelector('.panel-body')
  const vacFooter = modal?.querySelector('.panel-footer')

  // Accessibility for vacancy modal + sticky shadow
  let lastFocusVac = null
  const focusFirstVac = () => {
    const first = document.getElementById('functietitel') || modal?.querySelector('input,select,textarea,button')
    first?.focus?.()
  }
  const updateVacFooterShadow = () => { if (vacFooter && vacBody) vacFooter.classList.toggle('elevated', vacBody.scrollTop > 0) }
  const handleEscVac = (e) => { if (e.key === 'Escape') closeModal() }
  const openModal = () => {
    if (!modal || !backdrop) return
    lastFocusVac = document.activeElement
    document.body.classList.add('modal-open')
    modal.classList.add('active')
    modal.setAttribute('aria-hidden', 'false')
    backdrop.classList.add('active')
    setTimeout(focusFirstVac, 10)
    updateVacFooterShadow()
    vacBody?.addEventListener('scroll', updateVacFooterShadow)
    document.addEventListener('keydown', handleEscVac)
  }
  const closeModal = () => {
    if (!modal || !backdrop) return
    document.body.classList.remove('modal-open')
    modal.classList.remove('active')
    modal.setAttribute('aria-hidden', 'true')
    backdrop.classList.remove('active')
    vacBody?.removeEventListener('scroll', updateVacFooterShadow)
    vacFooter?.classList.remove('elevated')
    document.removeEventListener('keydown', handleEscVac)
    lastFocusVac?.focus?.()
  }
  openBtn?.addEventListener('click', () => {
    const titleEl = document.getElementById('vacModalTitle')
    if (titleEl) titleEl.textContent = 'Vacature maken'
    resetVacatureForm();
    openModal()
  })
  closeBtn?.addEventListener('click', closeModal)
  cancelBtn?.addEventListener('click', (e) => { e.preventDefault(); closeModal() })
  backdrop?.addEventListener('click', closeModal)

  // Skills tag input
  const skillsInput = document.getElementById('skillsInput')
  const skillsList = document.getElementById('skillsList')
  const skills = []

  const renderSkills = () => {
    if (!skillsList) return
    skillsList.innerHTML = ''
    skills.forEach((s, idx) => {
      const chip = document.createElement('span')
      chip.className = 'chip'
      chip.innerHTML = `${s} <button type="button" class="remove" aria-label="Verwijder">×</button>`
      chip.querySelector('.remove')?.addEventListener('click', () => {
        skills.splice(idx, 1)
        renderSkills()
      })
      skillsList.appendChild(chip)
    })
  }

  skillsInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ',' ) {
      e.preventDefault()
      const val = (skillsInput.value || '').trim().replace(/,$/, '')
      if (val && !skills.includes(val)) {
        skills.push(val)
        renderSkills()
      }
      skillsInput.value = ''
    }
  })

  // Submit vacature
  form?.addEventListener('submit', async (e) => {
    e.preventDefault()
    const id = document.getElementById('vacatureId')?.value || ''
    const payload = {
      functietitel: document.getElementById('functietitel')?.value?.trim(),
      categorie: document.getElementById('categorie')?.value?.trim(),
      locatie: document.getElementById('locatie')?.value?.trim(),
      dienstverband: document.getElementById('dienstverband')?.value?.trim(),
      uren_per_week: Number(document.getElementById('uren')?.value || 0),
      salaris_min: document.getElementById('salarisMin')?.value,
      salaris_max: document.getElementById('salarisMax')?.value,
      opleidingsniveau: document.getElementById('opleiding')?.value?.trim(),
      ervaring_jaren: Number(document.getElementById('ervaring')?.value || 0),
      vaardigheden: skills.slice(),
      omschrijving: document.getElementById('omschrijving')?.value || '',
      startdatum: document.getElementById('startdatum')?.value || null,
      posities: document.getElementById('posities')?.value,
      contractduur: document.getElementById('contractduur')?.value || '',
      contactpersoon: document.getElementById('contactpersoon')?.value || '',
      is_active: document.getElementById('isActive')?.checked ? 1 : 0,
    }

    // client-side required check for main fields
    const required = ['functietitel','categorie','locatie','dienstverband','uren_per_week','opleidingsniveau','ervaring_jaren']
    const missing = required.filter(k => !payload[k] && payload[k] !== 0)
    if (missing.length) {
      showToast(`Ontbrekende velden: ${missing.join(', ')}`, 'error')
      return
    }
    if (!payload.vaardigheden || payload.vaardigheden.length === 0) {
      showToast('Voeg minstens 1 vaardigheid toe', 'error')
      return
    }

    try {
      const isEdit = Boolean(id)
      const url = isEdit ? `${API_BASE}/api/vacatures/${id}` : `${API_BASE}/api/vacatures`
      const method = isEdit ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error || `Fout (${res.status})`)
      }
      showToast(isEdit ? 'Vacature bijgewerkt' : 'Vacature opgeslagen', 'success')
      form.reset()
      skills.splice(0, skills.length)
      renderSkills()
      closeModal()
      loadVacancies()
    } catch (err) {
      showToast(err.message || 'Kon vacature niet opslaan', 'error')
    }
  })

  const deleteBtn = document.getElementById('deleteVacature')
  deleteBtn?.addEventListener('click', async (e) => {
    e.preventDefault()
    const id = document.getElementById('vacatureId')?.value
    if (!id) return
    try {
      const res = await fetch(`${API_BASE}/api/vacatures/${id}`, { method: 'DELETE', credentials: 'include' })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error || `Fout (${res.status})`)
      }
      showToast('Vacature verwijderd', 'success')
      form.reset(); skills.splice(0, skills.length); renderSkills(); closeModal(); loadVacancies()
    } catch (err) {
      showToast(err.message || 'Kon vacature niet verwijderen', 'error')
    }
  })
})


