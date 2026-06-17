const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys')
const pino = require('pino')
const readline = require('readline')

// Group Management
const {
    handleGroupCommands,
    antiLinkHandler,
    handleAntiSpam,
    checkIfMuted,
    deleteMutedMessage,
    sendGroupMessage,
    mutedUsers,
    warnings,
    groupSettings
} = require('./groupManagement')

// Empire System
const { getUser, createUser } = require('./src/data/db')
const { awardMessageXP } = require('./src/engine/xp')
const { menuCommand } = require('./src/commands/menu')

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const question = (t) => new Promise((r) => rl.question(t, r))

// Admin commands list
const ADMIN_COMMANDS = [
    'kick', 'warn', 'mute', 'unmute', 'promote', 'demote',
    'antilink', 'antispam', 'welcome', 'leave', 'setwelcome',
    'setleave', 'tagall', 'tagadmins', 'hidetag', 'open', 'close',
    'delete', 'purge', 'blacklist', 'resetwarn', 'news'
]

// Owner commands list
const OWNER_COMMANDS = [
    'appoint', 'setrep', 'setrank', 'givexp', 'givecoins',
    'resetuser', 'ban', 'unban', 'announce', 'broadcast',
    'restart', 'listgroups'
]

// Your WhatsApp number (owner)
const OWNER_NUMBER = 'YOUR_NUMBER_HERE@s.whatsapp.net'

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
        if (connection === 'open') console.log('✅ Empire Bot connected!')
    })

    sock.ev.on('creds.update', saveCreds)

    // Check if user is group admin
