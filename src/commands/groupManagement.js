// groupManagement.js - Complete Group Management System

const mutedUsers = new Map()
const warnings = new Map()
const { getGroupSettings, updateGroupSettings } = require('../data/db')

const groupSettings = new Proxy(new Map(), {
    get(target, prop) {
        if (prop === 'set') {
            return (key, value) => {
                target.set(key, value)
                const parts = key.split('_')
                const chatId = parts.slice(1).join('_')
                const setting = parts[0]
                updateGroupSettings(chatId, { [setting]: value }).catch(() => {})
                return target
            }
        }
        return typeof target[prop] === 'function' ? target[prop].bind(target) : target[prop]
    }
})

// Anti-spam storage
const spamTimestamps = new Map()
const botWarnings = new Map()
const lastMessages = new Map()

const SPAM_WINDOW = 5000
const SPAM_LIMIT = 5
const BOT_WARN_LIMIT = 2

// ---------- Helpers ----------
function getWarnLimit(chatId) {
    return groupSettings.get(`warnlimit_${chatId}`) || 3
}

function parseDuration(str) {
    if (!str) return null
    const match = str.match(/^(\d+)(s|sec|secs|seconds|m|min|mins|minutes|h|hr|hrs|hours|d|day|days)$/i)
    if (!match) return null
    const val = parseInt(match[1])
    const unit = match[2].toLowerCase()
    if (unit.startsWith('s')) return val * 1000
    if (unit.startsWith('m')) return val * 60 * 1000
    if (unit.startsWith('h')) return val * 60 * 60 * 1000
    if (unit.startsWith('d')) return val * 24 * 60 * 60 * 1000
    return null
}

function formatTime(ms) {
    const s = Math.floor(ms / 1000)
    const m = Math.floor(s / 60)
    const h = Math.floor(m / 60)
    const d = Math.floor(h / 24)
    if (d > 0) return `${d}d ${h % 24}h`
    if (h > 0) return `${h}h ${m % 60}m`
    if (m > 0) return `${m}m ${s % 60}s`
    return `${s}s`
}

function getTargetUsers(msg, args) {
    const targets = []
    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || []
    targets.push(...mentioned)
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.participant
    if (quoted && !targets.includes(quoted)) targets.push(quoted)
    for (const a of args) {
        if (/^\d+$/.test(a)) {
            const jid = a + '@s.whatsapp.net'
            if (!targets.includes(jid)) targets.push(jid)
        }
    }
    return targets
}

async function reply(sock, chatId, text, msg) {
    await sock.sendMessage(chatId, { text, quoted: msg })
}

// ---------- Kick ----------
async function kickMember(sock, msg, args) {
    const chatId = msg.key.remoteJid
    const targets = getTargetUsers(msg, args)
    if (!targets.length) return reply(sock, chatId, '❌ Tag or reply to the member(s) to kick.', msg)
    if (targets.length > 10) return reply(sock, chatId, '❌ Max 10 members at once.', msg)
    try {
        await sock.groupParticipantsUpdate(chatId, targets, 'remove')
        const names = targets.map(t => `@${t.split('@')[0]}`).join(' ')
        await sock.sendMessage(chatId, { text: `✅ Kicked ${targets.length} member(s): ${names}`, mentions: targets, quoted: msg })
    } catch {
        reply(sock, chatId, '❌ Failed to kick. Make sure I\'m admin.', msg)
    }
}

// ---------- Warn ----------
async function warnMember(sock, msg, args, warnings) {
    const chatId = msg.key.remoteJid
    const targets = getTargetUsers(msg, args)
    if (!targets.length) return reply(sock, chatId, '❌ Tag or reply to the member(s) to warn.', msg)
    if (targets.length > 10) return reply(sock, chatId, '❌ Max 10 members at once.', msg)
    const maxWarns = getWarnLimit(chatId)
    let results = [], kicked = []
    for (const t of targets) {
        const key = `${chatId}_${t}`
        const count = (warnings.get(key) || 0) + 1
        warnings.set(key, count)
        if (count >= maxWarns) {
            try {
                await sock.groupParticipantsUpdate(chatId, [t], 'remove')
                kicked.push(`@${t.split('@')[0]}`)
                warnings.delete(key)
            } catch { results.push(`@${t.split('@')[0]} (warn ${count}/${maxWarns} - kick failed)`) }
        } else {
            results.push(`@${t.split('@')[0]} (warn ${count}/${maxWarns})`)
        }
    }
    let text = `⚠️ *Warning Issued*\n━━━━━━━━━━━━━━━━\n${results.join('\n')}`
    if (kicked.length) text += `\n\n⚔️ Kicked at ${maxWarns} warnings: ${kicked.join(', ')}`
    await sock.sendMessage(chatId, { text, mentions: targets, quoted: msg })
    await deleteCommandMessage(sock, msg)
}

