const { MongoClient } = require('mongodb')

async function useMongoAuthState(uri) {
    const { initAuthCreds, BufferJSON, proto } = await import('@whiskeysockets/baileys')

    const client = new MongoClient(uri)
    await client.connect()
    const db = client.db('empireBot')
    const col = db.collection('authSessions')

    const writeData = async (data, key) => {
        await col.updateOne(
            { _id: key },
            { $set: { data: JSON.stringify(data, BufferJSON.replacer) } },
            { upsert: true }
        )
    }

    const readData = async (key) => {
        const doc = await col.findOne({ _id: key })
        if (!doc) return null
        return JSON.parse(doc.data, BufferJSON.reviver)
    }

    const removeData = async (key) => {
        await col.deleteOne({ _id: key })
    }

    const creds = (await readData('creds')) || initAuthCreds()

    return {
        state: {
            creds,
            keys: {
                get: async (type, ids) => {
                    const data = {}
                    await Promise.all(ids.map(async id => {
                        let value = await readData(`${type}-${id}`)
                        if (type === 'app-state-sync-key' && value) {
                            value = proto.Message.AppStateSyncKeyData.fromObject(value)
                        }
                        data[id] = value
                    }))
                    return data
                },
                set: async (data) => {
                    const tasks = []
                    for (const category of Object.keys(data)) {
                        for (const id of Object.keys(data[category])) {
                            const value = data[category][id]
                            const key = `${category}-${id}`
                            tasks.push(value ? writeData(value, key) : removeData(key))
                        }
                    }
                    await Promise.all(tasks)
                }
            }
        },
        saveCreds: async () => {
            await writeData(creds, 'creds')
        }
    }
}

module.exports = { useMongoAuthState }
