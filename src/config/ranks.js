const RANKS = [
    {
        name: 'Peasant',
        symbol: '🧑',
        vaultCap: 5000,
        titles: {
            low: 'Village Hand',
            mid: 'Common Folk',
            high: 'Rising Commoner'
        }
    },
    {
        name: 'Warrior',
        symbol: '⚔️',
        vaultCap: 15000,
        titles: {
            low: 'Raw Recruit',
            mid: 'Iron Warrior',
            high: 'Battle-Hardened'
        }
    },
    {
        name: 'Knight',
        symbol: '🧭',
        vaultCap: 50000,
        titles: {
            low: 'Squire Knight',
            mid: 'Silver Knight',
            high: 'Veteran Knight'
        }
    },
    {
        name: 'Noble',
        symbol: '🎖️',
        vaultCap: 150000,
        titles: {
            low: 'Junior Noble',
            mid: 'Court Noble',
            high: 'High Noble'
        }
    },
    {
        name: 'Elite Noble',
        symbol: '⭐',
        vaultCap: 400000,
        titles: {
            low: 'Elite Initiate',
            mid: 'Elite Guardian',
            high: 'Ascended Elite'
        }
    },
    {
        name: 'Count',
        symbol: '🏰',
        vaultCap: 1000000,
        titles: {
            low: 'Minor Count',
            mid: 'Regional Count',
            high: 'Grand Count'
        }
    },
    {
        name: 'Duke',
        symbol: '🏆',
        vaultCap: Infinity,
        titles: {
            low: 'Fledgling Duke',
            mid: 'Sovereign Duke',
            high: 'Archduke'
        }
    }
]

function getRankByName(name) {
    return RANKS.find(r => r.name === name) || null
}

function getNextRank(currentRank) {
    const index = RANKS.findIndex(r => r.name === currentRank)
    return index !== -1 && index < RANKS.length - 1 ? RANKS[index + 1] : null
}

function getTitle(rankName, level) {
    const rank = getRankByName(rankName)
    if (!rank) return ''
    if (level <= 3) return rank.titles.low
    if (level <= 7) return rank.titles.mid
    return rank.titles.high
}

module.exports = { RANKS, getRankByName, getNextRank, getTitle }
