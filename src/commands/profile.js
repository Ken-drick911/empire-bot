const { getUser } = require('../data/db')
const { isOwnerId } = require('../config/owner')
const { calculateReputation } = require('../config/reputation')
const { createCanvas, loadImage } = require('@napi-rs/canvas')

const WEB_URL = process.env.WEB_URL || 'https://empire-bot-w94m.onrender.com'

async function profileCommand(sock, msg, from, sender, username) {
    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || []
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.participant
    const targetId = mentioned[0] || quoted || sender
    const user = await getUser(targetId)

    if (!user) {
        await sock.sendMessage(from, { text: '❌ User not found in the Empire.', quoted: msg })
        return
    }

    const displayRank = isOwnerId(targetId) ? '👑 Emperor' : user.rank
    const reputation = calculateReputation(user)
    const reputationText = reputation ? `${reputation.symbol} ${reputation.name}` : 'None'
    const xpToNext = user.xpToNext || 100
    const xpPercent = Math.min((user.xp || 0) / xpToNext, 1)

    try {
        const cardBuffer = await generateProfileCard(user, displayRank, xpPercent, xpToNext)

        const caption = `⚜️ *IMPERIAL DOSSIER* ⚜️
♤ Name: ${user.username}
♤ Bio: ${user.bio || 'No bio set'}
♤ Reputation: ${reputationText}
♤ Streak: ${user.streak || 0} days 🔥
♤ Messages: ${user.totalMessages || 0}
♤ Joined: ${user.joinDate ? new Date(user.joinDate).toDateString() : 'Unknown'}
🔗 ${WEB_URL}`

        await sock.sendMessage(from, {
            image: cardBuffer,
            caption
        }, { quoted: msg })

    } catch (err) {
        console.error('Profile card error:', err)
        // Fallback to text only
        const caption = `⚜️ *IMPERIAL DOSSIER* ⚜️
♤ Name: ${user.username}
♤ Bio: ${user.bio || 'No bio set'}
♤ Rank: ${displayRank} • Lv.${user.level || 1}
♤ XP: ${user.xp || 0}/${xpToNext}
♤ Title: ${user.title || '—'}
♤ Reputation: ${reputationText}
♤ Streak: ${user.streak || 0} days 🔥
♤ Messages: ${user.totalMessages || 0}
♤ Joined: ${user.joinDate ? new Date(user.joinDate).toDateString() : 'Unknown'}
🔗 ${WEB_URL}`
        await sock.sendMessage(from, { text: caption, quoted: msg })
    }
}

