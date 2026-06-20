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

    return { xp, level, rank: newRank, title: newTitle, vaultCap: newVaultCap, leveled, promoted }
}

async function awardMessageXP(userId, username) {
    let user = await getUser(userId)
    if (!user) user = await createUser(userId, username)

    if (isOnCooldown(user)) return null
    if (!username || username.length < XP_CONFIG.minMessageLength) return null

    const gained = XP_CONFIG.messageXP
    const tempUser = { ...user, xp: user.xp + gained }
    const result = checkLevelUp(tempUser)

    const now = Date.now()
    const lastMsgTime = user.lastMessage ? new Date(user.lastMessage).getTime() : 0
    const daysSinceLastMsg = (now - lastMsgTime) / (1000 * 60 * 60 * 24)
    const newRecentCount = daysSinceLastMsg > 5 ? 1 : (user.recentMessages || 0) + 1

    await updateUser(userId, {
        xp: result.xp,
        level: result.level,
        rank: result.rank,
        title: result.title,
        vaultCap: result.vaultCap,
        xpToNext: getXPToNext(result.level),
        totalMessages: user.totalMessages + 1,
        recentMessages: newRecentCount,
        lastMessage: new Date().toISOString()
    })

    return { gained, leveled: result.leveled, promoted: result.promoted, newRank: result.rank, newLevel: result.level, newTitle: result.title }
}

async function awardXP(userId, amount) {
    const user = await getUser(userId)
    if (!user) return null

    const tempUser = { ...user, xp: user.xp + amount }
    const result = checkLevelUp(tempUser)

    await updateUser(userId, {
        xp: result.xp,
        level: result.level,
        rank: result.rank,
        title: result.title,
        vaultCap: result.vaultCap,
        xpToNext: getXPToNext(result.level)
    })

    return { gained: amount, leveled: result.leveled, promoted: result.promoted, newRank: result.rank, newLevel: result.level, newTitle: result.title }
}

module.exports = { awardMessageXP, awardXP, getXPToNext }