// ---------- Reset Warn ----------
async function resetWarn(sock, msg, args, warnings) {
    const chatId = msg.key.remoteJid
    const targets = getTargetUsers(msg, args)
    if (!targets.length) return reply(sock, chatId, '❌ Tag or reply to the member(s) to reset warnings.', msg)
    let reset = []
    for (const t of targets) {
        const key = `${chatId}_${t}`
        warnings.delete(key)
        reset.push(`@${t.split('@')[0]}`)
    }
    await sock.sendMessage(chatId, {
        text: `✅ *Warnings Reset*\n━━━━━━━━━━━━━━━━\n${reset.join('\n')}`,
        mentions: targets,
        quoted: msg
    })
    await deleteCommandMessage(sock, msg)
}

// ---------- Set Warn Limit ----------
async function setWarnLimit(sock, msg, args) {
    const chatId = msg.key.remoteJid
    const limit = parseInt(args[0])
    if (!limit || limit < 1 || limit > 5) return reply(sock, chatId, '❌ Usage: .setwarn 1-5\nExample: .setwarn 3', msg)
    groupSettings.set(`warnlimit_${chatId}`, limit)
    await sock.sendMessage(chatId, {
        text: `⚙️ *Warn Limit Updated*\n━━━━━━━━━━━━━━━━\nMembers will be kicked after *${limit} warning(s)*.`,
        quoted: msg
    })
}

// ---------- Mute ----------
async function muteMembers(sock, msg, args, mutedUsers, isUserAdmin) {
    const chatId = msg.key.remoteJid
    const targets = getTargetUsers(msg, args)
    if (!targets.length) return reply(sock, chatId, '❌ Tag or reply to the member(s) to mute.\nExample: .mute @user1 @user2 30m', msg)
    if (targets.length > 10) return reply(sock, chatId, '❌ Max 10 members at once.', msg)
    let durationStr = args.find(a => /^\d+(s|sec|secs|seconds|m|min|mins|minutes|h|hr|hrs|hours|d|day|days)$/i.test(a)) || '1h'
    const durationMs = parseDuration(durationStr)
    if (!durationMs) return reply(sock, chatId, '❌ Invalid duration. Use like: 30m, 2h, 1d', msg)
    if (!mutedUsers.has(chatId)) mutedUsers.set(chatId, new Map())
    const chatMutes = mutedUsers.get(chatId)
    const until = Date.now() + durationMs
    const timeStr = formatTime(durationMs)
    let muted = [], failed = []
    for (const t of targets) {
        if (await isUserAdmin(chatId, t)) { failed.push(`@${t.split('@')[0]} (admin)`); continue }
        if (chatMutes.has(t)) { failed.push(`@${t.split('@')[0]} (already muted)`); continue }
        chatMutes.set(t, { until, reason: '' })
        muted.push(`@${t.split('@')[0]}`)
        setTimeout(() => autoUnmuteMember(sock, chatId, t, mutedUsers), durationMs)
    }
    let text = `🔇 Muted ${muted.length} member(s) for ${timeStr}.\n`
    if (muted.length) text += `✅ ${muted.join(', ')}\n`
    if (failed.length) text += `❌ ${failed.join(', ')}`
    if (muted.length) text += `\n⏰ Auto-unmute at ${new Date(until).toLocaleTimeString()}`
    const allMentions = targets
    await sock.sendMessage(chatId, { text, mentions: allMentions, quoted: msg })
}

