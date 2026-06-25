const { getUser } = require('../data/db')
const { getXPToNext } = require('../engine/xp')
const { isOwnerId } = require('../config/owner')
const { calculateReputation } = require('../config/reputation')
const fs = require('fs')
const path = require('path')

async function profileCommand(sock, msg, from, sender, username) {
    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || []
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.participant
    const targetId = mentioned[0] || quoted || sender
    const user = await getUser(targetId)

    console.log('msg.key:', JSON.stringify(msg.key))

    if (!user) {
        await sock.sendMessage(from, { text: '❌ User not found in the Empire.', quoted: msg })
        return
    }

    const xpBar = getXPBar(user.xp, user.xpToNext)
    const displayRank = isOwnerId(targetId) ? '👑 Emperor' : user.rank

    const reputation = calculateReputation(user)
    const reputationText = reputation ? `${reputation.symbol} ${reputation.name}` : 'None'

    const profileText = `⚜️ 𝗜𝗠𝗣𝗘𝗥𝗜𝗔𝗟 𝗗𝗢𝗦𝗦𝗜𝗘𝗥 ⚜️
━━━━━━━━━━━━━━━━
👤 ${user.username}
🏛️ Rank: ${displayRank}
📊 Level: ${user.level} / 10
⚡ XP: ${user.xp} / ${user.xpToNext}
${xpBar}
🎖️ Title: ${user.title}
🎭 Reputation: ${reputationText}
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
