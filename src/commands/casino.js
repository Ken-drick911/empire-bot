const { getUser, updateUser } = require('../data/db')

// ─── CASINO SESSIONS ─────────────────────────────────────────────
const casinoEntry = new Map()      // sender → expiry timestamp
const gameCooldowns = new Map()    // sender → { game: expiry }

const ENTRY_COST_PER_UNIT = 100
const ENTRY_MINUTES_PER_UNIT = 20
const MAX_ENTRY = 1000

const COOLDOWN_SECONDS = {
    flip: 40,
    dice: 60,
    slots: 120,
    bj: 180,
    blackjack: 180,
    roulette: 120,
    rou: 120,
    db: 180,
    casino: 300
}

// ─── ENTRY HELPERS ───────────────────────────────────────────────
function hasEntry(sender) {
    const expiry = casinoEntry.get(sender)
    if (!expiry) return false
    if (Date.now() > expiry) {
        casinoEntry.delete(sender)
        return false
    }
    return true
}

function getRemainingEntry(sender) {
    const expiry = casinoEntry.get(sender)
    if (!expiry) return 0
    const remaining = expiry - Date.now()
    if (remaining <= 0) {
        casinoEntry.delete(sender)
        return 0
    }
    return Math.ceil(remaining / 1000 / 60)
}

// ─── COOLDOWN HELPERS ────────────────────────────────────────────
function isOnGameCooldown(sender, game) {
    const userCDs = gameCooldowns.get(sender)
    if (!userCDs) return false
    const expiry = userCDs[game]
    if (!expiry) return false
    if (Date.now() > expiry) {
        delete userCDs[game]
        return false
    }
    return true
}

function setGameCooldown(sender, game) {
    const secs = COOLDOWN_SECONDS[game] || 60
    const userCDs = gameCooldowns.get(sender) || {}
    userCDs[game] = Date.now() + secs * 1000
    gameCooldowns.set(sender, userCDs)
}

function getGameCooldownRemaining(sender, game) {
    const userCDs = gameCooldowns.get(sender)
    if (!userCDs || !userCDs[game]) return 0
    const remaining = userCDs[game] - Date.now()
    if (remaining <= 0) return 0
    return remaining
}

