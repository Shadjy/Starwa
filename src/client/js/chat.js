// CHANGE: Fixed search functionality and improved chat logic
const io = window.io // Declare the io variable
const socket = io()
const apiBaseUrl =
  window.location.port === "3000" ? window.location.origin : `${location.protocol}//${location.hostname}:3000`

let currentUserId = null
let currentChatId = null
let currentChatUser = null
let isTyping = false

// DOM elements
const searchInput = document.getElementById("search-input")
const searchBtn = document.getElementById("search-btn")
const searchResults = document.getElementById("search-results")
const chatsList = document.getElementById("chats-list")
const noChatSelected = document.getElementById("no-chat-selected")
const chatView = document.getElementById("chat-view")
const messagesContainer = document.getElementById("messages-container")
const messageInput = document.getElementById("message-input")
const sendBtn = document.getElementById("send-btn")
const chatUserName = document.getElementById("chat-user-name")
const closeChatBtn = document.getElementById("close-chat-btn")
const typingIndicator = document.getElementById("typing-indicator")
const backToDashboardBtn = document.getElementById("back-to-dashboard") // Added back to dashboard button

// Initialize
async function init() {
  try {
    const response = await fetch(`${apiBaseUrl}/api/auth/me`)
    const data = await response.json()
    if (!response.ok) {
      window.location.href = "/login"
      return
    }
    currentUserId = data.user.id
    socket.emit("user_join", { userId: currentUserId, userName: data.user.email })
    loadChats()
  } catch (err) {
    console.error("[v0] Failed to initialize:", err)
    window.location.href = "/login"
  }
}

// Load existing chats
async function loadChats() {
  try {
    const response = await fetch(`${apiBaseUrl}/api/chat/list`)
    const data = await response.json()
    displayChats(data.chats || [])
  } catch (err) {
    console.error("[v0] Failed to load chats:", err)
  }
}

function displayChats(chats) {
  chatsList.innerHTML = ""
  if (chats.length === 0) {
    chatsList.innerHTML =
      '<p style="padding: 20px; text-align: center; color: #999; font-size: 14px;">Geen gesprekken</p>'
    return
  }
  chats.forEach((chat) => {
    const chatItem = document.createElement("div")
    chatItem.className = "chat-item"
    chatItem.innerHTML = `
      <h3>${chat.otherUserName || "Onbekend"}</h3>
      <p>${new Date(chat.createdAt).toLocaleDateString("nl-NL")}</p>
    `
    chatItem.addEventListener("click", () => openChat(chat.id, chat.otherUserId, chat.otherUserName))
    chatsList.appendChild(chatItem)
  })
}

// CHANGE: Fixed search functionality with proper error handling
searchBtn.addEventListener("click", searchUsers)
searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") searchUsers()
})

async function searchUsers() {
  const q = searchInput.value.trim()
  if (!q || q.length < 2) {
    searchResults.style.display = "none"
    return
  }

  try {
    console.log("[v0] Searching for:", q)
    const response = await fetch(`${apiBaseUrl}/api/chat/search?q=${encodeURIComponent(q)}`)
    const data = await response.json()
    console.log("[v0] Search results:", data)
    displaySearchResults(data.users || [])
  } catch (err) {
    console.error("[v0] Search failed:", err)
    searchResults.innerHTML = '<p style="padding: 20px; text-align: center; color: #e74c3c;">Zoeken mislukt</p>'
    searchResults.style.display = "block"
  }
}

function displaySearchResults(users) {
  searchResults.innerHTML = ""
  if (users.length === 0) {
    searchResults.innerHTML =
      '<p style="padding: 20px; text-align: center; color: #999; font-size: 14px;">Geen resultaten gevonden</p>'
    searchResults.style.display = "block"
    return
  }

  searchResults.style.display = "block"
  users.forEach((user) => {
    const item = document.createElement("div")
    item.className = "search-result-item"
    item.innerHTML = `
      <h3>${user.name || user.email || "Onbekend"}</h3>
      <p>${user.email || ""} • ${user.role === "employer" ? "Werkgever" : "Werkzoeker"}</p>
    `
    item.addEventListener("click", () => startChat(user.id, user.name || user.email))
    searchResults.appendChild(item)
  })
}

