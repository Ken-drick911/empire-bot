const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const readline = require('readline');
const path = require('path');

const AUTH_FOLDER = path.join(__dirname, 'auth_info_baileys');

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
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question('Enter your WhatsApp number (e.g. 27831234567): ', async (number) => {
      rl.close();
      const code = await sock.requestPairingCode(number.trim());
      console.log(`\n✅ Your pairing code: ${code}\n`);
      console.log('Enter this code in WhatsApp → Linked Devices → Link a Device → Link with phone number');
      console.log('\nWaiting for pairing to complete...');
    });
  }

  sock.ev.on('connection.update', ({ connection, lastDisconnect }) => {
  if (connection === 'open') {
    console.log('\n✅ Paired successfully! Auth session saved to auth_info_baileys/');
    console.log('You can now stop this script and deploy normally.');
    process.exit(0);
  }
  if (connection === 'close') {
    const code = lastDisconnect?.error?.output?.statusCode;
    if (code === DisconnectReason.loggedOut) {
      console.log('Logged out.');
      process.exit(1);
    } else {
      console.log('Connection closed, reconnecting in 3s...');
      setTimeout(pair, 3000);
    }
  }
});
}

pair();
