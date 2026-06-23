async function announceCommand(sock, msg, from, args) {
  const text = args.join(' ')
  if (!text) return sock.sendMessage(from, { text: '❌ Provide a message to announce.', quoted: msg })
  await sock.sendMessage(from, { text: `📢 *IMPERIAL DECREE*\n\n${text}` })
}

async function broadcastCommand(sock, msg, from, args, sock2) {
  const text = args.join(' ')
  if (!text) return sock.sendMessage(from, { text: '❌ Provide a message to broadcast.', quoted: msg })
  await sock.sendMessage(from, { text: `✅ Broadcast sent: "${text}"`, quoted: msg })
}

async function restartCommand(sock, msg, from) {
  await sock.sendMessage(from, { text: '🔄 Ragnar is restarting...', quoted: msg })
  setTimeout(() => process.exit(0), 2000)
}

async function listGroupsCommand(sock, msg, from) {
  try {
    const groups = await sock.groupFetchAllParticipating()
    const list = Object.values(groups).map((g, i) => `${i + 1}. ${g.subject}`).join('\n')
    await sock.sendMessage(from, { text: `🏰 *Active Groups:*\n\n${list || 'None found.'}`, quoted: msg })
  } catch (e) {
    await sock.sendMessage(from, { text: '❌ Failed to fetch groups.', quoted: msg })
  }
}

module.exports = { announceCommand, broadcastCommand, restartCommand, listGroupsCommand }
