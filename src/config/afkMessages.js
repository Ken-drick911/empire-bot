const NO_REASON_MESSAGES = [
    "Even carrier pigeons provide more details.",
    "The Imperial Council has received exactly zero information.",
    "Reason missing. Generating one… \"kidnapped by ducks.\"",
    "Departure logged. Reason withheld from the Crown.",
    "AFK detected. Context not detected.",
    "Reason: Trust me bro.",
    "Sources say \"just because.\"",
    "The reason was eaten by dragons.",
    "Bro left faster than the tax collector arrived.",
    "Royal records show an absence but no reason.",
    "A citizen has abandoned their post without authorization.",
    "The kingdom's spies are investigating your mysterious disappearance."
]

const HIGH_DUTY_REASONS = [
    'sleep', 'sleeping', 'rest', 'nap', 'sick', 'hospital',
    'study', 'studying', 'school', 'exam', 'assignment', 'homework', 'lecture',
    'work', 'working', 'job', 'shift', 'meeting', 'office', 'business'
]

const HIGH_DUTY_MESSAGES = [
    "The Crown acknowledges your duty. Return victorious.",
    "Royal duties understood. Your post shall await your return.",
    "Departure approved by the Empire. Handle your affairs well.",
    "The Empire honors this absence. Go well."
]

const COMMON_DUTY_REASONS = [
    'cooking', 'cleaning', 'chores', 'laundry', 'shopping', 'market',
    'travel', 'traveling', 'trip', 'journey', 'driving', 'road',
    'family', 'parents', 'visiting', 'guest', 'errand',
    'gym', 'training', 'exercise', 'prayer', 'church', 'meditation'
]

const COMMON_DUTY_MESSAGES = [
    "The Empire accepts your temporary departure.",
    "Your duties beyond the realm are acknowledged.",
    "Departure recorded in imperial archives.",
    "The court understands. Return when ready."
]

const WEAK_REASONS = ['idk', 'bye', 'lol', 'hmm', 'nothing', 'later']

const WEAK_REASON_MESSAGES = [
    "The Empire reviewed your excuse and remains unimpressed.",
    "Even rulers are expected to provide better excuses than \"idk.\"",
    "That explanation has been rejected by Imperial standards.",
    "That reason was so weak even the court jesters refused to laugh."
]

function classifyReason(reason) {
    if (!reason) return 'none'
    const lower = reason.toLowerCase().trim()
    if (HIGH_DUTY_REASONS.some(r => lower.includes(r))) return 'high'
    if (COMMON_DUTY_REASONS.some(r => lower.includes(r))) return 'common'
    if (WEAK_REASONS.some(r => lower === r)) return 'weak'
    return 'common'
}

function getRandomMessage(category) {
    const pools = {
        none: NO_REASON_MESSAGES,
        high: HIGH_DUTY_MESSAGES,
        common: COMMON_DUTY_MESSAGES,
        weak: WEAK_REASON_MESSAGES
    }
    const pool = pools[category] || COMMON_DUTY_MESSAGES
    return pool[Math.floor(Math.random() * pool.length)]
}

module.exports = { classifyReason, getRandomMessage }
