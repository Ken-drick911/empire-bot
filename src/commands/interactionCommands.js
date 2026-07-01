const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args))
const { getUserFlexible } = require('../data/db')

// Anime GIF fetcher from nekos.best (free, no API key)
async function getAnimeGif(action) {
    try {
        const res = await fetch(`https://nekos.best/api/v2/${action}`)
        const data = await res.json()
        return data.results[0]?.url || null
    } catch {
        return null
    }
}

// Claude rank-based message generator
async function getRankMessage(action, senderName, targetName, targetRank, targetTitle) {
    try {
        const res = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': process.env.ANTHROPIC_API_KEY,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-haiku-4-5-20251001',
                max_tokens: 100,
                messages: [{
                    role: 'user',
                    content: `In one short creative sentence, describe ${senderName} ${action}ing ${targetName} who is a ${targetRank} (title: ${targetTitle}) in an empire. Make it themed to their rank. Be poetic and fun. No hashtags, no quotes, just the sentence.`
                }]
            })
        })
        const data = await res.json()
        return data.content[0].text.trim()
    } catch {
        return null
    }
}

// Get target from mention or reply
function getTarget(msg, args) {
    // From reply
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.participant
    if (quoted && args.length === 0) return quoted

    // From mention
    const mentions = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || []
    if (mentions.length > 0) return mentions[0]

    return null
}

async function hugCommand(sock, msg, from, sender, args) {
    const target = getTarget(msg, args)
    if (!target) {
        await sock.sendMessage(from, { text: '⚔️ Tag someone or reply to their message to hug them!', quoted: msg })
        return
    }

    const senderName = sender.split('@')[0]
    const targetName = target.split('@')[0]
    const gifUrl = await getAnimeGif('hug')
    const targetUser = await getUserFlexible(target)

    let caption
    if (targetUser?.rank) {
        const rankMsg = await getRankMessage('hug', senderName, targetUser.username || targetName, targetUser.rank, targetUser.title) 
        || `Even in the empire, warmth finds the ${targetUser.rank}.`
        caption = `🤗〔 ⚔️ IMPERIAL HUG ⚔️ 〕🤗\n\n@${senderName} hugs @${targetName}!\n\n👑 "${rankMsg}"`
    } else {
        caption = `🤗〔 ⚔️ IMPERIAL HUG ⚔️ 〕🤗\n\n@${senderName} hugs @${targetName}!`
    }

    if (gifUrl) {
        await sock.sendMessage(from, {
            image: { url: gifUrl },
            caption,
            mentions: [sender, target],
            quoted: msg
        })
    } else {
        await sock.sendMessage(from, { text: caption, mentions: [sender, target], quoted: msg })
    }
}

async function kissCommand(sock, msg, from, sender, args) {
    const target = getTarget(msg, args)
    if (!target) {
        await sock.sendMessage(from, { text: '⚔️ Tag someone or reply to their message to kiss them!', quoted: msg })
        return
    }

    const senderName = sender.split('@')[0]
    const targetName = target.split('@')[0]
    const gifUrl = await getAnimeGif('kiss')
    const targetUser = await getUserFlexible(target)

    let caption
    if (targetUser?.rank) {
        const rankMsg = await getRankMessage('kiss', senderName, targetUser.username || targetName, targetUser.rank, targetUser.title)
        || `A royal kiss bestowed upon the ${targetUser.rank}.`
        caption = `💋〔 ⚔️ IMPERIAL KISS ⚔️ 〕💋\n\n@${senderName} kisses @${targetName}!\n\n👑 "${rankMsg}"`
    } else {
        caption = `💋〔 ⚔️ IMPERIAL KISS ⚔️ 〕💋\n\n@${senderName} kisses @${targetName}!`
    }

    if (gifUrl) {
        await sock.sendMessage(from, {
            image: { url: gifUrl },
            caption,
            mentions: [sender, target],
            quoted: msg
        })
    } else {
        await sock.sendMessage(from, { text: caption, mentions: [sender, target], quoted: msg })
    }
}

