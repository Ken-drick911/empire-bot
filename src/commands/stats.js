const { getUser } = require('../data/db')

async function statsCommand(sock, msg, from, sender) {
    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || []
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.participant
    const targetId = mentioned[0] || quoted || sender
    const user = await getUser(targetId)

    if (!user) {
        await sock.sendMessage(from, { text: '❌ User not found in the Empire.', quoted: msg })
        return
    }

    const daysSinceJoin = Math.floor((Date.now() - new Date(user.joinDate)) / (1000 * 60 * 60 * 24))
    const avgPerDay = daysSinceJoin > 0 ? (user.totalMessages / daysSinceJoin).toFixed(1) : user.totalMessages

    const text = `📊 𝗜𝗠𝗣𝗘𝗥𝗜𝗔𝗟 𝗦𝗧𝗔𝗧𝗜𝗦𝗧𝗜𝗖𝗦 📊
━━━━━━━━━━━━━━━━
👤 ${user.username}
━━━━━━━━━━━━━━━━
📨 Total Messages: ${user.totalMessages}
📅 Days in Empire: ${daysSinceJoin}
📈 Avg Messages/Day: ${avgPerDay}
🔥 Current Streak: ${user.streak} day(s)
━━━━━━━━━━━━━━━━
🗡️ Times Stolen From Others: ${user.timesStolen || 0}
🛡️ Times Robbed: ${user.timesRobbed || 0}
━━━━━━━━━━━━━━━━
📅 Joined: ${new Date(user.joinDate).toDateString()}
━━━━━━━━━━━━━━━━`

    await sock.sendMessage(from, { text, quoted: msg })
}

module.exports = { statsCommand }