function formatTime(ms) {
    const totalSecs = Math.ceil(ms / 1000)
    if (totalSecs < 60) return `${totalSecs}s`
    const mins = Math.floor(totalSecs / 60)
    const secs = totalSecs % 60
    return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`
}

// ─── HOUSE EDGE RNG ──────────────────────────────────────────────
function houseRoll(winChance) {
    return Math.random() < winChance * 0.95
}

function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

// ─── BET VALIDATION ──────────────────────────────────────────────
async function validateBet(sender, betArg, min = 10) {
    const user = await getUser(sender)
    if (!user) return { error: '❌ User not found.' }
    if (!betArg) return { error: `❌ You forgot the bet amount.\nExample: *100* or *all*` }
    const bet = betArg === 'all' ? user.wallet : parseInt(betArg)
    if (isNaN(bet) || bet < min) return { error: `❌ Invalid bet. Minimum is *${min} 🪙*` }
    if (bet > user.wallet) return { error: `❌ Not enough Gold. You have *${user.wallet} 🪙*` }
    if (user.wallet === 0) return { error: `❌ Your wallet is empty! Claim *.daily* first.` }
    return { user, bet }
}

// ─── ENTRY FEE ───────────────────────────────────────────────────
async function enterCasinoCommand(sock, msg, from, sender, args) {
    const amountArg = parseInt(args[0])

    if (!args[0] || isNaN(amountArg)) {
        await sock.sendMessage(from, {
            text: `🎰 *CASINO ENTRY*
━━━━━━━━━━━━━━━━
Pay to enter the gambling room!

💰 100 Gold = 20 minutes
💰 Max 1000 Gold = 200 minutes

Usage: *.ec 100* or *.ec 500*

_Paying again adds to your time!_
━━━━━━━━━━━━━━━━`,
            quoted: msg
        })
        return
    }

    if (amountArg % 100 !== 0 || amountArg < 100 || amountArg > MAX_ENTRY) {
        await sock.sendMessage(from, {
            text: `❌ *Invalid amount!*\nMust be a multiple of 100 (100, 200... up to 1000).\n\nExample: *.ec 100* or *.ec 500*`,
            quoted: msg
        })
        return
    }

    const user = await getUser(sender)
    if (!user) return sock.sendMessage(from, { text: '❌ User not found.', quoted: msg })
    if (user.wallet < amountArg) {
        return sock.sendMessage(from, {
            text: `❌ Not enough Gold!\nYou need *${amountArg} 🪙* but have *${user.wallet} 🪙*`,
            quoted: msg
        })
    }

    const units = amountArg / 100
    const minutesAdded = units * ENTRY_MINUTES_PER_UNIT
    const msAdded = minutesAdded * 60 * 1000

    const currentExpiry = casinoEntry.get(sender) || Date.now()
    const newExpiry = Math.max(currentExpiry, Date.now()) + msAdded
    casinoEntry.set(sender, newExpiry)

    await updateUser(sender, { wallet: user.wallet - amountArg })

    const totalRemaining = Math.ceil((newExpiry - Date.now()) / 1000 / 60)

    await sock.sendMessage(from, {
        text: `🎰 *CASINO ENTRY*
━━━━━━━━━━━━━━━━
👤 ${user.username}
━━━━━━━━━━━━━━━━
💰 Paid: *${amountArg} 🪙*
⏱️ Time added: *${minutesAdded} minutes*
⏳ Total time left: *${totalRemaining} minutes*
👝 Wallet: ${user.wallet - amountArg} 🪙
━━━━━━━━━━━━━━━━
🎲 You may now gamble! Good luck!
━━━━━━━━━━━━━━━━`,
        quoted: msg
    })
}

// ─── CHECK COOLDOWNS ─────────────────────────────────────────────
async function checkCooldownCommand(sock, msg, from, sender) {
    const userCDs = gameCooldowns.get(sender) || {}
    const now = Date.now()

    const activeGames = Object.entries(userCDs).filter(([game, expiry]) => expiry > now)

    const entryRemaining = getRemainingEntry(sender)

    if (activeGames.length === 0 && entryRemaining === 0) {
        await sock.sendMessage(from, {
            text: `🎰 *COOLDOWN STATUS*
━━━━━━━━━━━━━━━━
✅ *All cooldowns ready!*
No active casino entry.

Pay entry with *.ec 100* to gamble.
━━━━━━━━━━━━━━━━`,
            quoted: msg
        })
        return
    }

    if (activeGames.length === 0 && entryRemaining > 0) {
        await sock.sendMessage(from, {
            text: `🎰 *COOLDOWN STATUS*
━━━━━━━━━━━━━━━━
✅ *All game cooldowns ready!*
🎰 Casino entry: *${entryRemaining} min left*
━━━━━━━━━━━━━━━━
You're free to gamble!
━━━━━━━━━━━━━━━━`,
            quoted: msg
        })
        return
    }

    const gameNames = {
        flip: '🪙 Coin Flip',
        dice: '🎲 Dice',
        slots: '🎰 Slots',
        bj: '🃏 Blackjack',
        blackjack: '🃏 Blackjack',
        roulette: '🎡 Roulette',
        rou: '🎡 Roulette',
        db: '⚔️ Dice Battle',
        casino: '🎴 Casino'
    }

    const cdLines = activeGames
        .sort((a, b) => a[1] - b[1])
        .map(([game, expiry]) => {
            const remaining = expiry - now
            return `┣ ${gameNames[game] || game}: *${formatTime(remaining)}*`
        })
        .join('\n')

    await sock.sendMessage(from, {
        text: `🎰 *COOLDOWN STATUS*
━━━━━━━━━━━━━━━━
${entryRemaining > 0 ? `🎰 Casino entry: *${entryRemaining} min left*` : `❌ No casino entry — pay *.ec 100*`}
━━━━━━━━━━━━━━━━
⏳ *Active Cooldowns:*
${cdLines}
━━━━━━━━━━━━━━━━`,
        quoted: msg
    })
}

// ─── CASINO HELP ─────────────────────────────────────────────────
async function casinoHelpCommand(sock, msg, from) {
    await sock.sendMessage(from, {
        text: `🎰 *IMPERIAL CASINO* 🎰
━━━━━━━━━━━━━━━━
Pay entry fee first: *.ec 100*
(100 Gold = 20 minutes access)
━━━━━━━━━━━━━━━━
🪙 *COIN FLIP* — .flip heads/tails [bet]
  Cooldown: 40s | Win = 2x

🎲 *DICE* — .dice [bet] [guess 1-6]
  Cooldown: 60s | Win = 5x

🎰 *SLOTS* — .slots [bet]
  Cooldown: 2min | Up to 10x

🃏 *BLACKJACK* — .bj [bet]
  Cooldown: 3min | Win = 2x

🎡 *ROULETTE* — .roulette [type] [bet]
  Cooldown: 2min | Up to 35x

⚔️ *DICE BATTLE* — .db [bet]
  Cooldown: 3min | Win = 2x

🎴 *CASINO* — .casino [bet]
  Cooldown: 5min | Win = 2x

━━━━━━━━━━━━━━━━
📊 Check cooldowns: *.ccd*
🎫 Check entry: *.ec*
━━━━━━━━━━━━━━━━`,
        quoted: msg
    })
}

// ─── ENTRY GATE ──────────────────────────────────────────────────
async function checkEntry(sock, msg, from, sender) {
    if (!hasEntry(sender)) {
        await sock.sendMessage(from, {
            text: `🚫 *Casino access required!*\n\nPay the entry fee to gamble:\n*.ec 100* — 20 minutes access\n*.ec 500* — 100 minutes access\n\n💡 100 Gold per 20 minutes, max 1000 Gold`,
            quoted: msg
        })
        return false
    }
    return true
}

// ─── COIN FLIP ────────────────────────────────────────────────────
async function coinFlipCommand(sock, msg, from, sender, args) {
    if (!await checkEntry(sock, msg, from, sender)) return
    if (isOnGameCooldown(sender, 'flip')) {
        const rem = getGameCooldownRemaining(sender, 'flip')
        return sock.sendMessage(from, { text: `⏳ Coin flip on cooldown! Wait *${formatTime(rem)}*`, quoted: msg })
    }

    const side = args[0]?.toLowerCase()
    const betArg = args[1]

    if (!side || !['heads', 'tails', 'h', 't'].includes(side)) {
        return sock.sendMessage(from, {
            text: `❌ *Wrong format!*\n\n🪙 *COIN FLIP* usage:\n┣ *.flip heads 100*\n┗ *.flip tails all*`,
            quoted: msg
        })
    }

    if (!betArg) {
        return sock.sendMessage(from, {
            text: `❌ *Missing bet amount!*\n\nExample: *.flip ${side} 100*`,
            quoted: msg
        })
    }

    const { error, user, bet } = await validateBet(sender, betArg)
    if (error) return sock.sendMessage(from, { text: error, quoted: msg })

    setGameCooldown(sender, 'flip')

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
⏳ Next flip in: *40s*
━━━━━━━━━━━━━━━━`,
        quoted: msg
    })
}

