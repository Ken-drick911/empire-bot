const { createCanvas, loadImage } = require('@napi-rs/canvas')
const fetch = require('node-fetch')

const GRAPH_CONFIGS = {
    skill: {
        top: 'confident', bottom: 'insecure',
        left: 'competent', right: 'incompetent',
        prompt: (user) => `User stats: rank=${user.rank}, level=${user.level}, xp=${user.xp}, totalMessages=${user.totalMessages}, timesRobbed=${user.timesRobbed}, timesStolen=${user.timesStolen}, wallet=${user.wallet}. Based on these empire game stats, place them on a skill chart. Return ONLY valid JSON: {"x": <-1.0 to 1.0>, "y": <-1.0 to 1.0>, "reason": "<one savage witty sentence explaining their position, empire themed>"}. x=1 means incompetent, x=-1 means competent. y=1 means confident, y=-1 means insecure.`
    },
    pov: {
        top: 'ignorant', bottom: 'perspective',
        left: 'optimistic', right: 'realistic',
        prompt: (user) => `User stats: rank=${user.rank}, level=${user.level}, totalMessages=${user.totalMessages}, wallet=${user.wallet}, vault=${user.vault}. Based on these empire stats, place them on a point-of-view chart. Return ONLY valid JSON: {"x": <-1.0 to 1.0>, "y": <-1.0 to 1.0>, "reason": "<one savage witty sentence, empire themed>"}. x=1 means realistic, x=-1 means optimistic. y=1 means ignorant, y=-1 means perspective.`
    },
    relation: {
        top: 'simp', bottom: 'commitment issues',
        left: 'walking red flag', right: 'green flag',
        prompt: (user) => `User stats: rank=${user.rank}, timesStolen=${user.timesStolen}, timesRobbed=${user.timesRobbed}, wallet=${user.wallet}, streak=${user.streak}. Based on these empire stats, place them on a relationship chart. Return ONLY valid JSON: {"x": <-1.0 to 1.0>, "y": <-1.0 to 1.0>, "reason": "<one savage witty sentence about their relationship style, empire themed>"}. x=1 means green flag, x=-1 means walking red flag. y=1 means simp, y=-1 means commitment issues.`
    },
    duality: {
        top: 'good', bottom: 'evil',
        left: 'calm', right: 'chaotic',
        prompt: (user) => `User stats: rank=${user.rank}, level=${user.level}, timesStolen=${user.timesStolen}, timesRobbed=${user.timesRobbed}, totalMessages=${user.totalMessages}. Based on these empire stats, place them on a duality chart. Return ONLY valid JSON: {"x": <-1.0 to 1.0>, "y": <-1.0 to 1.0>, "reason": "<one savage witty sentence about their duality, empire themed>"}. x=1 means chaotic, x=-1 means calm. y=1 means good, y=-1 means evil.`
    },
    gen: {
        top: 'gen alpha', bottom: 'boomer',
        left: 'cringe', right: 'based',
        prompt: (user) => `User stats: rank=${user.rank}, level=${user.level}, totalMessages=${user.totalMessages}, joinDate=${user.joinDate}, streak=${user.streak}. Based on these empire stats, place them on a generation chart. Return ONLY valid JSON: {"x": <-1.0 to 1.0>, "y": <-1.0 to 1.0>, "reason": "<one savage witty sentence about their generation vibe, empire themed>"}. x=1 means based, x=-1 means cringe. y=1 means gen alpha, y=-1 means boomer.`
    },
    social: {
        top: 'extrovert', bottom: 'introvert',
        left: 'awkward', right: 'smooth',
        prompt: (user) => `User stats: rank=${user.rank}, totalMessages=${user.totalMessages}, recentMessages=${user.recentMessages}, timesRobbed=${user.timesRobbed}, reputation=${user.reputation}. Based on these empire stats, place them on a social chart. Return ONLY valid JSON: {"x": <-1.0 to 1.0>, "y": <-1.0 to 1.0>, "reason": "<one savage witty sentence about their social skills, empire themed>"}. x=1 means smooth, x=-1 means awkward. y=1 means extrovert, y=-1 means introvert.`
    }
}

async function getClaudeAnalysis(prompt) {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 200,
            messages: [{ role: 'user', content: prompt }]
        })
    })
    const data = await response.json()
    const text = data.content[0].text
    const clean = text.replace(/```json|```/g, '').trim()
    return JSON.parse(clean)
}

