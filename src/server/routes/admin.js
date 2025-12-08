import { Router } from "express"
import { query } from "../db.js"

const router = Router()

function isAdmin(req, res, next) {
  console.log("[v0] Admin middleware check for user:", req.session.userId)

  if (!req.session.userId) {
    console.log("[v0] Admin middleware: No session user ID")
    return res.status(401).json({ error: "Niet ingelogd" })
  }

  // Check database for admin flag
  query("SELECT is_admin FROM users WHERE id = ?", [req.session.userId])
    .then((result) => {
      console.log("[v0] Admin check result:", result)

      if (result.length > 0 && result[0].is_admin === 1) {
        console.log("[v0] Admin access granted")
        next()
      } else {
        console.log("[v0] Admin access denied: Not admin")
        return res.status(403).json({ error: "Geen admin rechten" })
      }
    })
    .catch((err) => {
      console.error("[v0] Admin check error:", err)
      res.status(500).json({ error: "Server fout bij admin check" })
    })
}

// Get all users (with pagination and filtering)
router.get("/users", isAdmin, async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search = "" } = req.query
    const offset = (page - 1) * limit

    let sql = "SELECT id, email, naam, contactpersoon, role, is_banned, created_at FROM users"
    const params = []

    if (search) {
      sql += " WHERE email LIKE ? OR naam LIKE ? OR contactpersoon LIKE ?"
      params.push(`%${search}%`, `%${search}%`, `%${search}%`)
    }

    sql += " ORDER BY created_at DESC LIMIT ? OFFSET ?"
    params.push(Number(limit), offset)

    const users = await query(sql, params)
    const countResult = await query("SELECT COUNT(*) as total FROM users")
    const total = countResult[0].total

    res.json({ users, total, page: Number(page), limit: Number(limit) })
  } catch (err) {
    next(err)
  }
})

// Ban/warn user
router.post("/users/:userId/action", isAdmin, async (req, res, next) => {
  try {
    const { userId } = req.params
    const { action, reason } = req.body // action: 'ban', 'warn', 'unban'

    if (action === "ban") {
      await query("UPDATE users SET is_banned = 1, ban_reason = ? WHERE id = ?", [reason, userId])
      await query("INSERT INTO moderation_log (user_id, action, reason, admin_id) VALUES (?, ?, ?, ?)", [
        userId,
        "ban",
        reason,
        req.session.userId,
      ])
    } else if (action === "unban") {
      await query("UPDATE users SET is_banned = 0, ban_reason = NULL WHERE id = ?", [userId])
      await query("INSERT INTO moderation_log (user_id, action, admin_id) VALUES (?, ?, ?)", [
        userId,
        "unban",
        req.session.userId,
      ])
    } else if (action === "warn") {
      await query("INSERT INTO moderation_log (user_id, action, reason, admin_id) VALUES (?, ?, ?, ?)", [
        userId,
        "warn",
        reason,
        req.session.userId,
      ])
    }

    res.json({ message: "Actie voltooid" })
  } catch (err) {
    next(err)
  }
})

// Get page by slug
router.get("/pages/:slug", async (req, res, next) => {
  try {
    const { slug } = req.params
    const rows = await query("SELECT * FROM pages WHERE slug = ?", [slug])
    res.json(rows[0] || null)
  } catch (err) {
    next(err)
  }
})

// Update or create page
router.post("/pages", isAdmin, async (req, res, next) => {
  try {
    const { slug, title, content, is_published } = req.body

    // Check if exists
    const existing = await query("SELECT id FROM pages WHERE slug = ?", [slug])

    if (existing.length) {
      await query("UPDATE pages SET title = ?, content = ?, is_published = ? WHERE slug = ?", [
        title,
        content,
        is_published ? 1 : 0,
        slug,
      ])
    } else {
      await query("INSERT INTO pages (slug, title, content, is_published) VALUES (?, ?, ?, ?)", [
        slug,
        title,
        content,
        is_published ? 1 : 0,
      ])
    }

    res.json({ message: "Pagina opgeslagen" })
  } catch (err) {
    next(err)
  }
})

router.get("/pages", isAdmin, async (req, res, next) => {
  try {
    const pages = await query("SELECT id, slug, title, is_published, created_at FROM pages ORDER BY created_at DESC")
    res.json(pages || [])
  } catch (err) {
    next(err)
  }
})

router.delete("/pages/:slug", isAdmin, async (req, res, next) => {
  try {
    const { slug } = req.params
    await query("DELETE FROM pages WHERE slug = ?", [slug])
    res.json({ message: "Page deleted" })
  } catch (err) {
    next(err)
  }
})

