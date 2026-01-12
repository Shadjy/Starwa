document.addEventListener("DOMContentLoaded", () => {
  // Detect API base (same-origin on :3000; otherwise target backend on :3000)
  const API_BASE = (typeof window !== 'undefined' && window.STARWA_API_BASE)
    ? window.STARWA_API_BASE
    : (location.port === '3000' ? '' : `${location.protocol}//${location.hostname}:3000`)

  const ensureAuthed = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/me`, { credentials: 'include' })
      if (res.status === 401) {
        window.location.href = '/inlog-aanmeld'
        return null
      }
      if (!res.ok) throw new Error('not_ok')
      const data = await res.json()
      return data?.user || null
    } catch {
      window.location.href = '/inlog-aanmeld'
      return null
    }
  }

  const initialsFromName = (name = '') => {
    const parts = name.split(/\s+/).filter(Boolean)
    if (!parts.length) return 'NA'
    return parts.map(p => p[0]).join('').slice(0, 2).toUpperCase()
  }

  const hydrateHeaderProfile = async () => {
    const headerProfileBtn = document.getElementById("headerProfileBtn")
    if (!headerProfileBtn) return
    const nameEl = headerProfileBtn.querySelector('.profile-chip__name')
    const initialsEl = headerProfileBtn.querySelector('.profile-chip__initials')
    const imgEl = headerProfileBtn.querySelector('img')
    const avatarEl = headerProfileBtn.querySelector('.profile-chip__avatar')
    try {
      const res = await fetch(`${API_BASE}/api/profile/me`, { credentials: 'include' })
      if (res.status === 401) {
        window.location.href = '/inlog-aanmeld'
        return
      }
      if (!res.ok) return
      const data = await res.json()
      const displayName = data?.user?.naam || data?.user?.contactpersoon || data?.user?.displayName || data?.user?.email || 'Profiel'
      if (nameEl) nameEl.textContent = displayName
      if (initialsEl) initialsEl.textContent = initialsFromName(displayName)
      const avatarUrl = data?.profile?.avatar_url || ''
      if (imgEl) imgEl.src = avatarUrl
      if (avatarEl) avatarEl.dataset.hasPhoto = avatarUrl ? 'true' : 'false'
    } catch (err) {
      // Fallback: laat statische waarden staan
    }
  }

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
  // Profiel openen alleen via de header; kaart nav verwijderd
  const headerProfileBtn = document.getElementById("headerProfileBtn")
  headerProfileBtn?.addEventListener("click", () => go('/profiel'))
  hydrateHeaderProfile()
  ensureAuthed()
  
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

  // Berichten: toon eigen berichten (recent)
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
  loadMessages()
})
