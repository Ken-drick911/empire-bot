const { getUser } = require('../data/db')
const { getXPToNext } = require('../engine/xp')
const fs = require('fs')
const path = require('path')

async function profileCommand(sock, msg, from, sender, username) {
    // Check if viewing someone else's profile
    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || []
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.participant
    const targetId = mentioned[0] || quoted || sender
    const user = getUser(targetId)

    if (!user) {
        await sock.sendMessage(from, { text: '❌ User not found in the Empire.', quoted: msg })
        return
    }

    const xpBar = getXPBar(user.xp, user.xpToNext)
    const profileText = `⚜️ 𝗜𝗠𝗣𝗘𝗥𝗜𝗔𝗟 𝗗𝗢𝗦𝗦𝗜𝗘𝗥 ⚜️
━━━━━━━━━━━━━━━━
👤 ${user.username}
🏛️ Rank: ${user.rank}
📊 Level: ${user.level} / 10
⚡ XP: ${user.xp} / ${user.xpToNext}
${xpBar}
🎖️ Title: ${user.title}
🎭 Reputation: ${user.reputation || 'None'}
💰 Coins: ${user.wallet + user.vault} 🪙
🔥 Streak: ${user.streak} day(s)
📨 Messages: ${user.totalMessages}
📅 Joined: ${new Date(user.joinDate).toDateString()}
━━━━━━━━━━━━━━━━`

    const picPath = user.profilePic ? path.join(__dirname, '../../', user.profilePic) : null
    const hasPic = picPath && fs.existsSync(picPath)

    if (hasPic) {
        const image = fs.readFileSync(picPath)
        await sock.sendMessage(from, { image, caption: profileText }, { quoted: msg })
    } else {
        await sock.sendMessage(from, { text: profileText, quoted: msg })
    }
}

function getXPBar(xp, xpToNext) {
    const filled = Math.round((xp / xpToNext) * 10)
    const empty = 10 - filled
    return '▓'.repeat(filled) + '░'.repeat(empty)
}

module.exports = { profileCommand }
