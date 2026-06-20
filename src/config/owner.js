const OWNER_NUMBER = '204926412185650@lid'

function isOwnerId(userId) {
    return userId === OWNER_NUMBER
}

module.exports = { OWNER_NUMBER, isOwnerId }
