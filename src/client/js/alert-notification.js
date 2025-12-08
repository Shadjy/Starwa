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

      // Add styles
      this.injectStyles()
    } else {
      this.container = document.getElementById("alert-container")
    }
  }

  injectStyles() {
    if (document.getElementById("alert-notification-styles")) return

    const style = document.createElement("style")
    style.id = "alert-notification-styles"
    style.textContent = `
      .alert-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 12px;
        max-width: 420px;
        width: 100%;
        pointer-events: none;
      }

      .alert {
        background: white;
        border-radius: 14px;
        padding: 1.2rem 1.5rem;
        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
        border: 1px solid #e0d7ce;
        display: flex;
        align-items: flex-start;
        gap: 1rem;
        pointer-events: auto;
        opacity: 0;
        transform: translateX(100px);
        transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      }

      .alert-show {
        opacity: 1;
        transform: translateX(0);
      }

      .alert-hide {
        opacity: 0;
        transform: translateX(100px);
        transition: all 0.3s ease;
      }

      .alert-icon {
        width: 2.5rem;
        height: 2.5rem;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .alert-icon svg {
        width: 1.4rem;
        height: 1.4rem;
      }

      .alert-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
      }

      .alert-title {
        font-weight: 700;
        font-size: 1rem;
        color: #1a1a1a;
      }

      .alert-message {
        font-size: 0.9rem;
        color: #666666;
        line-height: 1.5;
      }

      .alert-close {
        width: 1.8rem;
        height: 1.8rem;
        border-radius: 50%;
        border: none;
        background: rgba(0, 0, 0, 0.05);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        flex-shrink: 0;
        transition: all 0.2s ease;
      }

      .alert-close:hover {
        background: rgba(0, 0, 0, 0.1);
      }

      .alert-close svg {
        width: 1rem;
        height: 1rem;
        stroke: #666666;
      }

      .alert-success {
        border-left: 4px solid #3da17b;
      }

      .alert-success .alert-icon {
        background: rgba(61, 161, 123, 0.1);
        color: #3da17b;
      }

      .alert-success .alert-icon svg {
        stroke: #3da17b;
      }

      .alert-error {
        border-left: 4px solid #d85f5f;
      }

      .alert-error .alert-icon {
        background: rgba(216, 95, 95, 0.1);
        color: #d85f5f;
      }

      .alert-error .alert-icon svg {
        stroke: #d85f5f;
      }

      .alert-warning {
        border-left: 4px solid #d08a32;
      }

      .alert-warning .alert-icon {
        background: rgba(208, 138, 50, 0.1);
        color: #d08a32;
      }

      .alert-warning .alert-icon svg {
        stroke: #d08a32;
      }

      .alert-info {
        border-left: 4px solid #427ad7;
      }

      .alert-info .alert-icon {
        background: rgba(66, 122, 215, 0.1);
        color: #427ad7;
      }

      .alert-info .alert-icon svg {
        stroke: #427ad7;
      }

      .alert-ban {
        border-left: 4px solid #d85f5f;
        background: linear-gradient(135deg, rgba(216, 95, 95, 0.05), rgba(255, 255, 255, 0.95));
      }

      .alert-ban .alert-icon {
        background: rgba(216, 95, 95, 0.15);
        color: #d85f5f;
      }

      .alert-ban .alert-icon svg {
        stroke: #d85f5f;
      }

      .alert-mute {
        border-left: 4px solid #9160d6;
      }

      .alert-mute .alert-icon {
        background: rgba(145, 96, 214, 0.1);
        color: #9160d6;
      }

      .alert-mute .alert-icon svg {
        stroke: #9160d6;
      }

      @media (max-width: 640px) {
        .alert-container {
          top: 10px;
          right: 10px;
          left: 10px;
          max-width: none;
        }

        .alert {
          padding: 1rem 1.2rem;
        }

        .alert-icon {
          width: 2.2rem;
          height: 2.2rem;
        }

        .alert-icon svg {
          width: 1.2rem;
          height: 1.2rem;
        }
      }
    `
    document.head.appendChild(style)
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
