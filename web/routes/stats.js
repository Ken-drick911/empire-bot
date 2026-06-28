const express = require('express')
const router = express.Router()
const getDB = () => global._db

router.get('/', async (req, res) => {
  try {
    const db = getDB()

    const citizens = await db.collection('users')
      .countDocuments({ id: { $regex: '@s.whatsapp.net' } })

    const groups = await db.collection('groups')
      .countDocuments()
      .catch(() => 0)

    res.json({ citizens, legions: groups, victories: 0 })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

module.exports = router
