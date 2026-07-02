const express = require('express')
const router = express.Router()
const getDB = () => global._db

router.get('/', async (req, res) => {
  try {
    const db = getDB()
    const type = req.query.type || 'xp'

    const sortField = type === 'gold' ? 'wallet'
      : type === 'diamonds' ? 'diamonds'
      : 'xp'

    const users = await db.collection('users')
      .find({
        username: { $exists: true, $ne: null },
        $or: [
          { registered: true },
          { password: { $exists: true } }
        ]
      })
      .sort({ [sortField]: -1 })
      .limit(20)
      .toArray()

    const result = users.map((u, i) => ({
      rank: i + 1,
      name: u.username,
      value: u[sortField] || 0,
      empireRank: u.rank || 'Peasant',
      level: u.level || 1
    }))

    res.json({ users: result })
  } catch (err) {
    console.error('Leaderboard error:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

module.exports = router
