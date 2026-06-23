const { getUser, updateUser, createUser } = require('../data/db')

async function appointCommand(sock, msg, from, args) {
  const number = args[0]?.replace(/\D/g, '')
  if (!number) return sock.sendMessage(from, { text: '❌ Provide a number. Example: .appoint 2348012345678 Elder', quoted: msg })
  const rank = args[1]
  if (!rank) return sock.sendMessage(from, { text: '❌ Provide a rank name.', quoted: msg })
  const targetId = `${number}@s.whatsapp.net`
  let user = await getUser(targetId)
  if (!user) user = await createUser(targetId, number)
  await updateUser(targetId, { rank })
  await sock.sendMessage(from, { text: `👑 ${number} has been appointed to ${rank}.`, quoted: msg })
}

async function setRankCommand(sock, msg, from, args) {
  const number = args[0]?.replace(/\D/g, '')
  if (!number) return sock.sendMessage(from, { text: '❌ Provide a number.', quoted: msg })
  const rank = args[1]
  if (!rank) return sock.sendMessage(from, { text: '❌ Provide a rank.', quoted: msg })
  const targetId = `${number}@s.whatsapp.net`
  let user = await getUser(targetId)
  if (!user) user = await createUser(targetId, number)
  await updateUser(targetId, { rank })
  await sock.sendMessage(from, { text: `⚔️ ${number}'s rank set to ${rank}.`, quoted: msg })
}

async function giveXPCommand(sock, msg, from, args) {
  const number = args[0]?.replace(/\D/g, '')
  if (!number) return sock.sendMessage(from, { text: '❌ Provide a number.', quoted: msg })
  const amount = parseInt(args[1])
  if (!amount || isNaN(amount)) return sock.sendMessage(from, { text: '❌ Provide an XP amount.', quoted: msg })
  const targetId = `${number}@s.whatsapp.net`
  let user = await getUser(targetId)
  if (!user) user = await createUser(targetId, number)
  const newXP = (user.xp || 0) + amount
  await updateUser(targetId, { xp: newXP })
  await sock.sendMessage(from, { text: `✅ Granted ${amount} XP to ${number}. Total: ${newXP}`, quoted: msg })
}

async function resetUserCommand(sock, msg, from, args) {
  const number = args[0]?.replace(/\D/g, '')
  if (!number) return sock.sendMessage(from, { text: '❌ Provide a number.', quoted: msg })
  const targetId = `${number}@s.whatsapp.net`
  await updateUser(targetId, { xp: 0, coins: 0, rank: 'Peasant', isMod: false, isBanned: false })
  await sock.sendMessage(from, { text: `🔄 ${number} has been fully reset.`, quoted: msg })
}

module.exports = { appointCommand, setRankCommand, giveXPCommand, resetUserCommand }
