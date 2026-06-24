const express = require('express')
const router = express.Router()
const auth = require('../middleware/authMiddleware')
const { getDB } = require('../../src/data/db')

const SHOP_ITEMS = [
    { id: 'pistol', name: 'Pistol', category: 'WEAPON', price: 2500, description: 'Required to steal coins from others.', emoji: '🔫' },
    { id: 'guard_shield', name: 'Guard Shield', category: 'EQUIPMENT', price: 50000, description: 'Defends against steal attempts.', emoji: '🛡️' },
    { id: 'fishing_rod', name: 'Fishing Rod', category: 'EQUIPMENT', price: 1000, description: 'Unlocks the .fish command.', emoji: '🎣' },
    { id: 'pickaxe', name: 'Pickaxe', category: 'EQUIPMENT', price: 1500, description: 'Unlocks the .dig command.', emoji: '⛏️' },
    { id: 'dungeon_map', name: 'Dungeon Map', category: 'EQUIPMENT', price: 5000, description: 'Unlocks the .dungeon command.', emoji: '🗺️' },
    { id: 'xp_potion', name: 'XP Potion', category: 'CONSUMABLE', price: 3000, description: 'Grants 2x XP for 1 hour.', emoji: '⚗️' },
    { id: 'time_token', name: 'Time Token', category: 'CONSUMABLE', price: 100000, description: 'Reverses a robbery within 5 minutes.', emoji: '⏰' },
    { id: 'heist_kit', name: 'Heist Kit', category: 'EQUIPMENT', price: 10000, description: 'Required to pull a group heist.', emoji: '🧰' },
]

// Get all shop items
router.get('/items', auth, async (req, res) => {
    try {
        const db = getDB()
        const user = await db.collection('users').findOne({ phone: req.user.phone })
        const inventory = user?.inventory || []

        const items = SHOP_ITEMS.map(item => ({
            ...item,
            owned: inventory.includes(item.id)
        }))

        res.json({ items })
    } catch (err) {
        res.status(500).json({ error: 'Server error' })
    }
})

// Buy item
router.post('/buy', auth, async (req, res) => {
    try {
        const { itemId } = req.body
        const item = SHOP_ITEMS.find(i => i.id === itemId)
        if (!item) return res.status(404).json({ error: 'Item not found' })

        const db = getDB()
        const phone = req.user.phone
        const jid = phone + '@s.whatsapp.net'

        const user = await db.collection('users').findOne({ phone })
        const stats = await db.collection('userStats').findOne({ userId: jid })

        const inventory = user?.inventory || []
        if (inventory.includes(itemId))
            return res.status(400).json({ error: 'You already own this item' })

        const wallet = stats?.wallet || 0
        if (wallet < item.price)
            return res.status(400).json({ error: 'Not enough coins' })

        await db.collection('userStats').updateOne(
            { userId: jid },
            { $inc: { wallet: -item.price } }
        )
        await db.collection('users').updateOne(
            { phone },
            { $addToSet: { inventory: itemId } }
        )

        res.json({ success: true, message: `${item.emoji} ${item.name} purchased!` })
    } catch (err) {
        res.status(500).json({ error: 'Server error' })
    }
})

module.exports = router
