// groupManagement.js - Complete Group Management System

const mutedUsers = new Map()
const warnings = new Map()
const groupSettings = new Map()

// Anti-spam storage
const spamTimestamps = new Map()
const botWarnings = new Map()
const lastMessages = new Map()

const SPAM_WINDOW = 5000
const SPAM_LIMIT = 5
const SPAM_WARN_LIMIT = 3
const BOT_WARN_LIMIT = 2

// ---------- Helpers ----------
function parseDuration(str) {
    if (!str) return null
    const match = str.match(/^(\d+)([mhd])$/i)
    if (!match) return null
    const val = parseInt(match[1])
    const unit = match[2].toLowerCase()
    switch(unit) {
        case 'm': return val * 60 * 1000
        case 'h': return val * 60 * 60 * 1000
        case 'd': return val * 24 * 60 * 60 * 1000
        default: return null
    }
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
    let results = [], kicked = []
    for (const t of targets) {
        const key = `${chatId}_${t}`
        const count = (warnings.get(key) || 0) + 1
        warnings.set(key, count)
        if (count >= 3) {
            try {
                await sock.groupParticipantsUpdate(chatId, [t], 'remove')
                kicked.push(`@${t.split('@')[0]}`)
                warnings.delete(key)
            } catch { results.push(`@${t.split('@')[0]} (warn ${count}/3 - kick failed)`) }
        } else {
            results.push(`@${t.split('@')[0]} (warn ${count}/3)`)
        }
    }
    let text = `⚠️ Warnings issued:\n${results.join('\n')}`
    if (kicked.length) text += `\n\n❗ Kicked for 3 warnings: ${kicked.join(', ')}`
    await sock.sendMessage(chatId, { text, mentions: targets, quoted: msg })
}

// ---------- Mute ----------
async function muteMembers(sock, msg, args, mutedUsers, isUserAdmin) {
    const chatId = msg.key.remoteJid
    const targets = getTargetUsers(msg, args)
    if (!targets.length) return reply(sock, chatId, '❌ Tag or reply to the member(s) to mute.\nExample: .mute @user1 @user2 30m', msg)
    if (targets.length > 10) return reply(sock, chatId, '❌ Max 10 members at once.', msg)
    let durationStr = args.find(a => /^\d+[mhd]$/i.test(a)) || '1h'
    const durationMs = parseDuration(durationStr)
    if (!durationMs) return reply(sock, chatId, '❌ Invalid duration. Use like: 30m, 2h, 1d', msg)
    if (!mutedUsers.has(chatId)) mutedUsers.set(chatId, new Map())
    const chatMutes = mutedUsers.get(chatId)
    const until = Date.now() + durationMs
    const timeStr = formatTime(durationMs)
    let muted = [], failed = []
    for (const t of targets) {
        if (await isUserAdmin(chatId, t)) {
            failed.push(`@${t.split('@')[0]} (admin)`)
            continue
        }
        if (chatMutes.has(t)) {
            failed.push(`@${t.split('@')[0]} (already muted)`)
            continue
        }
        chatMutes.set(t, { until, reason: '' })
        muted.push(`@${t.split('@')[0]}`)
        setTimeout(() => autoUnmuteMember(sock, chatId, t, mutedUsers), durationMs)
    }
    if (!muted.length && !failed.length) {
        mutedUsers.delete(chatId)
        return reply(sock, chatId, '❌ No members were muted.', msg)
    }
    let text = `🔇 Muted ${muted.length} member(s) for ${timeStr}.\n`
    if (muted.length) text += `✅ ${muted.join(', ')}\n`
    if (failed.length) text += `❌ ${failed.join(', ')}`
    if (muted.length) text += `\n⏰ Auto-unmute at ${new Date(until).toLocaleTimeString()}`
    const allMentions = [...muted, ...failed].map(m => m.replace('@', '') + '@s.whatsapp.net').filter(id => id.includes('@'))
    await sock.sendMessage(chatId, { text, mentions: allMentions.length ? allMentions : undefined, quoted: msg })
}

