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

    const newUser = {
        id,
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

async function loadSession() {
    await connectDB()
    const sessionsCollection = db.collection('sessions')
    const session = await sessionsCollection.findOne({ id: 'main' })
    return session ? session.data : null
}

module.exports = { getUser, createUser, updateUser, getAllUsers, saveSession, loadSession }
