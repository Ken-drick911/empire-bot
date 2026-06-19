const { getUser, updateUser } = require('../data/db')

const afkUsers = new Map()

async function afkCommand(sock, msg, from, sender, args) {
    const reason = args.join(' ') || 'No reason given'
    afkUsers.set(sender, { reason, time: Date.now() })

    await sock.sendMessage(from, {
        text: `💤 You're now AFK: ${reason}`,
        quoted: msg
    })
}

async function checkAfkReturn(sock, msg, from, sender, username) {
    if (afkUsers.has(sender)) {
        const data = afkUsers.get(sender)
        const duration = Math.floor((Date.now() - data.time) / 60000)
        afkUsers.delete(sender)
        await sock.sendMessage(from, {
            text: `👋 Welcome back ${username}! You were AFK for ${duration} minute(s).`,
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
            const duration = Math.floor((Date.now() - data.time) / 60000)
            await sock.sendMessage(from, {
                text: `💤 @${t.split('@')[0]} is AFK: ${data.reason} (${duration}m ago)`,
                mentions: [t]
            })
        }
    }
}

module.exports = { afkCommand, checkAfkReturn, checkAfkMention, afkUsers }
