const { getUser, updateUser } = require('../data/db')
const { awardXP } = require('./xp')
const { XP_CONFIG } = require('../config/xp')

function getStreak(user) {
    if (!user.lastDaily) return 0
    const now = new Date()
    const last = new Date(user.lastDaily)
    const diffDays = Math.floor((now - last) / (1000 * 60 * 60 * 24))
    if (diffDays === 1) return user.streak + 1
    if (diffDays === 0) return user.streak
    return 0
}

function getStreakBonus(streak) {
    const { daily } = XP_CONFIG
    if (streak >= 30) return daily.bonusStreak30
    if (streak >= 7) return daily.bonusStreak7
    if (streak >= 3) return daily.bonusStreak3
    return { xp: 0, coins: 0 }
}

async function claimDaily(userId) {
    const user = await getUser(userId)
    if (!user) return { success: false, reason: 'User not found.' }

    if (user.lastDaily) {
        const now = new Date()
        const last = new Date(user.lastDaily)
        const diffHours = (now - last) / (1000 * 60 * 60)
        if (diffHours < 24) {
            const hoursLeft = Math.ceil(24 - diffHours)
            return { success: false, reason: `Already claimed. Come back in ${hoursLeft} hour(s).` }
        }
    }

    const { daily } = XP_CONFIG
    const newStreak = getStreak(user)
    const bonus = getStreakBonus(newStreak)
    const totalXP = daily.baseXP + bonus.xp
    const totalCoins = daily.baseCoins + bonus.coins

    const xpResult = await awardXP(userId, totalXP)

    await updateUser(userId, {
        wallet: user.wallet + totalCoins,
        streak: newStreak,
        lastDaily: new Date().toISOString()
    })

    return {
        success: true, xpGained: totalXP, coinsGained: totalCoins, streak: newStreak,
        bonusXP: bonus.xp, bonusCoins: bonus.coins,
        leveled: xpResult?.leveled || false, promoted: xpResult?.promoted || false,
        newRank: xpResult?.newRank, newLevel: xpResult?.newLevel, newTitle: xpResult?.newTitle
    }
}

module.exports = { claimDaily }
