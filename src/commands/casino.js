const { getUser, updateUser } = require('../data/db')

// ─── House Edge RNG ───────────────────────────────────────────────
function houseRoll(winChance) {
    const houseEdge = 0.05
    const adjustedChance = winChance * (1 - houseEdge)
    return Math.random() < adjustedChance
}

function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

// ─── Bet Validation ───────────────────────────────────────────────
async function validateBet(sender, betArg, min = 10) {
    const user = await getUser(sender)
    if (!user) return { error: '❌ User not found.' }

    const bet = betArg === 'all' ? user.wallet : parseInt(betArg)
    if (isNaN(bet) || bet < min) return { error: `❌ Minimum bet is ${min} 🪙` }
    if (bet > user.wallet) return { error: `❌ Not enough Gold. You have ${user.wallet} 🪙` }

    return { user, bet }
}

// ─── COIN FLIP ────────────────────────────────────────────────────
async function coinFlipCommand(sock, msg, from, sender, args) {
    const side = args[0]?.toLowerCase()
    const betArg = args[1]

    if (!side || !['heads', 'tails', 'h', 't'].includes(side)) {
        await sock.sendMessage(from, {
            text: `🪙 *COIN FLIP*\n━━━━━━━━━━━━━━━━\nUsage: *.flip heads 100* or *.flip tails all*\n━━━━━━━━━━━━━━━━`,
            quoted: msg
        })
        return
    }

    const { error, user, bet } = await validateBet(sender, betArg)
    if (error) return sock.sendMessage(from, { text: error, quoted: msg })

    const userSide = ['h', 'heads'].includes(side) ? 'heads' : 'tails'
    const result = houseRoll(0.5) ? userSide : (userSide === 'heads' ? 'tails' : 'heads')
    const won = result === userSide
    const payout = won ? bet : -bet

    await updateUser(sender, { wallet: user.wallet + payout })

    await sock.sendMessage(from, {
        text: `🪙 *COIN FLIP*
━━━━━━━━━━━━━━━━
👤 ${user.username}
━━━━━━━━━━━━━━━━
Your pick: *${userSide.toUpperCase()}*
Result: *${result.toUpperCase()}* ${result === 'heads' ? '👑' : '🦅'}
━━━━━━━━━━━━━━━━
${won ? `🎉 You won *+${bet} 🪙*` : `😞 You lost *-${bet} 🪙*`}
👝 Wallet: ${user.wallet + payout} 🪙
━━━━━━━━━━━━━━━━`,
        quoted: msg
    })
}