async function slapCommand(sock, msg, from, sender, args) {
    const target = getTarget(msg, args)
    if (!target) {
        await sock.sendMessage(from, { text: '⚔️ Tag someone or reply to their message to slap them!', quoted: msg })
        return
    }

    const senderName = sender.split('@')[0]
    const targetName = target.split('@')[0]
    const gifUrl = await getAnimeGif('slap')
    const targetUser = await getUserFlexible(target)

    let caption
    if (targetUser?.rank) {
        const rankMsg = await getRankMessage('slap', senderName, targetUser.username || targetName, targetUser.rank, targetUser.title)
        || `The ${targetUser.rank} has been dishonored!`
        caption = `👋〔 ⚔️ IMPERIAL SLAP ⚔️ 〕👋\n\n@${senderName} slaps @${targetName}!\n\n👑 "${rankMsg}"`
    } else {
        caption = `👋〔 ⚔️ IMPERIAL SLAP ⚔️ 〕👋\n\n@${senderName} slaps @${targetName}!`
    }

    if (gifUrl) {
        await sock.sendMessage(from, {
            image: { url: gifUrl },
            caption,
            mentions: [sender, target],
            quoted: msg
        })
    } else {
        await sock.sendMessage(from, { text: caption, mentions: [sender, target], quoted: msg })
    }
}

async function waveCommand(sock, msg, from, sender, args) {
    const target = getTarget(msg, args)
    const senderName = sender.split('@')[0]
    const gifUrl = await getAnimeGif('wave')

    let caption
    if (target) {
        const targetName = target.split('@')[0]
        const targetUser = await getUserFlexible(target)
        if (targetUser?.rank) {
            const rankMsg = await getRankMessage('wave at', senderName, targetUser.username || targetName, targetUser.rank, targetUser.title)
            || `A royal wave to the ${targetUser.rank}.`
            caption = `👋〔 ⚔️ IMPERIAL WAVE ⚔️ 〕👋\n\n@${senderName} waves at @${targetName}!\n\n👑 "${rankMsg}"`
        } else {
            caption = `👋〔 ⚔️ IMPERIAL WAVE ⚔️ 〕👋\n\n@${senderName} waves at @${targetName}!`
        }
        if (gifUrl) {
            await sock.sendMessage(from, { image: { url: gifUrl }, caption, mentions: [sender, target], quoted: msg })
        } else {
            await sock.sendMessage(from, { text: caption, mentions: [sender, target], quoted: msg })
        }
    } else {
        caption = `👋〔 ⚔️ IMPERIAL WAVE ⚔️ 〕👋\n\n@${senderName} waves at the kingdom!\n\n👑 "The empire acknowledges your presence."`
        if (gifUrl) {
            await sock.sendMessage(from, { image: { url: gifUrl }, caption, mentions: [sender], quoted: msg })
        } else {
            await sock.sendMessage(from, { text: caption, mentions: [sender], quoted: msg })
        }
    }
}

async function patCommand(sock, msg, from, sender, args) {
    const target = getTarget(msg, args)
    if (!target) {
        await sock.sendMessage(from, { text: '⚔️ Tag someone or reply to their message to pat them!', quoted: msg })
        return
    }

    const senderName = sender.split('@')[0]
    const targetName = target.split('@')[0]
    const gifUrl = await getAnimeGif('pat')
    const targetUser = await getUserFlexible(target)

    let caption
    if (targetUser?.rank) {
        const rankMsg = await getRankMessage('pat', senderName, targetUser.username || targetName, targetUser.rank, targetUser.title)
        || `A gentle pat for the loyal ${targetUser.rank}.`
        caption = `🤚〔 ⚔️ IMPERIAL PAT ⚔️ 〕🤚\n\n@${senderName} pats @${targetName}!\n\n👑 "${rankMsg}"`
    } else {
        caption = `🤚〔 ⚔️ IMPERIAL PAT ⚔️ 〕🤚\n\n@${senderName} pats @${targetName}!`
    }

    if (gifUrl) {
        await sock.sendMessage(from, {
            image: { url: gifUrl },
            caption,
            mentions: [sender, target],
            quoted: msg
        })
    } else {
        await sock.sendMessage(from, { text: caption, mentions: [sender, target], quoted: msg })
    }
                                                                 }

