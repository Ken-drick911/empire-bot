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
app.use(express.static(path.join(__dirname, 'public')))

app.use('/api/auth', authRoutes)
app.use('/api/profile', profileRoutes)
app.use('/api/shop', shopRoutes)
const leaderboardRoutes = require('./routes/leaderboard')
const uploadRoutes = require('./routes/upload')
app.use('/api/leaderboard', leaderboardRoutes)
app.use('/api/upload', uploadRoutes)

// Pairing endpoint
app.get('/pair', async (req, res) => {
    res.send(`
        <html>
        <body style="background:#111;color:#fff;font-family:sans-serif;padding:40px;text-align:center">
        <h2>⚔️ Empire Bot Pairing</h2>
        <form method="POST" action="/pair">
            <input name="phone" placeholder="2348012345678" style="padding:10px;width:300px;font-size:16px">
            <button type="submit" style="padding:10px 20px;background:#c9a84c;border:none;cursor:pointer;font-size:16px">Get Pairing Code</button>
        </form>
        </body></html>
    `)
})

app.post('/pair', express.urlencoded({ extended: true }), async (req, res) => {
    try {
        const phone = req.body.phone?.replace(/\D/g, '')
        if (!phone) return res.send('❌ No phone number provided')

        const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys')
        const pino = require('pino')
        const { state, saveCreds } = await useMultiFileAuthState('./auth_info_baileys')

        const sock = makeWASocket({
            auth: state,
            logger: pino({ level: 'silent' }),
            printQRInTerminal: false,
            connectTimeoutMs: 60000
        })

        sock.ev.on('creds.update', saveCreds)

        let codeSent = false
        const code = await new Promise((resolve, reject) => {
            sock.ev.on('connection.update', async ({ connection }) => {
                if (connection === 'open' && !codeSent) {
                    codeSent = true
                    try {
                        const c = await sock.requestPairingCode(phone)
                        resolve(c)
                    } catch (e) { reject(e) }
                }
                if (connection === 'close') reject(new Error('Connection closed'))
            })
            // Try requesting before connection too
            setTimeout(async () => {
                if (!codeSent) {
                    try {
                        codeSent = true
                        const c = await sock.requestPairingCode(phone)
                        resolve(c)
                    } catch (e) { reject(e) }
                }
            }, 3000)
            setTimeout(() => reject(new Error('Timeout')), 30000)
        })

        res.send(`
            <html>
            <body style="background:#111;color:#fff;font-family:sans-serif;padding:40px;text-align:center">
            <h2>⚔️ Pairing Code</h2>
            <h1 style="color:#c9a84c;font-size:3rem;letter-spacing:8px">${code}</h1>
            <p>Enter this in WhatsApp → Linked Devices → Link with phone number</p>
            </body></html>
        `)
    } catch (err) {
        res.send('❌ Error: ' + err.message)
    }
})

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