async function generateProfileCard(user, displayRank, xpPercent, xpToNext) {
    const W = 600
    const H = 720
    const canvas = createCanvas(W, H)
    const ctx = canvas.getContext('2d')

    // --- Background ---
    ctx.fillStyle = '#0a0908'
    ctx.fillRect(0, 0, W, H)

    // --- Cover photo (faded center banner) ---
    if (user.cover) {
        try {
            const cover = await loadImage(user.cover)
            ctx.save()
            ctx.globalAlpha = 0.35
            ctx.drawImage(cover, 0, 0, W, H)
            ctx.restore()

            // Dark overlay on top of cover
            const grad = ctx.createLinearGradient(0, 0, 0, H)
            grad.addColorStop(0, 'rgba(10,9,8,0.6)')
            grad.addColorStop(0.4, 'rgba(10,9,8,0.2)')
            grad.addColorStop(0.7, 'rgba(10,9,8,0.5)')
            grad.addColorStop(1, 'rgba(10,9,8,0.95)')
            ctx.fillStyle = grad
            ctx.fillRect(0, 0, W, H)
        } catch {}
    } else {
        // Default dark gradient background
        const grad = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, W)
        grad.addColorStop(0, '#1a1508')
        grad.addColorStop(1, '#0a0908')
        ctx.fillStyle = grad
        ctx.fillRect(0, 0, W, H)
    }

    // --- Gold border ---
    ctx.strokeStyle = '#c9a84c'
    ctx.lineWidth = 3
    ctx.strokeRect(8, 8, W - 16, H - 16)

    // Inner border
    ctx.strokeStyle = 'rgba(201,168,76,0.3)'
    ctx.lineWidth = 1
    ctx.strokeRect(14, 14, W - 28, H - 28)

    // --- Gold corner ornaments ---
    drawCornerOrnaments(ctx, W, H)

    // --- Top left: wallet/vault/diamonds ---
    ctx.font = 'bold 18px Arial'
    ctx.fillStyle = 'rgba(255,255,255,0.9)'
    ctx.fillText(`💰 ${(user.wallet || 0).toLocaleString()}`, 28, 48)
    ctx.fillText(`🏦 ${(user.vault || 0).toLocaleString()} · 💎 ${user.diamonds || 0}`, 28, 72)

    // --- Profile picture ---
    const pfpX = W / 2
    const pfpY = 260
    const pfpR = 90

    if (user.avatar) {
        try {
            const avatar = await loadImage(user.avatar)
            ctx.save()
            ctx.beginPath()
            ctx.arc(pfpX, pfpY, pfpR, 0, Math.PI * 2)
            ctx.clip()
            ctx.drawImage(avatar, pfpX - pfpR, pfpY - pfpR, pfpR * 2, pfpR * 2)
            ctx.restore()
        } catch {
            drawDefaultAvatar(ctx, pfpX, pfpY, pfpR)
        }
    } else {
        drawDefaultAvatar(ctx, pfpX, pfpY, pfpR)
    }

    // --- Frame around pfp ---
    drawFrame(ctx, pfpX, pfpY, pfpR, user.frame || 'classic')

    // --- Username ---
    ctx.font = 'bold 32px Arial'
    ctx.fillStyle = '#e6c668'
    ctx.textAlign = 'center'
    ctx.fillText(user.username || 'Unknown', W / 2, pfpY + pfpR + 48)

    // --- Rank + Level ---
    ctx.font = '20px Arial'
    ctx.fillStyle = '#c9a84c'
    ctx.fillText(`${displayRank}  •  Lv.${user.level || 1}`, W / 2, pfpY + pfpR + 80)

    // --- Title ---
    ctx.font = 'italic 17px Arial'
    ctx.fillStyle = 'rgba(201,168,76,0.75)'
    ctx.fillText(user.title || '—', W / 2, pfpY + pfpR + 108)

    // --- XP Bar ---
    const barW = 320
    const barH = 18
    const barX = (W - barW) / 2
    const barY = pfpY + pfpR + 130

    // Bar background
    ctx.fillStyle = 'rgba(255,255,255,0.08)'
    ctx.beginPath()
    ctx.roundRect(barX, barY, barW, barH, 9)
    ctx.fill()

    // Bar fill
    const fillGrad = ctx.createLinearGradient(barX, 0, barX + barW, 0)
    fillGrad.addColorStop(0, '#c9a84c')
    fillGrad.addColorStop(1, '#e6c668')
    ctx.fillStyle = fillGrad
    ctx.beginPath()
    ctx.roundRect(barX, barY, barW * xpPercent, barH, 9)
    ctx.fill()

    // XP text on bar
    ctx.font = 'bold 12px Arial'
    ctx.fillStyle = '#0a0908'
    ctx.textAlign = 'center'
    ctx.fillText(`${user.xp || 0} / ${xpToNext} XP`, W / 2, barY + 13)

    // --- Bottom watermark ---
    ctx.font = 'bold 15px Arial'
    ctx.fillStyle = 'rgba(201,168,76,0.5)'
    ctx.textAlign = 'center'
    ctx.fillText('⚔️  T H E  E M P I R E  ⚔️', W / 2, H - 28)

    return await canvas.encode('jpeg')
}

function drawDefaultAvatar(ctx, x, y, r) {
    ctx.save()
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fillStyle = '#1a1508'
    ctx.fill()
    ctx.restore()

    // Person icon
    ctx.strokeStyle = '#c9a84c'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(x, y - 20, 28, 0, Math.PI * 2)
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(x, y + 60, 50, Math.PI, 0)
    ctx.stroke()
}

