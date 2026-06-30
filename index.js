const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const { useMongoAuthState } = require('./src/engine/mongoAuth')
const pino = require('pino')
const { saveSession, loadSession, getAllGroupSettings } = require('./src/data/db')

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
    groupSettings,
    tagMods
} = require('./src/commands/groupManagement')

// Empire System
const { getUser, createUser } = require('./src/data/db')
const { awardMessageXP } = require('./src/engine/xp')
const { menuCommand, decreeCommand, modMenuCommand } = require('./src/commands/menu')
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
const { reputationListCommand, myReputationCommand } = require('./src/commands/reputation')
const { giveCoinsCommand, banCommand, unbanCommand } = require('./src/commands/ownerCommands')
const { appointCommand, setRankCommand, giveXPCommand, resetUserCommand } = require('./src/commands/ownerCommands2')
const { announceCommand, broadcastCommand, restartCommand, listGroupsCommand } = require('./src/commands/ownerCommands3')
const { isBanned } = require('./src/engine/moderation')
const { OWNER_NUMBER } = require('./src/config/owner')

const WEB_URL = process.env.WEB_URL || 'https://empire-bot-w94m.onrender.com'

const ADMIN_COMMANDS = [
    'kick', 'warn', 'resetwarn', 'setwarn', 'mute', 'unmute', 'promote', 'demote',
    'antilink', 'antispam', 'antism', 'welcome', 'leave', 'setwelcome',
    'setleave', 'tagall', 'tagadmins', 'hidetag', 'open', 'close',
    'delete', 'purge', 'blacklist', 'news', 'groupstats', 'gs', 'active', 'inactive'
]

const OWNER_COMMANDS = [
    'appoint', 'setrep', 'setrank', 'givexp', 'givecoins',
    'resetuser', 'announce', 'broadcast',
    'restart', 'listgroups', 'addmod', 'removemod'
]

// Game commands that require registration
const GAME_COMMANDS = [
    'daily', 'profile', 'p', 'asset', 'deposit', 'dep', 'withdraw', 'wd',
    'give', 'steal', 'top', 'leaderboard', 'lb', 'wealthleaderboard', 'wlb',
    'gr', 'gwlb', 'stats', 'ranks', 'titles', 'reputation', 'rep',
    'myreputation', 'mr', 'decree', 'afk'
]

