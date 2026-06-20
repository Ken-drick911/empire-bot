const REPUTATIONS = [
    { name: 'Storm Caller', symbol: '⚡', description: 'Highly active, drives conversations' },
    { name: 'Iron Will', symbol: '🔱', description: 'Never misses a daily streak' },
    { name: 'Bloodmarked', symbol: '🩸', description: 'Competitive, frequent in heists' },
    { name: 'Watcher', symbol: '👁️', description: 'Quiet, long-standing member' },
    { name: 'Newcomer', symbol: '🌱', description: 'Recently joined the Empire' }
]

function calculateReputation(user) {
    const daysSinceJoin = Math.floor((Date.now() - new Date(user.joinDate)) / (1000 * 60 * 60 * 24))

    if (daysSinceJoin <= 3) {
        return REPUTATIONS.find(r => r.name === 'Newcomer')
    }
    if ((user.streak || 0) >= 7) {
        return REPUTATIONS.find(r => r.name === 'Iron Will')
    }
    if ((user.timesStolen || 0) >= 5) {
        return REPUTATIONS.find(r => r.name === 'Bloodmarked')
    }
    if ((user.recentMessages || 0) >= 20) {
        return REPUTATIONS.find(r => r.name === 'Storm Caller')
    }
    if (daysSinceJoin > 14 && (user.recentMessages || 0) < 5) {
        return REPUTATIONS.find(r => r.name === 'Watcher')
    }
    return null
}

module.exports = { REPUTATIONS, calculateReputation }