// ─── DICE ────────────────────────────────────────────────────────
async function diceCommand(sock, msg, from, sender, args) {
    if (!await checkEntry(sock, msg, from, sender)) return
    if (isOnGameCooldown(sender, 'dice')) {
        const rem = getGameCooldownRemaining(sender, 'dice')
        return sock.sendMessage(from, { text: `⏳ Dice on cooldown! Wait *${formatTime(rem)}*`, quoted: msg })
    }

    const betArg = args[0]
    const guess = parseInt(args[1])

    if (!betArg || isNaN(guess) || guess < 1 || guess > 6) {
        return sock.sendMessage(from, {
            text: `❌ *Wrong format!*\n\n🎲 *DICE* usage:\n┣ *.dice 100 4*\n┗ *.dice all 6*\n\nGuess right = *5x payout!*`,
            quoted: msg
        })
    }

    const { error, user, bet } = await validateBet(sender, betArg)
    if (error) return sock.sendMessage(from, { text: error, quoted: msg })

    setGameCooldown(sender, 'dice')

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
${won ? `🎉 *CORRECT!* You won *+${bet * 4} 🪙*` : `😞 Wrong! You lost *-${bet} 🪙*`}
👝 Wallet: ${user.wallet + payout} 🪙
⏳ Next dice in: *60s*
━━━━━━━━━━━━━━━━`,
        quoted: msg
    })
}

// ─── SLOTS ───────────────────────────────────────────────────────
const SLOT_SYMBOLS = ['🍒', '🍋', '🍊', '⭐', '💎', '👑']
const SLOT_PAYOUTS = {
    '👑👑👑': 10, '💎💎💎': 7, '⭐⭐⭐': 5,
    '🍊🍊🍊': 3, '🍋🍋🍋': 2, '🍒🍒🍒': 2
}

function spinSlots() {
    return [SLOT_SYMBOLS[randInt(0, 5)], SLOT_SYMBOLS[randInt(0, 5)], SLOT_SYMBOLS[randInt(0, 5)]]
}

function calcSlotPayout(reels, bet) {
    const key = reels.join('')
    if (SLOT_PAYOUTS[key]) return Math.floor(bet * SLOT_PAYOUTS[key])
    const crowns = reels.filter(r => r === '👑').length
    const diamonds = reels.filter(r => r === '💎').length
    const cherries = reels.filter(r => r === '🍒').length
    if (crowns >= 2) return Math.floor(bet * 3)
    if (diamonds >= 2) return Math.floor(bet * 2)
    if (cherries >= 1) return Math.floor(bet * 1.5)
    return 0
}

async function slotsCommand(sock, msg, from, sender, args) {
    if (!await checkEntry(sock, msg, from, sender)) return
    if (isOnGameCooldown(sender, 'slots')) {
        const rem = getGameCooldownRemaining(sender, 'slots')
        return sock.sendMessage(from, { text: `⏳ Slots on cooldown! Wait *${formatTime(rem)}*`, quoted: msg })
    }

    const betArg = args[0]
    if (!betArg) {
        return sock.sendMessage(from, {
            text: `❌ *Wrong format!*\n\n🎰 *SLOTS* usage:\n┣ *.slots 100*\n┗ *.slots all*\n\n👑👑👑 = 10x | 💎💎💎 = 7x\n⭐⭐⭐ = 5x | 🍊🍊🍊 = 3x`,
            quoted: msg
        })
    }

    const { error, user, bet } = await validateBet(sender, betArg)
    if (error) return sock.sendMessage(from, { text: error, quoted: msg })

    setGameCooldown(sender, 'slots')

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
⏳ Next spin in: *2 min*
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
    for (const suit of suits) for (const val of values) deck.push({ suit, val })
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
    while (total > 21 && aces > 0) { total -= 10; aces-- }
    return total
}

function formatHand(hand) {
    return hand.map(c => `${c.val}${c.suit}`).join(' ')
}

async function blackjackCommand(sock, msg, from, sender, args) {
    if (!await checkEntry(sock, msg, from, sender)) return
    if (isOnGameCooldown(sender, 'bj')) {
        const rem = getGameCooldownRemaining(sender, 'bj')
        return sock.sendMessage(from, { text: `⏳ Blackjack on cooldown! Wait *${formatTime(rem)}*`, quoted: msg })
    }

    const betArg = args[0]
    if (!betArg) {
        return sock.sendMessage(from, {
            text: `❌ *Wrong format!*\n\n🃏 *BLACKJACK* usage:\n┣ *.bj 100*\n┗ *.bj all*\n\nThen type *.hit* or *.stand*`,
            quoted: msg
        })
    }

    if (BLACKJACK_SESSIONS.has(sender)) {
        return sock.sendMessage(from, {
            text: `⚠️ *Active game running!*\nType *.hit* or *.stand*`,
            quoted: msg
        })
    }

    const { error, user, bet } = await validateBet(sender, betArg)
    if (error) return sock.sendMessage(from, { text: error, quoted: msg })

    setGameCooldown(sender, 'bj')

    const deck = createDeck()
    const playerHand = [deck.pop(), deck.pop()]
    const dealerHand = [deck.pop(), deck.pop()]
    BLACKJACK_SESSIONS.set(sender, { deck, playerHand, dealerHand, bet, from })

    const playerTotal = handTotal(playerHand)

    if (playerTotal === 21) {
        const winAmount = Math.floor(bet * 1.5)
        await updateUser(sender, { wallet: user.wallet + winAmount })
        BLACKJACK_SESSIONS.delete(sender)
        return sock.sendMessage(from, {
            text: `🃏 *BLACKJACK*\n━━━━━━━━━━━━━━━━\n👤 ${user.username}\n━━━━━━━━━━━━━━━━\nYour hand: ${formatHand(playerHand)} = *21*\n━━━━━━━━━━━━━━━━\n🎉 *BLACKJACK!* You won *+${winAmount} 🪙*\n👝 Wallet: ${user.wallet + winAmount} 🪙\n━━━━━━━━━━━━━━━━`,
            quoted: msg
        })
    }

    await sock.sendMessage(from, {
        text: `🃏 *BLACKJACK*\n━━━━━━━━━━━━━━━━\n👤 ${user.username} | Bet: ${bet} 🪙\n━━━━━━━━━━━━━━━━\nYour hand: ${formatHand(playerHand)} = *${playerTotal}*\nDealer shows: ${dealerHand[0].val}${dealerHand[0].suit} 🂠\n━━━━━━━━━━━━━━━━\nType *.hit* to draw or *.stand* to hold\n━━━━━━━━━━━━━━━━`,
        quoted: msg
    })
}

async function hitCommand(sock, msg, from, sender) {
    const session = BLACKJACK_SESSIONS.get(sender)
    if (!session) return sock.sendMessage(from, { text: `❌ No active game! Start with *.bj 100*`, quoted: msg })

    const user = await getUser(sender)
    session.playerHand.push(session.deck.pop())
    const total = handTotal(session.playerHand)

    if (total > 21) {
        BLACKJACK_SESSIONS.delete(sender)
        await updateUser(sender, { wallet: user.wallet - session.bet })
        return sock.sendMessage(from, {
            text: `🃏 *BLACKJACK*\n━━━━━━━━━━━━━━━━\nYour hand: ${formatHand(session.playerHand)} = *${total}*\n━━━━━━━━━━━━━━━━\n😞 *BUST!* You lost *-${session.bet} 🪙*\n👝 Wallet: ${user.wallet - session.bet} 🪙\n━━━━━━━━━━━━━━━━`,
            quoted: msg
        })
    }

    if (total === 21) return standCommand(sock, msg, from, sender)

    await sock.sendMessage(from, {
        text: `🃏 *BLACKJACK*\n━━━━━━━━━━━━━━━━\nYour hand: ${formatHand(session.playerHand)} = *${total}*\nDealer shows: ${session.dealerHand[0].val}${session.dealerHand[0].suit} 🂠\n━━━━━━━━━━━━━━━━\nType *.hit* or *.stand*\n━━━━━━━━━━━━━━━━`,
        quoted: msg
    })
}

async function standCommand(sock, msg, from, sender) {
    const session = BLACKJACK_SESSIONS.get(sender)
    if (!session) return sock.sendMessage(from, { text: `❌ No active game! Start with *.bj 100*`, quoted: msg })

    const user = await getUser(sender)
    BLACKJACK_SESSIONS.delete(sender)

    while (handTotal(session.dealerHand) < 17) session.dealerHand.push(session.deck.pop())

    const playerTotal = handTotal(session.playerHand)
    const dealerTotal = handTotal(session.dealerHand)

    let payout = 0
    let resultText = ''

    if (dealerTotal > 21 || playerTotal > dealerTotal) {
        payout = session.bet
        resultText = `🎉 You won *+${session.bet} 🪙*`
    } else if (playerTotal === dealerTotal) {
        resultText = `🤝 *PUSH!* Bet returned.`
    } else {
        payout = -session.bet
        resultText = `😞 Dealer wins! You lost *-${session.bet} 🪙*`
    }

    await updateUser(sender, { wallet: user.wallet + payout })
    await sock.sendMessage(from, {
        text: `🃏 *BLACKJACK*\n━━━━━━━━━━━━━━━━\nYour hand: ${formatHand(session.playerHand)} = *${playerTotal}*\nDealer hand: ${formatHand(session.dealerHand)} = *${dealerTotal}*\n━━━━━━━━━━━━━━━━\n${resultText}\n👝 Wallet: ${user.wallet + payout} 🪙\n━━━━━━━━━━━━━━━━`,
        quoted: msg
    })
}

// ─── ROULETTE ────────────────────────────────────────────────────
const ROULETTE_NUMBERS = Array.from({ length: 37 }, (_, i) => i)
const RED_NUMBERS = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]

async function rouletteCommand(sock, msg, from, sender, args) {
    if (!await checkEntry(sock, msg, from, sender)) return
    if (isOnGameCooldown(sender, 'roulette')) {
        const rem = getGameCooldownRemaining(sender, 'roulette')
        return sock.sendMessage(from, { text: `⏳ Roulette on cooldown! Wait *${formatTime(rem)}*`, quoted: msg })
    }

    const betType = args[0]?.toLowerCase()
    const validTypes = ['red', 'black', 'even', 'odd', 'high', 'low', 'number']

    if (!betType || !validTypes.includes(betType)) {
        return sock.sendMessage(from, {
            text: `❌ *Wrong format!*\n\n🎡 *ROULETTE* usage:\n┣ *.roulette red 100*\n┣ *.roulette black 100*\n┣ *.roulette even 100*\n┣ *.roulette odd 100*\n┣ *.roulette high 100* (19-36)\n┣ *.roulette low 100* (1-18)\n┗ *.roulette number 17 500*\n\nred/black/even/odd = *2x* | number = *35x*`,
            quoted: msg
        })
    }

    let finalBetArg = args[1]
    let numberGuess = null

    if (betType === 'number') {
        numberGuess = parseInt(args[1])
        finalBetArg = args[2]
        if (isNaN(numberGuess) || numberGuess < 0 || numberGuess > 36) {
            return sock.sendMessage(from, {
                text: `❌ *Invalid number!*\nPick between *0 and 36*\n\nExample: *.roulette number 17 500*`,
                quoted: msg
            })
        }
    }

    if (!finalBetArg) {
        return sock.sendMessage(from, {
            text: `❌ *Missing bet amount!*\nExample: *.roulette ${betType}${numberGuess !== null ? ` ${numberGuess}` : ''} 100*`,
            quoted: msg
        })
    }

    const { error, user, bet } = await validateBet(sender, finalBetArg)
    if (error) return sock.sendMessage(from, { text: error, quoted: msg })

    setGameCooldown(sender, 'roulette')

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
    else if (betType === 'number') { won = spin === numberGuess; multiplier = 35 }

    const payout = won ? bet * (multiplier - 1) : -bet
    await updateUser(sender, { wallet: user.wallet + payout })

    await sock.sendMessage(from, {
        text: `🎡 *ROULETTE*
━━━━━━━━━━━━━━━━
👤 ${user.username}
━━━━━━━━━━━━━━━━
Ball landed: ${color} *${spin}*
Your bet: *${betType}${numberGuess !== null ? ` ${numberGuess}` : ''}*
━━━━━━━━━━━━━━━━
${won ? `🎉 You won *+${bet * (multiplier - 1)} 🪙*` : `😞 You lost *-${bet} 🪙*`}
👝 Wallet: ${user.wallet + payout} 🪙
⏳ Next spin in: *2 min*
━━━━━━━━━━━━━━━━`,
        quoted: msg
    })
}

// ─── DICE BATTLE ─────────────────────────────────────────────────
async function diceBattleCommand(sock, msg, from, sender, args) {
    if (!await checkEntry(sock, msg, from, sender)) return
    if (isOnGameCooldown(sender, 'db')) {
        const rem = getGameCooldownRemaining(sender, 'db')
        return sock.sendMessage(from, { text: `⏳ Dice Battle on cooldown! Wait *${formatTime(rem)}*`, quoted: msg })
    }

    const betArg = args[0]
    if (!betArg) {
        return sock.sendMessage(from, {
            text: `❌ *Wrong format!*\n\n⚔️ *DICE BATTLE* usage:\n┣ *.db 100*\n┗ *.db all*\n\nYou vs the house — highest roll wins!\nTie = roll again. Win = *2x payout*`,
            quoted: msg
        })
    }

    const { error, user, bet } = await validateBet(sender, betArg)
    if (error) return sock.sendMessage(from, { text: error, quoted: msg })

    setGameCooldown(sender, 'db')

    const diceEmojis = ['', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣']
    let playerRoll, houseRoll2, rounds = 0

    do {
        playerRoll = randInt(1, 6)
        houseRoll2 = randInt(1, 6)
        rounds++
    } while (playerRoll === houseRoll2 && rounds < 5)

    const won = playerRoll > houseRoll2
    const payout = won ? bet : -bet

    await updateUser(sender, { wallet: user.wallet + payout })

    const tieText = rounds > 1 ? `\n🔄 *Tied ${rounds - 1} time(s)! Re-rolled.*` : ''

    await sock.sendMessage(from, {
        text: `⚔️ *DICE BATTLE*
━━━━━━━━━━━━━━━━
👤 ${user.username}
━━━━━━━━━━━━━━━━
You rolled: ${diceEmojis[playerRoll]}
House rolled: ${diceEmojis[houseRoll2]}${tieText}
━━━━━━━━━━━━━━━━
${won ? `🎉 You win! *+${bet} 🪙*` : `😞 House wins! *-${bet} 🪙*`}
👝 Wallet: ${user.wallet + payout} 🪙
⏳ Next battle in: *3 min*
━━━━━━━━━━━━━━━━`,
        quoted: msg
    })
}

// ─── CASINO (FLAT BET) ───────────────────────────────────────────
async function casinoGameCommand(sock, msg, from, sender, args) {
    if (!await checkEntry(sock, msg, from, sender)) return
    if (isOnGameCooldown(sender, 'casino')) {
        const rem = getGameCooldownRemaining(sender, 'casino')
        return sock.sendMessage(from, { text: `⏳ Casino on cooldown! Wait *${formatTime(rem)}*`, quoted: msg })
    }

    const betArg = args[0]
    if (!betArg) {
        return sock.sendMessage(from, {
            text: `❌ *Wrong format!*\n\n🎴 *CASINO* usage:\n┣ *.casino 500*\n┗ *.casino all*\n\nFlat bet — pure luck. Win = *2x payout*\nCooldown: *5 minutes*`,
            quoted: msg
        })
    }

    const { error, user, bet } = await validateBet(sender, betArg, 50)
    if (error) return sock.sendMessage(from, { text: error, quoted: msg })

    setGameCooldown(sender, 'casino')

    const won = houseRoll(0.5)
    const payout = won ? bet : -bet

    await updateUser(sender, { wallet: user.wallet + payout })

    const outcomes = won
        ? ['🎰 The stars align in your favor!', '🏆 Fortune favors the bold!', '👑 The Empire smiles upon you!', '🎊 Lady Luck is on your side!']
        : ['💀 The house always has its way...', '😔 Not your night, soldier.', '⚔️ The Empire takes its cut.', '🌑 Darkness falls on your gold.']

    const flavor = outcomes[randInt(0, outcomes.length - 1)]

    await sock.sendMessage(from, {
        text: `🎴 *CASINO*
━━━━━━━━━━━━━━━━
👤 ${user.username} | Bet: ${bet} 🪙
━━━━━━━━━━━━━━━━
${flavor}
━━━━━━━━━━━━━━━━
${won ? `🎉 You won *+${bet} 🪙*` : `😞 You lost *-${bet} 🪙*`}
👝 Wallet: ${user.wallet + payout} 🪙
⏳ Next game in: *5 min*
━━━━━━━━━━━━━━━━`,
        quoted: msg
    })
}

module.exports = {
    casinoHelpCommand,
    enterCasinoCommand,
    checkCooldownCommand,
    coinFlipCommand,
    diceCommand,
    slotsCommand,
    blackjackCommand,
    hitCommand,
    standCommand,
    rouletteCommand,
    diceBattleCommand,
    casinoGameCommand
}
