require('dotenv').config()
const { useMongoAuthState } = require('./src/engine/mongoAuth')
const readline = require('readline')

async function pair() {
    const { default: makeWASocket } = await import('@whiskeysockets/baileys')
    const pino = require('pino')

    const { state, saveCreds } = await useMongoAuthState(process.env.MONGO_URI)

    const sock = makeWASocket({
        auth: state,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false
    })

    sock.ev.on('creds.update', saveCreds)

    sock.ev.on('connection.update', async ({ connection }) => {
        if (connection === 'open') {
            console.log('✅ Paired and saved to MongoDB! You can now deploy anywhere.')
            process.exit(0)
        }
        if (connection === 'close') {
            console.log('❌ Connection closed - try again')
            process.exit(1)
        }
    })

    const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
    rl.question('Enter your phone number (e.g. 2348012345678): ', async (phone) => {
        rl.close()
        const code = await sock.requestPairingCode(phone.replace(/\D/g, ''))
        console.log(`\n📲 Your pairing code: ${code}\n`)
        console.log('Enter this in WhatsApp → Linked Devices → Link with phone number')
    })
}

pair()
