const express = require('express')
const router = express.Router()
const getDB = () => global._db

router.get('/', async (req, res) => {
    try {
        const db = getDB()
        const type = req.query.type || 'xp'
        const sortField = type === 'wealth' ? 'wallet' : 'xp'

        const users = await db.collection('users')
            .find({ id: { $regex: '@s.whatsapp.net' } })
            .sort({ [sortField]: -1 })
            .limit(20)
            .toArray()

        const result = users.map(u => ({
            username: u.username || u.id.replace('@s.whatsapp.net', ''),
            score: u[sortField] || 0,
            rank: u.rank || 'Peasant',
            level: u.level || 1
        }))

        res.json({ users: result })
    } catch (err) {
        res.status(500).json({ error: 'Server error' })
    }
})

module.exports = router
