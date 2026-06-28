const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const getDB = () => global._db

const JWT_SECRET = process.env.JWT_SECRET || 'empire_secret_key'

// Register
router.post('/register', async (req, res) => {
  try {
    const { phone, password, username } = req.body
    if (!phone || !password || !username)
      return res.status(400).json({ error: 'All fields required' })

    const db = getDB()
    const cleanPhone = phone.replace(/\D/g, '')

    // Check if already registered on web
    const existingWeb = await db.collection('users').findOne({ phone: cleanPhone, password: { $exists: true } })
    if (existingWeb)
      return res.status(400).json({ error: 'Phone already registered' })

    const hashed = await bcrypt.hash(password, 10)

    // Check if user already exists in bot DB (by phone in LID or JID)
    const botUser = await db.collection('users').findOne({
      $or: [
        { id: cleanPhone + '@s.whatsapp.net' },
        { id: { $regex: cleanPhone } },
        { phone: cleanPhone }
      ]
    })

    if (botUser) {
      // Link web account to existing bot user
      await db.collection('users').updateOne(
        { _id: botUser._id },
        {
          $set: {
            phone: cleanPhone,
            password: hashed,
            username,
            registered: true,
            registeredAt: new Date(),
            frame: 'classic',
            inventory: []
          }
        }
      )
    } else {
      // Brand new user — create fresh
      await db.collection('users').insertOne({
        phone: cleanPhone,
        password: hashed,
        username,
        registered: true,
        registeredAt: new Date(),
        xp: 0,
        level: 1,
        rank: 'Peasant',
        wallet: 0,
        vault: 0,
        diamonds: 0,
        title: '',
        frame: 'classic',
        inventory: [],
        createdAt: new Date()
      })
    }

    res.json({ success: true, message: 'Registered successfully' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

// Login
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body
    const db = getDB()
    const cleanPhone = phone.replace(/\D/g, '')

    const user = await db.collection('users').findOne({
      phone: cleanPhone,
      password: { $exists: true }
    })
    if (!user)
      return res.status(400).json({ error: 'Phone not registered' })

    const match = await bcrypt.compare(password, user.password)
    if (!match)
      return res.status(400).json({ error: 'Wrong password' })

    const token = jwt.sign({ phone: cleanPhone }, JWT_SECRET, { expiresIn: '7d' })
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'none',
      secure: true
    })
    res.json({ success: true, username: user.username })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie('token')
  res.json({ success: true })
})

module.exports = router
