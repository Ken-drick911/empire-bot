const { RANKS } = require('../config/ranks')

async function ranksCommand(sock, msg, from) {
    const list = RANKS.map((r, i) => `${i + 1}. ${r.symbol} ${r.name}`).join('\n')

    const text = `🏛️ 𝗜𝗠𝗣𝗘𝗥𝗜𝗔𝗟 𝗥𝗔𝗡𝗞 𝗣𝗔𝗧𝗛 🏛️
━━━━━━━━━━━━━━━━
${list}
━━━━━━━━━━━━━━━━
📊 Each rank: Level 1 - 10
⚔️ Reach Level 10 to advance!
━━━━━━━━━━━━━━━━`

    await sock.sendMessage(from, { text, quoted: msg })
}

async function titlesCommand(sock, msg, from) {
    let sections = RANKS.map(r => {
        return `${r.symbol} 𝗧𝗛𝗘 ${r.name.toUpperCase()}
   Lv 1-3: ${r.titles.low}
   Lv 4-7: ${r.titles.mid}
   Lv 8-10: ${r.titles.high}`
    }).join('\n\n')

    const text = `🎖️ 𝗜𝗠𝗣𝗘𝗥𝗜𝗔𝗟 𝗧𝗜𝗧𝗟𝗘𝗦 🎖️
━━━━━━━━━━━━━━━━
${sections}
━━━━━━━━━━━━━━━━`

    await sock.sendMessage(from, { text, quoted: msg })
}

module.exports = { ranksCommand, titlesCommand }