async function danceCommand(sock, msg, from, sender, args) {
    const senderName = sender.split('@')[0]
    const target = getTarget(msg, args)
    const gifUrl = await getAnimeGif('dance')

    let caption
    if (target) {
        const targetName = target.split('@')[0]
        caption = `@${senderName} is dancing with @${targetName}! 💃🕺`
    } else {
        caption = `@${senderName} is dancing! 💃\n👑 "The kingdom celebrates!"`
    }

    const mentions = target ? [sender, target] : [sender]
    if (gifUrl) {
        await sock.sendMessage(from, { image: { url: gifUrl }, caption, mentions, quoted: msg })
    } else {
        await sock.sendMessage(from, { text: caption, mentions, quoted: msg })
    }
}

async function sadCommand(sock, msg, from, sender) {
    const senderName = sender.split('@')[0]
    const gifUrl = await getAnimeGif('sad')
    const user = await getUserFlexible(sender)

    let caption
    if (user?.rank) {
        const rankMsg = await getRankMessage('feel sad', senderName, senderName, user.rank, user.title)
        || `Even a ${user.rank} has hard days in the empire.`
        caption = `@${senderName} is feeling sad 😢\n\n👑 "${rankMsg}"`
    } else {
        caption = `@${senderName} is feeling sad 😢`
    }

    if (gifUrl) {
        await sock.sendMessage(from, { image: { url: gifUrl }, caption, mentions: [sender], quoted: msg })
    } else {
        await sock.sendMessage(from, { text: caption, mentions: [sender], quoted: msg })
    }
}

async function smileCommand(sock, msg, from, sender) {
    const senderName = sender.split('@')[0]
    const gifUrl = await getAnimeGif('smile')
    const user = await getUserFlexible(sender)

    let caption
    if (user?.rank) {
        const rankMsg = await getRankMessage('smile', senderName, senderName, user.rank, user.title)
        || `A ${user.rank}'s smile lights up the whole empire.`
        caption = `@${senderName} is smiling 😊\n\n👑 "${rankMsg}"`
    } else {
        caption = `@${senderName} is smiling 😊`
    }

    if (gifUrl) {
        await sock.sendMessage(from, { image: { url: gifUrl }, caption, mentions: [sender], quoted: msg })
    } else {
        await sock.sendMessage(from, { text: caption, mentions: [sender], quoted: msg })
    }
}

async function laughCommand(sock, msg, from, sender, args) {
    const target = getTarget(msg, args)
    const senderName = sender.split('@')[0]
    const gifUrl = await getAnimeGif('laugh')

    let caption
    if (target) {
        const targetName = target.split('@')[0]
        const targetUser = await getUserFlexible(target)
        if (targetUser?.rank) {
            const rankMsg = await getRankMessage('laugh at', senderName, targetUser.username || targetName, targetUser.rank, targetUser.title)
            || `A ${targetUser.rank} being laughed at... how the mighty fall.`
            caption = `@${senderName} is laughing at @${targetName} 😂\n\n👑 "${rankMsg}"`
        } else {
            caption = `@${senderName} is laughing at @${targetName} 😂`
        }
        if (gifUrl) {
            await sock.sendMessage(from, { image: { url: gifUrl }, caption, mentions: [sender, target], quoted: msg })
        } else {
            await sock.sendMessage(from, { text: caption, mentions: [sender, target], quoted: msg })
        }
    } else {
        caption = `@${senderName} is laughing 😂`
        if (gifUrl) {
            await sock.sendMessage(from, { image: { url: gifUrl }, caption, mentions: [sender], quoted: msg })
        } else {
            await sock.sendMessage(from, { text: caption, mentions: [sender], quoted: msg })
        }
    }
}

