const express = require('express')
const router = express.Router()
const auth = require('../middleware/authMiddleware')
const getDB = () => global._db

// Get own profile
router.get('/me', auth, async (req, res) => {
    try {
        const db = getDB()
        const phone = req.user.phone
        const jid = phone + '@s.whatsapp.net'

        const webUser = await db.collection('users').findOne({ phone })
        if (!webUser) return res.status(404).json({ error: 'User not found' })

        // Find bot stats using phone number formats
        const botUser = await db.collection('users').findOne({
    $or: [
        { id: jid },
        { phone: phone }
    ]
})

      const now = Date.now()
const lastReset = botUser?.ticketResetAt
  ? new Date(botUser.ticketResetAt).getTime() : 0
const tickets = (now - lastReset) >= 5 * 60 * 60 * 1000
  ? 0 : (botUser?.lotteryTickets || 0)

res.json({
  username: webUser.username,
  phone,
  avatar: webUser.avatar || null,
  cover: webUser.cover || null,
  bio: webUser.bio || '',
  xp: botUser?.xp || 0,
  level: botUser?.level || 1,
  rank: botUser?.rank || 'Peasant',
  wallet: botUser?.wallet || 0,
  vault: botUser?.vault || 0,
  diamonds: botUser?.diamonds || 0,
  reputation: botUser?.reputation || null,
  title: botUser?.title || '',
  lotteryTickets: tickets,
  inventory: webUser.inventory || []
})  
    } catch (err) {
        res.status(500).json({ error: 'Server error' })
    }
})

// Update profile (avatar, cover, bio)
router.post('/update', auth, async (req, res) => {
    try {
        const db = getDB()
        const { avatar, cover, bio, username } = req.body
        const update = {}
        if (avatar) update.avatar = avatar
        if (cover) update.cover = cover
        if (bio) update.bio = bio
        if (username) update.username = username

        await db.collection('users').updateOne(
            { phone: req.user.phone },
            { $set: update }
        )
        res.json({ success: true })
    } catch (err) {
        res.status(500).json({ error: 'Server error' })
    }
})

module.exports = router
