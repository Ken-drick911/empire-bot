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
        const existing = await db.collection('users').findOne({ phone })
        if (existing)
            return res.status(400).json({ error: 'Phone already registered' })

        const hashed = await bcrypt.hash(password, 10)
        await db.collection('users').insertOne({
            phone,
            password: hashed,
            username,
            createdAt: new Date()
        })

        res.json({ success: true, message: 'Registered successfully' })
    } catch (err) {
        res.status(500).json({ error: 'Server error' })
    }
})

// Login
router.post('/login', async (req, res) => {
    try {
        const { phone, password } = req.body
        const db = getDB()
        const user = await db.collection('users').findOne({ phone })
        if (!user)
            return res.status(400).json({ error: 'Phone not registered' })

        const match = await bcrypt.compare(password, user.password)
        if (!match)
            return res.status(400).json({ error: 'Wrong password' })

        const token = jwt.sign({ phone: user.phone }, JWT_SECRET, { expiresIn: '7d' })
        res.cookie('token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000, sameSite: 'none', secure: true })
        res.json({ success: true, username: user.username })
    } catch (err) {
        res.status(500).json({ error: 'Server error' })
    }
})

// Logout
router.post('/logout', (req, res) => {
    res.clearCookie('empire_token')
    res.json({ success: true })
})

module.exports = router