async function unmuteMembers(sock, msg, args, mutedUsers) {
    const chatId = msg.key.remoteJid
    const targets = getTargetUsers(msg, args)
    if (!targets.length) return reply(sock, chatId, '❌ Tag or reply to the member(s) to unmute.', msg)
    if (targets.length > 10) return reply(sock, chatId, '❌ Max 10 members at once.', msg)
    if (!mutedUsers.has(chatId)) return reply(sock, chatId, 'ℹ️ No one is muted.', msg)
    const chatMutes = mutedUsers.get(chatId)
    let unmuted = [], notMuted = []
    for (const t of targets) {
        if (chatMutes.has(t)) {
            chatMutes.delete(t)
            unmuted.push(`@${t.split('@')[0]}`)
        } else {
            notMuted.push(`@${t.split('@')[0]}`)
        }
    }
    if (chatMutes.size === 0) mutedUsers.delete(chatId)
    let text = ''
    if (unmuted.length) text += `🔊 Unmuted ${unmuted.length} member(s): ${unmuted.join(', ')}`
    if (notMuted.length) text += `\nℹ️ Not muted: ${notMuted.join(', ')}`
    if (!text) text = '❌ No changes.'
    const allMentions = [...unmuted, ...notMuted].map(m => m.replace('@', '') + '@s.whatsapp.net').filter(id => id.includes('@'))
    await sock.sendMessage(chatId, { text, mentions: allMentions.length ? allMentions : undefined, quoted: msg })
}

async function autoUnmuteMember(sock, chatId, target, mutedUsers) {
    if (!mutedUsers.has(chatId)) return
    const chatMutes = mutedUsers.get(chatId)
    if (!chatMutes.has(target)) return
    const info = chatMutes.get(target)
    if (info.until > Date.now()) return
    chatMutes.delete(target)
    if (chatMutes.size === 0) mutedUsers.delete(chatId)
    await sock.sendMessage(chatId, {
        text: `🔊 @${target.split('@')[0]} auto-unmuted (time expired).`,
        mentions: [target]
    })
}

// ---------- Promote & Demote ----------
async function promoteMember(sock, msg, args) {
    const chatId = msg.key.remoteJid
    const targets = getTargetUsers(msg, args)
    if (!targets.length) return reply(sock, chatId, '❌ Tag or reply to the member(s) to promote.', msg)
    if (targets.length > 10) return reply(sock, chatId, '❌ Max 10 members at once.', msg)
    let done = [], fail = []
    for (const t of targets) {
        try { await sock.groupParticipantsUpdate(chatId, [t], 'promote'); done.push(`@${t.split('@')[0]}`) } 
        catch { fail.push(`@${t.split('@')[0]}`) }
    }
    const mentions = [...done, ...fail].map(m => m.replace('@', '') + '@s.whatsapp.net').filter(id => id.includes('@'))
    await sock.sendMessage(chatId, {
        text: `⬆️ Promoted ${done.length}: ${done.join(', ')}` + (fail.length ? `\n❌ Failed: ${fail.join(', ')}` : ''),
        mentions: mentions.length ? mentions : undefined,
        quoted: msg
    })
}

