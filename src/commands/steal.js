const { attemptSteal } = require('../engine/steal')

async function stealCommand(sock, msg, from, sender, args) {
    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || []
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.participant
    const targetId = mentioned[0] || quoted

    if (!targetId) {
        await sock.sendMessage(from, { text: '❌ Tag or reply to someone to steal from.', quoted: msg })
        return
    }

    const result = attemptSteal(sender, targetId)

    if (!result.success && result.reason) {
        await sock.sendMessage(from, { text: `❌ ${result.reason}`, quoted: msg })
        return
    }

    if (result.success) {
        await sock.sendMessage(from, {
            text: `🗡️ 𝗛𝗘𝗜𝗦𝗧 𝗦𝗨𝗖𝗖𝗘𝗦𝗦\n━━━━━━━━━━━━━━━━\n@${sender.split('@')[0]} robbed @${targetId.split('@')[0]}\n\n💰 Stolen: 【 ${result.amount} 🪙 】\n━━━━━━━━━━━━━━━━`,
            mentions: [sender, targetId],
            quoted: msg
        })
    } else {
        await sock.sendMessage(from, {
            text: `🛡️ 𝗛𝗘𝗜𝗦𝗧 𝗙𝗔𝗜𝗟𝗘𝗗\n━━━━━━━━━━━━━━━━\n@${sender.split('@')[0]} tried to rob @${targetId.split('@')[0]}\nand got caught empty handed.\n\n⏳ Cooldown: 2 hours\n━━━━━━━━━━━━━━━━`,
            mentions: [sender, targetId],
            quoted: msg
        })
    }
}

module.exports = { stealCommand }
