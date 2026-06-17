const fs = require('fs')
const path = require('path')

const menuText = `⚜️ 𝐄𝐌𝐏𝐈𝐑𝐄 ⚜️
⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘
👑 𝗣𝗿𝗲𝗳𝗶𝘅: .
⚔️ 𝗡𝗮𝗺𝗲: Ragnar
🏛️ 𝗘𝗺𝗽𝗲𝗿𝗼𝗿: 𝙺𝙴𝙽♠️
⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘

📜 𝗜𝗠𝗣𝗘𝗥𝗜𝗔𝗟 𝗗𝗢𝗦𝗦𝗜𝗘𝗥 📜
┣ ♤ .profile / .p
┣ ♤ .rank / .r
┣ ♤ .stats
┣ ♤ .setpic
┣ ♤ .bio
┣ ♤ .edit
┗━━━━━━━━━━━

💰 𝗜𝗠𝗣𝗘𝗥𝗜𝗔𝗟 𝗧𝗥𝗘𝗔𝗦𝗨𝗥𝗬 💰
┣ ♤ .daily
┣ ♤ .asset
┣ ♤ .deposit / .dep
┣ ♤ .withdraw / .wd
┣ ♤ .steal
┣ ♤ .give
┗━━━━━━━━━━━

⚜️ 𝗜𝗠𝗣𝗘𝗥𝗜𝗔𝗟 𝗥𝗘𝗚𝗜𝗦𝗧𝗥𝗬 ⚜️
┣ ♤ .top
┣ ♤ .leaderboard / .lb
┣ ♤ .wealthleaderboard / .wlb
┣ ♤ .ranks
┣ ♤ .titles
┣ ♤ .reputation
┗━━━━━━━━━━━

⚙️ 𝗜𝗠𝗣𝗘𝗥𝗜𝗔𝗟 𝗛𝗘𝗥𝗔𝗟𝗗𝗥𝗬 ⚙️
┣ ♤ .rules
┣ ♤ .test
┣ ♤ .mods
┣ ♤ .owner
┣ ♤ .bots
┣ ♤ .url
┣ ♤ .menu
┗━━━━━━━━━━━

🎮 𝗜𝗠𝗣𝗘𝗥𝗜𝗔𝗟 𝗔𝗥𝗘𝗡𝗔 🎮
┣ ♤ .ttt
┣ ♤ .wcg
┣ ♤ .aquiz
┣ ♤ .wouldyourather / .wyr
┣ ♤ .truth
┣ ♤ .dare
┣ ♤ .joke
┗━━━━━━━━━━━

📲 𝗜𝗠𝗣𝗘𝗥𝗜𝗔𝗟 𝗦𝗖𝗥𝗜𝗕𝗘𝗦 📲
┣ ♤ .ig
┣ ♤ .ttk
┣ ♤ .yt
┣ ♤ .x
┣ ♤ .fb
┣ ♤ .play
┣ ♤ .anime
┣ ♤ .manga
┣ ♤ .manhwa
┣ ♤ .novel
┗━━━━━━━━━━━

🔍 𝗜𝗠𝗣𝗘𝗥𝗜𝗔𝗟 𝗦𝗖𝗢𝗨𝗧𝗦 🔍
┣ ♤ .pinterest / .pint
┣ ♤ .sauce
┣ ♤ .wallpaper
┣ ♤ .lyrics
┣ ♤ .igstalk
┣ ♤ .shazam
┗━━━━━━━━━━━

🤖 𝗜𝗠𝗣𝗘𝗥𝗜𝗔𝗟 𝗢𝗥𝗔𝗖𝗟𝗘 🤖
┣ ♤ .gpt
┣ ♤ .copilot
┣ ♤ .perplexity
┣ ♤ .imagine
┣ ♤ .upscale
┣ ♤ .translate / .tt
┣ ♤ .transcribe / .tb
┣ ♤ .ocr
┣ ♤ .tldr
┣ ♤ .tts
┗━━━━━━━━━━━

🔧 𝗜𝗠𝗣𝗘𝗥𝗜𝗔𝗟 𝗙𝗢𝗥𝗚𝗘 🔧
┣ ♤ .sticker / .s
┣ ♤ .take
┣ ♤ .toimg
┣ ♤ .tovid
┣ ♤ .rotate
┣ ♤ .carbon
┣ ♤ .fancy
┗━━━━━━━━━━━

🛠️ 𝗜𝗠𝗣𝗘𝗥𝗜𝗔𝗟 𝗚𝗨𝗔𝗥𝗗𝗦 🛠️
┣ ♤ .kick
┣ ♤ .warn
┣ ♤ .resetwarn
┣ ♤ .mute
┣ ♤ .unmute
┣ ♤ .promote
┣ ♤ .demote
┣ ♤ .antilink
┣ ♤ .antispam
┣ ♤ .blacklist
┣ ♤ .welcome
┣ ♤ .leave
┣ ♤ .setwelcome
┣ ♤ .setleave
┣ ♤ .purge
┣ ♤ .hidetag
┣ ♤ .tagall
┣ ♤ .tagadmins
┣ ♤ .groupstats / .gs
┣ ♤ .activity
┣ ♤ .active
┣ ♤ .inactive
┣ ♤ .open
┣ ♤ .close
┣ ♤ .news
┣ ♤ .delete
┗━━━━━━━━━━━

👑 𝗜𝗠𝗣𝗘𝗥𝗜𝗔𝗟 𝗧𝗛𝗥𝗢𝗡𝗘 👑
┣ ♤ .appoint
┣ ♤ .setrep
┣ ♤ .setrank
┣ ♤ .givexp
┣ ♤ .givecoins
┣ ♤ .resetuser
┣ ♤ .ban
┣ ♤ .unban
┣ ♤ .announce
┣ ♤ .broadcast
┣ ♤ .restart
┣ ♤ .listgroups
┗━━━━━━━━━━━`

async function menuCommand(sock, msg, from) {
    const botPicPath = path.join(__dirname, '../../media/bot.jpg')
    const hasPic = fs.existsSync(botPicPath)

    if (hasPic) {
        const image = fs.readFileSync(botPicPath)
        await sock.sendMessage(from, {
            image,
            caption: menuText
        }, { quoted: msg })
    } else {
        await sock.sendMessage(from, {
            text: menuText
        }, { quoted: msg })
    }
}

module.exports = { menuCommand }
