const roleSelectionScreen = document.getElementById("role-selection-screen")
const formScreen = document.getElementById("form-screen")
const roleButtons = document.querySelectorAll(".role-button-large")
const continueBtn = document.getElementById("continue-btn")
const backBtn = document.getElementById("back-btn")
const form = document.getElementById("register-form")
const errorMessage = document.getElementById("error-message")
const roleInput = document.getElementById("role")
const roleSubtitle = document.getElementById("role-subtitle")

const seekerFields = document.getElementById("seeker-fields")
const employerFields = document.getElementById("employer-fields")

const apiBaseUrl =
  window.location.port === "3000" ? window.location.origin : `${location.protocol}//${location.hostname}:3000`

let selectedRole = "employer"

roleButtons.forEach((button) => {
  button.addEventListener("click", (e) => {
    e.preventDefault()
    roleButtons.forEach((b) => b.classList.remove("active"))
    button.classList.add("active")
    selectedRole = button.dataset.role
    roleInput.value = selectedRole
    console.log("[v0] Selected role:", selectedRole)
  })
})

continueBtn.addEventListener("click", () => {
  roleSelectionScreen.style.display = "none"
  formScreen.style.display = "block"

  if (selectedRole === "employer") {
    roleSubtitle.textContent = "Vul je bedrijfsgegevens in"
    seekerFields.style.display = "none"
    employerFields.style.display = "block"
    // Make employer fields required
    document.getElementById("bedrijfsnaam").required = true
    document.getElementById("kvk").required = true
    document.getElementById("bedrijfsGrootte").required = true
    document.getElementById("contactpersoon").required = true
    // Remove seeker required
    const naamField = document.getElementById("naam")
    if (naamField) naamField.required = false
  } else {
    roleSubtitle.textContent = "Vul je persoonlijke gegevens in"
    seekerFields.style.display = "block"
    employerFields.style.display = "none"
    document.getElementById("naam").required = true
    // Remove employer required
    document.getElementById("bedrijfsnaam").required = false
    document.getElementById("kvk").required = false
    document.getElementById("bedrijfsGrootte").required = false
    document.getElementById("contactpersoon").required = false
  }
})

backBtn.addEventListener("click", (e) => {
  e.preventDefault()
  formScreen.style.display = "none"
  roleSelectionScreen.style.display = "block"
})

form.addEventListener("submit", async (e) => {
  e.preventDefault()

  const email = document.getElementById("email").value.trim()
  const password = document.getElementById("password").value
  const confirmPassword = document.getElementById("confirm-password").value
  const role = roleInput.value

  // Validation
  if (!email || !password || !confirmPassword) {
    showError("Vul alle velden in.")
    return
  }

  if (password.length < 6) {
    showError("Wachtwoord moet minstens 6 karakters zijn.")
    return
  }

  if (password !== confirmPassword) {
    showError("Wachtwoorden komen niet overeen.")
    return
  }

  let formData = { email, password, role }

  if (role === "employer") {
    const bedrijfsnaam = document.getElementById("bedrijfsnaam").value.trim()
    const kvk = document.getElementById("kvk").value.trim()
    const bedrijfsGrootte = document.getElementById("bedrijfsGrootte").value
    const contactpersoon = document.getElementById("contactpersoon").value.trim()

    if (!bedrijfsnaam || !kvk || !bedrijfsGrootte || !contactpersoon) {
      showError("Vul alle bedrijfsgegevens in.")
      return
    }

    if (!/^\d{8}$/.test(kvk)) {
      showError("KVK-nummer moet 8 cijfers bevatten.")
      return
    }

    formData = { ...formData, bedrijfsnaam, kvk, bedrijfsGrootte, contactpersoon }
  } else {
    const naam = document.getElementById("naam").value.trim()
    if (!naam) {
      showError("Vul je naam in.")
      return
    }
    formData = { ...formData, naam }
  }

  const submitBtn = form.querySelector('button[type="submit"]')
  submitBtn.disabled = true
  submitBtn.textContent = "Bezig met registreren..."

  try {
    const response = await fetch(`${apiBaseUrl}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
      credentials: "include",
    })

    const data = await response.json()

    if (!response.ok) {
      showError(data.error || "Registratie is mislukt.")
      submitBtn.disabled = false
      submitBtn.textContent = "Registreren"
      return
    }

    // Redirect based on role
    setTimeout(() => {
      window.location.href = role === "employer" ? "/dashboard-werkgever" : "/vragenlijst"
    }, 500)
  } catch (err) {
    console.error("[v0] Registration error:", err)
    showError("Er is een fout opgetreden. Probeer opnieuw.")
    submitBtn.disabled = false
    submitBtn.textContent = "Registreren"
  }
})

function showError(message) {
  errorMessage.textContent = message
  errorMessage.classList.add("show")
  setTimeout(() => {
    errorMessage.classList.remove("show")
  }, 5000)
}
