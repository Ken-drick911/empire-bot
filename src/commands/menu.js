const fs = require('fs')
const path = require('path')
const { isOwnerId } = require('../config/owner')

function getMenuText(senderName) {
    return `╭───⚜️ 𝐄𝐌𝐏𝐈𝐑𝐄 ⚜️───╮
│ 👑 𝗣𝗿𝗲𝗳𝗶𝘅: .
│ ⚔️ 𝗡𝗮𝗺𝗲: Arthur
│ 🏛️ 𝗘𝗺𝗽𝗲𝗿𝗼𝗿: 𝙺𝙴𝙽♠️
╰─────────────────╯

📜 𝗜𝗠𝗣𝗘𝗥𝗜𝗔𝗟 𝗗𝗢𝗦𝗦𝗜𝗘𝗥 📜
┣ ♤ .profile / .p
┣ ♤ .stats
┣ ♤ .decree
┣ ♤ .reg
┗━━━━━━━━━━━

💰 𝗜𝗠𝗣𝗘𝗥𝗜𝗔𝗟 𝗧𝗥𝗘𝗔𝗦𝗨𝗥𝗬 💰
┣ ♤ .daily
┣ ♤ .asset
┣ ♤ .deposit / .dep
┣ ♤ .withdraw / .wd
┣ ♤ .steal
┣ ♤ .give
┗━━━━━━━━━━━

🎰 𝗜𝗠𝗣𝗘𝗥𝗜𝗔𝗟 𝗖𝗔𝗦𝗜𝗡𝗢 🎰
┣ ♤ .ec [amount] — enter casino
┣ ♤ .ccd — check cooldowns
┣ ♤ .flip heads/tails [bet]
┣ ♤ .dice [bet] [1-6]
┣ ♤ .slots [bet]
┣ ♤ .bj [bet] → .hit / .stand
┣ ♤ .db [bet] — dice battle
┣ ♤ .roulette [type] [bet]
┣ ♤ .casino [bet]
┗━━━━━━━━━━━

⚜️ 𝗜𝗠𝗣𝗘𝗥𝗜𝗔𝗟 𝗦𝗛𝗢𝗣 ⚜️
┣ ♤ .shop
┗━━━━━━━━━━━

⚜️ 𝗜𝗠𝗣𝗘𝗥𝗜𝗔𝗟 𝗥𝗘𝗚𝗜𝗦𝗧𝗥𝗬 ⚜️
┣ ♤ .top / .leaderboard / .lb
┣ ♤ .wealthleaderboard / .wlb
┣ ♤ .gr
┣ ♤ .gwlb
┣ ♤ .ranks
┣ ♤ .titles
┣ ♤ .reputation / .rep
┣ ♤ .myreputation / .mr
┗━━━━━━━━━━━

⚙️ 𝗜𝗠𝗣𝗘𝗥𝗜𝗔𝗟 𝗛𝗘𝗥𝗔𝗟𝗗𝗥𝗬 ⚙️
┣ ♤ .ping
┣ ♤ .menu
┣ ♤ .afk
┣ ♤ .mods
┗━━━━━━━━━━━

🛠️ 𝗜𝗠𝗣𝗘𝗥𝗜𝗔𝗟 𝗚𝗨𝗔𝗥𝗗𝗦 🛠️
┣ ♤ .kick
┣ ♤ .warn @user
┣ ♤ .resetwarn @user
┣ ♤ .setwarn 1-5
┣ ♤ .mute @user [time]
┣ ♤ .unmute @user
┣ ♤ .promote / .demote
┣ ♤ .antilink off/whatsapp/all
┣ ♤ .antispam on/off
┣ ♤ .antism on/off
┣ ♤ .welcome on/off
┣ ♤ .setwelcome [msg]
┣ ♤ .setleave [msg]
┣ ♤ .hidetag [msg]
┣ ♤ .tagall [msg]
┣ ♤ .tagadmins [msg]
┣ ♤ .groupstats / .gs
┣ ♤ .active / .inactive
┣ ♤ .open / .close
┗━━━━━━━━━━━`
}

