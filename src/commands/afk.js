const { getUser } = require('../data/db')
const { isOwnerId } = require('../config/owner')
const { classifyReason, getRandomMessage } = require('../config/afkMessages')
const { getToneForUser, getTonePrefix } = require('../config/afkTone')

const afkUsers = new Map()

async function afkCommand(sock, msg, from, sender, args) {
    const reason = args.join(' ').trim() || null
    afkUsers.set(sender, { reason, time: Date.now() })

    const user = await getUser(sender)
    const owner = isOwnerId(sender)
    const tone = getToneForUser(owner, user?.rank)

    const category = classifyReason(reason)
    const notice = getRandomMessage(category, tone)

    const text = `⚜️ 𝗜𝗺𝗽𝗲𝗿𝗶𝗮𝗹 𝗗𝘂𝘁𝘆 𝗖𝗮𝗹𝗹𝘀 𝗥𝗲𝗴𝗶𝘀𝘁𝗲𝗿𝗲𝗱

@${sender.split('@')[0]} is now AFK.

📌 Reason:
${reason || 'Not provided'}

📜 Notice:
${notice}`

    await sock.sendMessage(from, { text, mentions: [sender], quoted: msg })
}

async function checkAfkReturn(sock, msg, from, sender, username) {
    if (afkUsers.has(sender)) {
        const data = afkUsers.get(sender)
        const duration = formatDuration(Date.now() - data.time)
        afkUsers.delete(sender)
        await sock.sendMessage(from, {
            text: `👋 Welcome back ${username}! Your Imperial Duty lasted ${duration}.`,
            quoted: msg
        })
    }
}

async function checkAfkMention(sock, msg, from) {
    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || []
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.participant
    const targets = [...mentioned]
    if (quoted) targets.push(quoted)

    for (const t of targets) {
        if (afkUsers.has(t)) {
            const data = afkUsers.get(t)
            const duration = formatDuration(Date.now() - data.time)
            await sock.sendMessage(from, {
                text: `⚠️ 𝗥𝗼𝘆𝗮𝗹 𝗡𝗼𝘁𝗶𝗰𝗲\n\n@${t.split('@')[0]} is currently on IDC.\n\nReason: ${data.reason || 'Not provided'}\nAway for: ${duration}`,
                mentions: [t]
            })
        }
    }
}

function formatDuration(ms) {
    const minutes = Math.floor(ms / 60000)
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const remMinutes = minutes % 60
    return `${hours}h ${remMinutes}m`
}

module.exports = { afkCommand, checkAfkReturn, checkAfkMention, afkUsers }
