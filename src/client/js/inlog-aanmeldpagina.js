const roleToggle = document.getElementById('role-toggle')
const roleButtons = roleToggle ? Array.from(roleToggle.querySelectorAll('[data-role]')) : []
const authTabs = document.getElementById('auth-tabs')
const authButtons = authTabs ? Array.from(authTabs.querySelectorAll('[data-auth]')) : []
const form = document.getElementById('auth-form')
const formContainer = document.getElementById('form-container')
const submitBtn = document.getElementById('submit-btn')
const confirmErrorMessage = document.querySelector('[data-error-for="confirm"]')
const feedbackMessage = document.querySelector('[data-feedback]')
const authSubtitle = document.querySelector('.auth-sub')

const AUTH_USER_KEY = 'starwa-auth-user'

const state = {
  role: 'seeker',
  auth: 'login',
}

const roleMessages = {
  seeker: 'Log in of maak een account aan om je perfecte baan te vinden',
  employer: 'Log in of maak een account aan om talent te vinden',
}

const fieldConfig = {
  login: {
    seeker: [
      {
        id: 'email',
        name: 'email',
        label: 'E-mailadres',
        type: 'email',
        autocomplete: 'email',
        required: true,
      },
      {
        id: 'password',
        name: 'password',
        label: 'Wachtwoord',
        type: 'password',
        autocomplete: 'current-password',
        required: true,
      },
    ],
    employer: [],
  },
  register: {
    seeker: [
      {
        id: 'naam',
        name: 'naam',
        label: 'Volledige naam',
        type: 'text',
        autocomplete: 'name',
        required: true,
      },
      {
        id: 'email',
        name: 'email',
        label: 'E-mailadres',
        type: 'email',
        autocomplete: 'email',
        required: true,
      },
      {
        id: 'password',
        name: 'password',
        label: 'Wachtwoord',
        type: 'password',
        autocomplete: 'new-password',
        required: true,
      },
      {
        id: 'confirm',
        name: 'confirm',
        label: 'Bevestig wachtwoord',
        type: 'password',
        autocomplete: 'new-password',
        required: true,
      },
    ],
    employer: [
      {
        id: 'contactpersoon',
        name: 'contactpersoon',
        label: 'Contactpersoon naam',
        type: 'text',
        autocomplete: 'name',
        required: true,
      },
      {
        id: 'bedrijfsnaam',
        name: 'bedrijfsnaam',
        label: 'Bedrijfsnaam',
        type: 'text',
        autocomplete: 'organization',
        required: true,
      },
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
      {
        id: 'email',
        name: 'email',
        label: 'E-mailadres',
        type: 'email',
        autocomplete: 'email',
        required: true,
      },
      {
        id: 'password',
        name: 'password',
        label: 'Wachtwoord',
        type: 'password',
        autocomplete: 'new-password',
        required: true,
      },
      {
        id: 'confirm',
        name: 'confirm',
        label: 'Bevestig wachtwoord',
        type: 'password',
        autocomplete: 'new-password',
        required: true,
      },
    ],
  },
}

// Gebruik login-config ook voor werkgeverslogin
fieldConfig.login.employer = [...fieldConfig.login.seeker]

const apiBaseUrl = (() => {
  if (!form) return ''
  const raw = form.dataset.apiBase?.trim()
  if (!raw || raw === 'self' || raw === 'auto') {
    return window.location.origin
  }
  return raw.endsWith('/') ? raw.slice(0, -1) : raw
})()

function getSubmitLabel(authMode = state.auth) {
  return authMode === 'login' ? 'Inloggen' : 'Account aanmaken'
}

function updateSubmitLabel() {
  if (!submitBtn) return
  submitBtn.textContent = getSubmitLabel()
}

function setSubmitting(isSubmitting) {
  if (!submitBtn) return
  submitBtn.disabled = isSubmitting
  submitBtn.textContent = isSubmitting
    ? state.auth === 'login'
      ? 'Bezig met inloggen...'
      : 'Bezig met registreren...'
    : getSubmitLabel()
}

function setFeedback(text = '', type = '') {
  if (!feedbackMessage) return
  feedbackMessage.textContent = text
  if (type) {
    feedbackMessage.dataset.type = type
  } else {
    delete feedbackMessage.dataset.type
  }
}

function updateRoleButtons() {
  roleButtons.forEach(button => {
    const isActive = button.dataset.role === state.role
    button.setAttribute('aria-selected', String(isActive))
  })

  if (authSubtitle) {
    authSubtitle.textContent = roleMessages[state.role] || roleMessages.seeker
  }
}

function updateAuthTabs() {
  authButtons.forEach(button => {
    const isActive = button.dataset.auth === state.auth
    button.setAttribute('aria-selected', String(isActive))
  })
}

function createInputField(config) {
  const wrapper = document.createElement('div')
  wrapper.className = 'form-field'

  const label = document.createElement('label')
  label.setAttribute('for', config.id)
  label.textContent = config.label

  let field
  if (config.type === 'select') {
    field = document.createElement('select')
    config.options.forEach(optionConfig => {
      const option = document.createElement('option')
      option.value = optionConfig.value
      option.textContent = optionConfig.text
      if (optionConfig.disabled) option.disabled = true
      if (optionConfig.selected) option.selected = true
      field.appendChild(option)
    })
  } else {
    field = document.createElement('input')
    field.type = config.type
    if (config.autocomplete) field.autocomplete = config.autocomplete
  }

  field.id = config.id
  field.name = config.name
  if (config.required) field.required = true

  wrapper.append(label, field)
  return wrapper
}

