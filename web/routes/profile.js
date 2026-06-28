const express = require('express')
const router = express.Router()
const auth = require('../middleware/authMiddleware')
const getDB = () => global._db

router.get('/me', auth, async (req, res) => {
  try {
    const db = getDB()
    const phone = req.user.phone
    const jid = phone + '@s.whatsapp.net'

    const webUser = await db.collection('users').findOne({ phone })
    if (!webUser) return res.status(404).json({ error: 'User not found' })

    // Search all possible ID formats including LID
    const botUser = await db.collection('users').findOne({
      $or: [
        { id: jid },
        { phone: phone },
        { id: { $regex: phone } }  // catches LID format which contains the phone number
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
      gold: botUser?.wallet || 0,
      vaultGold: botUser?.vault || 0,
      vaultDiamonds: botUser?.diamonds || 0,
      reputation: botUser?.reputation || null,
      title: botUser?.title || '',
      titleDesc: botUser?.titleDesc || 'Begin your rise.',
      xpToNext: botUser?.xpToNext || 2000,
      lotteryTickets: tickets,
      frame: webUser.frame || 'classic',
      inventory: webUser.inventory || []
    })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

router.post('/update', auth, async (req, res) => {
  try {
    const db = getDB()
    const { avatar, cover, bio, username, frame } = req.body
    const update = {}
    if (avatar) update.avatar = avatar
    if (cover) update.cover = cover
    if (bio !== undefined) update.bio = bio
    if (username) update.username = username
    if (frame) update.frame = frame

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
