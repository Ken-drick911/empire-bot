require('dotenv').config()
const express = require('express')
const cookieParser = require('cookie-parser')
const path = require('path')
const { connectDB } = require('../src/data/db')

const authRoutes = require('./routes/auth')
const profileRoutes = require('./routes/profile')
const shopRoutes = require('./routes/shop')

const app = express()
const PORT = process.env.WEB_PORT || 3000

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.use('/api/auth', authRoutes)
app.use('/api/profile', profileRoutes)
app.use('/api/shop', shopRoutes)

// Serve frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`🌐 Empire Web running on port ${PORT}`)
    })
})

module.exports = app
