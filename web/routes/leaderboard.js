const express = require('express')
const router = express.Router()
const { getDB } = require('../../src/data/db')

router.get('/', async (req, res) => {
    try {
        const db = getDB()
        const type = req.query.type || 'xp'
        const sortField = type === 'wealth' ? 'wallet' : 'xp'

        const stats = await db.collection('userStats')
            .find({})
            .sort({ [sortField]: -1 })
            .limit(20)
            .toArray()

        const users = await Promise.all(stats.map(async (s) => {
            const phone = s.userId.replace('@s.whatsapp.net', '')
            const user = await db.collection('users').findOne({ phone })
            return {
                username: user?.username || phone,
                score: s[sortField] || 0,
                rank: s.rank || 'Peasant',
                level: s.level || 1
            }
        }))

        res.json({ users })
    } catch (err) {
        res.status(500).json({ error: 'Server error' })
    }
})

module.exports = router
