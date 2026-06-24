require('dotenv').config()
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys')
const { saveSession } = require('./src/data/db')
const path = require('path')
const readline = require('readline')

const AUTH_FOLDER = path.join(__dirname, 'auth_info_baileys')

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const question = (t) => new Promise((r) => rl.question(t, r))

async function pair() {
    const { state, saveCreds } = await useMultiFileAuthState(AUTH_FOLDER)

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        connectTimeoutMs: 120000,
        defaultQueryTimeoutMs: 120000,
        keepAliveIntervalMs: 10000,
    })

    sock.ev.on('creds.update', async () => {
        saveCreds()
        await saveSession(JSON.stringify(state))
        console.log('✅ Session saved to MongoDB')
    })

    if (!sock.authState.creds.registered) {
        rl.question('Enter your WhatsApp number (e.g. 2348012345678): ', async (number) => {
            rl.close()
            const code = await sock.requestPairingCode(number.trim())
            console.log(`\n✅ Your pairing code: ${code}\n`)
            console.log('Enter this in WhatsApp → Linked Devices → Link with phone number')
        })
    }

    sock.ev.on('connection.update', ({ connection, lastDisconnect }) => {
        if (connection === 'open') {
            console.log('\n✅ Paired successfully! Session saved to MongoDB.')
            console.log('You can now stop this script and deploy to Railway.')
            process.exit(0)
        }
        if (connection === 'close') {
            const code = lastDisconnect?.error?.output?.statusCode
            if (code === DisconnectReason.loggedOut) {
                console.log('Logged out.')
                process.exit(1)
            } else {
                console.log('Reconnecting in 3s...')
                setTimeout(pair, 3000)
            }
        }
    })
}

pair()
