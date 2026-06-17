const XP_CONFIG = {
    // XP per message
    messageXP: 1,

    // Cooldown between XP gains in seconds
    messageCooldown: 60,

    // Minimum message length to earn XP
    minMessageLength: 3,

    // XP required to go from one level to the next
    levelXP: [
        0,    // Level 1 (starting point)
        100,  // Level 1 → 2
        150,  // Level 2 → 3
        220,  // Level 3 → 4
        310,  // Level 4 → 5
        420,  // Level 5 → 6
        550,  // Level 6 → 7
        700,  // Level 7 → 8
        870,  // Level 8 → 9
        1060  // Level 9 → 10
    ],

    // Daily reward
    daily: {
        baseXP: 50,
        baseCoins: 30,
        bonusStreak3: { xp: 75, coins: 50 },
        bonusStreak7: { xp: 150, coins: 100 },
        bonusStreak30: { xp: 400, coins: 300 }
    },

    // Steal config
    steal: {
        percentage: 0.10,
        cooldownHours: 2,
        minWallet: 100,
        successRates: {
            higher: 0.65,
            same: 0.50,
            lower: 0.35
        }
    }
}

module.exports = { XP_CONFIG }
