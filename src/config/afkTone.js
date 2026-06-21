const RANK_TONES = {
    'Duke': 'respectful',
    'Count': 'respectful',
    'Elite Noble': 'aristocratic',
    'Noble': 'aristocratic',
    'Knight': 'citizen',
    'Warrior': 'citizen',
    'Peasant': 'chaotic'
}

const TONE_PREFIXES = {
    emperor: [
        "The Crown acknowledges your temporary departure.",
        "Even the Crown expected more details than this.",
        "The Emperor is mildly disappointed, but understands."
    ],
    respectful: [
        "A noble exits the court with dignity.",
        "The council notes your departure with respect.",
        "Imperial duty recognized."
    ],
    aristocratic: [
        "A noble has left the court without a word.",
        "The council notes your temporary absence.",
        "Departure recorded in imperial archives."
    ],
    citizen: [
        "A citizen has stepped away from the realm.",
        "Activity in the kingdom slightly reduced.",
        "Imperial attendance updated."
    ],
    chaotic: [
        "Bro vanished into the shadows.",
        "Sources say: trust me bro.",
        "AFK detected. Context not detected."
    ]
}

function getToneForUser(isOwner, rank) {
    if (isOwner) return 'emperor'
    return RANK_TONES[rank] || 'citizen'
}

function getTonePrefix(tone) {
    const pool = TONE_PREFIXES[tone] || TONE_PREFIXES.citizen
    return pool[Math.floor(Math.random() * pool.length)]
}

module.exports = { getToneForUser, getTonePrefix }
