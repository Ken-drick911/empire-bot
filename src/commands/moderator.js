const { getUser, createUser, updateUser } = require('../data/db')

async function addModCommand(sock, msg, from, args) {
    const number = args[0]?.replace(/\D/g, '')
    if (!number) return sock.sendMessage(from, { text: '❌ Provide a number. Example: .addmod 2348012345678', quoted: msg })

    const targetId = `${number}@s.whatsapp.net`
    let user = await getUser(targetId)
    if (!user) user = await createUser(targetId, number)
    await updateUser(targetId, { isMod: true, phone: number })

    await sock.sendMessage(from, { text: `✅ ${number} is now a Moderator.`, quoted: msg })
}

async function removeModCommand(sock, msg, from, args) {
    const number = args[0]?.replace(/\D/g, '')
    if (!number) return sock.sendMessage(from, { text: '❌ Provide a number. Example: .removemod 2348012345678', quoted: msg })

    const targetId = `${number}@s.whatsapp.net`
    const user = await getUser(targetId)
    if (!user) return sock.sendMessage(from, { text: '❌ User not found.', quoted: msg })

    await updateUser(targetId, { isMod: false, phone: number })
    await sock.sendMessage(from, { text: `✅ ${number} is no longer a Moderator.', quoted: msg })
}

async function isModerator(userId) {
    // Direct lookup
    const user = await getUser(userId)
    if (user?.isMod === true) return true

    // Try @s.whatsapp.net format
    const phone = userId.replace('@s.whatsapp.net', '').replace('@lid', '')
    const userByPhone = await getUser(`${phone}@s.whatsapp.net`)
    if (userByPhone?.isMod === true) return true

    // Try phone field lookup via db
    try {
        const { MongoClient } = require('mongodb')
        const dbClient = new MongoClient(process.env.MONGO_URI)
        await dbClient.connect()
        const db = dbClient.db('empireBot')
        const u = await db.collection('users').findOne({ phone, isMod: true })
        await dbClient.close()
        if (u) return true
    } catch {}

    return false
}

module.exports = { addModCommand, removeModCommand, isModerator }
