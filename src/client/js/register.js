const roleToggle = document.getElementById('role-toggle')
const roleButtons = roleToggle ? Array.from(roleToggle.querySelectorAll('[data-role]')) : []
const form = document.getElementById('auth-form')
const formContainer = document.getElementById('form-container')
const submitBtn = document.getElementById('submit-btn')
const confirmErrorMessage = document.querySelector('[data-error-for="confirm"]')
const feedbackMessage = document.querySelector('[data-feedback]')
const authSubtitle = document.querySelector('.auth-sub')
const roleField = document.getElementById('roleField')

const state = {
  role: 'seeker',
}

const roleMessages = {
  seeker: 'Maak een account aan om je perfecte match te vinden.',
  employer: 'Maak een account aan om talent te vinden.',
}

const fieldConfig = {
  seeker: [
    { id: 'naam', name: 'naam', label: 'Volledige naam', type: 'text', autocomplete: 'name', required: true },
    { id: 'email', name: 'email', label: 'E-mailadres', type: 'email', autocomplete: 'email', required: true },
    { id: 'password', name: 'password', label: 'Wachtwoord', type: 'password', autocomplete: 'new-password', required: true },
    { id: 'confirm', name: 'confirm', label: 'Bevestig wachtwoord', type: 'password', autocomplete: 'new-password', required: true },
  ],
  employer: [
    { id: 'contactpersoon', name: 'contactpersoon', label: 'Contactpersoon naam', type: 'text', autocomplete: 'name', required: true },
    { id: 'bedrijfsnaam', name: 'bedrijfsnaam', label: 'Bedrijfsnaam', type: 'text', autocomplete: 'organization', required: true },
    {
      id: 'bedrijfsGrootte',
      name: 'bedrijfsGrootte',
      label: 'Bedrijfsgrootte',
      type: 'select',
      options: [
        { value: '', text: 'Selecteer bedrijfsgrootte', disabled: true, selected: true },
        { value: '1-10', text: '1-10 medewerkers' },
        { value: '11-50', text: '11-50 medewerkers' },
        { value: '51-200', text: '51-200 medewerkers' },
        { value: '201-500', text: '201-500 medewerkers' },
        { value: '500+', text: '500+ medewerkers' },
      ],
      required: true,
    },
    { id: 'email', name: 'email', label: 'E-mailadres', type: 'email', autocomplete: 'email', required: true },
    { id: 'password', name: 'password', label: 'Wachtwoord', type: 'password', autocomplete: 'new-password', required: true },
    { id: 'confirm', name: 'confirm', label: 'Bevestig wachtwoord', type: 'password', autocomplete: 'new-password', required: true },
  ],
}

const apiBaseUrl = (location.port === '3000')
  ? window.location.origin
  : `${location.protocol}//${location.hostname}:3000`

const registerErrors = {
  missing: 'Vul alle verplichte velden in.',
  exists: 'E-mailadres bestaat al.',
  role_invalid: 'Onbekende rol geselecteerd.',
}

let pendingFeedback = ''

function setFeedback(text = '', type = '') {
  if (!feedbackMessage) return
  feedbackMessage.textContent = text
  if (type) feedbackMessage.dataset.type = type
  else delete feedbackMessage.dataset.type
}

function setSubmitting(isSubmitting) {
  if (!submitBtn) return
  submitBtn.disabled = isSubmitting
  submitBtn.textContent = isSubmitting ? 'Bezig met registreren...' : 'Account aanmaken'
}

function updateRoleButtons() {
  roleButtons.forEach(btn => btn.setAttribute('aria-selected', String(btn.dataset.role === state.role)))
  if (authSubtitle) {
    authSubtitle.textContent = roleMessages[state.role] || roleMessages.seeker
  }
}

function createInputField(config) {
  const wrap = document.createElement('div')
  wrap.className = 'form-field'

  const label = document.createElement('label')
  label.setAttribute('for', config.id)
  label.textContent = config.label

  let field
  if (config.type === 'select') {
    field = document.createElement('select')
    ;(config.options || []).forEach(o => {
      const opt = document.createElement('option')
      opt.value = o.value
      opt.textContent = o.text
      if (o.disabled) opt.disabled = true
      if (o.selected) opt.selected = true
      field.appendChild(opt)
    })
  } else {
    field = document.createElement('input')
    field.type = config.type
    if (config.autocomplete) field.autocomplete = config.autocomplete
  }
  field.id = config.id
  field.name = config.name
  if (config.required) field.required = true

  wrap.append(label, field)
  return wrap
}

function renderForm() {
  if (!formContainer) return
  formContainer.innerHTML = ''
  setFeedback()
  setSubmitting(false)

  const fields = fieldConfig[state.role]
  const fieldset = document.createElement('fieldset')
  fieldset.className = 'form-fields'

  const legend = document.createElement('legend')
  legend.className = 'visually-hidden'
  legend.textContent = 'Registratiegegevens'
  fieldset.appendChild(legend)

  fields.forEach(f => fieldset.appendChild(createInputField(f)))
  formContainer.appendChild(fieldset)

  if (form) {
    form.method = 'POST'
    form.action = `${apiBaseUrl}/api/auth/register`
  }
}

function setRole(role) {
  if (!role || role === state.role) return
  state.role = role
  if (roleField) roleField.value = role
  updateRoleButtons()
  renderForm()
}

function validatePasswords() {
  if (!form) return true
  const pw = form.querySelector('input[name="password"]')
  const cf = form.querySelector('input[name="confirm"]')
  if (!pw || !cf) {
    if (confirmErrorMessage) confirmErrorMessage.textContent = ''
    return true
  }
  const ok = pw.value === cf.value
  if (!ok && cf.value.length > 0) {
    cf.setCustomValidity('Wachtwoorden komen niet overeen.')
    if (confirmErrorMessage) confirmErrorMessage.textContent = 'Wachtwoorden komen niet overeen.'
  } else {
    cf.setCustomValidity('')
    if (confirmErrorMessage) confirmErrorMessage.textContent = ''
  }
  return ok
}

function applyQueryFeedback() {
  try {
    const params = new URLSearchParams(window.location.search || '')
    const roleParam = params.get('role')
    const error = params.get('error')
    if (roleParam === 'employer' || roleParam === 'seeker') {
      state.role = roleParam
    }
    if (error) {
      pendingFeedback = registerErrors[error] || 'Registreren mislukt. Probeer opnieuw.'
    }
  } catch {}
}

roleButtons.forEach(btn => btn.addEventListener('click', () => setRole(btn.dataset.role)))

if (form) {
  form.addEventListener('input', (e) => {
    if (e.target.name === 'password' || e.target.name === 'confirm') validatePasswords()
  })

  form.addEventListener('submit', (e) => {
    if (!form.checkValidity() || !validatePasswords()) {
      e.preventDefault()
      form.reportValidity()
      return
    }
    if (roleField) roleField.value = state.role
    setSubmitting(true)
  })
}

function init() {
  applyQueryFeedback()
  if (roleField) roleField.value = state.role
  updateRoleButtons()
  renderForm()
  if (pendingFeedback) {
    setFeedback(pendingFeedback, 'error')
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  init()
}