async function unmuteMembers(sock, msg, args, mutedUsers) {
    const chatId = msg.key.remoteJid
    const targets = getTargetUsers(msg, args)
    if (!targets.length) return reply(sock, chatId, '❌ Tag or reply to the member(s) to unmute.', msg)
    if (!mutedUsers.has(chatId)) return reply(sock, chatId, 'ℹ️ No one is muted.', msg)
    const chatMutes = mutedUsers.get(chatId)
    let unmuted = [], notMuted = []
    for (const t of targets) {
        if (chatMutes.has(t)) { chatMutes.delete(t); unmuted.push(`@${t.split('@')[0]}`) }
        else { notMuted.push(`@${t.split('@')[0]}`) }
    }
    if (chatMutes.size === 0) mutedUsers.delete(chatId)
    let text = ''
    if (unmuted.length) text += `🔊 Unmuted: ${unmuted.join(', ')}`
    if (notMuted.length) text += `\nℹ️ Not muted: ${notMuted.join(', ')}`
    await sock.sendMessage(chatId, { text: text || '❌ No changes.', mentions: targets, quoted: msg })
}

async function autoUnmuteMember(sock, chatId, target, mutedUsers) {
    if (!mutedUsers.has(chatId)) return
    const chatMutes = mutedUsers.get(chatId)
    if (!chatMutes.has(target)) return
    const info = chatMutes.get(target)
    if (info.until > Date.now()) return
    chatMutes.delete(target)
    if (chatMutes.size === 0) mutedUsers.delete(chatId)
    await sock.sendMessage(chatId, { text: `🔊 @${target.split('@')[0]} auto-unmuted.`, mentions: [target] })
}

// ---------- Promote & Demote ----------
async function promoteMember(sock, msg, args) {
    const chatId = msg.key.remoteJid
    const targets = getTargetUsers(msg, args)
    if (!targets.length) return reply(sock, chatId, '❌ Tag or reply to the member(s) to promote.', msg)
    let done = [], fail = []
    for (const t of targets) {
        try { await sock.groupParticipantsUpdate(chatId, [t], 'promote'); done.push(`@${t.split('@')[0]}`) }
        catch { fail.push(`@${t.split('@')[0]}`) }
    }
    await sock.sendMessage(chatId, {
        text: `⬆️ Promoted: ${done.join(', ')}` + (fail.length ? `\n❌ Failed: ${fail.join(', ')}` : ''),
        mentions: targets, quoted: msg
    })
}

async function demoteMember(sock, msg, args) {
    const chatId = msg.key.remoteJid
    const targets = getTargetUsers(msg, args)
    if (!targets.length) return reply(sock, chatId, '❌ Tag or reply to the member(s) to demote.', msg)
    let done = [], fail = []
    for (const t of targets) {
        try { await sock.groupParticipantsUpdate(chatId, [t], 'demote'); done.push(`@${t.split('@')[0]}`) }
        catch { fail.push(`@${t.split('@')[0]}`) }
    }
    await sock.sendMessage(chatId, {
        text: `⬇️ Demoted: ${done.join(', ')}` + (fail.length ? `\n❌ Failed: ${fail.join(', ')}` : ''),
        mentions: targets, quoted: msg
    })
}

// ---------- Anti-link ----------
async function toggleAntiLink(sock, chatId, args, groupSettings) {
    const mode = args[0]?.toLowerCase()
    const validModes = ['off', 'whatsapp', 'all']
    if (!mode || !validModes.includes(mode)) {
        const current = groupSettings.get(`antilink_${chatId}`) || 'off'
        return reply(sock, chatId, `ℹ️ Current mode: ${current}\nUsage: .antilink off / whatsapp / all`)
    }
    groupSettings.set(`antilink_${chatId}`, mode)
    await sock.sendMessage(chatId, { text: `🔗 Anti-link set to: ${mode.toUpperCase()}` })
}