// ─── DICE ────────────────────────────────────────────────────────
async function diceCommand(sock, msg, from, sender, args) {
    const betArg = args[0]
    const guess = parseInt(args[1])

    if (!betArg || isNaN(guess) || guess < 1 || guess > 6) {
        await sock.sendMessage(from, {
            text: `🎲 *DICE*\n━━━━━━━━━━━━━━━━\nUsage: *.dice 100 4* (bet amount, guess 1-6)\nGuess right = *5x payout!*\n━━━━━━━━━━━━━━━━`,
            quoted: msg
        })
        return
    }

    const { error, user, bet } = await validateBet(sender, betArg)
    if (error) return sock.sendMessage(from, { text: error, quoted: msg })

    const roll = randInt(1, 6)
    const won = roll === guess
    const payout = won ? bet * 4 : -bet

    await updateUser(sender, { wallet: user.wallet + payout })

    const diceEmojis = ['', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣']

    await sock.sendMessage(from, {
        text: `🎲 *DICE ROLL*
━━━━━━━━━━━━━━━━
👤 ${user.username}
━━━━━━━━━━━━━━━━
Your guess: ${diceEmojis[guess]}
Result: ${diceEmojis[roll]}
━━━━━━━━━━━━━━━━
${won ? `✅ *CORRECT!* You won *+${bet * 4} 🪙*` : `😞 Wrong! You lost *-${bet} 🪙*`}
👝 Wallet: ${user.wallet + payout} 🪙
━━━━━━━━━━━━━━━━`,
        quoted: msg
    })
}

// ─── SLOTS ───────────────────────────────────────────────────────
const SLOT_SYMBOLS = ['🍒', '🍋', '🍊', '⭐', '💎', '👑']
const SLOT_PAYOUTS = {
    '👑👑👑': 10,
    '💎💎💎': 7,
    '⭐⭐⭐': 5,
    '🍊🍊🍊': 3,
    '🍋🍋🍋': 2,
    '🍒🍒🍒': 2,
    'two_crown': 3,
    'two_diamond': 2,
    'any_cherry': 1.5
}

function spinSlots() {
    return [
        SLOT_SYMBOLS[randInt(0, 5)],
        SLOT_SYMBOLS[randInt(0, 5)],
        SLOT_SYMBOLS[randInt(0, 5)]
    ]
}

function calcSlotPayout(reels, bet) {
    const key = reels.join('')
    if (SLOT_PAYOUTS[key]) return Math.floor(bet * SLOT_PAYOUTS[key])
    if (reels[0] === reels[1] && reels[1] === reels[2]) return Math.floor(bet * 2)
    const crowns = reels.filter(r => r === '👑').length
    const diamonds = reels.filter(r => r === '💎').length
    const cherries = reels.filter(r => r === '🍒').length
    if (crowns >= 2) return Math.floor(bet * SLOT_PAYOUTS['two_crown'])
    if (diamonds >= 2) return Math.floor(bet * SLOT_PAYOUTS['two_diamond'])
    if (cherries >= 1) return Math.floor(bet * SLOT_PAYOUTS['any_cherry'])
    return 0
}

async function slotsCommand(sock, msg, from, sender, args) {
    const betArg = args[0]

    if (!betArg) {
        await sock.sendMessage(from, {
            text: `🎰 *SLOTS*\n━━━━━━━━━━━━━━━━\nUsage: *.slots 100* or *.slots all*\n\n💎💎💎 = 7x  |  👑👑👑 = 10x\n⭐⭐⭐ = 5x  |  🍊🍊🍊 = 3x\n🍒🍒🍒 = 2x  |  Two 👑 = 3x\n━━━━━━━━━━━━━━━━`,
            quoted: msg
        })
        return
    }

    const { error, user, bet } = await validateBet(sender, betArg)
    if (error) return sock.sendMessage(from, { text: error, quoted: msg })

    const reels = spinSlots()
    const winAmount = calcSlotPayout(reels, bet)
    const payout = winAmount > 0 ? winAmount - bet : -bet

    await updateUser(sender, { wallet: user.wallet + payout })

    await sock.sendMessage(from, {
        text: `🎰 *SLOTS*
━━━━━━━━━━━━━━━━
👤 ${user.username}
━━━━━━━━━━━━━━━━
[ ${reels[0]} | ${reels[1]} | ${reels[2]} ]
━━━━━━━━━━━━━━━━
${winAmount > 0 ? `🎉 You won *+${winAmount} 🪙*` : `😞 No match! You lost *-${bet} 🪙*`}
👝 Wallet: ${user.wallet + payout} 🪙
━━━━━━━━━━━━━━━━`,
        quoted: msg
    })
}

// ─── BLACKJACK ───────────────────────────────────────────────────
const BLACKJACK_SESSIONS = new Map()

function createDeck() {
    const suits = ['♠', '♥', '♦', '♣']
    const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
    const deck = []
    for (const suit of suits) {
        for (const val of values) {
            deck.push({ suit, val })
        }
    }
    return deck.sort(() => Math.random() - 0.5)
}

function cardValue(card) {
    if (['J', 'Q', 'K'].includes(card.val)) return 10
    if (card.val === 'A') return 11
    return parseInt(card.val)
}

function handTotal(hand) {
    let total = hand.reduce((sum, c) => sum + cardValue(c), 0)
    let aces = hand.filter(c => c.val === 'A').length
    while (total > 21 && aces > 0) {
        total -= 10
        aces--
    }
    return total
}

function formatHand(hand) {
    return hand.map(c => `${c.val}${c.suit}`).join(' ')
}

async function blackjackCommand(sock, msg, from, sender, args) {
    const betArg = args[0]

    if (!betArg) {
        await sock.sendMessage(from, {
            text: `🃏 *BLACKJACK*\n━━━━━━━━━━━━━━━━\nUsage: *.bj 100* to start\nThen: *.hit* or *.stand*\nGet closer to 21 than the dealer!\n━━━━━━━━━━━━━━━━`,
            quoted: msg
        })
        return
    }

    if (BLACKJACK_SESSIONS.has(sender)) {
        await sock.sendMessage(from, {
            text: `⚠️ You already have an active blackjack game!\nUse *.hit* or *.stand*`,
            quoted: msg
        })
        return
    }

    const { error, user, bet } = await validateBet(sender, betArg)
    if (error) return sock.sendMessage(from, { text: error, quoted: msg })

    const deck = createDeck()
    const playerHand = [deck.pop(), deck.pop()]
    const dealerHand = [deck.pop(), deck.pop()]

    BLACKJACK_SESSIONS.set(sender, { deck, playerHand, dealerHand, bet, from })

    const playerTotal = handTotal(playerHand)

    if (playerTotal === 21) {
        const winAmount = Math.floor(bet * 1.5)
        await updateUser(sender, { wallet: user.wallet + winAmount })
        BLACKJACK_SESSIONS.delete(sender)
        await sock.sendMessage(from, {
            text: `🃏 *BLACKJACK*
━━━━━━━━━━━━━━━━
👤 ${user.username}
━━━━━━━━━━━━━━━━
Your hand: ${formatHand(playerHand)} = *21*
Dealer: ${formatHand(dealerHand)} = ${handTotal(dealerHand)}
━━━━━━━━━━━━━━━━
🎉 *BLACKJACK!* You won *+${winAmount} 🪙*
👝 Wallet: ${user.wallet + winAmount} 🪙
━━━━━━━━━━━━━━━━`,
            quoted: msg
        })
        return
    }

    await sock.sendMessage(from, {
        text: `🃏 *BLACKJACK*
━━━━━━━━━━━━━━━━
👤 ${user.username} | Bet: ${bet} 🪙
━━━━━━━━━━━━━━━━
Your hand: ${formatHand(playerHand)} = *${playerTotal}*
Dealer shows: ${dealerHand[0].val}${dealerHand[0].suit} 🂠
━━━━━━━━━━━━━━━━
Type *.hit* to draw or *.stand* to hold
━━━━━━━━━━━━━━━━`,
        quoted: msg
    })
}

async function hitCommand(sock, msg, from, sender) {
    const session = BLACKJACK_SESSIONS.get(sender)
    if (!session) {
        await sock.sendMessage(from, { text: `❌ No active blackjack game. Start one with *.bj 100*`, quoted: msg })
        return
    }

    const user = await getUser(sender)
    session.playerHand.push(session.deck.pop())
    const total = handTotal(session.playerHand)

    if (total > 21) {
        BLACKJACK_SESSIONS.delete(sender)
        await updateUser(sender, { wallet: user.wallet - session.bet })
        await sock.sendMessage(from, {
            text: `🃏 *BLACKJACK*
━━━━━━━━━━━━━━━━
Your hand: ${formatHand(session.playerHand)} = *${total}*
━━━━━━━━━━━━━━━━
💥 *BUST!* You lost *-${session.bet} 🪙*
👝 Wallet: ${user.wallet - session.bet} 🪙
━━━━━━━━━━━━━━━━`,
            quoted: msg
        })
        return
    }

    if (total === 21) {
        await standCommand(sock, msg, from, sender)
        return
    }

    await sock.sendMessage(from, {
        text: `🃏 *BLACKJACK*
━━━━━━━━━━━━━━━━
Your hand: ${formatHand(session.playerHand)} = *${total}*
Dealer shows: ${session.dealerHand[0].val}${session.dealerHand[0].suit} 🂠
━━━━━━━━━━━━━━━━
Type *.hit* or *.stand*
━━━━━━━━━━━━━━━━`,
        quoted: msg
    })
}

async function standCommand(sock, msg, from, sender) {
    const session = BLACKJACK_SESSIONS.get(sender)
    if (!session) {
        await sock.sendMessage(from, { text: `❌ No active blackjack game. Start one with *.bj 100*`, quoted: msg })
        return
    }

    const user = await getUser(sender)
    BLACKJACK_SESSIONS.delete(sender)

    while (handTotal(session.dealerHand) < 17) {
        session.dealerHand.push(session.deck.pop())
    }

    const playerTotal = handTotal(session.playerHand)
    const dealerTotal = handTotal(session.dealerHand)

    let payout = 0
    let resultText = ''

    if (dealerTotal > 21 || playerTotal > dealerTotal) {
        payout = session.bet
        resultText = `🎉 You won *+${session.bet} 🪙*`
    } else if (playerTotal === dealerTotal) {
        payout = 0
        resultText = `🤝 *PUSH!* Bet returned.`
    } else {
        payout = -session.bet
        resultText = `❌ Dealer wins! You lost *-${session.bet} 🪙*`
    }

    await updateUser(sender, { wallet: user.wallet + payout })

    await sock.sendMessage(from, {
        text: `🃏 *BLACKJACK*
━━━━━━━━━━━━━━━━
Your hand: ${formatHand(session.playerHand)} = *${playerTotal}*
Dealer hand: ${formatHand(session.dealerHand)} = *${dealerTotal}*
━━━━━━━━━━━━━━━━
${resultText}
👝 Wallet: ${user.wallet + payout} 🪙
━━━━━━━━━━━━━━━━`,
        quoted: msg
    })
}

// ─── ROULETTE ────────────────────────────────────────────────────
const ROULETTE_NUMBERS = Array.from({ length: 37 }, (_, i) => i)
const RED_NUMBERS = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]