function renderForm() {
  if (!formContainer) return

  formContainer.innerHTML = ''
  if (confirmErrorMessage) confirmErrorMessage.textContent = ''
  setFeedback()
  setSubmitting(false)

  const fields = fieldConfig[state.auth][state.role]
  const fieldset = document.createElement('fieldset')
  fieldset.className = 'form-fields'

  const legend = document.createElement('legend')
  legend.className = 'visually-hidden'
  legend.textContent = state.auth === 'login' ? 'Log in gegevens' : 'Registratiegegevens'
  fieldset.appendChild(legend)

  fields.forEach(field => {
    fieldset.appendChild(createInputField(field))
  })

  formContainer.appendChild(fieldset)
  updateSubmitLabel()
}

function setRole(role) {
  if (!role || role === state.role) return
  state.role = role
  updateRoleButtons()
  renderForm()
}

function setAuth(authMode) {
  if (!authMode || authMode === state.auth) return
  state.auth = authMode
  updateAuthTabs()
  renderForm()
}

roleButtons.forEach(button => {
  button.addEventListener('click', () => setRole(button.dataset.role))
})

authButtons.forEach(button => {
  button.addEventListener('click', () => setAuth(button.dataset.auth))
})

function validatePasswords() {
  if (!form) return true
  const passwordField = form.querySelector('input[name="password"]')
  const confirmField = form.querySelector('input[name="confirm"]')

  if (!passwordField || !confirmField) {
    if (confirmErrorMessage) confirmErrorMessage.textContent = ''
    return true
  }

  const passwordsMatch = passwordField.value === confirmField.value
  if (!passwordsMatch && confirmField.value.length > 0) {
    confirmField.setCustomValidity('Wachtwoorden komen niet overeen.')
    if (confirmErrorMessage) confirmErrorMessage.textContent = 'Wachtwoorden komen niet overeen.'
  } else {
    confirmField.setCustomValidity('')
    if (confirmErrorMessage) confirmErrorMessage.textContent = ''
  }

  return passwordsMatch
}

if (form) {
  form.addEventListener('input', event => {
    if (event.target.name === 'password' || event.target.name === 'confirm') {
      validatePasswords()
    }
  })

  form.addEventListener('submit', async event => {
    event.preventDefault()
    const passwordsValid = validatePasswords()
    if (!form.checkValidity() || !passwordsValid) {
      form.reportValidity()
      return
    }

    setFeedback()
    setSubmitting(true)

    const formData = new FormData(form)
    const payload = Object.fromEntries(formData.entries())
    payload.role = state.role

    if (state.auth === 'register') {
      delete payload.confirm
    }

    const endpoint = state.auth === 'login' ? '/api/auth/login' : '/api/auth/register'

    try {
      const response = await fetch(`${apiBaseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        setFeedback(data.error || 'Er ging iets mis. Probeer het opnieuw.', 'error')
        return
      }

      const successMessage =
        data.message || (state.auth === 'login' ? 'Inloggen gelukt.' : 'Account succesvol aangemaakt.')

      setFeedback(successMessage, 'success')

      const { password: _pw, confirm: _confirm, ...sanitizedPayload } = payload

      if (state.auth === 'login') {
        try {
          const sessionPayload = {
            user: data.user || sanitizedPayload,
            role: sanitizedPayload.role || state.role,
            loggedInAt: new Date().toISOString(),
          }
          localStorage.setItem(AUTH_USER_KEY, JSON.stringify(sessionPayload))
        } catch (storageError) {
          console.warn('Kan loginstatus niet opslaan.', storageError)
        }

        window.location.href = 'dashboard.html'
        return
      }

      try {
        const sessionPayload = {
          user:
            state.role === 'seeker'
              ? {
                  role: state.role,
                  naam: sanitizedPayload.naam || '',
                  email: sanitizedPayload.email || '',
                }
              : {
                  role: state.role,
                  contactpersoon: sanitizedPayload.contactpersoon || '',
                  bedrijfsnaam: sanitizedPayload.bedrijfsnaam || '',
                  bedrijfsGrootte: sanitizedPayload.bedrijfsGrootte || '',
                  email: sanitizedPayload.email || '',
                },
          role: state.role,
          registeredAt: new Date().toISOString(),
        }
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(sessionPayload))
      } catch (storageError) {
        console.warn('Kan registratiegegevens niet opslaan.', storageError)
      }

      window.location.href = 'vragenlijst.html'
      return
    } catch (networkError) {
      console.error('Netwerkfout tijdens authenticatie', networkError)
      setFeedback('Kan de server niet bereiken. Controleer of de backend actief is.', 'error')
    } finally {
      setSubmitting(false)
    }
  })
}

function init() {
  updateRoleButtons()
  updateAuthTabs()
  renderForm()
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  init()
}
