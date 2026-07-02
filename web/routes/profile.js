const express = require('express')
const router = express.Router()
const auth = require('../middleware/authMiddleware')
const getDB = () => global._db

function getXPToNextLevel(level) {
  const levelXP = [0, 100, 150, 220, 310, 420, 550, 700, 870, 1060]
  return levelXP[level] || 1060
}

router.get('/me', auth, async (req, res) => {
  try {
    const db = getDB()
    const phone = req.user.phone
    const jid = phone + '@s.whatsapp.net'

    const webUser = await db.collection('users').findOne({ phone })
    if (!webUser) return res.status(404).json({ error: 'User not found' })

    const botUser = await db.collection('users').findOne({
      $or: [
        { id: jid },
        { id: { $regex: phone } },
        { phone: phone, xp: { $exists: true } }
      ]
    }) || webUser

    const level = botUser.level || webUser.level || 1
    const xp = botUser.xp || webUser.xp || 0
    const xpToNext = botUser.xpToNext || getXPToNextLevel(level)

    const now = Date.now()
    const lastReset = botUser.ticketResetAt
      ? new Date(botUser.ticketResetAt).getTime() : 0
    const tickets = (now - lastReset) >= 5 * 60 * 60 * 1000
      ? 0 : (botUser.lotteryTickets || 0)

    res.json({
      username: webUser.username,
      phone,
      avatar: webUser.avatar || null,
      cover: webUser.cover || null,
      bio: webUser.bio || '',
      xp,
      level,
      xpToNext,
      rank: botUser.rank || webUser.rank || 'Peasant',
      gold: botUser.wallet || webUser.wallet || 0,
      vaultGold: botUser.vault || webUser.vault || 0,
      vaultDiamonds: botUser.diamonds || webUser.diamonds || 0,
      reputation: botUser.reputation || null,
      title: botUser.title || webUser.title || '',
      titleDesc: botUser.titleDesc || webUser.titleDesc || 'Begin your rise.',
      lotteryTickets: tickets,
      frame: webUser.frame || 'classic',
      inventory: webUser.inventory || []
    })
  } catch (err) {
    console.error('Profile error:', err)
    res.status(500).json({ error: 'Server error' })
  }
})
module.exports = router
