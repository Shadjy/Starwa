document.addEventListener("DOMContentLoaded", () => {
  const API_BASE = (typeof window !== 'undefined' && window.STARWA_API_BASE)
    ? window.STARWA_API_BASE
    : (location.port === '3000' ? '' : `${location.protocol}//${location.hostname}:3000`)

  const editButton = document.getElementById("editButton")
  const saveButton = document.getElementById("saveButton")
  const profilePage = document.querySelector(".profile-page")
  const headerProfileBtn = document.getElementById("headerProfileBtn")

  const inputs = {
    fullName: document.getElementById("fullName"),
    email: document.getElementById("email"),
    phone: document.getElementById("phone"),
    address: document.getElementById("address"),
    city: document.getElementById("city"),
    degree: document.getElementById("degree"),
    workExperience: document.getElementById("workExperience"),
    workWishes: document.getElementById("workWishes"),
    workLocation: document.getElementById("workLocation"),
    workHours: document.getElementById("workHours"),
  }

  let isEditing = false

  const initialsFromName = (name = '') => {
    const parts = name.split(/\s+/).filter(Boolean)
    if (!parts.length) return 'NA'
    return parts.map(p => p[0]).join('').slice(0, 2).toUpperCase()
  }

  const setInputsDisabled = (disabled) => {
    Object.values(inputs).forEach(input => {
      if (!input) return
      input.disabled = disabled
    })
  }

  const updateHeaderChip = (user, profile) => {
    if (!headerProfileBtn) return
    const nameEl = headerProfileBtn.querySelector('.profile-chip__name')
    const initialsEl = headerProfileBtn.querySelector('.profile-chip__initials')
    const imgEl = headerProfileBtn.querySelector('img')
    const avatarEl = headerProfileBtn.querySelector('.profile-chip__avatar')
    const displayName = user?.naam || user?.contactpersoon || user?.displayName || user?.email || 'Profiel'
    if (nameEl) nameEl.textContent = displayName
    if (initialsEl) initialsEl.textContent = initialsFromName(displayName)
    const avatarUrl = profile?.avatar_url || ''
    if (imgEl) imgEl.src = avatarUrl
    if (avatarEl) avatarEl.dataset.hasPhoto = avatarUrl ? 'true' : 'false'
  }

  const fillForm = (user = {}, profile = {}) => {
    if (inputs.fullName) inputs.fullName.value = user.naam || user.contactpersoon || ''
    if (inputs.email) inputs.email.value = user.email || ''
    if (inputs.phone) inputs.phone.value = profile.phone || ''
    if (inputs.address) inputs.address.value = profile.address || ''
    if (inputs.city) inputs.city.value = profile.city || ''
    if (inputs.degree) inputs.degree.value = profile.degree || ''
    if (inputs.workExperience) inputs.workExperience.value = profile.work_experience || ''
    if (inputs.workWishes) inputs.workWishes.value = profile.work_wishes || ''
    if (inputs.workLocation) inputs.workLocation.value = profile.work_location || ''
    if (inputs.workHours) inputs.workHours.value = profile.work_hours || ''
  }

  const loadProfile = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/profile/me`, { credentials: 'include' })
      if (res.status === 401) {
        window.location.href = '/inlog-aanmeld'
        return
      }
      if (!res.ok) throw new Error('not_ok')
      const data = await res.json()
      fillForm(data.user, data.profile || {})
      updateHeaderChip(data.user, data.profile || {})
    } catch (err) {
      console.error('Profiel laden mislukt:', err)
    }
  }

  const saveProfile = async () => {
    const payload = {
      naam: inputs.fullName?.value?.trim() || undefined,
      email: inputs.email?.value?.trim() || undefined,
      phone: inputs.phone?.value?.trim() || '',
      address: inputs.address?.value?.trim() || '',
      city: inputs.city?.value?.trim() || '',
      degree: inputs.degree?.value?.trim() || '',
      workExperience: inputs.workExperience?.value?.trim() || '',
      workWishes: inputs.workWishes?.value?.trim() || '',
      workLocation: inputs.workLocation?.value?.trim() || '',
      workHours: inputs.workHours?.value?.trim() || '',
    }

    try {
      const res = await fetch(`${API_BASE}/api/profile/me`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        const msg = data?.error || 'Opslaan mislukt'
        alert(msg)
        return
      }
      fillForm(data.user, data.profile || {})
      updateHeaderChip(data.user, data.profile || {})
      isEditing = false
      setInputsDisabled(true)
      saveButton.disabled = true
      editButton.textContent = "Bewerken"
    profilePage?.classList.remove("editing")
      alert("Profiel opgeslagen")
    } catch (err) {
      alert("Opslaan mislukt. Probeer opnieuw.")
    }
  }

  editButton.addEventListener("click", () => {
    isEditing = !isEditing
    setInputsDisabled(!isEditing)
    saveButton.disabled = !isEditing
    editButton.textContent = isEditing ? "Annuleren" : "Bewerken"
    profilePage?.classList.toggle("editing", isEditing)
  })

  saveButton.addEventListener("click", () => {
    if (!isEditing) return
    saveProfile()
  })

  // Header klik: ga naar bewerk-sectie
  headerProfileBtn?.addEventListener("click", () => {
    editButton?.scrollIntoView({ behavior: "smooth", block: "center" })
    if (!isEditing) editButton?.click()
  })

  setInputsDisabled(true)
  loadProfile()
})