async function antiLinkHandler(sock, msg, deps) {
    const { groupSettings, warnings, isUserAdmin, mutedUsers } = deps
    const chatId = msg.key.remoteJid
    const mode = groupSettings.get(`antilink_${chatId}`) || 'off'
    if (mode === 'off') return
    const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || ''
    if (!text) return
    const urlRegex = /(https?:\/\/[^\s]+)/gi
    const matches = text.match(urlRegex)
    if (!matches) return
    const isWhatsAppLink = (url) => {
        const lower = url.toLowerCase()
        return lower.includes('wa.me') || lower.includes('whatsapp.com') ||
               lower.includes('chat.whatsapp.com') || lower.includes('api.whatsapp.com')
    }
    let shouldBlock = false
    if (mode === 'all') shouldBlock = true
    else if (mode === 'whatsapp') shouldBlock = matches.some(isWhatsAppLink)
    if (!shouldBlock) return
    const sender = msg.key.participant || msg.key.remoteJid
    if (await isUserAdmin(chatId, sender)) return
    try { await sock.sendMessage(chatId, { delete: msg.key }) } catch {}
    const maxWarns = getWarnLimit(chatId)
    const key = `${chatId}_${sender}`
    const count = (warnings.get(key) || 0) + 1
    warnings.set(key, count)
    if (count >= maxWarns) {
        try {
            await sock.groupParticipantsUpdate(chatId, [sender], 'remove')
            warnings.delete(key)
            await sock.sendMessage(chatId, { text: `🚫 @${sender.split('@')[0]} kicked for sending links (${maxWarns} warnings).`, mentions: [sender] })
        } catch {
            await sock.sendMessage(chatId, { text: `⚠️ @${sender.split('@')[0]} reached max warnings for links but kick failed.`, mentions: [sender] })
        }
    } else {
        await sock.sendMessage(chatId, { text: `🔗 @${sender.split('@')[0]} link deleted — Warning ${count}/${maxWarns}`, mentions: [sender] })
    }
}

// ---------- Anti-spam ----------
async function toggleAntiSpam(sock, chatId, args, groupSettings) {
    const setting = args[0]?.toLowerCase()
    if (!['on', 'off'].includes(setting)) return reply(sock, chatId, '❌ Usage: .antispam on/off')
    groupSettings.set(`antispam_${chatId}`, setting === 'on')
    await sock.sendMessage(chatId, { text: `🛡️ Anti-spam ${setting === 'on' ? 'ON' : 'OFF'}` })
}

async function toggleAntiStatusMention(sock, chatId, args, groupSettings) {
    const setting = args[0]?.toLowerCase()
    if (!['on', 'off'].includes(setting)) return reply(sock, chatId, '❌ Usage: .antism on/off')
    groupSettings.set(`antism_${chatId}`, setting === 'on')
    await sock.sendMessage(chatId, { text: `📵 Anti-status-mention ${setting === 'on' ? 'ON' : 'OFF'}` })
}

async function handleAntiSpam(sock, msg, deps) {
    const { warnings, groupSettings, isUserAdmin } = deps
    const chatId = msg.key.remoteJid
    if (!chatId.endsWith('@g.us')) return
    if (!groupSettings.get(`antispam_${chatId}`)) return
    const sender = msg.key.participant || msg.key.remoteJid
    const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || ''
    const isSticker = !!msg.message?.stickerMessage
    if (text.startsWith('.')) return
    if (sender === sock.user.id) return
    if (await isUserAdmin(chatId, sender)) return
    const now = Date.now()
    const maxWarns = getWarnLimit(chatId)

    if (!spamTimestamps.has(chatId)) spamTimestamps.set(chatId, new Map())
    const userTimestamps = spamTimestamps.get(chatId)
    if (!userTimestamps.has(sender)) userTimestamps.set(sender, [])
    const timestamps = userTimestamps.get(sender)
    const recent = timestamps.filter(t => now - t < SPAM_WINDOW)
    recent.push(now)
    userTimestamps.set(sender, recent)
    if (recent.length > SPAM_LIMIT) {
        try { await sock.sendMessage(chatId, { delete: msg.key }) } catch {}
        const warnKey = `${chatId}_${sender}`
        const warnCount = (warnings.get(warnKey) || 0) + 1
        warnings.set(warnKey, warnCount)
        if (warnCount >= maxWarns) {
            try {
                await sock.groupParticipantsUpdate(chatId, [sender], 'remove')
                await sock.sendMessage(chatId, { text: `🚫 @${sender.split('@')[0]} kicked for spam (${maxWarns} warnings).`, mentions: [sender] })
                warnings.delete(warnKey)
            } catch {
                await sock.sendMessage(chatId, { text: `⚠️ @${sender.split('@')[0]} reached spam warning limit but kick failed.`, mentions: [sender] })
            }
        } else {
            await sock.sendMessage(chatId, { text: `⚠️ @${sender.split('@')[0]} spam warning ${warnCount}/${maxWarns}. Slow down!`, mentions: [sender] })
        }
        return
    }

    if (text && !isSticker) {
        if (!lastMessages.has(chatId)) lastMessages.set(chatId, new Map())
        const userLast = lastMessages.get(chatId)
        const prev = userLast.get(sender)
        if (prev && prev.text === text && (now - prev.timestamp) < 10000) {
            try { await sock.sendMessage(chatId, { delete: msg.key }) } catch {}
            if (!botWarnings.has(chatId)) botWarnings.set(chatId, new Map())
            const userBotWarns = botWarnings.get(chatId)
            const botCount = (userBotWarns.get(sender) || 0) + 1
            userBotWarns.set(sender, botCount)
            if (botCount >= BOT_WARN_LIMIT) {
                try {
                    await sock.groupParticipantsUpdate(chatId, [sender], 'remove')
                    await sock.sendMessage(chatId, { text: `🤖 @${sender.split('@')[0]} kicked for bot-like behaviour.`, mentions: [sender] })
                    userBotWarns.delete(sender)
                } catch {
                    await sock.sendMessage(chatId, { text: `⚠️ @${sender.split('@')[0]} bot warning ${botCount}/${BOT_WARN_LIMIT}.`, mentions: [sender] })
                }
            } else {
                await sock.sendMessage(chatId, { text: `🤖 @${sender.split('@')[0]} bot warning ${botCount}/${BOT_WARN_LIMIT}. Stop repeating messages!`, mentions: [sender] })
            }
            return
        }
        userLast.set(sender, { text, timestamp: now })
    }
}

