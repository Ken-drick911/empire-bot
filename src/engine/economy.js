const { getUser, updateUser } = require('../data/db')

async function deposit(userId, amount) {
    const user = await getUser(userId)
    if (!user) return { success: false, reason: 'User not found.' }
    if (isNaN(amount) || amount <= 0) return { success: false, reason: 'Invalid amount.' }
    if (user.wallet < amount) return { success: false, reason: `Not enough coins in wallet. You have ${user.wallet} 🪙` }
    const spaceLeft = user.vaultCap - user.vault
    if (spaceLeft <= 0) return { success: false, reason: 'Your vault is full!' }
    const actualAmount = Math.min(amount, spaceLeft)
    await updateUser(userId, {
        wallet: user.wallet - actualAmount,
        vault: user.vault + actualAmount
    })
    return { success: true, amount: actualAmount, wallet: user.wallet - actualAmount, vault: user.vault + actualAmount }
}

async function withdraw(userId, amount) {
    const user = await getUser(userId)
    if (!user) return { success: false, reason: 'User not found.' }
    if (isNaN(amount) || amount <= 0) return { success: false, reason: 'Invalid amount.' }
    if (user.vault < amount) return { success: false, reason: `Not enough coins in vault. You have ${user.vault} 🪙` }
    await updateUser(userId, {
        wallet: user.wallet + amount,
        vault: user.vault - amount
    })
    return { success: true, amount, wallet: user.wallet + amount, vault: user.vault - amount }
}

async function give(userId, targetId, amount) {
    const user = await getUser(userId)
    const target = await getUser(targetId)
    if (!user) return { success: false, reason: 'Sender not found.' }
    if (!target) return { success: false, reason: 'Target user not found.' }
    if (isNaN(amount) || amount <= 0) return { success: false, reason: 'Invalid amount.' }
    if (user.wallet < amount) return { success: false, reason: `Not enough coins. You have ${user.wallet} 🪙` }
    await updateUser(userId, { wallet: user.wallet - amount })
    await updateUser(targetId, { wallet: target.wallet + amount })
    return { success: true, amount, senderWallet: user.wallet - amount }
}

module.exports = { deposit, withdraw, give }
