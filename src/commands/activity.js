const { getAllUsers } = require('../data/db')

const FIVE_DAYS_MS = 5 * 24 * 60 * 60 * 1000

async function activeCommand(sock, msg, from) {
    const allUsers = Object.values(getAllUsers())
    const now = Date.now()

    const active = allUsers.filter(u => {
        if (!u.lastMessage) return false
        const diff = now - new Date(u.lastMessage).getTime()
        return diff <= FIVE_DAYS_MS
    })

    if (!active.length) {
        await sock.sendMessage(from, { text: '❌ No active members found in the past 5 days.', quoted: msg })
        return
    }

    const list = active
        .sort((a, b) => new Date(b.lastMessage) - new Date(a.lastMessage))
        .map((u, i) => `${i + 1}. ${u.username}`)
        .join('\n')

    const text = `🟢 𝗔𝗖𝗧𝗜𝗩𝗘 𝗠𝗘𝗠𝗕𝗘𝗥𝗦 (𝟱 𝗗𝗔𝗬𝗦) 🟢
━━━━━━━━━━━━━━━━
${list}
━━━━━━━━━━━━━━━━
Total: ${active.length} member(s)`

    await sock.sendMessage(from, { text, quoted: msg })
}

async function inactiveCommand(sock, msg, from) {
    const allUsers = Object.values(getAllUsers())
    const now = Date.now()

    const inactive = allUsers.filter(u => {
        if (!u.lastMessage) return true
        const diff = now - new Date(u.lastMessage).getTime()
        return diff > FIVE_DAYS_MS
    })

    if (!inactive.length) {
        await sock.sendMessage(from, { text: '✅ No inactive members. Everyone has been active recently!', quoted: msg })
        return
    }

    const list = inactive
        .map((u, i) => `${i + 1}. ${u.username}`)
        .join('\n')

    const text = `🔴 𝗜𝗡𝗔𝗖𝗧𝗜𝗩𝗘 𝗠𝗘𝗠𝗕𝗘𝗥𝗦 (𝟱+ 𝗗𝗔𝗬𝗦) 🔴
━━━━━━━━━━━━━━━━
${list}
━━━━━━━━━━━━━━━━
Total: ${inactive.length} member(s)`

    await sock.sendMessage(from, { text, quoted: msg })
}

module.exports = { activeCommand, inactiveCommand }