async function demoteMember(sock, msg, args) {
    const chatId = msg.key.remoteJid
    const targets = getTargetUsers(msg, args)
    if (!targets.length) return reply(sock, chatId, '❌ Tag or reply to the member(s) to demote.', msg)
    if (targets.length > 10) return reply(sock, chatId, '❌ Max 10 members at once.', msg)
    let done = [], fail = []
    for (const t of targets) {
        try { await sock.groupParticipantsUpdate(chatId, [t], 'demote'); done.push(`@${t.split('@')[0]}`) } 
        catch { fail.push(`@${t.split('@')[0]}`) }
    }
    const mentions = [...done, ...fail].map(m => m.replace('@', '') + '@s.whatsapp.net').filter(id => id.includes('@'))
    await sock.sendMessage(chatId, {
        text: `⬇️ Demoted ${done.length}: ${done.join(', ')}` + (fail.length ? `\n❌ Failed: ${fail.join(', ')}` : ''),
        mentions: mentions.length ? mentions : undefined,
        quoted: msg
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
    await sock.sendMessage(chatId, { text: `🔗 Anti‑link set to: ${mode.toUpperCase()}` })
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
        return lower.includes('wa.me') ||
               lower.includes('whatsapp.com') ||
               lower.includes('chat.whatsapp.com') ||
               lower.includes('api.whatsapp.com')
    }
    let shouldBlock = false
    if (mode === 'all') shouldBlock = true
    else if (mode === 'whatsapp') shouldBlock = matches.some(isWhatsAppLink)
    if (!shouldBlock) return
    const sender = msg.key.participant || msg.key.remoteJid
    if (await isUserAdmin(chatId, sender)) return
    if (mutedUsers.has(chatId) && mutedUsers.get(chatId).has(sender)) {
        await deleteMutedMessage(sock, msg)
        return
    }
    await warnMember(sock, msg, [sender], warnings)
    await sock.sendMessage(chatId, {
        text: `🚫 Links not allowed! @${sender.split('@')[0]} warned.`,
        mentions: [sender]
    })
}

// ---------- Anti-spam ----------
async function toggleAntiSpam(sock, chatId, args, groupSettings) {
    const setting = args[0]?.toLowerCase()
    if (!['on', 'off'].includes(setting)) {
        return reply(sock, chatId, '❌ Usage: .antispam on/off')
    }
    groupSettings.set(`antispam_${chatId}`, setting === 'on')
    await sock.sendMessage(chatId, { text: `🛡️ Anti‑spam ${setting === 'on' ? 'ON' : 'OFF'}` })
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
    // Spam detection
    if (!spamTimestamps.has(chatId)) spamTimestamps.set(chatId, new Map())
    const userTimestamps = spamTimestamps.get(chatId)
    if (!userTimestamps.has(sender)) userTimestamps.set(sender, [])
    const timestamps = userTimestamps.get(sender)
    const recent = timestamps.filter(t => now - t < SPAM_WINDOW)
    recent.push(now)
    userTimestamps.set(sender, recent)
    if (recent.length > SPAM_LIMIT) {
        await deleteMutedMessage(sock, msg)
        const warnKey = `${chatId}_${sender}`
        const warnCount = (warnings.get(warnKey) || 0) + 1
        warnings.set(warnKey, warnCount)
        if (warnCount >= SPAM_WARN_LIMIT) {
            try {
                await sock.groupParticipantsUpdate(chatId, [sender], 'remove')
                await sock.sendMessage(chatId, {
                    text: `🚫 @${sender.split('@')[0]} kicked for spam (3 warnings).`,
                    mentions: [sender]
                })
                warnings.delete(warnKey)
            } catch {
                await sock.sendMessage(chatId, {
                    text: `⚠️ @${sender.split('@')[0]} reached 3 spam warnings but I couldn't kick.`,
                    mentions: [sender]
                })
            }
        } else {
            await sock.sendMessage(chatId, {
                text: `⚠️ @${sender.split('@')[0]} spam warning ${warnCount}/${SPAM_WARN_LIMIT}. Slow down!`,
                mentions: [sender]
            })
        }
        return
    }
    // Anti-bot (duplicate consecutive messages)
    if (text && !isSticker) {
        if (!lastMessages.has(chatId)) lastMessages.set(chatId, new Map())
        const userLast = lastMessages.get(chatId)
        const prev = userLast.get(sender)
        if (prev && prev.text === text && (now - prev.timestamp) < 10000) {
            await deleteMutedMessage(sock, msg)
            if (!botWarnings.has(chatId)) botWarnings.set(chatId, new Map())
            const userBotWarns = botWarnings.get(chatId)
            const botCount = (userBotWarns.get(sender) || 0) + 1
            userBotWarns.set(sender, botCount)
            if (botCount >= BOT_WARN_LIMIT) {
                try {
                    await sock.groupParticipantsUpdate(chatId, [sender], 'remove')
                    await sock.sendMessage(chatId, {
                        text: `🤖 @${sender.split('@')[0]} kicked for bot-like behaviour (${botCount} warnings).`,
                        mentions: [sender]
                    })
                    userBotWarns.delete(sender)
                    if (userBotWarns.size === 0) botWarnings.delete(chatId)
                } catch {
                    await sock.sendMessage(chatId, {
                        text: `⚠️ @${sender.split('@')[0]} reached bot warning limit but I couldn't kick.`,
                        mentions: [sender]
                    })
                }
            } else {
                await sock.sendMessage(chatId, {
                    text: `🤖 @${sender.split('@')[0]} bot warning ${botCount}/${BOT_WARN_LIMIT}. Stop repeating messages!`,
                    mentions: [sender]
                })
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
        await sock.sendMessage(chatId, {
            text: `🔊 @${sender.split('@')[0]} auto-unmuted (time expired).`,
            mentions: [sender]
        })
        return false
    }
    return true
}

async function deleteMutedMessage(sock, msg) {
    try {
        await sock.sendMessage(msg.key.remoteJid, { delete: msg.key })
    } catch {}
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

async function setWelcomeMessage(sock, chatId, args, msg) {
    const text = args.join(' ')
    if (!text) return reply(sock, chatId, '❌ Please provide a message.\nExample: .setwelcome "Welcome @ to the group!"', msg)
    groupSettings.set(`welcome_msg_${chatId}`, text)
    await sock.sendMessage(chatId, { text: `✅ Welcome message set:\n${text}` })
}

async function setLeaveMessage(sock, chatId, args) {
    const text = args.join(' ')
    if (!text) return reply(sock, chatId, '❌ Please provide a message.\nExample: .setleave "Goodbye @, see you later!"')
    groupSettings.set(`leave_msg_${chatId}`, text)
    await sock.sendMessage(chatId, { text: `✅ Leave message set:\n${text}` })
}

async function sendGroupMessage(sock, chatId, participants, action) {
    const key = action === 'add' ? `welcome_${chatId}` : `leave_${chatId}`
    if (!groupSettings.get(key)) return
    const msgKey = action === 'add' ? `welcome_msg_${chatId}` : `leave_msg_${chatId}`
    let template = groupSettings.get(msgKey)
    if (!template) {
        template = action === 'add' ? '👋 Welcome @!' : '👋 Goodbye @!'
    }
    for (const p of participants) {
        const mention = `@${p.split('@')[0]}`
        const finalMsg = template.replace(/@/g, mention)
        await sock.sendMessage(chatId, { text: finalMsg, mentions: [p] })
    }
}

// ---------- Tag commands ----------
async function tagAll(sock, msg, args) {
    const chatId = msg.key.remoteJid
    const text = args.join(' ') || '📢 Attention everyone!'
    try {
        const meta = await sock.groupMetadata(chatId)
        const participants = meta.participants.map(p => p.id)
        await sock.sendMessage(chatId, {
            text: `📣 ${text}\n\n` + participants.map(p => `@${p.split('@')[0]}`).join(' '),
            mentions: participants,
            quoted: msg
        })
        await deleteCommandMessage(sock, msg)
    } catch {
        reply(sock, chatId, '❌ Failed to tag all.', msg)
    }
}

async function tagAdmins(sock, msg, args) {
    const chatId = msg.key.remoteJid
    const text = args.join(' ') || '📢 Admins:'
    try {
        const meta = await sock.groupMetadata(chatId)
        const admins = meta.participants.filter(p => p.admin === 'admin' || p.admin === 'superadmin').map(p => p.id)
        if (!admins.length) return reply(sock, chatId, 'ℹ️ No admins found.', msg)
        const mentionText = admins.map(p => `@${p.split('@')[0]}`).join(' ')
        await sock.sendMessage(chatId, {
            text: `📣 ${text}\n\n${mentionText}`,
            mentions: admins,
            quoted: msg
        })
        await deleteCommandMessage(sock, msg)
    } catch {
        reply(sock, chatId, '❌ Failed to tag admins.', msg)
    }
}

async function hideTag(sock, msg, args) {
    const chatId = msg.key.remoteJid
    const text = args.join(' ') || '📢 Message from admin'
    try {
        const meta = await sock.groupMetadata(chatId)
        const participants = meta.participants.map(p => p.id)
        await sock.sendMessage(chatId, {
            text: `📣 ${text}`,
            mentions: participants,
            quoted: msg
        })
        await deleteCommandMessage(sock, msg)
    } catch {
        reply(sock, chatId, '❌ Failed to send hidetag.', msg)
    }
}

async function deleteCommandMessage(sock, msg) {
    try {
        await sock.sendMessage(msg.key.remoteJid, { delete: msg.key })
    } catch {}
}

// ---------- Menu ----------
async function showMenu(sock, chatId, msg) {
    // Get the sender's name
    const sender = msg.key.participant || msg.key.remoteJid
    let senderName = msg.pushName || sender.split('@')[0]
    
    const menuText = `
⚜️ 𝐄𝐌𝐏𝐈𝐑𝐄 ⚜️
│⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘│

👑 𝗣𝗥𝗘𝗙𝗜𝗫: .
⚔️ 𝗡𝗔𝗠𝗘: ${senderName}
🏛️ 𝗘𝗠𝗣𝗘𝗥𝗢𝗥: 𝙺𝙴𝙽♠️

│⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘│

🛠️ 𝗜𝗠𝗣𝗘𝗥𝗜𝗔𝗟 𝗚𝗨𝗔𝗥𝗗𝗦 🛠️
│⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘│
├─ ♤ .kick
├─ ♤ .warn
├─ ♤ .mute
├─ ♤ .unmute
├─ ♤ .promote
├─ ♤ .demote
├─ ♤ .antilink
├─ ♤ .antispam
├─ ♤ .welcome
├─ ♤ .leave
├─ ♤ .setwelcome
├─ ♤ .setleave
├─ ♤ .tagall
├─ ♤ .tagadmins
├─ ♤ .hidetag
├─ ♤ .open
├─ ♤ .close
├─ ♤ .menu
│⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘⫘│

📜 Type .menu for this guide
    `
    await sock.sendMessage(chatId, { text: menuText, quoted: msg })
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

// ---------- Command Dispatcher ----------
async function handleGroupCommands(sock, msg, command, args, deps) {
    const { groupSettings: settings, warnings: warns, isUserAdmin, mutedUsers: muted } = deps
    const chatId = msg.key.remoteJid

    switch(command) {
        case 'kick': await kickMember(sock, msg, args); break
        case 'warn': await warnMember(sock, msg, args, warns); break
        case 'mute': await muteMembers(sock, msg, args, muted, isUserAdmin); break
        case 'unmute': await unmuteMembers(sock, msg, args, muted); break
        case 'promote': await promoteMember(sock, msg, args); break
        case 'demote': await demoteMember(sock, msg, args); break
        case 'antilink': await toggleAntiLink(sock, chatId, args, settings); break
        case 'antispam': await toggleAntiSpam(sock, chatId, args, settings); break
        case 'welcome': await toggleWelcome(sock, chatId, args, settings); break
        case 'leave': await toggleLeave(sock, chatId, args, settings); break
        case 'setwelcome': await setWelcomeMessage(sock, chatId, args, msg); break
        case 'setleave': await setLeaveMessage(sock, chatId, args); break
        case 'tagall': await tagAll(sock, msg, args); break
        case 'tagadmins': await tagAdmins(sock, msg, args); break
        case 'hidetag': await hideTag(sock, msg, args); break
        case 'menu': await showMenu(sock, chatId, msg); break
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
    lastMessages
              }