// Get site settings
router.get("/settings", isAdmin, async (req, res, next) => {
  try {
    const settings = await query("SELECT * FROM site_settings")
    const settingsObj = {}
    settings.forEach((s) => {
      settingsObj[s.setting_key] = s.setting_value
    })
    res.json(settingsObj)
  } catch (err) {
    next(err)
  }
})

// Update site settings
router.post("/settings", isAdmin, async (req, res, next) => {
  try {
    const { setting_key, setting_value } = req.body

    const existing = await query("SELECT id FROM site_settings WHERE setting_key = ?", [setting_key])

    if (existing.length) {
      await query("UPDATE site_settings SET setting_value = ? WHERE setting_key = ?", [setting_value, setting_key])
    } else {
      await query("INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?)", [setting_key, setting_value])
    }

    res.json({ message: "Instellingen opgeslagen" })
  } catch (err) {
    next(err)
  }
})

router.post("/design", isAdmin, async (req, res, next) => {
  try {
    const { primaryColor, bgColor, logoText, siteTitle } = req.body

    // Save design settings to database
    for (const [key, value] of Object.entries({
      primaryColor,
      bgColor,
      logoText,
      siteTitle,
    })) {
      const existing = await query("SELECT id FROM site_settings WHERE setting_key = ?", [key])

      if (existing.length) {
        await query("UPDATE site_settings SET setting_value = ? WHERE setting_key = ?", [value, key])
      } else {
        await query("INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?)", [key, value])
      }
    }

    res.json({ message: "Design settings saved" })
  } catch (err) {
    next(err)
  }
})

// Get chat monitoring data
router.get("/chats", isAdmin, async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query
    const offset = (page - 1) * limit

    const chats = await query(
      `SELECT c.id, c.user_id_1, c.user_id_2, c.created_at,
              u1.email as user1_email, u2.email as user2_email,
              COUNT(m.id) as message_count
       FROM chats c
       LEFT JOIN users u1 ON c.user_id_1 = u1.id
       LEFT JOIN users u2 ON c.user_id_2 = u2.id
       LEFT JOIN messages m ON c.id = m.chat_id
       GROUP BY c.id
       ORDER BY c.created_at DESC
       LIMIT ? OFFSET ?`,
      [Number(limit), offset],
    )

    res.json({ chats, page: Number(page), limit: Number(limit) })
  } catch (err) {
    next(err)
  }
})

// Get chat messages (for moderation)
router.get("/chats/:chatId/messages", isAdmin, async (req, res, next) => {
  try {
    const { chatId } = req.params
    const messages = await query(
      `SELECT m.*, u_from.email as from_email, u_to.email as to_email
       FROM messages m
       LEFT JOIN users u_from ON m.sender_id = u_from.id
       LEFT JOIN users u_to ON m.receiver_id = u_to.id
       WHERE m.chat_id = ?
       ORDER BY m.created_at DESC
       LIMIT 50`,
      [chatId],
    )
    res.json(messages)
  } catch (err) {
    next(err)
  }
})

// Get moderation log
router.get("/moderation-log", isAdmin, async (req, res, next) => {
  try {
    const log = await query(
      `SELECT m.*, u.email as user_email, admin.email as admin_email
       FROM moderation_log m
       LEFT JOIN users u ON m.user_id = u.id
       LEFT JOIN users admin ON m.admin_id = admin.id
       ORDER BY m.created_at DESC
       LIMIT 100`,
    )
    res.json(log)
  } catch (err) {
    next(err)
  }
})

// Create/update notification
router.post("/notifications", isAdmin, async (req, res, next) => {
  try {
    const { user_id, type, title, content } = req.body

    await query("INSERT INTO notifications (user_id, type, title, content, is_read) VALUES (?, ?, ?, ?, 0)", [
      user_id,
      type,
      title,
      content,
    ])

    res.json({ message: "Notificatie verzonden" })
  } catch (err) {
    next(err)
  }
})

router.get("/check", async (req, res, next) => {
  try {
    console.log("[v0] Admin check endpoint called, session:", {
      userId: req.session.userId,
      userRole: req.session.userRole,
    })

    if (!req.session.userId) {
      console.log("[v0] Admin check: No session")
      return res.json({ isAdmin: false, error: "Niet ingelogd" })
    }

    const result = await query("SELECT is_admin FROM users WHERE id = ?", [req.session.userId])
    const isAdmin = result.length > 0 && result[0].is_admin === 1

    console.log("[v0] Admin check result:", { isAdmin, result })

    res.json({ isAdmin })
  } catch (err) {
    console.error("[v0] Admin check error:", err)
    res.json({ isAdmin: false, error: "Database fout" })
  }
})

export default router
