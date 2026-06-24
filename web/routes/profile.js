const express = require('express')
const router = express.Router()
const auth = require('../middleware/authMiddleware')
const { getDB } = require('../../src/data/db')

// Get own profile
router.get('/me', auth, async (req, res) => {
    try {
        const db = getDB()
        const phone = req.user.phone
        const jid = phone + '@s.whatsapp.net'

        const user = await db.collection('users').findOne({ phone })
        const stats = await db.collection('userStats').findOne({ userId: jid })

        if (!user) return res.status(404).json({ error: 'User not found' })

        res.json({
            username: user.username,
            phone,
            avatar: user.avatar || null,
            cover: user.cover || null,
            bio: user.bio || '',
            xp: stats?.xp || 0,
            level: stats?.level || 1,
            rank: stats?.rank || 'Peasant',
            wallet: stats?.wallet || 0,
            vault: stats?.vault || 0,
            reputation: stats?.reputation || 0,
            title: stats?.title || '',
            inventory: user.inventory || []
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
