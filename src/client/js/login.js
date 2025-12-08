const form = document.getElementById("login-form")
const errorMessage = document.getElementById("error-message")

const apiBaseUrl =
  window.location.port === "3000" ? window.location.origin : `${location.protocol}//${location.hostname}:3000`

form.addEventListener("submit", async (e) => {
  e.preventDefault()

  const email = form.email.value.trim()
  const password = form.password.value

  if (!email || !password) {
    showError("Vul alle velden in.")
    return
  }

  const submitBtn = form.querySelector('button[type="submit"]')
  submitBtn.disabled = true
  submitBtn.textContent = "Bezig met inloggen..."

  try {
    const response = await fetch(`${apiBaseUrl}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()

    if (!response.ok) {
      showError(data.error || "Inloggen is mislukt.")
      submitBtn.disabled = false
      submitBtn.textContent = "Inloggen"
      return
    }

    let redirectUrl = "/dashboard"
    if (data.user.is_admin) {
      redirectUrl = "/admin"
    } else if (data.user.role === "employer") {
      redirectUrl = "/dashboard-werkgever"
    }

    // Redirect after successful login
    setTimeout(() => {
      window.location.href = redirectUrl
    }, 300)
  } catch (err) {
    console.log("[v0] Login error:", err)
    showError("Er is een fout opgetreden. Probeer opnieuw.")
    submitBtn.disabled = false
    submitBtn.textContent = "Inloggen"
  }
})

function showError(message) {
  errorMessage.textContent = message
  errorMessage.classList.add("show")
  setTimeout(() => {
    errorMessage.classList.remove("show")
  }, 5000)
}
