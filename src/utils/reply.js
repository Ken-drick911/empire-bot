// Sends a message as a quoted reply to the original message
async function reply(sock, from, msg, content) {
    // content can be a string or an object like { text: '...' } / { image: ... }
    const payload = typeof content === 'string' ? { text: content } : content
    return sock.sendMessage(from, payload, { quoted: msg })
}

module.exports = { reply }