function getDecreeText(senderName) {
    return `╭───👑 𝐃𝐄𝐂𝐑𝐄𝐄 👑───╮
│ Emperor Command List
│ 𝗔𝗿𝘁𝗵𝘂𝗿
╰─────────────────╯

👑 𝗢𝗪𝗡𝗘𝗥 𝗢𝗡𝗟𝗬 👑
┣ ♤ .addmod (number)
┣ ♤ .removemod (number)
┣ ♤ .appoint (number) (rank)
┣ ♤ .setrank (number) (rank)
┣ ♤ .givexp (number) (amount)
┣ ♤ .givecoins (number) (amount)
┣ ♤ .ban (number) [time]
┣ ♤ .unban (number)
┣ ♤ .restart
┗━━━━━━━━━━━

⚔️ 𝗢𝗪𝗡𝗘𝗥 + 𝗠𝗢𝗗 👑
┣ ♤ .resetuser (number)
┣ ♤ .announce (message)
┣ ♤ .broadcast (message)
┣ ♤ .listgroups
┣ ♤ .modmenu
┗━━━━━━━━━━━`
}

function getModMenuText(senderName) {
    return `╭───⚔️ 𝗠𝗢𝗗 𝗔𝗥𝗦𝗘𝗡𝗔𝗟 ⚔️───╮
│ Moderator Command List
│ ${senderName}
╰─────────────────╯

🛡️ 𝗠𝗢𝗗𝗘𝗥𝗔𝗧𝗜𝗢𝗡 🛡️
┣ ♤ .ban (number) [time]
┣ ♤ .unban (number)
┣ ♤ .resetuser (number)
┣ ♤ .warn @user
┣ ♤ .resetwarn @user
┣ ♤ .setwarn 1-5
┣ ♤ .kick @user
┣ ♤ .mute @user [time]
┣ ♤ .unmute @user
┗━━━━━━━━━━━

🛠️ 𝗚𝗥𝗢𝗨𝗣 𝗖𝗢𝗡𝗧𝗥𝗢𝗟 🛠️
┣ ♤ .tagall [msg]
┣ ♤ .tagadmins [msg]
┣ ♤ .antilink off/whatsapp/all
┣ ♤ .antispam on/off
┣ ♤ .antism on/off
┣ ♤ .welcome on/off
┣ ♤ .setwelcome [msg]
┣ ♤ .setleave [msg]
┣ ♤ .open / .close
┣ ♤ .groupstats / .gs
┗━━━━━━━━━━━

📢 𝗕𝗥𝗢𝗔𝗗𝗖𝗔𝗦𝗧 📢
┣ ♤ .announce (message)
┣ ♤ .broadcast (message)
┗━━━━━━━━━━━

📋 𝗜𝗡𝗙𝗢 📋
┣ ♤ .listgroups
┣ ♤ .modmenu
┗━━━━━━━━━━━

— Serve the Empire ⚔️`
}

async function menuCommand(sock, msg, from, username) {
    const botPicPath = path.join(__dirname, '../../media/bot.jpg')
    const hasPic = fs.existsSync(botPicPath)
    const menuText = getMenuText(username)

    if (hasPic) {
        const image = fs.readFileSync(botPicPath)
        await sock.sendMessage(from, { image, caption: menuText }, { quoted: msg })
    } else {
        await sock.sendMessage(from, { text: menuText }, { quoted: msg })
    }
}

async function decreeCommand(sock, msg, from, sender, username) {
    if (!isOwnerId(sender)) {
        await sock.sendMessage(from, { text: '👑 Only the Emperor may view the Decree.', quoted: msg })
        return
    }
    await sock.sendMessage(from, { text: getDecreeText(username), quoted: msg })
}

async function modMenuCommand(sock, msg, from, username) {
    await sock.sendMessage(from, { text: getModMenuText(username), quoted: msg })
}

module.exports = { menuCommand, decreeCommand, modMenuCommand }
