// Notification system for real-time alerts

const apiBaseUrl =
  window.location.port === "3000" ? window.location.origin : `${location.protocol}//${location.hostname}:3000`

class NotificationManager {
  constructor() {
    this.notifications = []
    this.soundEnabled = true
    this.init()
  }

  async init() {
    await this.loadNotifications()
    this.startPolling()
    this.createNotificationUI()
  }

  async loadNotifications() {
    try {
      const response = await fetch(`${apiBaseUrl}/api/notifications?unread_only=true`)
      const data = await response.json()
      this.notifications = data.notifications || []
      this.updateBadge()
    } catch (err) {
      console.error("Error loading notifications:", err)
    }
  }

  startPolling() {
    setInterval(() => this.loadNotifications(), 30000) // Poll every 30 seconds
  }

  createNotificationUI() {
    if (document.getElementById("notification-bell")) return

    const header = document.querySelector("header.main-header") || document.querySelector("header")
    if (!header) return

    const notifDiv = document.createElement("div")
    notifDiv.id = "notification-panel"
    notifDiv.className = "notification-panel"
    notifDiv.innerHTML = `
      <button id="notification-bell" class="notification-bell">
        <span class="bell-icon">🔔</span>
        <span id="notification-badge" class="notification-badge" style="display: none;">0</span>
      </button>
      <div id="notification-dropdown" class="notification-dropdown" style="display: none;">
        <div class="notification-header">
          <h3>Notificaties</h3>
          <button id="clear-all-btn" class="btn-clear">Alles als gelezen</button>
        </div>
        <div id="notification-list" class="notification-list"></div>
      </div>
    `

    header.appendChild(notifDiv)

    // Event listeners
    document.getElementById("notification-bell").addEventListener("click", this.toggleDropdown.bind(this))
    document.getElementById("clear-all-btn").addEventListener("click", this.clearAll.bind(this))
  }

  updateBadge() {
    const badge = document.getElementById("notification-badge")
    const unreadCount = this.notifications.filter((n) => !n.is_read).length

    if (badge) {
      if (unreadCount > 0) {
        badge.textContent = unreadCount > 9 ? "9+" : unreadCount
        badge.style.display = "flex"
      } else {
        badge.style.display = "none"
      }
    }

    this.renderNotifications()
  }

  renderNotifications() {
    const list = document.getElementById("notification-list")
    if (!list) return

    if (this.notifications.length === 0) {
      list.innerHTML = '<p class="empty-state">Geen notificaties</p>'
      return
    }

    list.innerHTML = this.notifications
      .slice(0, 10)
      .map(
        (notif) => `
      <div class="notification-item ${notif.is_read ? "read" : "unread"}">
        <div class="notif-content">
          <p class="notif-title">${notif.title}</p>
          <p class="notif-text">${notif.content}</p>
          <small>${this.formatTime(notif.created_at)}</small>
        </div>
        <button class="btn-close" onclick="notificationManager.deleteNotification(${notif.id})">×</button>
      </div>
    `,
      )
      .join("")
  }

  toggleDropdown() {
    const dropdown = document.getElementById("notification-dropdown")
    if (dropdown) {
      dropdown.style.display = dropdown.style.display === "none" ? "block" : "none"
    }
  }

  async deleteNotification(id) {
    try {
      await fetch(`${apiBaseUrl}/api/notifications/${id}`, { method: "DELETE" })
      this.notifications = this.notifications.filter((n) => n.id !== id)
      this.updateBadge()
    } catch (err) {
      console.error("Error deleting notification:", err)
    }
  }

  async clearAll() {
    try {
      await fetch(`${apiBaseUrl}/api/notifications/read-all`, { method: "POST" })
      this.notifications.forEach((n) => (n.is_read = true))
      this.updateBadge()
    } catch (err) {
      console.error("Error clearing notifications:", err)
    }
  }

  formatTime(timestamp) {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return "Net nu"
    if (diffMins < 60) return `${diffMins}m geleden`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}u geleden`
    return date.toLocaleDateString("nl-NL")
  }

  sendNotification(title, content, type = "system") {
    // This would be called from admin panel or other parts of the app
    console.log(`[Notificatie] ${title}: ${content}`)
  }
}

// Initialize notification manager when DOM is ready
const notificationManager = new NotificationManager()

// Make available globally for onclick handlers
window.notificationManager = notificationManager
