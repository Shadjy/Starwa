const form = document.getElementById('auth-form')
const submitBtn = document.getElementById('submit-btn')
const errorMessage = document.querySelector('[data-error-for="form"]')
const feedbackMessage = document.querySelector('[data-feedback]')

const apiBaseUrl = (location.port === '3000')
  ? window.location.origin
  : `${location.protocol}//${location.hostname}:3000`

const errorMessages = {
  invalid: 'Onjuiste inloggegevens.',
  missing: 'Vul je e-mailadres en wachtwoord in.',
  role_missing: 'Account rol ontbreekt, neem contact op.',
  role_unknown: 'Account rol ontbreekt of is ongeldig.',
}

function setError(text = '') {
  if (!errorMessage) return
  errorMessage.textContent = text
}

function setFeedback(text = '', type = '') {
  if (!feedbackMessage) return
  feedbackMessage.textContent = text
  if (type) feedbackMessage.dataset.type = type
  else delete feedbackMessage.dataset.type
}

function setSubmitting(isSubmitting) {
  if (!submitBtn) return
  submitBtn.disabled = isSubmitting
  submitBtn.textContent = isSubmitting ? 'Bezig met inloggen...' : 'Inloggen'
}

function applyQueryFeedback() {
  setError('')
  setFeedback('')
  try {
    const params = new URLSearchParams(window.location.search || '')
    const error = params.get('error')
    const registered = params.get('registered')
    if (registered === '1') {
      setFeedback('Account aangemaakt. Log nu in.', 'success')
    }
    if (error) {
      setError(errorMessages[error] || 'Inloggen mislukt. Probeer opnieuw.')
    }
  } catch {}
}

if (form) {
  form.method = 'POST'
  form.action = `${apiBaseUrl}/api/auth/login`
  form.addEventListener('submit', (e) => {
    if (!form.checkValidity()) {
      e.preventDefault()
      form.reportValidity()
      return
    }
    setSubmitting(true)
  })
}

applyQueryFeedback()
