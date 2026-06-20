const { claimDaily } = require('../engine/daily')
const { getUser } = require('../data/db')

async function dailyCommand(sock, msg, from, sender, username) {
    const result = await claimDaily(sender)

    if (!result.success) {
        await sock.sendMessage(from, {
            text: `⏳ 𝗗𝗔𝗜𝗟𝗬 𝗥𝗘𝗪𝗔𝗥𝗗\n━━━━━━━━━━━━━━━━\n❌ ${result.reason}\n━━━━━━━━━━━━━━━━`,
            quoted: msg
        })
        return
    }

    const user = await getUser(sender)

    let streakText = `🔥 Streak: ${result.streak} day(s)`
    if (result.bonusXP > 0 || result.bonusCoins > 0) {
        streakText += `\n🎁 Streak Bonus: +${result.bonusXP} XP  +${result.bonusCoins} 🪙`
    }

    let rewardText = `💰 𝗗𝗔𝗜𝗟𝗬 𝗥𝗘𝗪𝗔𝗥𝗗
━━━━━━━━━━━━━━━━
👤 ${username}
━━━━━━━━━━━━━━━━
⚡ XP Gained:    +${result.xpGained}
🪙 Coins Gained: +${result.coinsGained}
━━━━━━━━━━━━━━━━
${streakText}
━━━━━━━━━━━━━━━━
👝 Wallet: ${user.wallet} 🪙
⚡ XP: ${user.xp} / ${user.xpToNext}
━━━━━━━━━━━━━━━━`

    if (result.promoted) {
        rewardText += `\n\n🎊 RANK UP! Welcome to *${result.newRank}*!\n🎖️ Title: ${result.newTitle}`
    } else if (result.leveled) {
        rewardText += `\n\n⚔️ LEVEL UP! *${result.newRank} Lv.${result.newLevel}*\n🎖️ Title: ${result.newTitle}`
    }

    await sock.sendMessage(from, { text: rewardText, quoted: msg })
}

module.exports = { dailyCommand }
