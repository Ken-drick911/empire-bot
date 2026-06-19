const cooldowns = new Map()

const COOLDOWN_MS = 4000 // 4 seconds

function isOnCooldown(userId, command) {
    const key = `${userId}_${command}`
    const last = cooldowns.get(key)
    if (!last) return false
    return (Date.now() - last) < COOLDOWN_MS
}

function getRemainingTime(userId, command) {
    const key = `${userId}_${command}`
    const last = cooldowns.get(key)
    if (!last) return 0
    const remaining = COOLDOWN_MS - (Date.now() - last)
    return Math.max(0, (remaining / 1000).toFixed(1))
}

function setCooldown(userId, command) {
    const key = `${userId}_${command}`
    cooldowns.set(key, Date.now())
}

module.exports = { isOnCooldown, getRemainingTime, setCooldown }
