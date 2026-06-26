const { getUser, createUser, updateUser } = require('../data/db')
const { MongoClient } = require('mongodb')

async function getModDB() {
    const client = new MongoClient(process.env.MONGO_URI)
    await client.connect()
    return { client, db: client.db('empireBot') }
}

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
    await sock.sendMessage(from, { text: `✅ ${number} is no longer a Moderator.`, quoted: msg })
}

async function isModerator(userId) {
    // Extract phone from any ID format
    const phone = userId.replace('@s.whatsapp.net', '').replace('@lid', '')

    // Try direct lookup
    const user = await getUser(userId)
    if (user?.isMod === true) return true

    // Try @s.whatsapp.net format
    const userByJid = await getUser(`${phone}@s.whatsapp.net`)
    if (userByJid?.isMod === true) return true

    // Try phone field in MongoDB directly
    try {
        const { client, db } = await getModDB()
        const u = await db.collection('users').findOne({ phone, isMod: true })
        await client.close()
        if (u) return true
    } catch {}

    return false
}

module.exports = { addModCommand, removeModCommand, isModerator }
