const { getUser, updateUser } = require('../data/db')
const { XP_CONFIG } = require('../config/xp')
const { RANKS } = require('../config/ranks')

function getRankIndex(rankName) {
    return RANKS.findIndex(r => r.name === rankName)
}

async function canSteal(userId, targetId) {
    const user = await getUser(userId)
    const target = await getUser(targetId)

    if (!user || !target) return { allowed: false, reason: 'User not found.' }
    if (userId === targetId) return { allowed: false, reason: "You can't steal from yourself." }

    const { steal } = XP_CONFIG

    if (user.lastSteal) {
        const now = Date.now()
        const last = new Date(user.lastSteal).getTime()
        const diffHours = (now - last) / (1000 * 60 * 60)
        if (diffHours < steal.cooldownHours) {
            const hoursLeft = (steal.cooldownHours - diffHours).toFixed(1)
            return { allowed: false, reason: `Cooldown active. Wait ${hoursLeft}h.` }
        }
    }

    if (target.wallet < steal.minWallet) {
        return { allowed: false, reason: `Target's wallet is too low to rob (min ${steal.minWallet} 🪙).` }
    }

    return { allowed: true }
}

async function attemptSteal(userId, targetId) {
    const check = await canSteal(userId, targetId)
    if (!check.allowed) return { success: false, reason: check.reason }

    const user = await getUser(userId)
    const target = await getUser(targetId)
    const { steal } = XP_CONFIG

    const userRankIdx = getRankIndex(user.rank)
    const targetRankIdx = getRankIndex(target.rank)

    let successRate = steal.successRates.same
    if (userRankIdx > targetRankIdx) successRate = steal.successRates.higher
    if (userRankIdx < targetRankIdx) successRate = steal.successRates.lower

    const roll = Math.random()
    const success = roll <= successRate

    await updateUser(userId, { lastSteal: new Date().toISOString() })

    if (!success) {
    const fineRoll = Math.random()
    let fine = 0
    let penalty = 'warning'

    if (fineRoll > 0.40 && fineRoll <= 0.70) {
        fine = Math.floor(user.wallet * 0.05)
        penalty = 'small'
    } else if (fineRoll > 0.70) {
        fine = Math.floor(user.wallet * 0.15)
        penalty = 'harsh'
    }

    const newWallet = Math.max(0, user.wallet - fine)
    if (fine > 0) await updateUser(userId, { wallet: newWallet })
    return { success: false, caught: true, fine, penalty }
    }

    const stolenAmount = Math.floor(target.wallet * steal.percentage)

    await updateUser(userId, {
        wallet: user.wallet + stolenAmount,
        timesStolen: (user.timesStolen || 0) + 1
    })
    await updateUser(targetId, {
        wallet: target.wallet - stolenAmount,
        timesRobbed: (target.timesRobbed || 0) + 1
    })

    return { success: true, amount: stolenAmount }
}

module.exports = { attemptSteal, canSteal }
