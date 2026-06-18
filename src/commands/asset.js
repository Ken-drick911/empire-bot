const { getUser } = require('../data/db')

async function assetCommand(sock, msg, from, sender) {
    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || []
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.participant
    const targetId = mentioned[0] || quoted || sender
    const user = getUser(targetId)

    if (!user) {
        await sock.sendMessage(from, { text: '❌ User not found in the Empire.', quoted: msg })
        return
    }

    const netWorth = user.wallet + user.vault
    const vaultPercent = Math.round((user.vault / user.vaultCap) * 100) || 0

    const text = `⚔️ 𝗜𝗠𝗣𝗘𝗥𝗜𝗔𝗟 𝗧𝗥𝗘𝗔𝗦𝗨𝗥𝗬 ⚔️
━━━━━━━━━━━━━━━━
👤 ${user.username}
🎖️ ${user.title} • ${user.rank} Lv.${user.level}
━━━━━━━━━━━━━━━━
👝 Wallet:    【 ${user.wallet} 🪙 】
🏦 Vault:     【 ${user.vault} 🪙 】
💎 Net Worth: 【 ${netWorth} 🪙 】
━━━━━━━━━━━━━━━━
🏰 Vault Cap:  【 ${user.vaultCap} 🪙 】
📊 Vault Used: ${vaultPercent}%
━━━━━━━━━━━━━━━━`

    await sock.sendMessage(from, { text, quoted: msg })
}

module.exports = { assetCommand }
