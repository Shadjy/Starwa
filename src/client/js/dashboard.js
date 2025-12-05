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
  // Profiel openen alleen via de header; kaart nav verwijderd
  const headerProfileBtn = document.getElementById("headerProfileBtn")
  headerProfileBtn?.addEventListener("click", () => go('/profiel'))
  
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
})