async function rouletteCommand(sock, msg, from, sender, args) {
    const betType = args[0]?.toLowerCase()
    const betArg = args[1]

    const validTypes = ['red', 'black', 'even', 'odd', 'high', 'low', 'number']

    if (!betType || !validTypes.includes(betType)) {
        await sock.sendMessage(from, {
            text: `🎡 *ROULETTE*
━━━━━━━━━━━━━━━━
Usage: *.roulette [type] [bet]*

Types:
• red/black — 2x payout
• even/odd — 2x payout  
• high(19-36)/low(1-18) — 2x payout
• number 0-36 — 35x payout!

Example: *.roulette red 100*
━━━━━━━━━━━━━━━━`,
            quoted: msg
        })
        return
    }

    let finalBetArg = betArg
    let numberGuess = null

    if (betType === 'number') {
        numberGuess = parseInt(args[1])
        finalBetArg = args[2]
        if (isNaN(numberGuess) || numberGuess < 0 || numberGuess > 36) {
            return sock.sendMessage(from, { text: `❌ Pick a number between 0 and 36`, quoted: msg })
        }
    }

    const { error, user, bet } = await validateBet(sender, finalBetArg)
    if (error) return sock.sendMessage(from, { text: error, quoted: msg })

    const spin = ROULETTE_NUMBERS[randInt(0, 36)]
    const isRed = RED_NUMBERS.includes(spin)
    const color = spin === 0 ? '🟢' : isRed ? '🔴' : '⚫'

    let won = false
    let multiplier = 2

    if (betType === 'red') won = isRed && spin !== 0
    else if (betType === 'black') won = !isRed && spin !== 0
    else if (betType === 'even') won = spin !== 0 && spin % 2 === 0
    else if (betType === 'odd') won = spin % 2 !== 0
    else if (betType === 'high') won = spin >= 19
    else if (betType === 'low') won = spin >= 1 && spin <= 18
    else if (betType === 'number') {
        won = spin === numberGuess
        multiplier = 35
    }

    const payout = won ? bet * (multiplier - 1) : -bet
    await updateUser(sender, { wallet: user.wallet + payout })

    await sock.sendMessage(from, {
        text: `🎡 *ROULETTE*
━━━━━━━━━━━━━━━━
👤 ${user.username}
━━━━━━━━━━━━━━━━
Ball landed on: ${color} *${spin}*
Your bet: *${betType}${numberGuess !== null ? ` ${numberGuess}` : ''}*
━━━━━━━━━━━━━━━━
${won ? `🎉 You won *+${bet * (multiplier - 1)} 🪙*` : `😞 You lost *-${bet} 🪙*`}
👝 Wallet: ${user.wallet + payout} 🪙
━━━━━━━━━━━━━━━━`,
        quoted: msg
    })
}

module.exports = {
    coinFlipCommand,
    diceCommand,
    slotsCommand,
    blackjackCommand,
    hitCommand,
    standCommand,
    rouletteCommand
      }
