// Alert notification system for user actions (ban, warn, mute)

class AlertNotification {
  constructor() {
    this.container = null
    this.init()
  }

  init() {
    // Create container if it doesn't exist
    if (!document.getElementById("alert-container")) {
      this.container = document.createElement("div")
      this.container.id = "alert-container"
      this.container.className = "alert-container"
      document.body.appendChild(this.container)
    } else {
      this.container = document.getElementById("alert-container")
    }
  }

  show(message, type = "info", duration = 5000) {
    const alert = document.createElement("div")
    alert.className = `alert alert-${type}`

    const icon = this.getIcon(type)

    alert.innerHTML = `
      <div class="alert-icon">${icon}</div>
      <div class="alert-content">
        <div class="alert-title">${this.getTitle(type)}</div>
        <div class="alert-message">${message}</div>
      </div>
      <button class="alert-close" aria-label="Sluiten">
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
          <path d="m5 5 10 10m0-10L5 15" stroke-linecap="round"/>
        </svg>
      </button>
    `

    this.container.appendChild(alert)

    // Trigger animation
    setTimeout(() => {
      alert.classList.add("alert-show")
    }, 10)

    // Close button
    const closeBtn = alert.querySelector(".alert-close")
    closeBtn.addEventListener("click", () => {
      this.hide(alert)
    })

    // Auto hide
    if (duration > 0) {
      setTimeout(() => {
        this.hide(alert)
      }, duration)
    }

    return alert
  }

  hide(alert) {
    alert.classList.remove("alert-show")
    alert.classList.add("alert-hide")

    setTimeout(() => {
      if (alert.parentElement) {
        alert.parentElement.removeChild(alert)
      }
    }, 300)
  }

  getIcon(type) {
    const icons = {
      success: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M20 6 9 17l-5-5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`,
      error: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <path d="M15 9l-6 6m0-6l6 6" stroke-linecap="round"/>
      </svg>`,
      warning: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 2 2 22h20L12 2Z" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M12 9v4m0 4h.01"/>
      </svg>`,
      info: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 16v-4m0-4h.01"/>
      </svg>`,
      ban: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <path d="m4.93 4.93 14.14 14.14" stroke-linecap="round"/>
      </svg>`,
      mute: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M11 5 6 9H2v6h4l5 4V5ZM22 9l-6 6m0-6 6 6" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`,
    }
    return icons[type] || icons.info
  }

  getTitle(type) {
    const titles = {
      success: "Succes",
      error: "Fout",
      warning: "Waarschuwing",
      info: "Informatie",
      ban: "Account Verbannen",
      mute: "Account Gemute",
    }
    return titles[type] || "Melding"
  }

  // Specific methods for moderation actions
  showBan(reason) {
    return this.show(`Je account is verbannen. Reden: ${reason}`, "ban", 0)
  }

  showWarn(reason) {
    return this.show(`Je hebt een waarschuwing ontvangen. Reden: ${reason}`, "warning", 8000)
  }

  showMute(reason) {
    return this.show(`Je bent tijdelijk gemute. Reden: ${reason}`, "mute", 8000)
  }

  showSuccess(message) {
    return this.show(message, "success", 5000)
  }

  showError(message) {
    return this.show(message, "error", 6000)
  }
}

// Initialize global alert system
if (typeof window !== "undefined") {
  window.alertNotification = new AlertNotification()
}

export default AlertNotification
