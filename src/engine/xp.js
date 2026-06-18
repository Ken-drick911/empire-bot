const { getUser, createUser, updateUser } = require('../data/db')
const { getRankByName, getNextRank, getTitle } = require('../config/ranks')
const { XP_CONFIG } = require('../config/xp')

function isOnCooldown(user) {
    if (!user.lastMessage) return false
    const now = Date.now()
    const last = new Date(user.lastMessage).getTime()
    const diff = (now - last) / 1000
    return diff < XP_CONFIG.messageCooldown
}

function getXPToNext(level) {
    return XP_CONFIG.levelXP[level] || 1060
}

function checkLevelUp(user) {
    let { xp, level, rank } = user
    let leveled = false
    let promoted = false
    let newRank = rank

    while (xp >= getXPToNext(level)) {
        xp -= getXPToNext(level)

        if (level >= 10) {
            const next = getNextRank(rank)
            if (next) {
                newRank = next.name
                promoted = true
            }
            level = 1
        } else {
            level++
        }
        leveled = true
    }

    const newTitle = getTitle(newRank, level)
    const newVaultCap = getRankByName(newRank)?.vaultCap || user.vaultCap

    return {
        xp,
        level,
        rank: newRank,
        title: newTitle,
        vaultCap: newVaultCap,
        leveled,
        promoted
    }
}

function awardMessageXP(userId, username) {
    let user = getUser(userId) || createUser(userId, username)

    if (isOnCooldown(user)) return null
    if (!username || username.length < XP_CONFIG.minMessageLength) return null

    const gained = XP_CONFIG.messageXP
    let newXP = user.xp + gained
    const tempUser = { ...user, xp: newXP }
    const result = checkLevelUp(tempUser)

    updateUser(userId, {
        xp: result.xp,
        level: result.level,
        rank: result.rank,
        title: result.title,
        vaultCap: result.vaultCap,
        xpToNext: getXPToNext(result.level),
        totalMessages: user.totalMessages + 1,
        lastMessage: new Date().toISOString()
    })

    return {
        gained,
        leveled: result.leveled,
        promoted: result.promoted,
        newRank: result.rank,
        newLevel: result.level,
        newTitle: result.title
    }
}

function awardXP(userId, amount) {
    const user = getUser(userId)
    if (!user) return null

    let newXP = user.xp + amount
    const tempUser = { ...user, xp: newXP }
    const result = checkLevelUp(tempUser)

    updateUser(userId, {
        xp: result.xp,
        level: result.level,
        rank: result.rank,
        title: result.title,
        vaultCap: result.vaultCap,
        xpToNext: getXPToNext(result.level)
    })

    return {
        gained: amount,
        leveled: result.leveled,
        promoted: result.promoted,
        newRank: result.rank,
        newLevel: result.level,
        newTitle: result.title
    }
}

module.exports = { awardMessageXP, awardXP, getXPToNext }