// ---------- Mute helpers ----------
async function checkIfMuted(sock, msg, mutedUsers) {
    const chatId = msg.key.remoteJid
    const sender = msg.key.participant || msg.key.remoteJid
    if (!mutedUsers.has(chatId)) return false
    const chatMutes = mutedUsers.get(chatId)
    if (!chatMutes.has(sender)) return false
    const info = chatMutes.get(sender)
    if (info.until < Date.now()) {
        chatMutes.delete(sender)
        if (chatMutes.size === 0) mutedUsers.delete(chatId)
        await sock.sendMessage(chatId, { text: `🔊 @${sender.split('@')[0]} auto-unmuted.`, mentions: [sender] })
        return false
    }
    return true
}

async function deleteMutedMessage(sock, msg) {
    try { await sock.sendMessage(msg.key.remoteJid, { delete: msg.key }) } catch {}
}

// ---------- Welcome / Leave ----------
async function toggleWelcome(sock, chatId, args, groupSettings) {
    const setting = args[0]?.toLowerCase()
    if (!['on', 'off'].includes(setting)) return reply(sock, chatId, '❌ Usage: .welcome on/off')
    groupSettings.set(`welcome_${chatId}`, setting === 'on')
    await sock.sendMessage(chatId, { text: `👋 Welcome messages ${setting === 'on' ? 'ON' : 'OFF'}` })
}

async function toggleLeave(sock, chatId, args, groupSettings) {
    const setting = args[0]?.toLowerCase()
    if (!['on', 'off'].includes(setting)) return reply(sock, chatId, '❌ Usage: .leave on/off')
    groupSettings.set(`leave_${chatId}`, setting === 'on')
    await sock.sendMessage(chatId, { text: `👋 Leave messages ${setting === 'on' ? 'ON' : 'OFF'}` })
}

async function setWelcomeMessage(sock, chatId, args, msg, groupSettings) {
    const text = args.join(' ')
    if (!text) return reply(sock, chatId, '❌ Please provide a message.\nExample: .setwelcome Welcome @ to the group!', msg)
    groupSettings.set(`welcome_msg_${chatId}`, text)
    await sock.sendMessage(chatId, { text: `✅ Welcome message set:\n${text}` })
}

async function setLeaveMessage(sock, chatId, args, groupSettings) {
    const text = args.join(' ')
    if (!text) return reply(sock, chatId, '❌ Please provide a message.\nExample: .setleave Goodbye @!')
    groupSettings.set(`leave_msg_${chatId}`, text)
    await sock.sendMessage(chatId, { text: `✅ Leave message set:\n${text}` })
}

