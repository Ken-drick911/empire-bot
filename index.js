const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys')
const pino = require('pino')
const readline = require('readline')

// Import group management features
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

    // Helper: Check if a user is admin
    async function isUserAdmin(chatId, userId) {
        try {
            const groupMetadata = await sock.groupMetadata(chatId)
            const participant = groupMetadata.participants.find(p => p.id === userId)
            return participant?.admin === 'admin' || participant?.admin === 'superadmin'
        } catch {
            return false
        }
    }

    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return
        const msg = messages[0]
        if (!msg.message) return

        const from = msg.key.remoteJid
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || ''
        const sender = msg.key.participant || msg.key.remoteJid
        const isGroup = from.endsWith('@g.us')

        // 1. Ping command (always works)
        if (text.toLowerCase() === '.ping') {
            await sock.sendMessage(from, { text: '👑 Pong! Empire Bot is online.' }, { quoted: msg })
            return
        }

        // ---- Group-only logic ----
        if (isGroup) {
            // 2. Mute check
            const isMuted = await checkIfMuted(sock, msg, mutedUsers)
            if (isMuted) {
                await deleteMutedMessage(sock, msg)
                return
            }

            // 3. Anti-spam
            await handleAntiSpam(sock, msg, { warnings, groupSettings, isUserAdmin })

            // 4. Anti-link
            await antiLinkHandler(sock, msg, {
                groupSettings,
                warnings,
                isUserAdmin,
                handleGroupCommands,
                mutedUsers
            })

            // 5. Admin-only commands
            if (text.startsWith('.')) {
                const [command, ...args] = text.slice(1).split(' ')
                const isAdmin = await isUserAdmin(from, sender)

                if (!isAdmin) {
                    await sock.sendMessage(from, {
                        text: '❌ Only admins can use commands!',
                        quoted: msg
                    })
                    return
                }

                await handleGroupCommands(sock, msg, command.toLowerCase(), args, {
                    groupSettings,
                    warnings,
                    mutedUsers,
                    isUserAdmin
                })
            }
        }
    })

    // 6. Welcome / Leave messages
    sock.ev.on('group-participants.update', async (update) => {
        const { id, participants, action } = update
        if (action === 'add' || action === 'remove') {
            await sendGroupMessage(sock, id, participants, action)
        }
    })
}

startBot()