function drawFrame(ctx, x, y, r, frameId) {
    ctx.save()
    if (frameId === 'ornate') {
        // Double ring
        ctx.beginPath()
        ctx.arc(x, y, r + 6, 0, Math.PI * 2)
        ctx.strokeStyle = '#e6c668'
        ctx.lineWidth = 2
        ctx.stroke()
        ctx.beginPath()
        ctx.arc(x, y, r + 12, 0, Math.PI * 2)
        ctx.strokeStyle = 'rgba(201,168,76,0.5)'
        ctx.lineWidth = 1
        ctx.stroke()
        // Tick marks
        for (let i = 0; i < 16; i++) {
            const a = (i / 16) * Math.PI * 2
            ctx.beginPath()
            ctx.moveTo(x + Math.cos(a) * (r + 6), y + Math.sin(a) * (r + 6))
            ctx.lineTo(x + Math.cos(a) * (r + 12), y + Math.sin(a) * (r + 12))
            ctx.strokeStyle = '#e6c668'
            ctx.lineWidth = 1
            ctx.stroke()
        }
    } else if (frameId === 'thin') {
        ctx.beginPath()
        ctx.arc(x, y, r + 5, 0, Math.PI * 2)
        ctx.strokeStyle = 'rgba(201,168,76,0.6)'
        ctx.lineWidth = 1.5
        ctx.setLineDash([3, 6])
        ctx.stroke()
        ctx.setLineDash([])
    } else if (frameId === 'dual') {
        ctx.beginPath()
        ctx.arc(x, y, r + 6, 0, Math.PI * 2)
        ctx.strokeStyle = '#e6c668'
        ctx.lineWidth = 2.5
        ctx.stroke()
        // Dot ring
        for (let i = 0; i < 24; i++) {
            const a = (i / 24) * Math.PI * 2
            ctx.beginPath()
            ctx.arc(x + Math.cos(a) * (r + 14), y + Math.sin(a) * (r + 14), 2, 0, Math.PI * 2)
            ctx.fillStyle = '#e6c668'
            ctx.fill()
        }
    } else {
        // Classic
        ctx.beginPath()
        ctx.arc(x, y, r + 6, 0, Math.PI * 2)
        ctx.strokeStyle = '#c9a84c'
        ctx.lineWidth = 3
        ctx.stroke()
        // Diamond points at N/S/E/W
        ;[0, 90, 180, 270].forEach(deg => {
            const a = (deg * Math.PI) / 180
            const px = x + Math.cos(a) * (r + 6)
            const py = y + Math.sin(a) * (r + 6)
            ctx.beginPath()
            ctx.moveTo(px, py - 5)
            ctx.lineTo(px + 5, py)
            ctx.lineTo(px, py + 5)
            ctx.lineTo(px - 5, py)
            ctx.closePath()
            ctx.fillStyle = '#c9a84c'
            ctx.fill()
        })
    }
    ctx.restore()
}

function drawCornerOrnaments(ctx, W, H) {
    const size = 24
    const pad = 20
    const corners = [
        [pad, pad, 0],
        [W - pad, pad, Math.PI / 2],
        [W - pad, H - pad, Math.PI],
        [pad, H - pad, (3 * Math.PI) / 2]
    ]
    ctx.strokeStyle = '#c9a84c'
    ctx.lineWidth = 1.5
    corners.forEach(([x, y, rot]) => {
        ctx.save()
        ctx.translate(x, y)
        ctx.rotate(rot)
        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.lineTo(size, 0)
        ctx.moveTo(0, 0)
        ctx.lineTo(0, size)
        ctx.stroke()
        ctx.restore()
    })
}

function getXPBar(xp, xpToNext) {
    const filled = Math.round((xp / xpToNext) * 10)
    const empty = 10 - filled
    return '▓'.repeat(Math.max(0, filled)) + '░'.repeat(Math.max(0, empty))
}

module.exports = { profileCommand }
