import express from "express"
import cors from "cors"
import path from "path"
import fs from "fs"
import { fileURLToPath } from "url"
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
import session from "express-session"
import { createServer } from "http"
import { Server } from "socket.io"
import authRoutes from "./routes/auth.js"
import vacaturesRoutes from "./routes/vacatures.js"
import companyRoutes from "./routes/company.js"
import candidatesRoutes from "./routes/candidates.js"
import chatRoutes from "./routes/chat.js"
import notificationsRoutes from "./routes/notifications.js"
import adminRoutes from "./routes/admin.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load .env: prefer repo root, fallback to server/.env
const ROOT_ENV = path.join(__dirname, "..", "..", ".env")
const SERVER_ENV = path.join(__dirname, ".env")
try {
  if (fs.existsSync(ROOT_ENV)) dotenv.config({ path: ROOT_ENV })
  if (!process.env.DB_HOST && fs.existsSync(SERVER_ENV)) dotenv.config({ path: SERVER_ENV })
} catch {}

const CLIENT_DIR = path.join(__dirname, "..", "client")
const PAGES_DIR = path.join(CLIENT_DIR, "pages")

function sendHtml(res, absPath) {
  if (fs.existsSync(absPath)) return res.sendFile(absPath)
  return res.status(404).send(`<h1>404</h1><p>Niet gevonden: ${absPath}</p>`)
}

const app = express()
// CHANGE: Create HTTP server for Socket.io
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: { origin: true, credentials: true },
  transports: ["websocket", "polling"],
})
const PORT = process.env.PORT || 3000

app.use(cors({ origin: true, credentials: true }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser(process.env.SESSION_SECRET || "starwa-dev-secret"))

app.use(
  session({
    secret: process.env.SESSION_SECRET || "starwa-dev-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    },
  }),
)

app.use(express.static(CLIENT_DIR))

app.use("/api/auth", authRoutes)
app.use("/api/vacatures", vacaturesRoutes)
app.use("/api/company", companyRoutes)
app.use("/api/candidates", candidatesRoutes)
// CHANGE: Add chat routes
app.use("/api/chat", chatRoutes)
// CHANGE: Add notifications and admin routes
app.use("/api/notifications", notificationsRoutes)
app.use("/api/admin", adminRoutes)

app.get("/", (_req, res) => {
  sendHtml(res, path.join(PAGES_DIR, "home.html"))
})

app.get("/home", (_req, res) => {
  sendHtml(res, path.join(PAGES_DIR, "home.html"))
})

app.get("/inlog-aanmeld", (_req, res) => {
  res.redirect(301, "/login")
})

app.get("/login", (_req, res) => {
  sendHtml(res, path.join(PAGES_DIR, "login.html"))
})

app.get("/register", (_req, res) => {
  sendHtml(res, path.join(PAGES_DIR, "register.html"))
})

app.get("/dashboard.html", (_req, res) => {
  res.redirect(301, "/dashboard")
})

app.get("/dashboard", (_req, res) => {
  sendHtml(res, path.join(PAGES_DIR, "dashboard.html"))
})

app.get("/dashboard-werkgever.html", (_req, res) => {
  res.redirect(301, "/dashboard-werkgever")
})

app.get("/dashboard-werkgever", (_req, res) => {
  sendHtml(res, path.join(PAGES_DIR, "dashboard-werkgever.html"))
})

app.get("/admin", async (req, res) => {
  // Check if user is logged in and is admin
  if (!req.session.userId) {
    console.log("[v0] Admin access denied: Not logged in")
    return res.redirect(303, "/login")
  }

  try {
    const { query: dbQuery } = await import("./db.js")
    const rows = await dbQuery("SELECT is_admin FROM users WHERE id = ?", [req.session.userId])

    if (!rows || rows.length === 0 || rows[0].is_admin !== 1) {
      console.log("[v0] Admin access denied: User is not admin")
      return res.redirect(303, "/login")
    }

    // User is admin, serve the page
    sendHtml(res, path.join(PAGES_DIR, "admin.html"))
  } catch (err) {
    console.error("[v0] Admin auth check error:", err)
    return res.redirect(303, "/login")
  }
})

app.get("/vragenlijst", (_req, res) => {
  sendHtml(res, path.join(PAGES_DIR, "vragenlijst.html"))
})

app.get("/vragenlijst.html", (_req, res) => {
  res.redirect(301, "/vragenlijst")
})

app.get("/profiel", (_req, res) => {
  sendHtml(res, path.join(PAGES_DIR, "profiel.html"))
})

// CHANGE: Add chat page route
app.get("/berichten", (_req, res) => {
  sendHtml(res, path.join(PAGES_DIR, "chat.html"))
})

app.get("/match", (_req, res) => {
  sendHtml(res, path.join(PAGES_DIR, "match.html"))
})

app.get("/matches", (_req, res) => res.redirect(301, "/match"))

app.use((req, res, next) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ error: "Niet gevonden" })
  }
  // Serve custom 404 page
  res.status(404)
  sendHtml(res, path.join(PAGES_DIR, "404.html"))
})