async function punchCommand(sock, msg, from, sender, args) {
    const target = getTarget(msg, args)
    if (!target) {
        await sock.sendMessage(from, { text: '⚔️ Who are you punching into the void?? Tag someone!', quoted: msg })
        return
    }

    const senderName = sender.split('@')[0]
    const targetName = target.split('@')[0]
    const gifUrl = await getAnimeGif('punch')
    const targetUser = await getUserFlexible(target)
    const senderUser = await getUserFlexible(sender)

    let rankMsg
    if (targetUser?.rank) {
        const prompts = [
            `In one savage funny empire-themed sentence, describe ${senderName} (a ${senderUser?.rank || 'citizen'}) absolutely decking ${targetName} (a ${targetUser.rank}) straight in the face. Make it chaotic and dramatic.`,
        ]
        rankMsg = await getRankMessage('punch', senderName, targetUser.username || targetName, targetUser.rank, targetUser.title)
        || `A ${targetUser.rank} just got sent flying across the kingdom! 💀`
    }

    const caption = targetUser?.rank
        ? `@${senderName} punches @${targetName} RIGHT in the face!! 👊💥\n\n👑 "${rankMsg}"`
        : `@${senderName} absolutely decks @${targetName}!! 👊💥\n💀 They never saw it coming.`

    if (gifUrl) {
        await sock.sendMessage(from, { image: { url: gifUrl }, caption, mentions: [sender, target], quoted: msg })
    } else {
        await sock.sendMessage(from, { text: caption, mentions: [sender, target], quoted: msg })
    }
}

async function bonkCommand(sock, msg, from, sender, args) {
    const target = getTarget(msg, args)
    if (!target) {
        await sock.sendMessage(from, { text: '🔨 BONK WHO?? Tag someone before I bonk YOU!', quoted: msg })
        return
    }

    const senderName = sender.split('@')[0]
    const targetName = target.split('@')[0]
    const gifUrl = await getAnimeGif('bonk')
    const targetUser = await getUserFlexible(target)

    const bonkReasons = [
        'for being too powerful in this economy 💀',
        'straight to horny jail 🚔',
        'for existing too loudly in the empire 😤',
        'because the Emperor said so 👑',
        'for crimes against the kingdom 📜',
        'for being suspicious in the royal court 👀'
    ]
    const reason = bonkReasons[Math.floor(Math.random() * bonkReasons.length)]

    let caption
    if (targetUser?.rank) {
        const rankMsg = await getRankMessage('bonk', senderName, targetUser.username || targetName, targetUser.rank, targetUser.title)
        || `A ${targetUser.rank} bonked ${reason}`
        caption = `🔨 @${senderName} BONKS @${targetName} ${reason}!\n\n👑 "${rankMsg}"`
    } else {
        caption = `🔨 @${senderName} BONKS @${targetName} ${reason}!`
    }

    if (gifUrl) {
        await sock.sendMessage(from, { image: { url: gifUrl }, caption, mentions: [sender, target], quoted: msg })
    } else {
        await sock.sendMessage(from, { text: caption, mentions: [sender, target], quoted: msg })
    }
}

async function tickleCommand(sock, msg, from, sender, args) {
    const target = getTarget(msg, args)
    if (!target) {
        await sock.sendMessage(from, { text: '🤣 Tag someone to tickle! Or are you just tickling the air?? 💀', quoted: msg })
        return
    }

    const senderName = sender.split('@')[0]
    const targetName = target.split('@')[0]
    const gifUrl = await getAnimeGif('tickle')
    const targetUser = await getUserFlexible(target)

    const chaos = [
        'The whole kingdom heard the screaming 😭',
        'Imperial guards were called. Twice. 💀',
        'Even the King paused his meeting for this 👀',
        'The royal court is in shambles 😂',
        'This is NOT what the throne room is for 💀'
    ]
    const chaosLine = chaos[Math.floor(Math.random() * chaos.length)]

    let caption
    if (targetUser?.rank) {
        const rankMsg = await getRankMessage('tickle', senderName, targetUser.username || targetName, targetUser.rank, targetUser.title)
        || `A ${targetUser.rank} has been reduced to uncontrollable laughter 😭`
        caption = `🤣 @${senderName} tickles @${targetName} mercilessly!!\n\n👑 "${rankMsg}"\n💀 ${chaosLine}`
    } else {
        caption = `🤣 @${senderName} tickles @${targetName} mercilessly!!\n💀 ${chaosLine}`
    }

    if (gifUrl) {
        await sock.sendMessage(from, { image: { url: gifUrl }, caption, mentions: [sender, target], quoted: msg })
    } else {
        await sock.sendMessage(from, { text: caption, mentions: [sender, target], quoted: msg })
    }
}

