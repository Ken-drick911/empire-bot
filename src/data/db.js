const fs = require('fs')
const path = require('path')

const DB_PATH = path.join(__dirname, 'users.json')

function loadDB() {
    if (!fs.existsSync(DB_PATH)) {
        fs.writeFileSync(DB_PATH, JSON.stringify({}, null, 2))
    }
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'))
}

function saveDB(data) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2))
}

function getUser(id) {
    const db = loadDB()
    return db[id] || null
}

function createUser(id, username) {
    const db = loadDB()
    if (db[id]) return db[id]

    db[id] = {
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
        lastMessage: null,
        lastDaily: null,
        lastSteal: null,
        lastStolenFrom: null,
        timesRobbed: 0,
        timesStolen: 0,
        profilePic: null,
        authority: null,
        joinDate: new Date().toISOString()
    }

    saveDB(db)
    return db[id]
}

function updateUser(id, updates) {
    const db = loadDB()
    if (!db[id]) return null
    db[id] = { ...db[id], ...updates }
    saveDB(db)
    return db[id]
}

function getAllUsers() {
    return loadDB()
}

module.exports = { loadDB, saveDB, getUser, createUser, updateUser, getAllUsers }
