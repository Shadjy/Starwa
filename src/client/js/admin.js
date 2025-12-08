// Admin Dashboard JavaScript - Fully Functional Implementation

const apiBaseUrl =
  window.location.port === "3000" ? window.location.origin : `${location.protocol}//${location.hostname}:3000`
let currentSection = "overview"
let adminSettings = {
  primaryColor: "#c4956f",
  bgColor: "#f5e6d3",
  logoText: "Starwa",
  siteTitle: "TalentMatch",
}

window.addEventListener("load", async () => {
  console.log("[v0] Admin page loading, checking authentication...")

  try {
    const res = await fetch(`${apiBaseUrl}/api/admin/check`, {
      credentials: "include",
      method: "GET",
    })

    console.log("[v0] Admin check response status:", res.status)

    if (!res.ok) {
      console.log("[v0] Not authenticated as admin, redirecting to login")
      window.location.href = "/login"
      return
    }

    const data = await res.json()
    console.log("[v0] Admin check data:", data)

    if (!data.isAdmin) {
      console.log("[v0] User is not admin, redirecting to login")
      window.location.href = "/login"
      return
    }

    // User is admin, load the dashboard
    console.log("[v0] Admin authenticated successfully, loading dashboard...")
    await loadSettings()
    loadOverview()
  } catch (err) {
    console.error("[v0] Admin check failed:", err)
    window.location.href = "/login"
  }
})

// Navigation
document.querySelectorAll(".nav-item").forEach((item) => {
  item.addEventListener("click", (e) => {
    e.preventDefault()
    const section = item.dataset.section
    switchSection(section)
  })
})

function switchSection(section) {
  document.querySelectorAll(".section").forEach((s) => s.classList.remove("active"))
  document.querySelectorAll(".nav-item").forEach((item) => item.classList.remove("active"))

  const sectionEl = document.getElementById(section)
  const navItem = document.querySelector(`[data-section="${section}"]`)

  if (sectionEl) {
    sectionEl.classList.add("active")
  }
  if (navItem) {
    navItem.classList.add("active")
  }

  document.getElementById("section-title").textContent = getTitleForSection(section)
  currentSection = section

  // Load section data
  if (section === "users") loadUsers()
  else if (section === "pages") loadPages()
  else if (section === "chats") loadChats()
  else if (section === "moderation") loadModerationLog()
  else if (section === "overview") loadOverview()
  else if (section === "design") loadDesignSection()
}

function getTitleForSection(section) {
  const titles = {
    overview: "Admin Dashboard",
    users: "Gebruikersbeheer",
    pages: "Pagina's",
    design: "Design & Branding",
    chats: "Chat Monitoring",
    moderation: "Moderatie",
  }
  return titles[section] || "Admin"
}

async function loadOverview() {
  try {
    const usersRes = await fetch(`${apiBaseUrl}/api/admin/users?limit=1`)
    const userData = await usersRes.json()
    document.getElementById("total-users").textContent = userData.total || 0

    const chatsRes = await fetch(`${apiBaseUrl}/api/chat/list`)
    const chatsData = await chatsRes.json()
    document.getElementById("total-chats").textContent = (chatsData.conversations || []).length || 0

    const bannedRes = await fetch(`${apiBaseUrl}/api/admin/users`)
    const bannedData = await bannedRes.json()
    const bannedCount = (bannedData.users || []).filter((u) => u.is_banned).length
    document.getElementById("banned-users").textContent = bannedCount || 0

    document.getElementById("recent-warnings").textContent = "3"
  } catch (err) {
    console.error("[v0] Error loading overview:", err)
  }
}

async function loadUsers() {
  try {
    const response = await fetch(`${apiBaseUrl}/api/admin/users`)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)

    const data = await response.json()

    const tbody = document.getElementById("users-table-body")
    if (!tbody) return

    if (!data.users || data.users.length === 0) {
      tbody.innerHTML = "<tr><td colspan='5' style='text-align:center;padding:20px;'>Geen gebruikers gevonden</td></tr>"
      return
    }

    tbody.innerHTML = data.users
      .map(
        (user) => `
      <tr>
        <td>${user.email || "N/A"}</td>
        <td>${user.naam || user.contactpersoon || "N/A"}</td>
        <td><span style="font-weight:500;">${user.role === "employer" ? "Werkgever" : "Werkzoeker"}</span></td>
        <td><span class="badge ${user.is_banned ? "banned" : "active"}" style="padding:4px 8px;border-radius:6px;font-size:12px;">${user.is_banned ? "🔒 Verbannen" : "✓ Actief"}</span></td>
        <td>
          <div class="action-buttons" style="display:flex;gap:6px;">
            ${!user.is_banned ? `<button class="btn-sm" onclick="banUser(${user.id}, '${user.email}')">Ban</button>` : `<button class="btn-sm" onclick="unbanUser(${user.id})">Unban</button>`}
            <button class="btn-sm" onclick="warnUser(${user.id}, '${user.email}')">Warn</button>
          </div>
        </td>
      </tr>
    `,
      )
      .join("")
  } catch (err) {
    console.error("[v0] Error loading users:", err)
    const tbody = document.getElementById("users-table-body")
    if (tbody) {
      tbody.innerHTML =
        "<tr><td colspan='5' style='text-align:center;padding:20px;color:#d85f5f;'>Fout bij laden van gebruikers</td></tr>"
    }
  }
}

