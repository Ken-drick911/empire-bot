require('dotenv').config()
const express = require('express')
const cookieParser = require('cookie-parser')
const path = require('path')
const { MongoClient } = require('mongodb')

const authRoutes = require('./routes/auth')
const profileRoutes = require('./routes/profile')
const shopRoutes = require('./routes/shop')

const app = express()
const PORT = process.env.PORT || process.env.WEB_PORT || 3000

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, '../frontend/dist')))
app.use('/api/auth', authRoutes)
app.use('/api/profile', profileRoutes)
app.use('/api/shop', shopRoutes)
const leaderboardRoutes = require('./routes/leaderboard')
const uploadRoutes = require('./routes/upload')
const statsRoutes = require('./routes/stats')
app.use('/api/leaderboard', leaderboardRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/stats', statsRoutes)

// Pairing endpoint
let pairingSock = null

app.get('/pair', (req, res) => {
    res.send(`
        <html>
        <head><title>Empire Pairing</title></head>
        <body style="background:#111;color:#fff;font-family:sans-serif;padding:40px;text-align:center">
        <h2>⚔️ Empire Bot Pairing</h2>
        <form method="POST" action="/pair">
            <input name="phone" placeholder="2348012345678" style="padding:12px;width:300px;font-size:16px;background:#1a1a1a;color:#fff;border:1px solid #c9a84c;border-radius:8px"><br><br>
            <button type="submit" style="padding:12px 32px;background:#c9a84c;border:none;cursor:pointer;font-size:16px;font-weight:bold;border-radius:8px">Get Pairing Code</button>
        </form>
        </body></html>
    `)
})

app.post('/pair', express.urlencoded({ extended: true }), async (req, res) => {
    try {
        const phone = req.body.phone?.replace(/\D/g, '')
        if (!phone) return res.send('❌ No phone number')

        const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys')
        const pino = require('pino')

        if (pairingSock) {
            try { pairingSock.end() } catch {}
            pairingSock = null
        }

        const { state, saveCreds } = await useMultiFileAuthState('./auth_info_baileys')
        pairingSock = makeWASocket({
            auth: state,
            logger: pino({ level: 'silent' }),
            printQRInTerminal: false,
            connectTimeoutMs: 60000,
            defaultQueryTimeoutMs: 60000
        })

        pairingSock.ev.on('creds.update', saveCreds)

        const code = await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error('Timeout - try again')), 15000)
            
            pairingSock.ev.on('connection.update', async ({ connection }) => {
                if (connection === 'open') {
                    clearTimeout(timeout)
                    try {
                        const c = await pairingSock.requestPairingCode(phone)
                        resolve(c)
                    } catch(e) { reject(e) }
                }
                if (connection === 'close') {
                    clearTimeout(timeout)
                    reject(new Error('Connection closed - WhatsApp may have flagged. Wait 10 mins and retry.'))
                }
            })
        })

        res.send(`
            <html>
            <body style="background:#111;color:#fff;font-family:sans-serif;padding:40px;text-align:center">
            <h2>⚔️ Your Pairing Code</h2>
            <h1 style="color:#c9a84c;font-size:3rem;letter-spacing:8px;background:#1a1a1a;padding:20px;border-radius:12px">${code}</h1>
            <p>Enter this in WhatsApp → Linked Devices → Link with phone number</p>
            <p style="color:#888">Code expires in ~60 seconds</p>
            </body></html>
        `)
    } catch (err) {
        res.send(`
            <html>
            <body style="background:#111;color:#fff;font-family:sans-serif;padding:40px;text-align:center">
            <h2>❌ Error</h2>
            <p style="color:#f55">${err.message}</p>
            <a href="/pair" style="color:#c9a84c">Try again</a>
            </body></html>
        `)
    }
})

// Serve frontend
app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) return res.status(404).json({ error: 'Not found' })
    res.sendFile(path.join(__dirname, '..', 'frontend', 'dist', 'index.html'))
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
