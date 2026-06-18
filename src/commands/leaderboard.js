const { getAllUsers } = require('../data/db')
const { RANKS } = require('../config/ranks')

function getRankIndex(rankName) {
    return RANKS.findIndex(r => r.name === rankName)
}

const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟']

async function leaderboardCommand(sock, msg, from) {
    const allUsers = Object.values(getAllUsers())

    if (!allUsers.length) {
        await sock.sendMessage(from, { text: '❌ No users found in the Empire yet.', quoted: msg })
        return
    }

    const sorted = allUsers.sort((a, b) => {
        const rankDiff = getRankIndex(b.rank) - getRankIndex(a.rank)
        if (rankDiff !== 0) return rankDiff
        const levelDiff = b.level - a.level
        if (levelDiff !== 0) return levelDiff
        return b.xp - a.xp
    }).slice(0, 10)

    let list = sorted.map((u, i) => {
        const rankData = RANKS.find(r => r.name === u.rank)
        const symbol = rankData ? rankData.symbol : '🧑'
        return `${medals[i]} ${u.username}\n   ${symbol} ${u.rank} Lv.${u.level}`
    }).join('\n\n')

    const text = `🏆 𝗜𝗠𝗣𝗘𝗥𝗜𝗔𝗟 𝗥𝗔𝗡𝗞𝗜𝗡𝗚𝗦 🏆
━━━━━━━━━━━━━━━━
${list}
━━━━━━━━━━━━━━━━`

    await sock.sendMessage(from, { text, quoted: msg })
}

async function wealthLeaderboardCommand(sock, msg, from) {
    const allUsers = Object.values(getAllUsers())

    if (!allUsers.length) {
        await sock.sendMessage(from, { text: '❌ No users found in the Empire yet.', quoted: msg })
        return
    }

    const sorted = allUsers
        .map(u => ({ ...u, netWorth: u.wallet + u.vault }))
        .sort((a, b) => b.netWorth - a.netWorth)
        .slice(0, 10)

    let list = sorted.map((u, i) => {
        return `${medals[i]} ${u.username} — ${u.netWorth.toLocaleString()} 🪙`
    }).join('\n')

    const text = `💰 𝗜𝗠𝗣𝗘𝗥𝗜𝗔𝗟 𝗪𝗘𝗔𝗟𝗧𝗛 💰
━━━━━━━━━━━━━━━━
${list}
━━━━━━━━━━━━━━━━`

    await sock.sendMessage(from, { text, quoted: msg })
}

module.exports = { leaderboardCommand, wealthLeaderboardCommand }