// Start a new chat
async function startChat(userId, userName) {
  try {
    const response = await fetch(`${apiBaseUrl}/api/chat/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ otherUserId: userId }),
    })
    const data = await response.json()
    openChat(data.chatId, userId, userName)
    searchResults.style.display = "none"
    searchInput.value = ""
  } catch (err) {
    console.error("[v0] Failed to start chat:", err)
  }
}

// Open chat and load messages
async function openChat(chatId, userId, userName) {
  currentChatId = chatId
  currentChatUser = { id: userId, name: userName }
  chatUserName.textContent = userName || "Chat"
  noChatSelected.style.display = "none"
  chatView.style.display = "flex"

  try {
    const response = await fetch(`${apiBaseUrl}/api/chat/${chatId}/messages`)
    const data = await response.json()
    displayMessages(data.messages || [])
  } catch (err) {
    console.error("[v0] Failed to load messages:", err)
  }

  messageInput.focus()
}

function displayMessages(messages) {
  messagesContainer.innerHTML = ""
  messages.forEach((msg) => {
    addMessageToUI(msg.sender_id, msg.content, msg.created_at)
  })
  messagesContainer.scrollTop = messagesContainer.scrollHeight
}

function addMessageToUI(senderId, content, timestamp) {
  const isSent = senderId === currentUserId
  const messageEl = document.createElement("div")
  messageEl.className = `message ${isSent ? "sent" : "received"}`

  const contentEl = document.createElement("div")
  contentEl.className = "message-content"
  contentEl.textContent = content

  const timeEl = document.createElement("div")
  timeEl.className = "message-time"
  timeEl.textContent = new Date(timestamp).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })

  messageEl.appendChild(contentEl)
  messageEl.appendChild(timeEl)
  messagesContainer.appendChild(messageEl)
  messagesContainer.scrollTop = messagesContainer.scrollHeight
}

// Send message
sendBtn.addEventListener("click", sendMessage)
messageInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault()
    sendMessage()
  }
})

function sendMessage() {
  const message = messageInput.value.trim()
  if (!message || !currentChatId) return

  socket.emit("send_message", {
    fromUserId: currentUserId,
    toUserId: currentChatUser.id,
    message,
    chatId: currentChatId,
  })

  addMessageToUI(currentUserId, message, new Date())
  messageInput.value = ""
  messageInput.focus()
}

// Typing indicators
messageInput.addEventListener("input", () => {
  if (!isTyping && currentChatUser) {
    isTyping = true
    socket.emit("user_typing", { toUserId: currentChatUser.id })
  }
})

messageInput.addEventListener("blur", () => {
  if (isTyping && currentChatUser) {
    isTyping = false
    socket.emit("user_stopped_typing", { toUserId: currentChatUser.id })
  }
})

// Close chat
closeChatBtn.addEventListener("click", () => {
  currentChatId = null
  currentChatUser = null
  noChatSelected.style.display = "flex"
  chatView.style.display = "none"
  searchResults.style.display = "none"
})

// CHANGE: Add back to dashboard button event listener
if (backToDashboardBtn) {
  backToDashboardBtn.addEventListener("click", () => {
    // Determine which dashboard to return to based on user role
    fetch(`${apiBaseUrl}/api/auth/me`)
      .then((res) => res.json())
      .then((data) => {
        if (data.user.role === "employer") {
          window.location.href = "/dashboard-werkgever"
        } else {
          window.location.href = "/dashboard"
        }
      })
      .catch(() => {
        window.location.href = "/dashboard"
      })
  })
}

// Socket.io event listeners
socket.on("receive_message", (data) => {
  if (data.chatId === currentChatId) {
    addMessageToUI(data.fromUserId, data.message, data.timestamp)
  }
})

socket.on("user_is_typing", (data) => {
  if (data.status) {
    typingIndicator.style.display = "flex"
  } else {
    typingIndicator.style.display = "none"
  }
})

socket.on("disconnect", () => {
  console.log("[v0] Verbronden van server")
})

// Initialize on page load
document.addEventListener("DOMContentLoaded", init)