async function shrugCommand(sock, msg, from, sender) {
    const senderName = sender.split('@')[0]
    const user = await getUserFlexible(sender)

    const shrugGifs = [
        'https://media.tenor.com/3BmkfPVaXgAAAAAC/anime-shrug.gif',
        'https://media.tenor.com/oqFMKkdnRWEAAAAC/shrug-anime.gif',
        'https://media.tenor.com/Yr8PCtW8vNsAAAAC/anime-girl-shrug.gif'
    ]
    const gifUrl = shrugGifs[Math.floor(Math.random() * shrugGifs.length)]

    const shrugLines = [
        '¯\\_(ツ)_/¯ Not my kingdom, not my problem.',
        '¯\\_(ツ)_/¯ The Emperor shrugs. The peasants panic.',
        '¯\\_(ツ)_/¯ Above my pay grade. Way above.',
        '¯\\_(ツ)_/¯ I just work here.',
        "¯\\_(ツ)_/¯ Ask the throne. I'm just vibing.",
        '¯\\_(ツ)_/¯ Genuinely could not care less right now.'
    ]
    const shrugLine = shrugLines[Math.floor(Math.random() * shrugLines.length)]

    let caption
    if (user?.rank) {
        caption = `@${senderName} shrugs 🤷\n\n👑 ${shrugLine}\n_— A ${user.rank} with zero concerns_`
    } else {
        caption = `@${senderName} shrugs 🤷\n\n${shrugLine}`
    }

    if (gifUrl) {
        await sock.sendMessage(from, {
            image: { url: gifUrl },
            caption,
            mentions: [sender],
            quoted: msg
        })
    } else {
        await sock.sendMessage(from, { text: caption, mentions: [sender], quoted: msg })
    }
}

async function killCommand(sock, msg, from, sender, args) {
    const target = getTarget(msg, args)
    if (!target) {
        await sock.sendMessage(from, { text: '⚔️ Who are you killing?? Tag someone or reply!', quoted: msg })
        return
    }

    const senderName = sender.split('@')[0]
    const targetName = target.split('@')[0]
    const targetUser = await getUserFlexible(target)
    const senderUser = await getUserFlexible(sender)

    const killGifs = [
        'https://media.tenor.com/vMWFBWHGkMQAAAAC/anime-kill.gif',
        'https://media.tenor.com/ozy3RMoHH3IAAAAC/anime-sword.gif',
        'https://media.tenor.com/3e3gJJxcXM8AAAAC/anime-fight.gif'
    ]
    const gifUrl = killGifs[Math.floor(Math.random() * killGifs.length)]

    const deathLines = [
        'was deleted from existence 💀',
        'has been removed from the server of life 💀',
        'got unalived in 4K 💀',
        'has left the kingdom permanently 💀',
        'has been yeeted into the void 💀',
        'just got their subscription to life cancelled 💀'
    ]
    const deathLine = deathLines[Math.floor(Math.random() * deathLines.length)]

    let caption
    if (targetUser?.rank && senderUser?.rank) {
        caption = `☠️ @${senderName} (${senderUser.rank}) just KILLED @${targetName} (${targetUser.rank})!!\n\n💀 The ${targetUser.rank} ${deathLine}\n\n👑 _The Emperor watches in silence._`
    } else {
        caption = `☠️ @${senderName} just KILLED @${targetName}!!\n\n💀 ${targetName} ${deathLine}`
    }

    if (gifUrl) {
        await sock.sendMessage(from, { image: { url: gifUrl }, caption, mentions: [sender, target], quoted: msg })
    } else {
        await sock.sendMessage(from, { text: caption, mentions: [sender, target], quoted: msg })
    }
}

