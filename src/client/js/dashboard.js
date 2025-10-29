document.addEventListener("DOMContentLoaded", () => {
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
  if (profileCard) profileCard.addEventListener("click", () => go('/profiel'))

  
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
})
