const fs = require('fs')
const path = require('path')
const { getUser, updateUser } = require('../data/db')

async function setpicCommand(sock, msg, from, sender) {
    const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage
    const directImage = msg.message?.imageMessage
    const quotedImage = quotedMsg?.imageMessage

    if (!directImage && !quotedImage) {
        await sock.sendMessage(from, {
            text: '❌ Send an image with caption *.setpic* or reply to an image with *.setpic*',
            quoted: msg
        })
        return
    }

    try {
        const { downloadMediaMessage } = require('@whiskeysockets/baileys')

        let targetMsg = msg
        if (quotedImage && !directImage) {
            targetMsg = {
                key: {
                    remoteJid: from,
                    id: msg.message.extendedTextMessage.contextInfo.stanzaId,
                    participant: msg.message.extendedTextMessage.contextInfo.participant
                },
                message: quotedMsg
            }
        }

        const buffer = await downloadMediaMessage(targetMsg, 'buffer', {})

        const pfpDir = path.join(__dirname, '../../media/pfp')
        if (!fs.existsSync(pfpDir)) {
            fs.mkdirSync(pfpDir, { recursive: true })
        }

        const fileName = `${sender.replace('@s.whatsapp.net', '')}.jpg`
        const filePath = path.join(pfpDir, fileName)
        fs.writeFileSync(filePath, buffer)

        updateUser(sender, { profilePic: `media/pfp/${fileName}` })

        await sock.sendMessage(from, {
            text: '✅ Profile picture updated! Check it with *.profile*',
            quoted: msg
        })
    } catch (err) {
        await sock.sendMessage(from, {
            text: '❌ Failed to set profile picture. Try again.',
            quoted: msg
        })
    }
}

module.exports = { setpicCommand }