async function murderCommand(sock, msg, from, sender, args) {
    const target = getTarget(msg, args)
    if (!target) {
        await sock.sendMessage(from, { text: '🔪 Murder WHO?? Tag someone or reply!', quoted: msg })
        return
    }

    const senderName = sender.split('@')[0]
    const targetName = target.split('@')[0]
    const targetUser = await getUserFlexible(target)
    const senderUser = await getUserFlexible(sender)

    const murderGifs = [
        'https://media.tenor.com/Wnbs9HNZLD4AAAAC/anime-stab.gif',
        'https://media.tenor.com/6j1ZHqFGkkkAAAAC/anime-murder.gif',
        'https://media.tenor.com/QmPEFoqRXTsAAAAC/kill-anime.gif'
    ]
    const gifUrl = murderGifs[Math.floor(Math.random() * murderGifs.length)]

    const mysteryLines = [
        'No witnesses. No evidence. Just vibes. 🔪',
        'The royal investigators have no leads. Suspicious. 👀',
        'The kingdom mourns. Nobody is surprised. 💀',
        'Motive unknown. Everyone is a suspect. 🕵️',
        'The body was found in the throne room. Awkward. 💀',
        'It was ruled an accident. Nobody believes that. 👀'
    ]
    const mysteryLine = mysteryLines[Math.floor(Math.random() * mysteryLines.length)]

    let caption
    if (targetUser?.rank && senderUser?.rank) {
        caption = `🔪 @${senderName} (${senderUser.rank}) has MURDERED @${targetName} (${targetUser.rank}) in cold blood!!\n\n🕵️ ${mysteryLine}\n\n👑 _The Emperor has been informed._`
    } else {
        caption = `🔪 @${senderName} has MURDERED @${targetName} in cold blood!!\n\n🕵️ ${mysteryLine}`
    }

    if (gifUrl) {
        await sock.sendMessage(from, { image: { url: gifUrl }, caption, mentions: [sender, target], quoted: msg })
    } else {
        await sock.sendMessage(from, { text: caption, mentions: [sender, target], quoted: msg })
    }
}

