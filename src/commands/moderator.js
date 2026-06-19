const { getUser, createUser, updateUser } = require('../data/db')

async function addModCommand(sock, msg, from, args) {
    const number = args[0]?.replace(/\D/g, '')
    if (!number) return sock.sendMessage(from, { text: '❌ Provide a number. Example: .addmod 2348012345678', quoted: msg })

    const targetId = `${number}@s.whatsapp.net`
    let user = getUser(targetId) || createUser(targetId, number)
    updateUser(targetId, { isMod: true })

    await sock.sendMessage(from, { text: `✅ ${number} is now a Moderator.`, quoted: msg })
}

async function removeModCommand(sock, msg, from, args) {
    const number = args[0]?.replace(/\D/g, '')
    if (!number) return sock.sendMessage(from, { text: '❌ Provide a number. Example: .removemod 2348012345678', quoted: msg })

    const targetId = `${number}@s.whatsapp.net`
    const user = getUser(targetId)
    if (!user) return sock.sendMessage(from, { text: '❌ User not found.', quoted: msg })

    updateUser(targetId, { isMod: false })
    await sock.sendMessage(from, { text: `✅ ${number} is no longer a Moderator.`, quoted: msg })
}

function isModerator(userId) {
    const user = getUser(userId)
    return user?.isMod === true
}

module.exports = { addModCommand, removeModCommand, isModerator }
