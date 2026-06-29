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

    // Single user doc — registration merges web + bot data
    const user = await db.collection('users').findOne({ phone })
    if (!user) return res.status(404).json({ error: 'User not found' })

    const level = user.level || 1
    const xp = user.xp || 0
    const xpToNext = user.xpToNext || getXPToNextLevel(level)

    const now = Date.now()
    const lastReset = user.ticketResetAt
      ? new Date(user.ticketResetAt).getTime() : 0
    const tickets = (now - lastReset) >= 5 * 60 * 60 * 1000
      ? 0 : (user.lotteryTickets || 0)

    res.json({
      username: user.username,
      phone,
      avatar: user.avatar || null,
      cover: user.cover || null,
      bio: user.bio || '',
      xp,
      level,
      xpToNext,
      rank: user.rank || 'Peasant',
      gold: user.wallet || 0,
      vaultGold: user.vault || 0,
      vaultDiamonds: user.diamonds || 0,
      reputation: user.reputation || null,
      title: user.title || '',
      titleDesc: user.titleDesc || 'Begin your rise.',
      lotteryTickets: tickets,
      frame: user.frame || 'classic',
      inventory: user.inventory || []
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
