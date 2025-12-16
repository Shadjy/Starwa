document.addEventListener("DOMContentLoaded", () => {
  // Detect API base (same-origin on :3000; otherwise target backend on :3000)
  const API_BASE = (typeof window !== 'undefined' && window.STARWA_API_BASE)
    ? window.STARWA_API_BASE
    : (location.port === '3000' ? '' : `${location.protocol}//${location.hostname}:3000`)

  const go = (path) => { window.location.href = path }

  // Profiel
  const profileAnchors = [
    ...document.querySelectorAll('a[href$="profiel.html"]'),
    ...document.querySelectorAll('[data-link="profiel"]'),
    ...document.querySelectorAll('#goProfile'),
  ]
  profileAnchors.forEach(el => {
    if (el.tagName.toLowerCase() === 'a') el.setAttribute('href', '/profiel')
    el.addEventListener('click', (e) => {
      if (el.tagName.toLowerCase() !== 'a') e.preventDefault()
      go('/profiel')
    })
  })

  const profileCard = document.getElementById("profileCard")
  const profileNameEl = document.getElementById("profileName")
  const profileAvatarEl = document.getElementById("profileAvatar")
  if (profileCard) profileCard.addEventListener("click", () => go('/profiel'))

  const candidateModal = document.getElementById('candidateModal')
  const candidateBackdrop = document.getElementById('candidateModalBackdrop')
  const btnCandidateInfo = document.getElementById('btnCandidateInfo')
  const closeCandidateModalBtn = document.getElementById('closeCandidateModal')
  const candidateForm = document.getElementById('candidateForm')
  const candidateFormMessage = document.getElementById('candidateFormMessage')
  let isPopulating = false
  let autoSaveTimer = null
  const candidateFields = {
    naam: document.getElementById('candidateName'),
    email_adres: document.getElementById('candidateEmail'),
    telefoonnummer: document.getElementById('candidatePhone'),
    huidige_functie: document.getElementById('candidateCurrent'),
    gewilde_functie: document.getElementById('candidateDesired'),
    sector: document.getElementById('candidateSector'),
    locatie: document.getElementById('candidateLocation'),
    beschikbaarheid: document.getElementById('candidateAvailability'),
    contracttype: document.getElementById('candidateContract'),
    uren_per_week: document.getElementById('candidateHours'),
    salarisindicatie: document.getElementById('candidateSalary'),
    cv_link: document.getElementById('candidateCv'),
    portfolio_link: document.getElementById('candidatePortfolio'),
    github_link: document.getElementById('candidateGithub'),
    vaardigheden: document.getElementById('candidateSkills'),
    talen: document.getElementById('candidateLanguages'),
    ervaring: document.getElementById('candidateExperience'),
    notities: document.getElementById('candidateNotes'),
  }
  const listInputs = {
    vaardigheden: document.querySelector('[data-list-input="vaardigheden"]'),
    talen: document.querySelector('[data-list-input="talen"]'),
    ervaring: document.querySelector('[data-list-input="ervaring"]'),
    notities: document.querySelector('[data-list-input="notities"]'),
  }
  const bulletPreviews = {
    vaardigheden: document.querySelector('[data-preview="vaardigheden"]'),
    talen: document.querySelector('[data-preview="talen"]'),
    ervaring: document.querySelector('[data-preview="ervaring"]'),
    notities: document.querySelector('[data-preview="notities"]'),
  }
  const listState = {
    vaardigheden: [],
    talen: [],
    ervaring: [],
    notities: [],
  }

  const setProfileDisplay = (text) => {
    if (profileNameEl) profileNameEl.textContent = text
    if (profileAvatarEl) profileAvatarEl.textContent = (text || 'J').charAt(0).toUpperCase()
  }

  const toggleCandidateModal = (show) => {
    if (!candidateModal || !candidateBackdrop) return
    if (show) {
      candidateModal.removeAttribute('hidden')
      candidateModal.classList.add('active')
      candidateBackdrop.classList.add('active')
      document.body.classList.add('modal-open')
    } else {
      candidateModal.setAttribute('hidden', '')
      candidateModal.classList.remove('active')
      candidateBackdrop.classList.remove('active')
      document.body.classList.remove('modal-open')
    }
  }

  const arrayToLines = (value) => {
    if (Array.isArray(value)) return value.join('\n')
    if (!value) return ''
    return typeof value === 'string' ? value : ''
  }

  const parseListInput = (value) => {
    if (!value) return []
    return String(value)
      .split(/[\r\n,;•]+/)
      .map(s => s.trim())
      .filter(Boolean)
  }

  const syncHiddenField = (key) => {
    const hidden = candidateFields[key]
    if (!hidden) return
    const items = listState[key] || []
    hidden.value = items.join('\n')
  }

  function scheduleAutoSave() {
    if (isPopulating) return
    clearTimeout(autoSaveTimer)
    autoSaveTimer = setTimeout(() => saveCandidate({ auto: true }), 800)
  }

  const renderBulletPreview = (key, value) => {
    const target = bulletPreviews[key]
    if (!target) return
    const items = Array.isArray(value) ? value : parseListInput(value)
    target.innerHTML = items.length
      ? items.map((item, idx) => `<li><span>${item}</span><button type="button" class="bullet-edit" data-edit-key="${key}" data-edit-idx="${idx}">Bewerken</button></li>`).join('')
      : ''
    target.querySelectorAll('.bullet-edit').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.dataset.editIdx)
        const listKey = btn.dataset.editKey
        const items = (listState[listKey] || []).slice()
        const [value] = items.splice(idx, 1)
        setListState(listKey, items)
        const entry = listInputs[listKey]
        if (entry && value !== undefined) {
          entry.value = value
          entry.focus()
        }
      })
    })
  }

  const setListState = (key, items) => {
    listState[key] = Array.isArray(items) ? items : []
    syncHiddenField(key)
    renderBulletPreview(key, listState[key])
    scheduleAutoSave()
  }

  const addListItem = (key, value) => {
    const text = String(value || '').trim()
    if (!text) return
    const items = listState[key] || []
    items.push(text)
    setListState(key, items)
  }

  const fillCandidateForm = (candidate = {}) => {
    Object.entries(candidateFields).forEach(([key, input]) => {
      if (!input) return
      switch (key) {
        case 'naam':
          input.value = candidate.name || candidate.naam || ''
          break
        case 'email_adres':
          input.value = candidate.email || ''
          break
        case 'telefoonnummer':
          input.value = candidate.details?.phone || candidate.telefoonnummer || ''
          break
        case 'huidige_functie':
          input.value = candidate.currentTitle || ''
          break
        case 'gewilde_functie':
          input.value = candidate.desiredRole || ''
          break
        case 'sector':
        case 'locatie':
        case 'beschikbaarheid':
        case 'contracttype':
        case 'salarisindicatie':
          input.value = candidate[key] || ''
          break
        case 'uren_per_week':
          input.value = candidate.uren ?? ''
          break
        case 'cv_link':
          input.value = candidate.details?.cvUrl || ''
          break
        case 'portfolio_link':
          input.value = candidate.details?.portfolio || ''
          break
        case 'github_link':
          input.value = candidate.details?.github || ''
          break
        default:
          input.value = ''
      }
    })
    setListState('vaardigheden', parseListInput(arrayToLines(candidate.skills || [])))
    setListState('talen', parseListInput(arrayToLines(candidate.details?.languages || candidate.languages || [])))
    setListState('ervaring', parseListInput(arrayToLines(candidate.details?.experience || candidate.experience || [])))
    setListState('notities', parseListInput(candidate.details?.notes || candidate.notities || ''))
    Object.values(listInputs).forEach(input => { if (input) input.value = '' })
  }

  const populateCandidateForm = async () => {
    if (candidateFormMessage) candidateFormMessage.textContent = ''
    isPopulating = true
    try {
      const res = await fetch(`${API_BASE}/api/candidates/me`, { credentials: 'include' })
      if (!res.ok) {
        fillCandidateForm()
        return
      }
      const data = await res.json()
      fillCandidateForm(data.item || {})
    } catch {
      fillCandidateForm()
    } finally {
      isPopulating = false
    }
  }

  const openCandidateModal = async () => {
    await populateCandidateForm()
    toggleCandidateModal(true)
  }

  const candidateCancel = () => toggleCandidateModal(false)

  btnCandidateInfo?.addEventListener('click', async (e) => {
    e.stopPropagation()
    e.preventDefault()
    await openCandidateModal()
  })

  closeCandidateModalBtn?.addEventListener('click', candidateCancel)
  candidateBackdrop?.addEventListener('click', candidateCancel)
  const cancelBtn = candidateForm?.querySelector('[data-candidate-cancel]')
  cancelBtn?.addEventListener('click', (event) => {
    event.preventDefault()
    candidateCancel()
  })

  const buildPayload = () => ({
    naam: candidateFields.naam?.value.trim() || null,
    email_adres: candidateFields.email_adres?.value.trim() || null,
    telefoonnummer: candidateFields.telefoonnummer?.value.trim() || null,
    huidige_functie: candidateFields.huidige_functie?.value.trim() || null,
    gewilde_functie: candidateFields.gewilde_functie?.value.trim() || null,
    sector: candidateFields.sector?.value.trim() || null,
    locatie: candidateFields.locatie?.value.trim() || null,
    beschikbaarheid: candidateFields.beschikbaarheid?.value.trim() || null,
    contracttype: candidateFields.contracttype?.value.trim() || null,
    uren_per_week: candidateFields.uren_per_week?.value ? Number(candidateFields.uren_per_week.value) : null,
    salarisindicatie: candidateFields.salarisindicatie?.value.trim() || null,
    cv_link: candidateFields.cv_link?.value.trim() || null,
    portfolio_link: candidateFields.portfolio_link?.value.trim() || null,
    github_link: candidateFields.github_link?.value.trim() || null,
    vaardigheden: parseListInput(candidateFields.vaardigheden?.value),
    talen: parseListInput(candidateFields.talen?.value),
    ervaring: parseListInput(candidateFields.ervaring?.value),
    notities: candidateFields.notities?.value.trim() || null,
  })

  async function saveCandidate({ auto = false, closeAfter = false } = {}) {
    if (candidateFormMessage) candidateFormMessage.textContent = auto ? 'Automatisch opslaan...' : 'Opslaan...'
    const payload = buildPayload()
    try {
      const res = await fetch(`${API_BASE}/api/candidates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const error = await res.json().catch(() => ({}))
        throw new Error(error.error || 'Kon kandidaatgegevens niet opslaan.')
      }
      if (candidateFormMessage) candidateFormMessage.textContent = auto ? 'Automatisch opgeslagen' : 'Opgeslagen!'
      if (closeAfter) setTimeout(() => candidateCancel(), 600)
    } catch (err) {
      if (candidateFormMessage) candidateFormMessage.textContent = err.message
    }
  }

  candidateForm?.addEventListener('submit', async (event) => {
    event.preventDefault()
    await saveCandidate({ auto: false, closeAfter: true })
  })

  ;['vaardigheden', 'talen', 'ervaring', 'notities'].forEach((key) => {
    const entry = listInputs[key]
    entry?.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault()
        addListItem(key, entry.value)
        entry.value = ''
        scheduleAutoSave()
      }
    })
  })
  Object.entries(candidateFields).forEach(([key, input]) => {
    if (!input) return
    input.addEventListener('input', scheduleAutoSave)
    input.addEventListener('change', scheduleAutoSave)
  })

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && candidateModal?.classList.contains('active')) {
      candidateCancel()
    }
  })

  const loadProfile = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/me`, { credentials: 'include' })
      if (!res.ok) return
      const data = await res.json()
      const user = data.user || {}
      const label = user.naam || user.contactpersoon || (user.email ? user.email.split('@')[0] : 'Jij')
      setProfileDisplay(label)
    } catch {}
  }

  
  const matchAnchors = [
    ...document.querySelectorAll('a[href$="match.html"]'),
    ...document.querySelectorAll('[data-link="match"]'),
    ...document.querySelectorAll('#goMatch'),
  ]
  matchAnchors.forEach(el => {
    if (el.tagName.toLowerCase() === 'a') el.setAttribute('href', '/match')
    el.addEventListener('click', (e) => {
      if (el.tagName.toLowerCase() !== 'a') e.preventDefault()
      go('/match')
    })
  })

  const matchViewAll = document.querySelector(".matches .view-all")
  if (matchViewAll) {
    if (matchViewAll.tagName.toLowerCase() === 'a') matchViewAll.setAttribute('href', '/match')
    matchViewAll.addEventListener('click', (e) => {
      if (matchViewAll.tagName.toLowerCase() !== 'a') e.preventDefault()
      go('/match')
    })
  }

  // Berichten
  const messagesAnchors = [
    ...document.querySelectorAll('a[href$="berichten.html"]'),
    ...document.querySelectorAll('[data-link="berichten"]'),
    ...document.querySelectorAll('#goBerichten'),
  ]
  messagesAnchors.forEach(el => {
    if (el.tagName.toLowerCase() === 'a') el.setAttribute('href', '/berichten')
    el.addEventListener('click', (e) => {
      if (el.tagName.toLowerCase() !== 'a') e.preventDefault()
      go('/berichten')
    })
  })

  const messagesViewAll = document.querySelector(".messages .view-all")
  if (messagesViewAll) {
    if (messagesViewAll.tagName.toLowerCase() === 'a') messagesViewAll.setAttribute('href', '/berichten')
    messagesViewAll.addEventListener('click', (e) => {
      if (messagesViewAll.tagName.toLowerCase() !== 'a') e.preventDefault()
      go('/berichten')
    })
  }

  // Matches: laad recent geplaatste vacatures (live uit backend)
  const matchesContainer = document.querySelector('.card.matches .card-content')
  const formatEuro = (n) => {
    try {
      if (n == null || n === '') return null
      return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(Number(n))
    } catch { return null }
  }
  const formatSalaris = (min, max) => {
    const a = formatEuro(min)
    const b = formatEuro(max)
    if (a && b) return `${a} - ${b}`
    if (a) return `${a}`
    if (b) return `${b}`
    return null
  }
  const calcScore = (v) => {
    let s = 60
    if (v.salaris_min != null || v.salaris_max != null) s += 10
    if (v.uren_per_week != null) s += Math.min(10, Math.max(0, (Number(v.uren_per_week) - 24) / 2)) // favor >=32u
    try {
      const skills = Array.isArray(v.vaardigheden) ? v.vaardigheden : (v.vaardigheden ? JSON.parse(v.vaardigheden) : [])
      if (Array.isArray(skills) && skills.length) s += 10
    } catch {}
    return Math.max(50, Math.min(97, Math.round(s)))
  }
  const renderMatches = (items = []) => {
    if (!matchesContainer) return
    matchesContainer.innerHTML = ''
    if (!items.length) {
      const empty = document.createElement('div')
      empty.className = 'job'
      empty.innerHTML = '<p>Geen vacatures gevonden.</p>'
      matchesContainer.appendChild(empty)
      return
    }
    items.forEach(v => {
      const el = document.createElement('div')
      el.className = 'job'
      el.dataset.id = v.id
      const salaris = formatSalaris(v.salaris_min, v.salaris_max)
      el.innerHTML = `
        <h3>${v.functietitel || 'Vacature'}</h3>
        <p>Locatie: ${v.locatie || '—'}</p>
        ${salaris ? `<p>Salaris: ${salaris}</p>` : ''}
        <span class="match-score">${calcScore(v)}%</span>
      `
      el.addEventListener('click', () => go('/match'))
      matchesContainer.appendChild(el)
    })
  }
  const loadMatches = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/vacatures?limit=3`, { credentials: 'include' })
      if (!res.ok) throw new Error('Kon vacatures niet laden')
      const data = await res.json()
      renderMatches(Array.isArray(data.items) ? data.items : [])
    } catch (err) {
      console.warn('Matches laden mislukt:', err)
      renderMatches([])
    }
  }
  loadMatches()
  loadProfile()
})