async function bombCommand(sock, msg, from, sender, args) {
    const target = getTarget(msg, args)
    if (!target) {
        await sock.sendMessage(from, { text: '💣 Bomb WHO?? Tag someone or reply!', quoted: msg })
        return
    }

    const senderName = sender.split('@')[0]
    const targetName = target.split('@')[0]
    const targetUser = await getUserFlexible(target)
    const senderUser = await getUserFlexible(sender)

    const bombGifs = [
        'https://media.tenor.com/3e3gJJxcXM8AAAAC/anime-explosion.gif',
        'https://media.tenor.com/L9CNXR5FXpAAAAAC/explosion-anime.gif',
        'https://media.tenor.com/2GDMRbKOkHEAAAAC/anime-bomb.gif'
    ]
    const gifUrl = bombGifs[Math.floor(Math.random() * bombGifs.length)]

    const explosionLines = [
        'The crater is still smoking 💥',
        'Imperial architects are already rebuilding 🏗️',
        'They felt that in 3 kingdoms over 💥',
        'The shockwave was felt in the royal palace 👑',
        'Seismologists are confused 📊',
        'The Emperor pretended not to notice 👀'
    ]
    const explosionLine = explosionLines[Math.floor(Math.random() * explosionLines.length)]

    let caption
    if (targetUser?.rank && senderUser?.rank) {
        caption = `💣 @${senderName} (${senderUser.rank}) just BOMBED @${targetName} (${targetUser.rank})!!\n\n💥 BOOOOM!! ${explosionLine}\n\n👑 _The Emperor files a noise complaint._`
    } else {
        caption = `💣 @${senderName} just BOMBED @${targetName}!!\n\n💥 BOOOOM!! ${explosionLine}`
    }

    if (gifUrl) {
        await sock.sendMessage(from, { image: { url: gifUrl }, caption, mentions: [sender, target], quoted: msg })
    } else {
        await sock.sendMessage(from, { text: caption, mentions: [sender, target], quoted: msg })
    }
}

 async function kidnapCommand(sock, msg, from, sender, args) {
    const target = getTarget(msg, args)
    if (!target) {
        await sock.sendMessage(from, { text: '🎭 Kidnap WHO?? Tag someone or reply!', quoted: msg })
        return
    }

    const senderName = sender.split('@')[0]
    const targetName = target.split('@')[0]
    const targetUser = await getUserFlexible(target)
    const senderUser = await getUserFlexible(sender)

    const kidnapGifs = [
        'https://media.tenor.com/Iy1hFoAeU8AAAAAC/anime-kidnap.gif',
        'https://media.tenor.com/8sFHOoJqVBUAAAAC/kidnap-anime.gif',
        'https://media.tenor.com/nGmBfVGQXEAAAAAC/anime-grab.gif'
    ]
    const gifUrl = kidnapGifs[Math.floor(Math.random() * kidnapGifs.length)]

    const ransomAmount = Math.floor(Math.random() * 9901) + 100
    const ransomItems = [
        `${ransomAmount} Gold Coins 💰`,
        `${ransomAmount} Imperial Tokens 👑`,
        `${ransomAmount} Royal Gems 💎`,
        `${ransomAmount} Kingdom Credits 🏰`
    ]
    const ransom = ransomItems[Math.floor(Math.random() * ransomItems.length)]

    const kidnapLines = [
        'was snatched in broad daylight. Bold move. 😭',
        'got yeeted into a burlap sack. Classy. 💀',
        'has been relocated against their will. Legally speaking. 👀',
        'is currently in an undisclosed royal dungeon. 🏰',
        'was grabbed so fast the guards are still processing. 💀'
    ]
    const kidnapLine = kidnapLines[Math.floor(Math.random() * kidnapLines.length)]

    let caption
    if (targetUser?.rank && senderUser?.rank) {
        caption = `🎭 @${senderName} (${senderUser.rank}) has KIDNAPPED @${targetName} (${targetUser.rank})!!\n\n😭 The ${targetUser.rank} ${kidnapLine}\n\n📜 *RANSOM NOTE:*\n_"Pay ${ransom} or you'll never see your ${targetUser.rank} again!!"_\n\n👑 _The Emperor refuses to negotiate. Good luck._`
    } else {
        caption = `🎭 @${senderName} has KIDNAPPED @${targetName}!!\n\n😭 ${targetName} ${kidnapLine}\n\n📜 *RANSOM NOTE:*\n_"Pay ${ransom} or you'll never see them again!!"_`
    }

    if (gifUrl) {
        await sock.sendMessage(from, { image: { url: gifUrl }, caption, mentions: [sender, target], quoted: msg })
    } else {
        await sock.sendMessage(from, { text: caption, mentions: [sender, target], quoted: msg })
    }
}

async function fuckCommand(sock, msg, from, sender, args) {
    const target = getTarget(msg, args)
    if (!target) {
        await sock.sendMessage(from, { text: '😏 Tag someone or reply to their message!', quoted: msg })
        return
    }

    const senderName = sender.split('@')[0]
    const targetName = target.split('@')[0]
    const targetUser = await getUserFlexible(target)
    const senderUser = await getUserFlexible(sender)

    let gifUrl = null
    try {
        const res = await fetch('https://nekos.best/api/v2/kiss')
        const data = await res.json()
        gifUrl = data.results[0]?.url || null
    } catch {}

    const lines = [
        'The royal bedchambers have been reserved 👀',
        'The Emperor looks away respectfully 👑',
        'The kingdom did NOT need to see this 😭',
        'Guards have been dismissed from the area 💀',
        'This is NOT in the imperial constitution 📜',
        'History books will not record this moment 👀'
    ]
    const line = lines[Math.floor(Math.random() * lines.length)]

    let caption
    if (targetUser?.rank && senderUser?.rank) {
        caption = `😏 @${senderName} (${senderUser.rank}) and @${targetName} (${targetUser.rank})...\n\n🔞 ${line}\n\n👑 _The Emperor pretends to be blind._`
    } else {
        caption = `😏 @${senderName} and @${targetName}...\n\n🔞 ${line}`
    }

    if (gifUrl) {
        await sock.sendMessage(from, { image: { url: gifUrl }, caption, mentions: [sender, target], quoted: msg })
    } else {
        await sock.sendMessage(from, { text: caption, mentions: [sender, target], quoted: msg })
    }
}

