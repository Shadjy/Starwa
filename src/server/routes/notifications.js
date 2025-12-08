import { Router } from "express"
import { query } from "../db.js"

const router = Router()

// Get user notifications
router.get("/", async (req, res, next) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Niet ingelogd" })
    }

    const { unread_only = false } = req.query
    let sql = "SELECT * FROM notifications WHERE user_id = ?"
    const params = [req.session.userId]

    if (unread_only === "true") {
      sql += " AND is_read = 0"
    }

    sql += " ORDER BY created_at DESC LIMIT 50"
    const notifications = await query(sql, params)

    res.json({ notifications })
  } catch (err) {
    next(err)
  }
})

// Mark notification as read
router.post("/:notificationId/read", async (req, res, next) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Niet ingelogd" })
    }

    const { notificationId } = req.params
    await query("UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?", [
      notificationId,
      req.session.userId,
    ])

    res.json({ message: "Notificatie gelezen" })
  } catch (err) {
    next(err)
  }
})

// Mark all as read
router.post("/read-all", async (req, res, next) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Niet ingelogd" })
    }

    await query("UPDATE notifications SET is_read = 1 WHERE user_id = ?", [req.session.userId])

    res.json({ message: "Alle notificaties gelezen" })
  } catch (err) {
    next(err)
  }
})

// Delete notification
router.delete("/:notificationId", async (req, res, next) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Niet ingelogd" })
    }

    const { notificationId } = req.params
    await query("DELETE FROM notifications WHERE id = ? AND user_id = ?", [notificationId, req.session.userId])

    res.json({ message: "Notificatie verwijderd" })
  } catch (err) {
    next(err)
  }
})

export default router
