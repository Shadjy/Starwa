const AUTH_USER_KEY = 'starwa-auth-user'

function ensureAuthenticated() {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY)
    if (!raw) throw new Error('no session')
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') throw new Error('invalid session')
    return true
  } catch (_error) {
    localStorage.removeItem(AUTH_USER_KEY)
    window.location.replace('vragenlijst.html')
    return false
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (!ensureAuthenticated()) return

  let currentPage = 1
  const pages = Array.from(document.querySelectorAll('.page'))
  const totalPages = pages.length
  const prevBtn = document.getElementById('prevBtn')
  const nextBtn = document.getElementById('nextBtn')
  const progressBar = document.getElementById('progressBar')

  function showPage(page) {
    pages.forEach(p => p.classList.remove('active'))
    const active = document.getElementById(`page${page}`)
    if (active) {
      active.classList.add('active')
    }

    if (prevBtn) {
      prevBtn.disabled = page === 1
    }

    if (nextBtn) {
      nextBtn.textContent = page === totalPages ? 'Afronden' : 'Volgende'
    }

    updateProgressBar()
    checkIfAnswered()
  }

  function updateProgressBar() {
    if (!progressBar) return
    const progress = (currentPage / totalPages) * 100
    progressBar.style.width = `${progress}%`
  }

  function isAnswered(pageIndex = currentPage) {
    const page = document.getElementById(`page${pageIndex}`)
    if (!page) return false

    const textInputs = page.querySelectorAll('input[type="text"], input[type="number"]')
    for (const input of textInputs) {
      if (input.value.trim() !== '') return true
    }

    const radios = page.querySelectorAll('input[type="radio"]')
    if (radios.length > 0) {
      const groups = {}
      radios.forEach(radio => {
        const { name } = radio
        if (!groups[name]) groups[name] = []
        groups[name].push(radio)
      })

      return Object.values(groups).some(group => group.some(radio => radio.checked))
    }

    return false
  }

  function checkIfAnswered() {
    if (!nextBtn) return
    nextBtn.disabled = !isAnswered()
  }

  function nextPage() {
    if (!isAnswered()) {
      window.alert('Beantwoord eerst deze vraag voordat je doorgaat!')
      return
    }

    if (currentPage < totalPages) {
      currentPage += 1
      showPage(currentPage)
    } else {
      window.alert('Bedankt voor het invullen van de vragenlijst!')
      window.location.href = 'dashboard.html'
    }
  }

  function prevPage() {
    if (currentPage > 1) {
      currentPage -= 1
      showPage(currentPage)
    }
  }

  if (nextBtn) nextBtn.addEventListener('click', nextPage)
  if (prevBtn) prevBtn.addEventListener('click', prevPage)

  document.addEventListener('input', event => {
    if (pages.some(page => page.contains(event.target))) {
      checkIfAnswered()
    }
  })

  document.addEventListener('change', event => {
    if (pages.some(page => page.contains(event.target))) {
      checkIfAnswered()
    }
  })

  showPage(currentPage)
})