async function wankCommand(sock, msg, from, sender) {
    const senderName = sender.split('@')[0]
    const user = await getUserFlexible(sender)

    const wankGifs = [
        'https://media.tenor.com/DGMXfGPpMvAAAAAC/anime-embarrassed.gif',
        'https://media.tenor.com/ozy3RMoHH3IAAAAC/anime-caught.gif',
        'https://media.tenor.com/Yr8PCtW8vNsAAAAC/anime-shocked.gif'
    ]
    const gifUrl = wankGifs[Math.floor(Math.random() * wankGifs.length)]

    const caughtLines = [
        'was caught in 4K by the royal guards 💀',
        'thought nobody was watching. The Emperor was watching. 👑',
        'has been reported to the imperial court 📜',
        'the kingdom has seen too much today 😭',
        'even the castle walls are traumatized 💀',
        'was caught red handed. Literally. 👀'
    ]
    const caughtLine = caughtLines[Math.floor(Math.random() * caughtLines.length)]

    let caption
    if (user?.rank) {
        caption = `💀 @${senderName} (${user.rank}) ${caughtLine}\n\n😭 A ${user.rank}... doing THIS... in the kingdom...\n\n👑 _The Emperor is disappointed but not surprised._`
    } else {
        caption = `💀 @${senderName} ${caughtLine}\n\n😭 The kingdom has seen too much today.`
    }

    if (gifUrl) {
        await sock.sendMessage(from, { image: { url: gifUrl }, caption, mentions: [sender], quoted: msg })
    } else {
        await sock.sendMessage(from, { text: caption, mentions: [sender], quoted: msg })
    }
}

async function goonCommand(sock, msg, from, sender, args) {
    const target = getTarget(msg, args)
    if (!target) {
        await sock.sendMessage(from, { text: '😭 Tag someone or reply to their message!', quoted: msg })
        return
    }

    const senderName = sender.split('@')[0]
    const targetName = target.split('@')[0]
    const targetUser = await getUserFlexible(target)
    const senderUser = await getUserFlexible(sender)

    const goonGifs = [
        'https://media.tenor.com/DGMXfGPpMvAAAAAC/anime-embarrassed.gif',
        'https://media.tenor.com/ozy3RMoHH3IAAAAC/anime-nosebleed.gif',
        'https://media.tenor.com/3BmkfPVaXgAAAAAC/anime-drool.gif'
    ]
    const gifUrl = goonGifs[Math.floor(Math.random() * goonGifs.length)]

    const goonLines = [
        'The imperial therapist has been called 📞',
        'The kingdom files a formal complaint 📜',
        'Even the dungeon prisoners are uncomfortable 💀',
        'The royal court is in emergency session 😭',
        'This has been added to the list of banned activities 📋',
        'The Emperor has left the group chat 👑💨'
    ]
    const goonLine = goonLines[Math.floor(Math.random() * goonLines.length)]

    let caption
    if (targetUser?.rank && senderUser?.rank) {
        caption = `😭 @${senderName} (${senderUser.rank}) is GOONING over @${targetName} (${targetUser.rank})!!\n\n💀 ${goonLine}\n\n👑 _This is NOT what the empire was built for._`
    } else {
        caption = `😭 @${senderName} is GOONING over @${targetName}!!\n\n💀 ${goonLine}`
    }

    if (gifUrl) {
        await sock.sendMessage(from, { image: { url: gifUrl }, caption, mentions: [sender, target], quoted: msg })
    } else {
        await sock.sendMessage(from, { text: caption, mentions: [sender, target], quoted: msg })
    }
 }
module.exports = {
    hugCommand,
    kissCommand,
    slapCommand,
    waveCommand,
    patCommand,
    danceCommand,
    sadCommand,
    smileCommand,
    laughCommand,
    punchCommand,
    bonkCommand,
    tickleCommand,
    shrugCommand,
    killCommand, 
    murderCommand, 
    bombCommand, 
    fuckCommand, 
    wankCommand, 
    goonCommand 
    }
