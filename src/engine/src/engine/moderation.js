const { getUser, updateUser } = require('../data/db')

function parseDuration(input) {
    if (!input) return null
    const match = input.match(/^(\d+)(m|h|d)$/i)
    if (!match) return null
    const value = parseInt(match[1])
    const unit = match[2].toLowerCase()
    const multipliers = { m: 60000, h: 3600000, d: 86400000 }
    return value * multipliers[unit]
}

async function banUser(targetId, durationInput, reason) {
    const user = await getUser(targetId)
    if (!user) return { success: false, reason: 'User not found.' }

    const durationMs = parseDuration(durationInput)
    const banUntil = durationMs ? new Date(Date.now() + durationMs).toISOString() : 'permanent'

    await updateUser(targetId, {
        banned: true,
        banUntil,
        banReason: reason || 'No reason given'
    })

    return { success: true, banUntil }
}

async function unbanUser(targetId) {
    const user = await getUser(targetId)
    if (!user) return { success: false, reason: 'User not found.' }

    await updateUser(targetId, {
        banned: false,
        banUntil: null,
        banReason: null
    })

    return { success: true }
}

async function isBanned(userId) {
    const user = await getUser(userId)
    if (!user || !user.banned) return false

    if (user.banUntil === 'permanent') return true

    const banExpiry = new Date(user.banUntil).getTime()
    if (Date.now() >= banExpiry) {
        await updateUser(userId, { banned: false, banUntil: null, banReason: null })
        return false
    }

    return true
}

module.exports = { banUser, unbanUser, isBanned, parseDuration }
