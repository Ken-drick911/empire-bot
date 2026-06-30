const express = require('express')
const router = express.Router()
const getDB = () => global._db

const ADMIN_KEY = process.env.ADMIN_KEY || 'changeme123'

router.get('/merge-duplicates', async (req, res) => {
  try {
    if (req.query.key !== ADMIN_KEY) {
      return res.status(403).json({ error: 'Unauthorized' })
    }

    const db = getDB()
    const users = db.collection('users')

    const webUsers = await users.find({ phone: { $exists: true }, password: { $exists: true } }).toArray()

    let merged = []
    let skipped = 0

    for (const webUser of webUsers) {
      const phone = webUser.phone

      const botDoc = await users.findOne({
        _id: { $ne: webUser._id },
        $or: [
          { id: phone + '@s.whatsapp.net' },
          { id: { $regex: phone } }
        ]
      })

      if (!botDoc) {
        skipped++
        continue
      }

      const mergeFields = {
        id: botDoc.id,
        rank: botDoc.rank || webUser.rank || 'Peasant',
        level: botDoc.level || webUser.level || 1,
        xp: botDoc.xp || webUser.xp || 0,
        xpToNext: botDoc.xpToNext || webUser.xpToNext || 100,
        title: botDoc.title || webUser.title || 'Village Hand',
        reputation: botDoc.reputation || webUser.reputation || null,
        wallet: botDoc.wallet || webUser.wallet || 0,
        vault: botDoc.vault || webUser.vault || 0,
        vaultCap: botDoc.vaultCap || webUser.vaultCap || 5000,
        streak: botDoc.streak || webUser.streak || 0,
        totalMessages: botDoc.totalMessages || webUser.totalMessages || 0,
        recentMessages: botDoc.recentMessages || webUser.recentMessages || 0,
        lastMessage: botDoc.lastMessage || webUser.lastMessage || null,
        lastDaily: botDoc.lastDaily || webUser.lastDaily || null,
        lastSteal: botDoc.lastSteal || webUser.lastSteal || null,
        lastStolenFrom: botDoc.lastStolenFrom || webUser.lastStolenFrom || null,
        timesRobbed: botDoc.timesRobbed || webUser.timesRobbed || 0,
        timesStolen: botDoc.timesStolen || webUser.timesStolen || 0,
        authority: botDoc.authority || webUser.authority || null,
        isMod: botDoc.isMod || webUser.isMod || false,
        joinDate: botDoc.joinDate || webUser.joinDate || new Date().toISOString()
      }

      await users.updateOne({ _id: webUser._id }, { $set: mergeFields })
      await users.deleteOne({ _id: botDoc._id })

      merged.push({ username: webUser.username, phone, botId: botDoc.id })
    }

    res.json({ success: true, mergedCount: merged.length, skipped, merged })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/check-user', async (req, res) => {
  try {
    if (req.query.key !== ADMIN_KEY) {
      return res.status(403).json({ error: 'Unauthorized' })
    }
    const db = getDB()
    const phone = req.query.phone
    const user = await db.collection('users').findOne({ phone })
    res.json(user)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