async function sendGroupMessage(sock, chatId, participants, action, groupSettings) {
    const key = action === 'add' ? `welcome_${chatId}` : `leave_${chatId}`
    if (!groupSettings.get(key)) return
    const msgKey = action === 'add' ? `welcome_msg_${chatId}` : `leave_msg_${chatId}`
    let template = groupSettings.get(msgKey)
    if (!template) template = action === 'add' ? '👋 Welcome @!' : '👋 Goodbye @!'
    for (const p of participants) {
        const id = typeof p === 'string' ? p : p.id
        if (!id) continue
        const mention = `@${id.split('@')[0]}`
        const finalMsg = template.replace(/@/g, mention)
        await sock.sendMessage(chatId, { text: finalMsg, mentions: [id] })
    }
}

// ---------- Tag commands ----------
async function hideTag(sock, msg, args) {
    const chatId = msg.key.remoteJid
    const text = args.join(' ')
    if (!text) return reply(sock, chatId, '❌ Provide a message. Example: .hidetag hello everyone', msg)
    try {
        const meta = await sock.groupMetadata(chatId)
        const participants = meta.participants.map(p => p.id)
        await sock.sendMessage(chatId, { text, mentions: participants, quoted: msg })
        await deleteCommandMessage(sock, msg)
    } catch {
        reply(sock, chatId, '❌ Failed to send hidetag.', msg)
    }
}

async function tagAdmins(sock, msg, args) {
    const chatId = msg.key.remoteJid
    const text = args.join(' ') || '📢 Admin notice!'
    try {
        const meta = await sock.groupMetadata(chatId)
        const admins = meta.participants.filter(p => p.admin === 'admin' || p.admin === 'superadmin').map(p => p.id)
        if (!admins.length) return reply(sock, chatId, 'ℹ️ No admins found.', msg)
        const mentionLines = admins.map(p => `  🛡️ @${p.split('@')[0]}`).join('\n')
        await sock.sendMessage(chatId, {
            text: `🛡️ 𝗔𝗗𝗠𝗜𝗡 𝗔𝗟𝗘𝗥𝗧\n━━━━━━━━━━━━━━━━\n📜 ${text}\n━━━━━━━━━━━━━━━━\n${mentionLines}\n━━━━━━━━━━━━━━━━`,
            mentions: admins, quoted: msg
        })
        await deleteCommandMessage(sock, msg)
    } catch {
        reply(sock, chatId, '❌ Failed to tag admins.', msg)
    }
}

async function groupStats(sock, msg, groupSettings) {
    const chatId = msg.key.remoteJid
    try {
        const meta = await sock.groupMetadata(chatId)
        const participants = meta.participants
        const admins = participants.filter(p => p.admin === 'admin' || p.admin === 'superadmin')
        const created = new Date(meta.creation * 1000).toDateString()
        const isOpen = meta.announce === false ? '🔓 Open' : '🔒 Closed'
        const antilink = groupSettings.get(`antilink_${chatId}`) || 'off'
        const antispam = groupSettings.get(`antispam_${chatId}`) ? '🟢 ON' : '🔴 OFF'
        const antism = groupSettings.get(`antism_${chatId}`) ? '🟢 ON' : '🔴 OFF'
        const welcome = groupSettings.get(`welcome_${chatId}`) ? '🟢 ON' : '🔴 OFF'
        const leave = groupSettings.get(`leave_${chatId}`) ? '🟢 ON' : '🔴 OFF'
        const warnLimit = getWarnLimit(chatId)
        const text = `🏰 𝗚𝗥𝗢𝗨𝗣 𝗦𝗧𝗔𝗧𝗦
━━━━━━━━━━━━━━━━
📋 Name: ${meta.subject}
📅 Created: ${created}
👥 Members: ${participants.length}
👑 Admins: ${admins.length}
🔒 Status: ${isOpen}
━━━━━━━━━━━━━━━━
⚙️ 𝗧𝗢𝗚𝗚𝗟𝗘 𝗦𝗧𝗔𝗧𝗨𝗦
━━━━━━━━━━━━━━━━
🔗 Antilink: ${antilink.toUpperCase()}
🛡️ Antispam: ${antispam}
📵 Anti-SM: ${antism}
👋 Welcome: ${welcome}
🚪 Leave: ${leave}
⚠️ Warn Limit: ${warnLimit}
━━━━━━━━━━━━━━━━`
        await sock.sendMessage(chatId, { text, quoted: msg })
    } catch {
        reply(sock, chatId, '❌ Failed to fetch group stats.', msg)
    }
}

async function deleteCommandMessage(sock, msg) {
    try { await sock.sendMessage(msg.key.remoteJid, { delete: msg.key }) } catch {}
}

