const express = require('express')
const router = express.Router()
const auth = require('../middleware/authMiddleware')
const getDB = () => global._db

const TICKET_PRICE = 50
const MAX_TICKETS = 3
const RESET_MS = 5 * 60 * 60 * 1000 // 5 hours

router.get('/items', async (req, res) => {
  res.json({ items: [] })
})

router.post('/buy-ticket', auth, async (req, res) => {
  try {
    const db = getDB()
    const phone = req.user.phone
    const jid = phone + '@s.whatsapp.net'

    const user = await db.collection('users').findOne({
      $or: [{ id: jid }, { phone }]
    })

    if (!user) return res.status(404).json({ error: 'User not found' })

    // Check ticket reset
    const now = Date.now()
    const lastReset = user.ticketResetAt ? new Date(user.ticketResetAt).getTime() : 0
    const ticketCount = (now - lastReset) >= RESET_MS ? 0 : (user.lotteryTickets || 0)

    if (ticketCount >= MAX_TICKETS)
      return res.status(400).json({ error: 'Max 3 tickets per 5 hours' })

    if ((user.wallet || 0) < TICKET_PRICE)
      return res.status(400).json({ error: 'Not enough Gold' })

    const newTickets = ticketCount + 1
    const resetAt = ticketCount === 0 ? new Date() : (user.ticketResetAt || new Date())

    await db.collection('users').updateOne(
      { $or: [{ id: jid }, { phone }] },
      {
        $inc: { wallet: -TICKET_PRICE },
        $set: {
          lotteryTickets: newTickets,
          ticketResetAt: resetAt
        }
      }
    )

    res.json({
      success: true,
      tickets: newTickets,
      wallet: (user.wallet || 0) - TICKET_PRICE
    })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

module.exports = router