async function generateGraphImage(sock, sender, config, analysis) {
    const size = 600
    const canvas = createCanvas(size, size)
    const ctx = canvas.getContext('2d')

    // White background
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, size, size)

    // Draw grid
    ctx.strokeStyle = '#e0e0e0'
    ctx.lineWidth = 1
    const gridCount = 10
    const step = size / gridCount
    for (let i = 0; i <= gridCount; i++) {
        ctx.beginPath()
        ctx.moveTo(i * step, 0)
        ctx.lineTo(i * step, size)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(0, i * step)
        ctx.lineTo(size, i * step)
        ctx.stroke()
    }

    const cx = size / 2
    const cy = size / 2

    // Horizontal axis (pink/red)
    ctx.strokeStyle = '#e91e8c'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(0, cy)
    ctx.lineTo(size, cy)
    ctx.stroke()

    // Vertical axis (green/yellow)
    const grad = ctx.createLinearGradient(cx, 0, cx, size)
    grad.addColorStop(0, '#4caf50')
    grad.addColorStop(1, '#ffeb3b')
    ctx.strokeStyle = grad
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(cx, 0)
    ctx.lineTo(cx, size)
    ctx.stroke()

    // Labels
    ctx.fillStyle = '#000000'
    ctx.font = 'bold 16px sans-serif'
    const pad = 8

    // Draw label with black background
    function drawLabel(text, x, y, align = 'center') {
        const metrics = ctx.measureText(text)
        const w = metrics.width + pad * 2
        const h = 24
        let bx = x - w / 2
        if (align === 'left') bx = x
        if (align === 'right') bx = x - w
        ctx.fillStyle = '#000000'
        ctx.fillRect(bx, y - h / 2, w, h)
        ctx.fillStyle = '#ffffff'
        ctx.textAlign = align === 'center' ? 'center' : align === 'left' ? 'left' : 'right'
        ctx.fillText(text, align === 'center' ? x : align === 'left' ? bx + pad : bx + w - pad, y + 6)
    }

    drawLabel(config.top, cx, 20)
    drawLabel(config.bottom, cx, size - 20)
    drawLabel(config.left, 10, cy, 'left')
    drawLabel(config.right, size - 10, cy, 'right')

    // Plot user position
    const dotX = cx + (analysis.x * (size / 2 - 40))
    const dotY = cy - (analysis.y * (size / 2 - 40))
    const radius = 30

    // Get WhatsApp pfp
    let pfpBuffer = null
    try {
        const ppUrl = await sock.profilePictureUrl(sender, 'image')
        const res = await fetch(ppUrl)
        pfpBuffer = await res.buffer()
    } catch {}

    if (pfpBuffer) {
        const img = await loadImage(pfpBuffer)
        ctx.save()
        ctx.beginPath()
        ctx.arc(dotX, dotY, radius, 0, Math.PI * 2)
        ctx.clip()
        ctx.drawImage(img, dotX - radius, dotY - radius, radius * 2, radius * 2)
        ctx.restore()
    } else {
        ctx.fillStyle = '#333333'
        ctx.beginPath()
        ctx.arc(dotX, dotY, radius, 0, Math.PI * 2)
        ctx.fill()
    }

    return canvas.toBuffer('image/png')
}

async function graphCommand(sock, msg, from, sender, type) {
    const { getUser } = require('../data/db')
    const config = GRAPH_CONFIGS[type]
    if (!config) return

    const user = await getUser(sender)
    if (!user) {
        await sock.sendMessage(from, { text: '⚔️ You need to register first!', quoted: msg })
        return
    }

    await sock.sendMessage(from, { text: `⚔️ Analyzing your empire presence...`, quoted: msg })

    try {
        const analysis = await getClaudeAnalysis(config.prompt(user))
        const imageBuffer = await generateGraphImage(sock, sender, config, analysis)

        await sock.sendMessage(from, {
            image: imageBuffer,
            caption: `Here is your position on the graph:\n\n*Reason:* ${analysis.reason}`,
            quoted: msg
        })
    } catch (err) {
        console.error('Graph error:', err)
        await sock.sendMessage(from, { text: '❌ Failed to generate graph. Try again!', quoted: msg })
    }
}

module.exports = { graphCommand }
