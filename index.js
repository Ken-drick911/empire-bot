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
} = require('./src/commands/groupManagement')

// Empire System
const { getUser, createUser } = require('./src/data/db')
const { awardMessageXP } = require('./src/engine/xp')
const { menuCommand } = require('./src/commands/menu')
const { dailyCommand } = require('./src/commands/daily')
const { profileCommand } = require('./src/commands/profile')
const { assetCommand } = require('./src/commands/asset')
const { depositCommand, withdrawCommand, giveCommand } = require('./src/commands/economy')
const { stealCommand } = require('./src/commands/steal')
const { leaderboardCommand, wealthLeaderboardCommand } = require('./src/commands/leaderboard')
const { setpicCommand } = require('./src/commands/setpic')
const { statsCommand } = require('./src/commands/stats')
const { ranksCommand, titlesCommand } = require('./src/commands/info')
const { afkCommand, checkAfkReturn, checkAfkMention } = require('./src/commands/afk')
const { activeCommand, inactiveCommand } = require('./src/commands/activity')
const { isOnCooldown, getRemainingTime, setCooldown } = require('./src/engine/cooldown')
const { addModCommand, removeModCommand, isModerator } = require('./src/commands/moderator')
const { globalRankCommand, globalWealthCommand } = require('./src/commands/globalLeaderboard')

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const question = (t) => new Promise((r) => rl.question(t, r))

// Admin commands list
const ADMIN_COMMANDS = [
    'kick', 'warn', 'mute', 'unmute', 'promote', 'demote',
    'antilink', 'antispam', 'antism', 'welcome', 'leave', 'setwelcome',
    'setleave', 'tagall', 'tagadmins', 'hidetag', 'open', 'close',
    'delete', 'purge', 'blacklist', 'resetwarn', 'news', 'groupstats', 'gs'
]

// Owner commands list
const OWNER_COMMANDS = [
    'appoint', 'setrep', 'setrank', 'givexp', 'givecoins',
    'resetuser', 'ban', 'unban', 'announce', 'broadcast',
    'restart', 'listgroups', 'addmod', 'removemod'
]

// Your WhatsApp number (owner)
const OWNER_NUMBER = '204926412185650@lid'

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
    async function isUserAdmin(chatId, userId) {
        try {
            const meta = await sock.groupMetadata(chatId)
            const participant = meta.participants.find(p => p.id === userId)
            return participant?.admin === 'admin' || participant?.admin === 'superadmin'
        } catch {
            return false
        }
    }

    // Check if user is owner
    function isOwner(sender) {
        return sender === OWNER_NUMBER
    }

    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return
        const msg = messages[0]
        if (!msg.message) return

        const from = msg.key.remoteJid
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || ''
        const sender = msg.key.participant || msg.key.remoteJid
        console.log('SENDER:', sender)
console.log('OWNER:', OWNER_NUMBER)
        const username = msg.pushName || sender.split('@')[0]
        const isGroup = from.endsWith('@g.us')

        // Create user if new
        createUser(sender, username)
        // DM restriction - only owner can use bot in DM
if (!isGroup && sender !== OWNER_NUMBER) {
    return
}

        // ---- Ping ----
if (text.toLowerCase() === '.ping') {
    await sock.sendMessage(from, { text: 'Arthur is live...👑' }, { quoted: msg })
    return
}

