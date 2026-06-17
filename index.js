const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys')
const pino = require('pino')
const readline = require('readline')

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const question = (t) => new Promise((r) => rl.question(t, r))

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info')
    const sock = makeWASocket({
        auth: state,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false
    })
    if (!sock.authState.creds.registered) {
        const num = await question('Enter your WhatsApp number with country code: ')
        const code = await sock.requestPairingCode(num.trim())
        console.log('Your pairing code: ' + code)
    }
    sock.ev.on('connection.update', async (u) => {
        const { connection, lastDisconnect } = u
        if (connection === 'close') {
            const r = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut
            if (r) startBot()
        }
        if (connection === 'open') console.log('✅ Bot connected!')
    })
    sock.ev.on('creds.update', saveCreds)
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return
        const msg = messages[0]
        if (!msg.message) return
        const from = msg.key.remoteJid
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || ''
        if (text.toLowerCase() === '.ping') {
            await sock.sendMessage(from, { text: '👑 Pong! Empire Bot is online.' }, { quoted: msg })
        }
    })
}

startBot()