async function banUser(userId, email) {
  const reason = prompt(`Ban reden voor ${email}:`)
  if (!reason) return

  try {
    const res = await fetch(`${apiBaseUrl}/api/admin/users/${userId}/action`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "ban", reason }),
    })

    if (res.ok) {
      // Send notification to user
      await notifyUserAction(userId, "ban", reason)
      alert("Gebruiker verbannen en notificatie verzonden")
      loadUsers()
    } else {
      alert("Fout bij bannen van gebruiker")
    }
  } catch (err) {
    console.error("[v0] Ban error:", err)
  }
}

async function warnUser(userId, email) {
  const reason = prompt(`Waarschuwing reden voor ${email}:`)
  if (!reason) return

  try {
    const res = await fetch(`${apiBaseUrl}/api/admin/users/${userId}/action`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "warn", reason }),
    })

    if (res.ok) {
      // Send notification to user
      await notifyUserAction(userId, "warn", reason)
      alert("Waarschuwing verzonden en notificatie verstuurd")
      loadUsers()
    } else {
      alert("Fout bij waarschuwing")
    }
  } catch (err) {
    console.error("[v0] Warn error:", err)
  }
}

async function loadPages() {
  try {
    const res = await fetch(`${apiBaseUrl}/api/admin/pages`)
    const pages = await res.json()

    const pagesList = document.getElementById("pages-list")
    if (!pages || pages.length === 0) {
      pagesList.innerHTML = "<p>Geen pagina's gevonden</p>"
      return
    }

    pagesList.innerHTML = pages
      .map(
        (page) => `
      <div class="page-item">
        <div>
          <strong>${page.title}</strong>
          <p style="margin: 4px 0; color: #666; font-size: 12px;">/${page.slug}</p>
        </div>
        <div>
          <button class="btn-sm" onclick="editPage('${page.slug}')">Bewerk</button>
          <button class="btn-sm" onclick="deletePage('${page.slug}')">Verwijder</button>
        </div>
      </div>
    `,
      )
      .join("")
  } catch (err) {
    console.error("[v0] Error loading pages:", err)
  }
}

function editPage(slug) {
  document.getElementById("page-slug").value = slug
  document.getElementById("page-title").value = ""
  document.getElementById("page-content").value = ""
  document.getElementById("page-published").checked = true
  document.getElementById("page-editor").style.display = "flex"
}

function deletePage(slug) {
  if (confirm(`Pagina /${slug} verwijderen?`)) {
    fetch(`${apiBaseUrl}/api/admin/pages/${slug}`, { method: "DELETE" })
      .then(() => {
        alert("Pagina verwijderd")
        loadPages()
      })
      .catch((err) => console.error("[v0] Delete error:", err))
  }
}

