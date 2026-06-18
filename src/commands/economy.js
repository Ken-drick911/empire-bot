const { deposit, withdraw, give } = require('../engine/economy')
const { getUser } = require('../data/db')

async function depositCommand(sock, msg, from, sender, args) {
    const amount = parseInt(args[0])
    const result = deposit(sender, amount)

    if (!result.success) {
        await sock.sendMessage(from, { text: `❌ ${result.reason}`, quoted: msg })
        return
    }

    await sock.sendMessage(from, {
        text: `🏦 𝗗𝗘𝗣𝗢𝗦𝗜𝗧 𝗦𝗨𝗖𝗖𝗘𝗦𝗦\n━━━━━━━━━━━━━━━━\n✅ Deposited ${result.amount} 🪙\n👝 Wallet: ${result.wallet} 🪙\n🏦 Vault: ${result.vault} 🪙\n━━━━━━━━━━━━━━━━`,
        quoted: msg
    })
}

async function withdrawCommand(sock, msg, from, sender, args) {
    const amount = parseInt(args[0])
    const result = withdraw(sender, amount)

    if (!result.success) {
        await sock.sendMessage(from, { text: `❌ ${result.reason}`, quoted: msg })
        return
    }

    await sock.sendMessage(from, {
        text: `👝 𝗪𝗜𝗧𝗛𝗗𝗥𝗔𝗪 𝗦𝗨𝗖𝗖𝗘𝗦𝗦\n━━━━━━━━━━━━━━━━\n✅ Withdrew ${result.amount} 🪙\n👝 Wallet: ${result.wallet} 🪙\n🏦 Vault: ${result.vault} 🪙\n━━━━━━━━━━━━━━━━`,
        quoted: msg
    })
}

async function giveCommand(sock, msg, from, sender, args) {
    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || []
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.participant
    const targetId = mentioned[0] || quoted

    if (!targetId) {
        await sock.sendMessage(from, { text: '❌ Tag or reply to someone to give coins.', quoted: msg })
        return
    }

    const amount = parseInt(args.find(a => !isNaN(parseInt(a))))
    const result = give(sender, targetId, amount)

    if (!result.success) {
        await sock.sendMessage(from, { text: `❌ ${result.reason}`, quoted: msg })
        return
    }

    await sock.sendMessage(from, {
        text: `🤝 @${sender.split('@')[0]} gave ${result.amount} 🪙 to @${targetId.split('@')[0]}`,
        mentions: [sender, targetId],
        quoted: msg
    })
}

module.exports = { depositCommand, withdrawCommand, giveCommand }
