import { Router } from "express"
import { query } from "../db.js"

const router = Router()

// CHANGE: Search users by name or ID
router.get("/search", async (req, res, next) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Niet ingelogd" })
    }

    const { q } = req.query
    if (!q || q.length < 1) {
      return res.json({ users: [] })
    }

    const searchTerm = `%${q}%`
    const rows = await query(
      "SELECT id, naam, contactpersoon, email, role FROM users WHERE (naam LIKE ? OR contactpersoon LIKE ? OR email LIKE ? OR id = ?) AND id != ? LIMIT 10",
      [searchTerm, searchTerm, searchTerm, q, req.session.userId],
    )

    const users = rows.map((u) => ({
      id: u.id,
      name: u.naam || u.contactpersoon || u.email,
      email: u.email,
      role: u.role,
    }))

    res.json({ users })
  } catch (err) {
    next(err)
  }
})

// CHANGE: Get or create chat with user
router.post("/start", async (req, res, next) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Niet ingelogd" })
    }

    const { otherUserId } = req.body
    if (!otherUserId) {
      return res.status(400).json({ error: "Ontbrekende otherUserId" })
    }

    // Check if chat exists
    const chatRows = await query(
      "SELECT id FROM chats WHERE (user_id_1 = ? AND user_id_2 = ?) OR (user_id_1 = ? AND user_id_2 = ?) LIMIT 1",
      [req.session.userId, otherUserId, otherUserId, req.session.userId],
    )

    let chatId
    if (chatRows.length) {
      chatId = chatRows[0].id
    } else {
      // Create new chat
      await query("INSERT INTO chats (user_id_1, user_id_2, created_at) VALUES (?, ?, NOW())", [
        req.session.userId,
        otherUserId,
      ])
      const newChat = await query(
        "SELECT id FROM chats WHERE (user_id_1 = ? AND user_id_2 = ?) OR (user_id_1 = ? AND user_id_2 = ?) ORDER BY created_at DESC LIMIT 1",
        [req.session.userId, otherUserId, otherUserId, req.session.userId],
      )
      chatId = newChat[0].id
    }

    res.json({ chatId })
  } catch (err) {
    next(err)
  }
})

// CHANGE: Get chat messages
router.get("/:chatId/messages", async (req, res, next) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Niet ingelogd" })
    }

    const { chatId } = req.params
    const messages = await query(
      "SELECT id, sender_id, receiver_id, content, created_at FROM messages WHERE chat_id = ? ORDER BY created_at ASC LIMIT 50",
      [chatId],
    )

    res.json({ messages })
  } catch (err) {
    next(err)
  }
})

// CHANGE: Get user's chats list
router.get("/list", async (req, res, next) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Niet ingelogd" })
    }

    const chats = await query(
      `SELECT c.id, c.user_id_1, c.user_id_2, c.created_at,
              u1.naam as user1_naam, u1.contactpersoon as user1_contact, u1.role as user1_role,
              u2.naam as user2_naam, u2.contactpersoon as user2_contact, u2.role as user2_role
       FROM chats c
       LEFT JOIN users u1 ON c.user_id_1 = u1.id
       LEFT JOIN users u2 ON c.user_id_2 = u2.id
       WHERE c.user_id_1 = ? OR c.user_id_2 = ?
       ORDER BY c.created_at DESC`,
      [req.session.userId, req.session.userId],
    )

    const formattedChats = chats.map((c) => {
      const otherUserId = c.user_id_1 === req.session.userId ? c.user_id_2 : c.user_id_1
      const otherUserName =
        c.user_id_1 === req.session.userId ? c.user2_naam || c.user2_contact : c.user1_naam || c.user1_contact

      return {
        id: c.id,
        otherUserId,
        otherUserName,
        createdAt: c.created_at,
      }
    })

    res.json({ chats: formattedChats })
  } catch (err) {
    next(err)
  }
})

export default router
