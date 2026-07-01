const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args))

function progressBar(percent) {
    const filled = Math.round(percent / 10)
    const empty = 10 - filled
    return '[' + '■'.repeat(filled) + '□'.repeat(empty) + ']'
}

function randomPercent() {
    return Math.floor(Math.random() * 101)
}

async function claudeRoast(prompt) {
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
                max_tokens: 150,
                messages: [{ role: 'user', content: prompt }]
            })
        })
        const data = await res.json()
        return data.content[0].text.trim()
    } catch {
        return null
    }
}

async function gayCommand(sock, msg, from, sender, pushName) {
    const percent = randomPercent()
    const bar = progressBar(percent)
    const roast = await claudeRoast(
        `In one short savage empire-themed sentence, roast someone who is ${percent}% gay. Be funny and creative. No hashtags, no quotes, just the sentence.`
    ) || '👑 The Emperor has no comment.'

    await sock.sendMessage(from, {
        text: `⚔️〔 🌈 GAY ANALYSIS 🌈 〕⚔️\n\n🏳️‍🌈 Analyzing: @${sender.split('@')[0]}\n💛 Gayness: *${percent}%*\n${bar}\n\n👑 ${roast}`,
        mentions: [sender],
        quoted: msg
    })
}

async function lesbianCommand(sock, msg, from, sender) {
    const percent = randomPercent()
    const bar = progressBar(percent)
    const roast = await claudeRoast(
        `In one short savage empire-themed sentence, roast someone who is ${percent}% lesbian. Be funny and creative. No hashtags, no quotes, just the sentence.`
    ) || '👑 The Empress raises an eyebrow.'

    await sock.sendMessage(from, {
        text: `⚔️〔 🌸 LESBIAN ANALYSIS 🌸 〕⚔️\n\n🌺 Analyzing: @${sender.split('@')[0]}\n💗 Lesbianness: *${percent}%*\n${bar}\n\n👑 ${roast}`,
        mentions: [sender],
        quoted: msg
    })
}

async function simpCommand(sock, msg, from, sender) {
    const percent = randomPercent()
    const bar = progressBar(percent)
    const roast = await claudeRoast(
        `In one short savage empire-themed sentence, roast someone who is ${percent}% a simp. Be funny and creative. No hashtags, no quotes, just the sentence.`
    ) || '👑 The Emperor is embarrassed for you.'

    await sock.sendMessage(from, {
        text: `⚔️〔 💘 SIMP DETECTOR 💘 〕⚔️\n\n🎯 Analyzing: @${sender.split('@')[0]}\n💀 Simp Level: *${percent}%*\n${bar}\n\n👑 ${roast}`,
        mentions: [sender],
        quoted: msg
    })
}

async function ppCommand(sock, msg, from, sender) {
    const sizes = ['1cm', '2cm', '3cm', '5cm', '7cm', '10cm', '13cm', '15cm', '18cm', '20cm', '25cm', '30cm']
    const size = sizes[Math.floor(Math.random() * sizes.length)]
    const roast = await claudeRoast(
        `In one short savage empire-themed sentence, react to someone whose pp size is ${size}. Be funny. No hashtags, no quotes, just the sentence.`
    ) || '👑 The Emperor has seen better kingdoms.'

    await sock.sendMessage(from, {
        text: `⚔️〔 👑 MEASUREMENT 👑 〕⚔️\n\n📏🍆 Measuring: @${sender.split('@')[0]}\n👑 Size: *${size}*\n\n💀 ${roast}`,
        mentions: [sender],
        quoted: msg
    })
}

async function shipCommand(sock, msg, from, sender, args) {
    let user1, user2, user1Name, user2Name

    // Mode 3: Reply to a message
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.participant
    if (quoted && args.length === 0) {
        user1 = sender
        user2 = quoted
        user1Name = sender.split('@')[0]
        user2Name = quoted.split('@')[0]
    }
    // Mode 1: .ship @user1 @user2
    else if (args.length >= 2) {
        const mentions = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || []
        if (mentions.length >= 2) {
            user1 = mentions[0]
            user2 = mentions[1]
            user1Name = mentions[0].split('@')[0]
            user2Name = mentions[1].split('@')[0]
        }
    }
    // Mode 2: .ship @user
    else if (args.length === 1) {
        const mentions = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || []
        if (mentions.length >= 1) {
            user1 = sender
            user2 = mentions[0]
            user1Name = sender.split('@')[0]
            user2Name = mentions[0].split('@')[0]
        }
    }

    if (!user1 || !user2) {
        await sock.sendMessage(from, {
            text: '⚔️ Usage:\n.ship @user1 @user2\n.ship @user\nOr reply to someone\'s message with .ship',
            quoted: msg
        })
        return
    }

    const percent = randomPercent()
    const bar = progressBar(percent)
    const roast = await claudeRoast(
        `In one short savage empire-themed sentence, comment on a ${percent}% compatibility match between two people in a kingdom. Be funny and creative. No hashtags, no quotes, just the sentence.`
    ) || '👑 The Emperor has blessed this union... barely.'

    const shipName = user1Name.slice(0, 3) + user2Name.slice(0, 3)

    await sock.sendMessage(from, {
        text: `💘〔 ⚔️ SHIP ANALYSIS ⚔️ 〕💘\n\n💫 Shipping @${user1Name} & @${user2Name}\n\n💑 Ship Name: *${shipName}*\n❤️ Match: *${percent}%*\n${bar}\n\n👑 ${roast}`,
        mentions: [user1, user2],
        quoted: msg
    })
}

