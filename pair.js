const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const path = require('path');

const AUTH_FOLDER = path.join(__dirname, 'auth_info_baileys');
const PHONE_NUMBER = '2349122876837'; // e.g. 2348012345678

async function pair() {
    const { state, saveCreds } = await useMultiFileAuthState(AUTH_FOLDER);

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        connectTimeoutMs: 120000,
        defaultQueryTimeoutMs: 120000,
        keepAliveIntervalMs: 10000,
    });

    sock.ev.on('creds.update', saveCreds);

    if (!sock.authState.creds.registered) {
        const code = await sock.requestPairingCode(PHONE_NUMBER.trim());
        console.log(`\n✅ PAIRING CODE: ${code}\n`);
        console.log('Enter this in WhatsApp → Linked Devices → Link with phone number');
    }

    sock.ev.on('connection.update', ({ connection, lastDisconnect }) => {
        if (connection === 'open') {
            console.log('\n✅ Paired successfully!');
        }
        if (connection === 'close') {
            const code = lastDisconnect?.error?.output?.statusCode;
            if (code === DisconnectReason.loggedOut) {
                console.log('Logged out.');
                process.exit(1);
            } else {
                console.log('Reconnecting in 3s...');
                setTimeout(pair, 3000);
            }
        }
    });
}

pair();
