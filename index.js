const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  isJidBroadcast,
} = require("@whiskeysockets/baileys");
const { Boom } = require("@hapi/boom");
const path = require("path");
const pino = require("pino");
const readline = require("readline");
const fs = require("fs").promises;
const chalk = require("chalk");
const QRCode = require("qrcode-terminal");
const { GenexVictim } = require("./DarkBug");

process.removeAllListeners("warning");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const logger = pino(
  {
    level: "silent",
  },
  pino.transport({
    target: "pino-pretty",
    options: {
      colorize: true,
      levelFirst: true,
      ignore: "pid,hostname",
    },
  })
);

const sessionDir = path.resolve(__dirname, "./GV_Session");

async function checkInitialSession() {
  try {
    const files = await fs.readdir(sessionDir);
    if (files.length === 1 && files.includes("creds.json")) {
      console.log(
        chalk.bold.magenta(`
       🪲 𝔇𝔞𝔯𝔨 𝔅𝔲𝔤 🪲
      
 ◇ STATUS : Invalid Credentials
 ◇ ACTION : Clearing Session Data
 ◇ TIME   : ${new Date().toLocaleTimeString()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
      );
      await fs.rm(sessionDir, { force: true, recursive: true });
      console.log(chalk.greenBright("✓ Successfully deleted the session folder"));
      return;
    }

    if (files.length === 0) {
      console.log(
        chalk.bold.cyan(`
       🪲 𝔇𝔞𝔯𝔞𝔯𝔨 𝔅𝔲𝔤 🪲
      
 ◇ STATUS : FOLDER NOT FOUND
 ◇ ACTION : CREATING NEW
 ◇ TIME   : ${new Date().toLocaleTimeString()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
      );
      return;
    }
  } catch (error) {
    if (error.code === "ENOENT") {
      console.log(
        chalk.bold.cyan(`
       🪲 𝔇𝔞𝔯𝔨 𝔅𝔲𝔤 🪲
      
 ◇ STATUS : FOLDER NOT FOUND
 ◇ ACTION : CREATING NEW
 ◇ TIME   : ${new Date().toLocaleTimeString()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
      );
      return;
    }
    throw error;
  }
}

async function connectToWhatsApp() {
  const { version, isLatest } = await fetchLatestBaileysVersion();

  const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

  const sock = makeWASocket({
    version,
    logger,
    printQRInTerminal: false,
    auth: state,
    browser: ["Ubuntu", "Chrome", "24.0.1"],
    syncFullHistory: false,
    shouldSyncHistoryMessage: () => false,
    maxRetries: 5,
    retryRequestDelayMs: 10,
    connectTimeoutMs: 60000,
    defaultQueryTimeoutMs: 0,
  });

  let promptShown = false;
  let qrAttempts = 0;
  const maxQRAttempts = 3;

  async function handleDisconnect(statusCode) {
    console.log(
      chalk.bold.cyan(`
       🪲 𝔇𝔞𝔯𝔨 𝔅𝔲𝔤 🪲
      
 ◇ STATUS : Session Error [${statusCode}]
 ◇ ACTION : Processing...
 ◇ TIME   : ${new Date().toLocaleTimeString()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
    );

    switch (statusCode) {
      case DisconnectReason.loggedOut:
      case DisconnectReason.accountDeleted:
      case DisconnectReason.forbidden:
        console.log(chalk.red("Account issue detected. Clearing session..."));
        await fs.rm(sessionDir, { force: true, recursive: true });
        process.exit(1);
        break;

      case DisconnectReason.connectionLost:
      case DisconnectReason.connectionReplaced:
      case DisconnectReason.connectionClosed:
      case DisconnectReason.restartRequired:
      case DisconnectReason.timedOut:
        console.log(chalk.yellow("Attempting to reconnect..."));
        return true;

      default:
        return true;
    }

    return false;
  }

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr, isNewLogin } = update;

    if (qr && !promptShown) {
      console.clear();
      console.log(chalk.bold.cyan("       🪲 𝔇𝔞𝔯𝔦𝔞𝔯𝔯𝔦𝔞𝔯𝔦𝔞𝔦𝔞𝔦𝔢𝔞𝔯𝔦𝔞𝔦𝔞𝔞𝔞𝔞𝔴𝔴𝔴𝔞𝔞𝔦𝔢𝔞𝔢𝔯𝔲𝔞𝔦𝔣𝔞𝔣𝔦𝔠𝔥𝔡𝔤𝔢𝔦𝔦𝔠𝔞𝔣𝔯𝔞𝔦𝔞𝔣𝔦𝔠𝔢𝔦𝔩𝔞𝔠𝔟𝔞𝔭𝔨𝔞𝔠𝔞𝔣𝔬𝔩𝔞𝔠𝔟𝔰𝔞𝔞𝔞𝔭𝔯𝔞𝔦𝔦𝔧𝔞𝔤𝔱𝔞𝔞𝔠𝔰𝔣𝔞𝔰𝔠𝔞𝔞𝔯𝔞𝔯𝔞𝔞𝔞𝔞𝔠𝔫𝔭𝔠𝔞𝔠𝔞𝔡𝔞𝔴𝔴𝔞𝔭𝔯𝔞𝔯𝔞𝔲𝔞𝔰𝔯𝔟𝔧𝔞𝔧𝔠𝔦𝔤𝔢𝔞𝔳𝔱𝔡𝔤𝔢𝔴𝔦𝔰𝔞𝔞𝔱𝔦𝔦𝔮𝔞𝔠𝔞𝔞𝔠𝔦𝔯𝔞𝔠𝔦𝔰𝔭𝔰𝔞𝔠𝔰𝔠𝔰𝔬𝔠𝔲𝔠𝔦𝔱𝔠𝔲𝔦𝔴𝔦𝔯𝔠𝔲𝔭𝔞𝔬𝔭𝔯𝔦𝔴𝔠𝔦𝔧 𝔇𝔞𝔯𝔨 𝔅𝔲𝔤 🪲\n\n 🔗 Scan QR Code Below:\n"));
      QRCode.generate(qr, { small: true });
      qrAttempts++;
    }

    if (!sock.authState.creds.registered && isNewLogin && !promptShown) {
      promptShown = true;
      console.clear();
      console.log(
        chalk.bold.green(`
       🪲 𝔇𝔞𝔯𝔨 𝔅𝔲𝔤 🪲
      
 ◇ AUTHENTICATION REQUIRED`)
      );

      rl.question(chalk.cyan(" ◇ Enter Password: "), async (inputPassword) => {
        const correctPassword = "Wealth32009";

        if (inputPassword !== correctPassword) {
          console.log(chalk.red("\n ✕ Incorrect Password!"));
          process.exit(1);
        }

        console.clear();
        console.log(
          chalk.bold.green(`
       🪲 𝔇𝔞𝔯𝔦𝔞𝔯𝔦𝔞𝔦𝔞𝔯𝔞𝔯𝔭𝔞𝔠𝔱𝔞𝔠𝔬𝔠𝔱𝔠𝔥𝔩𝔠𝔦𝔞𝔞𝔠𝔦𝔡𝔬𝔡𝔬𝔡 𝔇𝔞𝔯𝔦𝔞𝔞𝔞𝔦𝔞𝔦𝔦𝔞𝔟𝔞𝔟𝔭𝔦𝔞𝔞𝔞𝔟𝔠𝔞𝔠𝔪𝔞𝔞𝔞𝔞𝔠𝔠𝔠𝔯𝔯𝔞𝔞𝔦𝔩𝔣𝔲𝔤𝔢𝔞𝔯𝔟𝔞𝔠𝔰𝔠𝔟𝔱𝔞𝔪𝔞𝔴𝔞𝔞𝔦𝔞𝔞𝔟𝔨𝔲 𝔭𝔯𝔤𝔦𝔰𝔱𝔯𝔞𝔱𝔦𝔬𝔫🪲
      
 ◇ PHONE NUMBER REGISTRATION`)
        );

        rl.question(chalk.cyan(" ◇ Enter Phone Number: "), async (number) => {
          const phoneNumber = number.replace(/[^0-9]/g, "");

          if (phoneNumber.length < 10) {
            console.log(chalk.red("Invalid phone number format"));
            process.exit(1);
          }

          try {
            const code = await sock.requestPairingCode(phoneNumber);
            const formattedCode = code.match(/.{1,4}/g)?.join("-") || code;

            console.clear();
            console.log(
              chalk.bold.yellow(`
       🪲 𝔇𝔞𝔯𝔨 𝔅𝔲𝔤 🪲
      
 ◇ NUMBER  : ${phoneNumber}
 ◇ CODE    : ${formattedCode}
 ◇ TIME    : ${new Date().toLocaleTimeString()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━

 📱 Go to WhatsApp Settings > Linked Devices > Link a Device
 📝 Enter the code above when prompted`)
            );

            promptShown = true;
          } catch (error) {
            console.error(chalk.red("Failed to request pairing code:"), error);
            process.exit(1);
          }
        });
      });
    }

    if (connection === "close") {
      const statusCode =
        lastDisconnect?.error instanceof Boom
          ? lastDisconnect?.error?.output?.statusCode
          : 0;

      console.log(
        chalk.yellow(`[Disconnect Reason]: ${statusCode}`)
      );

      const shouldReconnect =
        statusCode !== DisconnectReason.loggedOut &&
        statusCode !== DisconnectReason.accountDeleted;

      if (shouldReconnect) {
        console.log(chalk.cyan("Attempting to reconnect..."));
        setTimeout(() => connectToWhatsApp(), 5000);
      }
    }

    if (connection === "open") {
      console.clear();
      console.log(
        chalk.bold.green(`
       🪲 𝔇𝔞𝔯𝔦𝔞𝔞𝔞𝔪𝔞𝔦𝔯𝔨𝔞𝔦𝔞𝔦𝔦𝔞𝔰𝔡𝔠𝔦𝔟𝔞𝔞𝔠𝔦𝔠𝔣𝔲𝔣𝔦𝔞𝔪𝔟𝔩𝔞𝔣𝔦𝔦𝔦𝔞𝔪𝔠𝔦𝔣𝔬𝔞𝔞𝔠𝔞𝔟𝔰𝔦𝔦𝔞𝔰𝔞𝔞𝔟𝔠𝔢𝔯𝔮𝔞𝔠𝔲𝔣𝔴𝔠𝔦𝔠𝔠𝔰𝔞𝔤𝔣𝔞𝔥𝔱𝔞𝔞𝔦𝔦𝔞𝔟𝔨𝔧𝔠𝔠𝔱𝔲𝔠𝔥𝔦𝔞𝔞𝔦𝔞𝔞𝔠𝔯𝔤𝔢𝔞𝔠𝔡𝔢𝔰𝔞𝔞𝔣𝔞𝔞𝔠𝔱𝔦𝔠𝔞𝔞𝔠𝔞𝔦𝔞𝔞𝔞𝔦𝔦𝔠𝔞𝔣𝔞𝔟𝔞𝔞 𝔇𝔞𝔯𝔦𝔞𝔫𝔞𝔡𝔯𝔦𝔞𝔞𝔞𝔦𝔦𝔦𝔞𝔠𝔦𝔞𝔲𝔠𝔦𝔦𝔞𝔠𝔢𝔨𝔞𝔡𝔠𝔦𝔰𝔠𝔯𝔞𝔟𝔯𝔱𝔠𝔦𝔭𝔯𝔬 𝔟𝔬𝔱 🪲

 ◇ STATUS : ✅ Connected Successfully
 ◇ OWNER  : @darkcodex_emp 
 ◇ TIME   : ${new Date().toLocaleTimeString()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
      );
      promptShown = false;
      qrAttempts = 0;
    }
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type === "notify" || type === "append") {
      for (const msg of messages) {
        if (!msg.key.fromMe) {
          try {
            await GenexVictim(sock, msg);
          } catch (error) {
            console.error("[Message Handler Error]:", error.message);
          }
        }
      }
    }
  });

  sock.ev.on("connection.error", (error) => {
    console.error(chalk.red("Connection Error:"), error);
  });

  sock.ev.on("error", (error) => {
    console.error(chalk.red("Socket Error:"), error);
  });

  return sock;
}

async function startWhatsApp() {
  try {
    await checkInitialSession();
    await connectToWhatsApp();
  } catch (error) {
    console.error(
      chalk.red(`
       ⚠ 𝔇𝔞𝔞𝔢𝔱𝔞𝔠𝔲𝔪𝔪𝔦𝔞𝔦𝔠𝔞𝔞𝔦𝔪𝔞𝔞𝔰𝔡𝔭𝔞𝔠𝔠𝔰𝔡𝔪𝔞𝔤𝔣𝔦𝔦𝔞𝔦𝔞𝔞𝔟𝔦𝔠𝔞𝔟𝔦𝔞𝔠𝔟𝔠𝔪𝔞𝔰𝔠𝔦𝔣𝔦𝔰𝔠𝔞𝔞𝔞𝔠𝔞𝔠𝔟𝔠𝔞𝔰𝔰 𝔇𝔞𝔦𝔢𝔯𝔞𝔯𝔦𝔞 ⚠

 ◇ STATUS : Fatal Error
 ◇ ERROR  : ${error.message}
 ◇ TIME   : ${new Date().toLocaleTimeString()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
    );
    process.exit(1);
  }
}

startWhatsApp();
