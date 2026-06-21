const { getUser } = require('../data/db')
const { REPUTATIONS, calculateReputation } = require('../config/reputation')

async function reputationListCommand(sock, msg, from) {
    const list = REPUTATIONS.map(r => `${r.symbol} *${r.name}*\n   ↳ ${r.description}`).join('\n\n')

    const text = `🎭 𝗜𝗠𝗣𝗘𝗥𝗜𝗔𝗟 𝗥𝗘𝗣𝗨𝗧𝗔𝗧𝗜𝗢𝗡𝗦 🎭
━━━━━━━━━━━━━━━━
Every citizen of the Empire earns a reputation through their deeds, presence, and loyalty. These titles are awarded automatically, not chosen.
━━━━━━━━━━━━━━━━

${list}

━━━━━━━━━━━━━━━━
⚜️ Your reputation reflects who you are in the Empire.`

    await sock.sendMessage(from, { text, quoted: msg })
}

async function myReputationCommand(sock, msg, from, sender, username) {
    const user = await getUser(sender)

    if (!user) {
        await sock.sendMessage(from, { text: '❌ User not found in the Empire.', quoted: msg })
        return
    }

    const reputation = calculateReputation(user)

    const text = reputation
        ? `🎭 𝗬𝗢𝗨𝗥 𝗥𝗘𝗣𝗨𝗧𝗔𝗧𝗜𝗢𝗡 🎭
━━━━━━━━━━━━━━━━
👤 ${username}
${reputation.symbol} *${reputation.name}*
↳ ${reputation.description}
━━━━━━━━━━━━━━━━`
        : `🎭 𝗬𝗢𝗨𝗥 𝗥𝗘𝗣𝗨𝗧𝗔𝗧𝗜𝗢𝗡 🎭
━━━━━━━━━━━━━━━━
👤 ${username}
🫥 No reputation earned yet.
↳ Stay active in the Empire to earn one.
━━━━━━━━━━━━━━━━`

    await sock.sendMessage(from, { text, quoted: msg })
}

module.exports = { reputationListCommand, myReputationCommand }