async function startBot() {
    const { state, saveCreds } = await useMongoAuthState(process.env.MONGO_URI)

    const sock = makeWASocket({
        auth: state,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false
    })

    const savedSettings = await getAllGroupSettings()
    savedSettings.forEach(doc => {
        const { chatId, ...settings } = doc
        Object.entries(settings).forEach(([key, value]) => {
            if (key !== '_id') groupSettings.set(`${key}_${chatId}`, value)
        })
    })
    console.log(`✅ Loaded settings for ${savedSettings.length} groups`)

    sock.ev.on('connection.update', async (u) => {
        const { connection, lastDisconnect } = u
        if (connection === 'close') {
            const code = lastDisconnect?.error?.output?.statusCode
            if (code === DisconnectReason.loggedOut) {
                console.log('❌ Logged out. Visit /pair to re-pair.')
            } else if (code !== 401) {
                setTimeout(startBot, 10000)
            }
        }
        if (connection === 'open') console.log('✅ Empire Bot connected!')
    })

    sock.ev.on('creds.update', async () => {
        saveCreds()
        await saveSession(JSON.stringify(state))
    })

    async function isUserAdmin(chatId, userId) {
        try {
            const meta = await sock.groupMetadata(chatId)
            const participant = meta.participants.find(p => p.id === userId)
            return participant?.admin === 'admin' || participant?.admin === 'superadmin'
        } catch {
            return false
        }
    }

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
        const pushName = msg.pushName || sender.split('@')[0] // WhatsApp display name (management only)
        const isGroup = from.endsWith('@g.us')

        const hasRealContent = !!(msg.message.conversation || msg.message.extendedTextMessage?.text || msg.message.imageMessage || msg.message.videoMessage || msg.message.stickerMessage)
        if (!hasRealContent) return

        // Create user if not exists (uses pushName temporarily)
        await createUser(sender, pushName)

        // Fetch user from DB
        const user = await getUser(sender)

        // Use registered username for games, pushName for management
        const username = user?.username || pushName

        if (await isBanned(sender)) return

        if (!isGroup && sender !== OWNER_NUMBER) return

        if (text.toLowerCase() === '.ping') {
            await sock.sendMessage(from, { text: 'Arthur is live...👑', quoted: msg })
            return
        }

        if (text.toLowerCase() === '.test') {
            await sock.sendMessage(from, { text: 'Testing....\nArthur is live...👑', quoted: msg })
            return
        }

        if (isGroup) {
            const isMuted = await checkIfMuted(sock, msg, mutedUsers)
            if (isMuted) {
                await deleteMutedMessage(sock, msg)
                return
            }

            await handleAntiSpam(sock, msg, { warnings, groupSettings, isUserAdmin })
            await antiLinkHandler(sock, msg, { groupSettings, warnings, isUserAdmin, mutedUsers })

            if (!text.startsWith('.')) {
                const result = await awardMessageXP(sender, username)
                if (result?.leveled) {
                    await sock.sendMessage(from, {
                        text: `⚔️ *${username}* leveled up to *${result.newRank} Lv.${result.newLevel}*!\n🎖️ Title: ${result.newTitle}`,
                        mentions: [sender]
                    })
                }
            }
        }

        await checkAfkMention(sock, msg, from)

        if (!text.startsWith('.')) {
            await checkAfkReturn(sock, msg, from, sender, username)
        }

        if (text.startsWith('.')) {
            const [command, ...args] = text.slice(1).trim().split(' ')
            const cmd = command.toLowerCase()
            const isAdmin = isGroup ? await isUserAdmin(from, sender) : false
            const owner = isOwner(sender)

            // Registration gate for game commands
            if (GAME_COMMANDS.includes(cmd) && !owner) {
                if (!user?.registered) {
                    await sock.sendMessage(from, {
                        text: `⚔️ *${pushName}*, you need to register first!\n\n🏰 Create your empire account to access games, XP, gold and more.\n\n🔗 *Register here:*\n${WEB_URL}\n\n_Use the REGISTER tab on the site_`,
                        quoted: msg
                    })
                    return
                }
            }

            if (OWNER_COMMANDS.includes(cmd)) {
                const isMod = await isModerator(sender)
                const modAllowed = ['announce', 'broadcast', 'listgroups', 'tagall']
                if (!owner && !isMod) {
                    await sock.sendMessage(from, { text: '👑 Only the Emperor can use this command.', quoted: msg })
                    return
                }
                if (!owner && isMod && !modAllowed.includes(cmd)) {
                    await sock.sendMessage(from, { text: '👑 Only the Emperor can use this command.', quoted: msg })
                    return
                }
                if (cmd === 'addmod') { await addModCommand(sock, msg, from, args); return }
                if (cmd === 'removemod') { await removeModCommand(sock, msg, from, args); return }
                if (cmd === 'givecoins') { await giveCoinsCommand(sock, msg, from, args); return }
                return
            }

            if (cmd === 'ban' || cmd === 'unban') {
                if (!owner && !(await isModerator(sender))) {
                    await sock.sendMessage(from, { text: '👑 Only the Emperor or Moderators can use this command.', quoted: msg })
                    return
                }
                if (cmd === 'ban') await banCommand(sock, msg, from, args)
                else await unbanCommand(sock, msg, from, args)
                return
            }

            if (ADMIN_COMMANDS.includes(cmd)) {
                if (!isAdmin && !owner && !(await isModerator(sender))) {
                    await sock.sendMessage(from, { text: '🛡️ Only admins can use this command.', quoted: msg })
                    return
                }
                await handleGroupCommands(sock, msg, cmd, args, { groupSettings, warnings, mutedUsers, isUserAdmin })
                return
            }

            const noCooldownCommands = ['daily', 'steal']
            if (!noCooldownCommands.includes(cmd)) {
                if (isOnCooldown(sender, cmd)) {
                    const remaining = getRemainingTime(sender, cmd)
                    await sock.sendMessage(from, { text: `⏳ Slow down! Try again in ${remaining}s.`, quoted: msg })
                    return
                }
                setCooldown(sender, cmd)
            }

            switch (cmd) {
                case 'menu':
                case 'm':
                    await menuCommand(sock, msg, from, username)
                    break
                case 'decree':
                    await decreeCommand(sock, msg, from, sender, username)
                    break
                case 'modmenu':
                    if (!owner && !(await isModerator(sender))) return sock.sendMessage(from, { text: '❌ Moderators only.', quoted: msg })
                    await modMenuCommand(sock, msg, from, username)
                    break
                case 'appoint':
                    if (!owner) return sock.sendMessage(from, { text: '❌ Owner only.', quoted: msg })
                    await appointCommand(sock, msg, from, args)
                    break
                case 'setrank':
                    if (!owner) return sock.sendMessage(from, { text: '❌ Owner only.', quoted: msg })
                    await setRankCommand(sock, msg, from, args)
                    break
                case 'givexp':
                    if (!owner) return sock.sendMessage(from, { text: '❌ Owner only.', quoted: msg })
                    await giveXPCommand(sock, msg, from, args)
                    break
                case 'resetuser':
                    if (!owner && !(await isModerator(sender))) return sock.sendMessage(from, { text: '❌ Owner/Mod only.', quoted: msg })
                    await resetUserCommand(sock, msg, from, args)
                    break
                case 'announce':
                    if (!owner && !(await isModerator(sender))) return sock.sendMessage(from, { text: '❌ Owner/Mod only.', quoted: msg })
                    await announceCommand(sock, msg, from, args)
                    break
                case 'broadcast':
                    if (!owner && !(await isModerator(sender))) return sock.sendMessage(from, { text: '❌ Owner/Mod only.', quoted: msg })
                    await broadcastCommand(sock, msg, from, args)
                    break
                case 'restart':
                    if (!owner) return sock.sendMessage(from, { text: '❌ Owner only.', quoted: msg })
                    await restartCommand(sock, msg, from)
                    break
                case 'listgroups':
                    if (!owner && !(await isModerator(sender))) return sock.sendMessage(from, { text: '❌ Owner/Mod only.', quoted: msg })
                    await listGroupsCommand(sock, msg, from)
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
                case 'reputation':
                case 'rep':
                    await reputationListCommand(sock, msg, from)
                    break
                case 'myreputation':
                case 'mr':
                    await myReputationCommand(sock, msg, from, sender, username)
                    break
                case 'reg':
                    await sock.sendMessage(from, {
                        text: `🏰 *EMPIRE PORTAL*\n\nRegister or login to access your profile, games, XP and economy!\n\n🔗 *${WEB_URL}*\n\n_Tap REGISTER if you're new, or LOGIN if you've registered before_`,
                        quoted: msg
                    })
                    break
                case 'shop':
                    await sock.sendMessage(from, {
                        text: `⚔️ *IMPERIAL SHOP*\n\nVisit the shop to buy items with your Gold!\n\n🔗 *${WEB_URL}*`,
                        quoted: msg
                    })
                    break
                case 'mods':
                    await tagMods(sock, msg, from, args)
                    break
                default:
                    break
            }
        }
    })
    sock.ev.on('groups.upsert', async (groups) => {
    const db = require('./src/data/db')
    for (const g of groups) {
        await global._db?.collection('groups').updateOne(
            { groupId: g.id },
            { $set: { groupId: g.id, name: g.subject, updatedAt: new Date() } },
            { upsert: true }
        )
    }
})

    sock.ev.on('group-participants.update', async (update) => {
        const { id, participants, action } = update
        if (action === 'add' || action === 'remove') {
            await sendGroupMessage(sock, id, participants, action, groupSettings)
        }
    })
}

startBot()
require('./web/server.js')