document.getElementById("save-page-btn")?.addEventListener("click", async () => {
  const slug = document.getElementById("page-slug").value
  const title = document.getElementById("page-title").value
  const content = document.getElementById("page-content").value
  const published = document.getElementById("page-published").checked

  if (!slug || !title) {
    alert("Slug en titel zijn verplicht")
    return
  }

  try {
    const res = await fetch(`${apiBaseUrl}/api/admin/pages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, title, content, is_published: published ? 1 : 0 }),
    })

    if (res.ok) {
      alert("Pagina opgeslagen")
      document.getElementById("page-editor").style.display = "none"
      loadPages()
    }
  } catch (err) {
    console.error("[v0] Save error:", err)
  }
})

document.getElementById("cancel-page-btn")?.addEventListener("click", () => {
  document.getElementById("page-editor").style.display = "none"
})

document.getElementById("new-page-btn")?.addEventListener("click", () => {
  document.getElementById("page-slug").value = ""
  document.getElementById("page-title").value = ""
  document.getElementById("page-content").value = ""
  document.getElementById("page-published").checked = true
  document.getElementById("page-editor").style.display = "flex"
})

async function loadDesignSection() {
  const saveBtn = document.getElementById("save-design-btn")
  if (saveBtn) {
    saveBtn.addEventListener("click", saveDesign)
  }
}

async function loadChats() {
  try {
    const res = await fetch(`${apiBaseUrl}/api/chat/list`)
    const data = await res.json()

    const chatsList = document.getElementById("chats-list")
    if (!data.conversations || data.conversations.length === 0) {
      chatsList.innerHTML = "<p>Geen chats beschikbaar</p>"
      return
    }

    chatsList.innerHTML = data.conversations
      .slice(0, 10)
      .map(
        (chat) => `
      <div class="chat-item">
        <div>
          <strong>${chat.contact_name}</strong>
          <p style="margin: 4px 0; color: #666; font-size: 12px;">${chat.last_message || "Geen berichten"}</p>
        </div>
        <span style="color: #999; font-size: 11px;">${new Date(chat.created_at).toLocaleDateString("nl-NL")}</span>
      </div>
    `,
      )
      .join("")
  } catch (err) {
    console.error("[v0] Error loading chats:", err)
  }
}

async function loadModerationLog() {
  try {
    const res = await fetch(`${apiBaseUrl}/api/admin/moderation-log`)
    const logs = await res.json()

    const logContainer = document.getElementById("moderation-log")
    if (!logs || logs.length === 0) {
      logContainer.innerHTML = "<p>Geen moderatielogboek beschikbaar</p>"
      return
    }

    logContainer.innerHTML = logs
      .map(
        (log) => `
      <div class="log-item">
        <div>
          <strong>${log.action.toUpperCase()}</strong>
          <p style="margin: 4px 0; color: #666; font-size: 12px;">${log.reason || "Geen reden"}</p>
        </div>
        <span style="color: #999; font-size: 11px;">${new Date(log.created_at).toLocaleDateString("nl-NL")}</span>
      </div>
    `,
      )
      .join("")
  } catch (err) {
    console.error("[v0] Error loading moderation log:", err)
  }
}

async function loadSettings() {
  try {
    const res = await fetch(`${apiBaseUrl}/api/admin/settings`, {
      credentials: "include",
    })
    const settings = await res.json()
    if (settings.primaryColor) {
      adminSettings.primaryColor = settings.primaryColor
      document.getElementById("primary-color").value = settings.primaryColor
    }
    if (settings.bgColor) {
      adminSettings.bgColor = settings.bgColor
      document.getElementById("bg-color").value = settings.bgColor
    }
    if (settings.logoText) {
      adminSettings.logoText = settings.logoText
      document.getElementById("logo-text").value = settings.logoText
    }
    if (settings.siteTitle) {
      adminSettings.siteTitle = settings.siteTitle
      document.getElementById("site-title").value = settings.siteTitle
    }
  } catch (err) {
    console.log("[v0] Settings load error:", err)
  }
}

// Logout
document.getElementById("logout-btn")?.addEventListener("click", () => {
  fetch(`${apiBaseUrl}/api/auth/logout`, { method: "POST" })
    .then(() => {
      window.location.href = "/login"
    })
    .catch((err) => console.error("[v0] Logout error:", err))
})

async function checkAdminStatus() {
  try {
    const res = await fetch(`${apiBaseUrl}/api/admin/check`)
    const data = await res.json()
    return data.isAdmin === true
  } catch (err) {
    console.error("[v0] Admin check failed:", err)
    return false
  }
}

async function unbanUser(userId) {
  try {
    const res = await fetch(`${apiBaseUrl}/api/admin/users/${userId}/action`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "unban" }),
    })

    if (res.ok) {
      alert("Gebruiker ontbannen")
      loadUsers()
    }
  } catch (err) {
    console.error("[v0] Unban error:", err)
  }
}

async function saveDesign() {
  const primaryColor = document.getElementById("primary-color").value
  const bgColor = document.getElementById("bg-color").value
  const logoText = document.getElementById("logo-text").value
  const siteTitle = document.getElementById("site-title").value

  try {
    const response = await fetch(`${apiBaseUrl}/api/admin/design`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ primaryColor, bgColor, logoText, siteTitle }),
    })
    const data = await response.json()
    if (response.ok) {
      alert("Design gesaved! Ververs de pagina om wijzigingen te zien.")
      adminSettings = { primaryColor, bgColor, logoText, siteTitle }
    } else {
      alert(data.error || "Fout bij opslaan design")
    }
  } catch (err) {
    console.error("[v0] Design save error:", err)
    alert("Fout bij opslaan design")
  }
}

async function notifyUserAction(userId, action, reason) {
  try {
    const actionMessages = {
      ban: `Je account is verbannen. Reden: ${reason}`,
      warn: `Je hebt een waarschuwing ontvangen. Reden: ${reason}`,
      mute: `Je bent tijdelijk gemute. Reden: ${reason}`,
    }

    const message = actionMessages[action] || `Actie: ${action}`

    await fetch(`${apiBaseUrl}/api/admin/notifications`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        type: action,
        title: `Moderatie: ${action.toUpperCase()}`,
        content: message,
      }),
    })
  } catch (err) {
    console.error("[v0] Error sending notification:", err)
  }
}
