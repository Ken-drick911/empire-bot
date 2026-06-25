require('dotenv').config()
const express = require('express')
const cookieParser = require('cookie-parser')
const path = require('path')
const { MongoClient } = require('mongodb')

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
const leaderboardRoutes = require('./routes/leaderboard')
const uploadRoutes = require('./routes/upload')
app.use('/api/leaderboard', leaderboardRoutes)
app.use('/api/upload', uploadRoutes)

// Serve frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

async function startWeb() {
    if (!global._db) {
        const client = new MongoClient(process.env.MONGO_URI)
        await client.connect()
        global._db = client.db('empireBot')
    }
    app.listen(PORT, () => {
        console.log(`🌐 Empire Web running on port ${PORT}`)
    })
}

startWeb()

module.exports = app
