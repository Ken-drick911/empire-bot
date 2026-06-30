require('dotenv').config()
const { MongoClient } = require('mongodb')

const client = new MongoClient(process.env.MONGO_URI)
let db = null
let usersCollection = null
let connected = false

async function connectDB() {
    if (connected) return
    await client.connect()
    db = client.db('empireBot')
    usersCollection = db.collection('users')
    connected = true
    console.log('✅ Connected to MongoDB')
}

async function getUser(id) {
    await connectDB()
    return await usersCollection.findOne({ id })
}

async function createUser(id, username) {
    await connectDB()
    const existing = await usersCollection.findOne({ id })
    if (existing) return existing

    // Check if this person already registered on web first (has phone, no bot id yet)
    const phone = id.replace('@s.whatsapp.net', '').replace('@lid', '')
    const webUser = await usersCollection.findOne({ phone, id: { $exists: false } })

    if (webUser) {
        const botFields = {
            id,
            rank: webUser.rank || 'Peasant',
            level: webUser.level || 1,
            xp: webUser.xp || 0,
            xpToNext: webUser.xpToNext || 100,
            title: webUser.title || 'Village Hand',
            reputation: webUser.reputation || null,
            wallet: webUser.wallet || 0,
            vault: webUser.vault || 0,
            vaultCap: webUser.vaultCap || 5000,
            streak: webUser.streak || 0,
            totalMessages: webUser.totalMessages || 0,
            recentMessages: webUser.recentMessages || 0,
            lastMessage: webUser.lastMessage || null,
            lastDaily: webUser.lastDaily || null,
            lastSteal: webUser.lastSteal || null,
            lastStolenFrom: webUser.lastStolenFrom || null,
            timesRobbed: webUser.timesRobbed || 0,
            timesStolen: webUser.timesStolen || 0,
            profilePic: webUser.profilePic || null,
            authority: webUser.authority || null,
            isMod: webUser.isMod || false,
            joinDate: webUser.joinDate || new Date().toISOString()
        }
        await usersCollection.updateOne({ _id: webUser._id }, { $set: botFields })
        return await usersCollection.findOne({ _id: webUser._id })
    }

    const newUser = {
        id,
        phone,
        username,
        rank: 'Peasant',
        level: 1,
        xp: 0,
        xpToNext: 100,
        title: 'Village Hand',
        reputation: null,
        wallet: 0,
        vault: 0,
        vaultCap: 5000,
        streak: 0,
        totalMessages: 0,
        recentMessages: 0,
        lastMessage: null,
        lastDaily: null,
        lastSteal: null,
        lastStolenFrom: null,
        timesRobbed: 0,
        timesStolen: 0,
        profilePic: null,
        authority: null,
        isMod: false,
        joinDate: new Date().toISOString()
    }

    await usersCollection.insertOne(newUser)
    return newUser
}

async function updateUser(id, updates) {
    await connectDB()
    await usersCollection.updateOne({ id }, { $set: updates })
    return await usersCollection.findOne({ id })
}

async function getAllUsers() {
    await connectDB()
    const all = await usersCollection.find({}).toArray()
    const obj = {}
    all.forEach(u => { obj[u.id] = u })
    return obj
}

async function saveSession(sessionData) {
    await connectDB()
    const sessionsCollection = db.collection('sessions')
    await sessionsCollection.updateOne(
        { id: 'main' },
        { $set: { id: 'main', data: sessionData, updatedAt: new Date().toISOString() } },
        { upsert: true }
    )
}

async function getGroupSettings(chatId) {
    await connectDB()
    const col = db.collection('groupSettings')
    const doc = await col.findOne({ chatId })
    return doc || { chatId }
}

async function updateGroupSettings(chatId, updates) {
    await connectDB()
    const col = db.collection('groupSettings')
    await col.updateOne(
        { chatId },
        { $set: { chatId, ...updates } },
        { upsert: true }
    )
}

async function loadSession() {
    await connectDB()
    const sessionsCollection = db.collection('sessions')
    const session = await sessionsCollection.findOne({ id: 'main' })
    return session ? session.data : null
}

async function getAllGroupSettings() {
    await connectDB()
    const col = db.collection('groupSettings')
    return await col.find({}).toArray()
}

module.exports = { getUser, createUser, updateUser, getAllUsers, saveSession, loadSession, getGroupSettings, updateGroupSettings, getAllGroupSettings }
