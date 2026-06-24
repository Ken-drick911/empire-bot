const { attemptSteal } = require('../engine/steal')

async function stealCommand(sock, msg, from, sender, args) {
    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || []
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.participant
    const targetId = mentioned[0] || quoted

    if (!targetId) {
        await sock.sendMessage(from, { text: '❌ Tag or reply to someone to steal from.', quoted: msg })
        return
    }

    const result = await attemptSteal(sender, targetId)

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
    let caughtMsg = ''
    if (result.penalty === 'warning') {
        caughtMsg = `🚨 *CAUGHT!*\n━━━━━━━━━━━━━━━━\n@${sender.split('@')[0]} tried to rob @${targetId.split('@')[0]}\nbut the Imperial Guard showed mercy!\n\n✅ No fine imposed — this time.\n⏳ Cooldown: 2 hours\n━━━━━━━━━━━━━━━━`
    } else if (result.penalty === 'small') {
        caughtMsg = `🚨 *CAUGHT!*\n━━━━━━━━━━━━━━━━\n@${sender.split('@')[0]} tried to rob @${targetId.split('@')[0]}\nand got slapped with a minor fine!\n\n💸 Fine Paid: 【 ${result.fine} 🪙】\n⏳ Cooldown: 2 hours\n━━━━━━━━━━━━━━━━`
    } else {
        caughtMsg = `🚨 *IMPERIAL ARREST!*\n━━━━━━━━━━━━━━━━\n@${sender.split('@')[0]} tried to rob @${targetId.split('@')[0]}\nand was dragged before the Emperor!\n\n💸 Heavy Fine: 【 ${result.fine} 🪙】\n⚖️ Reputation damaged!\n⏳ Cooldown: 2 hours\n━━━━━━━━━━━━━━━━`
    }
    await sock.sendMessage(from, {
        text: caughtMsg,
        mentions: [sender, targetId],
        quoted: msg
    })
   }
}

module.exports = { stealCommand }