app.use((err, _req, res, _next) => {
  const payload = { error: "Interne serverfout" }
  if (process.env.NODE_ENV !== "production") {
    payload.details = String(err?.message || err)
    if (err && typeof err === "object") {
      payload.code = err.code
      payload.sqlMessage = err.sqlMessage
      payload.sqlState = err.sqlState
      payload.name = err.name
    }
  }
  console.error("Server error:", err?.stack || err)
  res.status(500).json(payload)
})

// CHANGE: Socket.io connection handler
const connectedUsers = new Map()

io.on("connection", (socket) => {
  console.log("[Socket.io] Gebruiker verbonden:", socket.id)

  socket.on("user_join", (data) => {
    const { userId, userName } = data
    connectedUsers.set(userId, { socketId: socket.id, userName })
    socket.join(`user_${userId}`)
    console.log("[Socket.io] Gebruiker ingelogd:", userId)
  })

  socket.on("send_message", async (data) => {
    const { fromUserId, toUserId, message, chatId } = data
    const timestamp = new Date()

    io.to(`user_${toUserId}`).emit("receive_message", {
      fromUserId,
      message,
      timestamp,
      chatId,
    })

    // Save to database
    try {
      import("./db.js").then(({ query }) => {
        query("INSERT INTO messages (chat_id, sender_id, receiver_id, content, created_at) VALUES (?, ?, ?, ?, ?)", [
          chatId,
          fromUserId,
          toUserId,
          message,
          timestamp,
        ])
      })
    } catch (err) {
      console.error("[Socket.io] Error saving message:", err.message)
    }
  })

  socket.on("user_typing", (data) => {
    const { toUserId } = data
    io.to(`user_${toUserId}`).emit("user_is_typing", { status: true })
  })

  socket.on("user_stopped_typing", (data) => {
    const { toUserId } = data
    io.to(`user_${toUserId}`).emit("user_is_typing", { status: false })
  })

  socket.on("disconnect", () => {
    for (const [userId, info] of connectedUsers.entries()) {
      if (info.socketId === socket.id) {
        connectedUsers.delete(userId)
        console.log("[Socket.io] Gebruiker verbroken:", userId)
        break
      }
    }
  })
})

// Start
httpServer.listen(PORT, () => {
  console.log(`Server draait op http://localhost:${PORT}`)
  console.log(`CLIENT_DIR: ${CLIENT_DIR}`)
  console.log(`PAGES_DIR : ${PAGES_DIR}`)
  console.log("Home: / -> " + path.join(PAGES_DIR, "home.html"))
})

// Debug: DB ping (dev only)
import { query as dbQuery } from "./db.js"
if (process.env.NODE_ENV !== "production") {
  app.get("/api/debug/ping", async (_req, res) => {
    try {
      const rows = await dbQuery("SELECT 1 AS ok")
      res.json({ ok: rows?.[0]?.ok === 1 })
    } catch (err) {
      res.status(500).json({ error: "db_error", details: String(err?.message || err) })
    }
  })
}

// ... existing database setup code ...
const { DB_HOST, DB_PORT, DB_USER, DB_NAME, DB_SSL } = process.env
console.log("[DB] Config (zonder wachtwoord):", {
  host: DB_HOST,
  port: Number(DB_PORT) || 3306,
  user: DB_USER,
  database: DB_NAME,
  ssl: DB_SSL || "off",
})
;(async () => {
  try {
    const rows = await dbQuery("SELECT 1 AS ok")
    if (rows?.[0]?.ok === 1) console.log("[DB] Verbinding OK")
    else console.log("[DB] Onverwachte ping-respons:", rows)
  } catch (err) {
    console.error("[DB] Verbinding FOUT:", {
      name: err?.name,
      code: err?.code,
      message: err?.message,
      sqlMessage: err?.sqlMessage,
      sqlState: err?.sqlState,
    })
    console.error("[DB] Tip: controleer firewall/GRANTs/bind-address/SSL en .env waarden.")
  }
})()
