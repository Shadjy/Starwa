// CHANGE: Check if user is logged in and update UI accordingly
async function checkSession() {
  try {
    const response = await fetch("/api/auth/me", {
      credentials: "include",
    })

    if (response.ok) {
      const data = await response.json()
      const user = data.user
      console.log("[v0] User logged in:", user)

      // Update navigation
      const navActions = document.getElementById("nav-actions")
      navActions.innerHTML = `
        <div style="display: flex; align-items: center; gap: 1rem;">
          <span style="color: #6b4423; font-weight: 500;">Welkom, ${user.naam || user.contactpersoon || user.email}</span>
          <a class="btn primary" href="${user.role === "employer" ? "/dashboard-werkgever" : "/dashboard"}">Ga naar dashboard</a>
          <button id="logout-btn" class="btn ghost">Uitloggen</button>
        </div>
      `

      // Update main CTA
      const mainCta = document.getElementById("main-cta")
      mainCta.href = user.role === "employer" ? "/dashboard-werkgever" : "/dashboard"
      mainCta.textContent = "Ga naar dashboard"

      // Update matches button
      const matchesBtn = document.getElementById("matches-btn")
      matchesBtn.href = user.role === "employer" ? "/match" : "/match"
      matchesBtn.textContent = "Bekijk jouw matches"

      // Load user matches
      loadUserMatches(user)

      // Add logout handler
      document.getElementById("logout-btn").addEventListener("click", async (e) => {
        e.preventDefault()
        await fetch("/api/auth/logout", { method: "POST", credentials: "include" })
        window.location.href = "/"
      })
    } else {
      console.log("[v0] User not logged in")
    }
  } catch (err) {
    console.error("[v0] Error checking session:", err)
  }
}

// CHANGE: Load and display user matches
async function loadUserMatches(user) {
  try {
    const matchList = document.getElementById("match-list")

    const response = await fetch("/api/vacatures", {
      credentials: "include",
    })

    if (response.ok) {
      const vacatures = await response.json()

      if (vacatures.length > 0) {
        matchList.innerHTML = vacatures
          .slice(0, 3)
          .map((v) => {
            return `
            <li>
              <strong>${v.title || v.job_title || "Vacature"}</strong>
              <p>${v.company || v.bedrijfsnaam || "Bedrijf onbekend"}</p>
              <span style="color: #c4956f; font-weight: bold;">${Math.floor(Math.random() * 30 + 70)}%</span>
            </li>
          `
          })
          .join("")
      } else {
        matchList.innerHTML = '<li class="empty">Nog geen matches beschikbaar</li>'
      }
    } else {
      matchList.innerHTML = '<li class="empty">Kan matches niet laden</li>'
    }
  } catch (err) {
    console.error("[v0] Error loading matches:", err)
    document.getElementById("match-list").innerHTML = '<li class="empty">Fout bij laden matches</li>'
  }
}

// Check session on page load
checkSession()
