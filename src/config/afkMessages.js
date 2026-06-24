const NO_REASON_MESSAGES = {
    emperor: [
        "The Crown notes your absence... and raises an eyebrow.",
        "Even the Emperor expected more details than this.",
        "His Majesty has logged your departure. Explanation pending."
    ],
    respectful: [
        "The Imperial Council has received exactly zero information.",
        "Departure logged. Reason withheld from the Crown.",
        "Even carrier pigeons provide more details."
    ],
    aristocratic: [
        "A noble vanishes without a word to the court.",
        "Royal records show an absence but no reason.",
        "The court whispers about your sudden disappearance."
    ],
    citizen: [
        "AFK detected. Context not detected.",
        "A citizen has abandoned their post without authorization.",
        "The kingdom's spies are investigating your mysterious disappearance."
    ],
    chaotic: [
        "Reason missing. Generating one… \"kidnapped by ducks.\"",
        "Bro left faster than the tax collector arrived.",
        "Sources say \"just because.\""
    ]
}

const HIGH_DUTY_REASONS = [
    'sleep', 'sleeping', 'rest', 'nap', 'sick', 'hospital',
    'study', 'studying', 'school', 'exam', 'assignment', 'homework', 'lecture',
    'work', 'working', 'job', 'shift', 'meeting', 'office', 'business'
]

const HIGH_DUTY_MESSAGES = {
    emperor: ["The Crown commends your dedication. Return when ready."],
    respectful: ["The Crown acknowledges your duty. Return victorious."],
    aristocratic: ["Royal duties understood. Your post shall await your return."],
    citizen: ["Departure approved by the Empire. Handle your affairs well."],
    chaotic: ["Aight that's actually valid, go handle it."]
}

const COMMON_DUTY_REASONS = [
    'cooking', 'cleaning', 'chores', 'laundry', 'shopping', 'market',
    'travel', 'traveling', 'trip', 'journey', 'driving', 'road',
    'family', 'parents', 'visiting', 'guest', 'errand',
    'gym', 'training', 'exercise', 'prayer', 'church', 'meditation'
]

const COMMON_DUTY_MESSAGES = {
    emperor: ["The Crown accepts this with quiet approval."],
    respectful: ["The Empire accepts your temporary departure."],
    aristocratic: ["Your duties beyond the realm are acknowledged."],
    citizen: ["Departure recorded in imperial archives."],
    chaotic: ["Okay fair enough, go do your thing."]
}

const WEAK_REASONS = ['idk', 'bye', 'lol', 'hmm', 'nothing', 'later']

const WEAK_REASON_MESSAGES = {
    emperor: ["The Crown is... mildly unimpressed by this effort."],
    respectful: ["The Empire reviewed your excuse and remains unimpressed."],
    aristocratic: ["That explanation has been rejected by Imperial standards."],
    citizen: ["Even rulers are expected to provide better excuses than \"idk.\""],
    chaotic: ["That reason was so weak even the court jesters refused to laugh."]
}

function classifyReason(reason) {
    if (!reason) return 'none'
    const lower = reason.toLowerCase().trim()
    if (HIGH_DUTY_REASONS.some(r => lower.includes(r))) return 'high'
    if (COMMON_DUTY_REASONS.some(r => lower.includes(r))) return 'common'
    if (WEAK_REASONS.some(r => lower === r)) return 'weak'
    return 'common'
}

function getRandomMessage(category, tone) {
    const pools = {
        none: NO_REASON_MESSAGES,
        high: HIGH_DUTY_MESSAGES,
        common: COMMON_DUTY_MESSAGES,
        weak: WEAK_REASON_MESSAGES
    }
    const categoryPool = pools[category] || COMMON_DUTY_MESSAGES
    const tonePool = categoryPool[tone] || categoryPool.citizen
    return tonePool[Math.floor(Math.random() * tonePool.length)]
}

module.exports = { classifyReason, getRandomMessage }
