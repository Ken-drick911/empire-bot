const { getUser, updateUser } = require('../data/db')
const { banUser, unbanUser } = require('../engine/moderation')

async function giveCoinsCommand(sock, msg, from, args) {
    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || []
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.participant
    const targetId = mentioned[0] || quoted

    if (!targetId) {
        await sock.sendMessage(from, { text: '❌ Tag or reply to someone. Example: .givecoins 5000 (tag user)', quoted: msg })
        return
    }

    const amount = parseInt(args.find(a => !isNaN(parseInt(a))))
    if (!amount || amount <= 0) {
        await sock.sendMessage(from, { text: '❌ Provide a valid amount.', quoted: msg })
        return
    }

    const target = await getUser(targetId)
    if (!target) {
        await sock.sendMessage(from, { text: '❌ Target user not found.', quoted: msg })
        return
    }

    await updateUser(targetId, { wallet: target.wallet + amount })

    await sock.sendMessage(from, {
        text: `👑 ${amount} 🪙 has been granted to @${targetId.split('@')[0]} by Imperial Decree.`,
        mentions: [targetId],
        quoted: msg
    })
}

async function banCommand(sock, msg, from, args) {
    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || []
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.participant
    const targetId = mentioned[0] || quoted

    if (!targetId) {
        await sock.sendMessage(from, { text: '❌ Tag or reply to someone. Example: .ban 1d disrespect (tag user)', quoted: msg })
        return
    }

    const durationInput = args[0]?.match(/^\d+(m|h|d)$/i) ? args[0] : null
    const reason = durationInput ? args.slice(1).join(' ') : args.join(' ')

    const result = await banUser(targetId, durationInput, reason)
    if (!result.success) {
        await sock.sendMessage(from, { text: `❌ ${result.reason}`, quoted: msg })
        return
    }

    const banText = result.banUntil === 'permanent'
        ? 'permanently'
        : `until ${new Date(result.banUntil).toLocaleString()}`

    await sock.sendMessage(from, {
        text: `🚫 @${targetId.split('@')[0]} has been banned ${banText} from using the bot.\n📜 Reason: ${reason || 'No reason given'}`,
        mentions: [targetId],
        quoted: msg
    })
}

async function unbanCommand(sock, msg, from, args) {
    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || []
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.participant
    const targetId = mentioned[0] || quoted

    if (!targetId) {
        await sock.sendMessage(from, { text: '❌ Tag or reply to someone to unban.', quoted: msg })
        return
    }

    const result = await unbanUser(targetId)
    if (!result.success) {
        await sock.sendMessage(from, { text: `❌ ${result.reason}`, quoted: msg })
        return
    }

    await sock.sendMessage(from, {
        text: `✅ @${targetId.split('@')[0]} has been unbanned and may use the bot again.`,
        mentions: [targetId],
        quoted: msg
    })
}

module.exports = { giveCoinsCommand, banCommand, unbanCommand }