// ---------- Open / Close ----------
async function openGroup(sock, chatId) {
    try {
        await sock.groupSettingUpdate(chatId, 'not_announcement')
        await sock.sendMessage(chatId, { text: '🔓 Group opened (everyone can send).' })
    } catch {
        reply(sock, chatId, '❌ Failed to open group.')
    }
}

async function closeGroup(sock, chatId) {
    try {
        await sock.groupSettingUpdate(chatId, 'announcement')
        await sock.sendMessage(chatId, { text: '🔒 Group closed (admins only).' })
    } catch {
        reply(sock, chatId, '❌ Failed to close group.')
    }
}

// ---------- Tag All ----------
async function tagAll(sock, msg, args) {
    const chatId = msg.key.remoteJid
    const sender = msg.key.participant || msg.key.remoteJid
    try {
        const meta = await sock.groupMetadata(chatId)
        const members = meta.participants
        const isAdmin = members.find(p => p.id === sender)?.admin === 'admin' ||
                        members.find(p => p.id === sender)?.admin === 'superadmin'
        const isMod = await require('../data/db').isModerator(sender)
        const owner = require('../config/owner').isOwner(sender)
        if (!isAdmin && !isMod && !owner) {
            return await sock.sendMessage(chatId, { text: '❌ Only admins, moderators, or the owner can use this command.', quoted: msg })
        }
        const text = args.join(' ') || '📢 Attention, all members!'
        const mentionLines = members.map((p, i) => `${i + 1}. @${p.id.split('@')[0]}`).join('\n')
        await sock.sendMessage(chatId, {
            text: `⚔️ *IMPERIAL SUMMONS* ⚔️\n${'─'.repeat(20)}\n📜 ${text}\n${'─'.repeat(20)}\n\n${mentionLines}`,
            mentions: members.map(p => p.id),
            quoted: msg
        })
        await deleteCommandMessage(sock, msg)
    } catch (err) {
        await sock.sendMessage(chatId, { text: '❌ Error: ' + err.message })
    }
}

// ---------- Command Dispatcher ----------
async function handleGroupCommands(sock, msg, command, args, deps) {
    const { groupSettings: settings, warnings: warns, isUserAdmin, mutedUsers: muted } = deps
    const chatId = msg.key.remoteJid

    switch(command) {
        case 'kick': await kickMember(sock, msg, args); break
        case 'warn': await warnMember(sock, msg, args, warns); break
        case 'resetwarn': await resetWarn(sock, msg, args, warns); break
        case 'setwarn': await setWarnLimit(sock, msg, args); break
        case 'mute': await muteMembers(sock, msg, args, muted, isUserAdmin); break
        case 'unmute': await unmuteMembers(sock, msg, args, muted); break
        case 'promote': await promoteMember(sock, msg, args); break
        case 'demote': await demoteMember(sock, msg, args); break
        case 'antilink': await toggleAntiLink(sock, chatId, args, settings); break
        case 'antispam': await toggleAntiSpam(sock, chatId, args, settings); break
        case 'antism': await toggleAntiStatusMention(sock, chatId, args, settings); break
        case 'welcome': await toggleWelcome(sock, chatId, args, settings); break
        case 'leave': await toggleLeave(sock, chatId, args, settings); break
        case 'setwelcome': await setWelcomeMessage(sock, chatId, args, msg, settings); break
        case 'setleave': await setLeaveMessage(sock, chatId, args, settings); break
        case 'tagall': await tagAll(sock, msg, args); break
        case 'tagadmins': await tagAdmins(sock, msg, args); break
        case 'hidetag': await hideTag(sock, msg, args); break
        case 'groupstats':
        case 'gs': await groupStats(sock, msg, settings); break
        case 'open': await openGroup(sock, chatId); break
        case 'close': await closeGroup(sock, chatId); break
        default:
            await reply(sock, chatId, '❌ Unknown command. Type .menu for help.', msg)
    }
}

// ---------- Exports ----------
module.exports = {
    handleGroupCommands,
    antiLinkHandler,
    handleAntiSpam,
    checkIfMuted,
    deleteMutedMessage,
    sendGroupMessage,
    mutedUsers,
    warnings,
    groupSettings,
    spamTimestamps,
    botWarnings,
    lastMessages,
    groupStats,
    toggleAntiStatusMention,
    tagAll
                    }