async function jokeCommand(sock, msg, from, sender) {
    const joke = await claudeRoast(
        `Generate one short funny empire/medieval themed joke. Make it clever and original. No hashtags, no quotes, just the joke itself.`
    ) || '👑 Why did the knight cross the road? To get to the other castle!'

    await sock.sendMessage(from, {
        text: `⚔️〔 👑 IMPERIAL JOKE 👑 〕⚔️\n\n🃏 ${joke}\n\n👑 _The Emperor laughs alone._`,
        mentions: [sender],
        quoted: msg
    })
}

async function truthCommand(sock, msg, from, sender) {
    const truth = await claudeRoast(
        `Generate one juicy, slightly uncomfortable but funny truth question for a WhatsApp group game. Empire themed. No hashtags, no quotes, just the question.`
    ) || '👑 When was the last time you truly embarrassed yourself in front of the whole kingdom?'

    await sock.sendMessage(from, {
        text: `⚔️〔 👑 TRUTH 👑 〕⚔️\n\n@${sender.split('@')[0]} must answer:\n\n🔮 ${truth}\n\n👑 _The Emperor demands honesty._`,
        mentions: [sender],
        quoted: msg
    })
}

async function dareCommand(sock, msg, from, sender) {
    const dare = await claudeRoast(
        `Generate one funny and slightly embarrassing dare for a WhatsApp group game. Empire themed. No hashtags, no quotes, just the dare.`
    ) || '👑 Send a voice note of yourself doing a royal speech for 10 seconds.'

    await sock.sendMessage(from, {
        text: `⚔️〔 👑 DARE 👑 〕⚔️\n\n@${sender.split('@')[0]} must:\n\n🎯 ${dare}\n\n👑 _The Emperor is watching._`,
        mentions: [sender],
        quoted: msg
    })
}

async function tdCommand(sock, msg, from, sender) {
    const isTruth = Math.random() > 0.5
    if (isTruth) {
        await truthCommand(sock, msg, from, sender)
    } else {
        await dareCommand(sock, msg, from, sender)
    }
}

async function wyrCommand(sock, msg, from, sender) {
    const wyr = await claudeRoast(
        `Generate one funny "Would You Rather" question with two options. Empire/medieval themed. Format exactly like this: "Would you rather [option A] OR [option B]?" No hashtags, just the question.`
    ) || '👑 Would you rather fight 100 peasant-sized knights OR 1 knight-sized peasant?'

    await sock.sendMessage(from, {
        text: `⚔️〔 👑 WOULD YOU RATHER 👑 〕⚔️\n\n@${sender.split('@')[0]}\n\n🤔 ${wyr}\n\n👑 _Choose wisely. The Emperor judges._`,
        mentions: [sender],
        quoted: msg
    })
          }

async function memeCommand(sock, msg, from) {
    try {
        const subreddits = ['memes', 'dankmemes', 'me_irl', 'funny', 'terriblefacebookmemes']
        const sub = subreddits[Math.floor(Math.random() * subreddits.length)]
        const res = await fetch(`https://meme-api.com/gimme/${sub}`)
        const data = await res.json()

        if (!data.url) throw new Error('No meme found')

        await sock.sendMessage(from, {
            image: { url: data.url },
            caption: `⚔️〔 👑 IMPERIAL MEME 👑 〕⚔️\n\n📜 ${data.title}\n\n👑 _The Emperor approves._`,
            quoted: msg
        })
    } catch {
        await sock.sendMessage(from, {
            text: '❌ The royal meme vault is empty. Try again!',
            quoted: msg
        })
    }
}

module.exports = {
    gayCommand,
    lesbianCommand,
    simpCommand,
    ppCommand,
    shipCommand,
    jokeCommand,
    truthCommand,
    dareCommand,
    tdCommand,
    wyrCommand,
    memeCommand
  }