// ---- Test ----
if (text.toLowerCase() === '.test') {
    await sock.sendMessage(from, { text: 'Testing....' }, { quoted: msg })
    await sock.sendMessage(from, { text: 'Arthur is live...👑' }, { quoted: msg })
    return
}

        // ---- Group only logic ----
        if (isGroup) {

            // Mute check
            const isMuted = await checkIfMuted(sock, msg, mutedUsers)
            if (isMuted) {
                await deleteMutedMessage(sock, msg)
                return
            }

            // Anti-spam
            await handleAntiSpam(sock, msg, { warnings, groupSettings, isUserAdmin })

            // Anti-link
            await antiLinkHandler(sock, msg, {
                groupSettings,
                warnings,
                isUserAdmin,
                mutedUsers
            })

            // Award XP for messages
            if (!text.startsWith('.')) {
                const result = awardMessageXP(sender, username)
                if (result?.leveled) {
                    await sock.sendMessage(from, {
                        text: `⚔️ @${username} leveled up to *${result.newRank} Lv.${result.newLevel}*!\n🎖️ Title: ${result.newTitle}`,
                        mentions: [sender]
                    })
                }
            }
        }
        // AFK check - mention someone AFK
        await checkAfkMention(sock, msg, from)

        // AFK check - user returns from AFK
        if (!text.startsWith('.')) {
            await checkAfkReturn(sock, msg, from, sender, username)
        }

        // ---- Commands ----
        if (text.startsWith('.')) {
            const [command, ...args] = text.slice(1).trim().split(' ')
            const cmd = command.toLowerCase()
            const isAdmin = isGroup ? await isUserAdmin(from, sender) : false
            const owner = isOwner(sender)

            // Owner only commands
            if (OWNER_COMMANDS.includes(cmd)) {
                if (!owner) {
                    await sock.sendMessage(from, { text: '👑 Only the Emperor can use this command.', quoted: msg })
                    return
                }
                if (cmd === 'addmod') {
                    await addModCommand(sock, msg, from, args)
                    return
                }
                if (cmd === 'removemod') {
                    await removeModCommand(sock, msg, from, args)
                    return
                }
                return
            }

            // Admin only commands
            if (!isAdmin && !owner && !isModerator(sender)) {
                if (!isAdmin && !owner) {
                    await sock.sendMessage(from, { text: '🛡️ Only admins can use this command.', quoted: msg })
                    return
                }
                await handleGroupCommands(sock, msg, cmd, args, {
                    groupSettings,
                    warnings,
                    mutedUsers,
                    isUserAdmin
                })
                return
            }
// Cooldown check (excludes commands with their own cooldown system)
            const noCooldownCommands = ['daily', 'steal']
            if (!noCooldownCommands.includes(cmd)) {
                if (isOnCooldown(sender, cmd)) {
                    const remaining = getRemainingTime(sender, cmd)
                    await sock.sendMessage(from, { text: `⏳ Slow down! Try again in ${remaining}s.`, quoted: msg })
                    return
                }
                setCooldown(sender, cmd)
            }

            // Everyone commands
            switch (cmd) {
                case 'menu':
case 'm':
    await menuCommand(sock, msg, from, username)
    break
                case 'daily':
                    await dailyCommand(sock, msg, from, sender, username)
                    break
                    case 'profile':
case 'p':
    await profileCommand(sock, msg, from, sender, username)
    break
case 'asset':
    await assetCommand(sock, msg, from, sender)
    break
case 'deposit':
case 'dep':
    await depositCommand(sock, msg, from, sender, args)
    break
case 'withdraw':
case 'wd':
    await withdrawCommand(sock, msg, from, sender, args)
    break
case 'give':
    await giveCommand(sock, msg, from, sender, args)
    break
case 'steal':
    await stealCommand(sock, msg, from, sender, args)
    break
                    case 'top':
case 'leaderboard':
case 'lb':
    await leaderboardCommand(sock, msg, from)
    break
case 'wealthleaderboard':
case 'wlb':
    await wealthLeaderboardCommand(sock, msg, from)
    break
                    case 'gr':
    await globalRankCommand(sock, msg, from)
    break
case 'gwlb':
    await globalWealthCommand(sock, msg, from)
    break
                    case 'setpic':
    await setpicCommand(sock, msg, from, sender)
    break
                    case 'stats':
    await statsCommand(sock, msg, from, sender)
    break
                    case 'ranks':
    await ranksCommand(sock, msg, from)
    break
case 'titles':
    await titlesCommand(sock, msg, from)
    break
                    case 'afk':
    await afkCommand(sock, msg, from, sender, args)
    break
                    case 'active':
    await activeCommand(sock, msg, from)
    break
case 'inactive':
    await inactiveCommand(sock, msg, from)
    break
                default:
                    break
            }
        }
    })

    // Welcome / Leave messages
    sock.ev.on('group-participants.update', async (update) => {
        const { id, participants, action } = update
        if (action === 'add' || action === 'remove') {
            await sendGroupMessage(sock, id, participants, action)
        }
    })
}

startBot()
