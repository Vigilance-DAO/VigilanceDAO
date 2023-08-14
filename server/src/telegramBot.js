const TelegramBot = require('node-telegram-bot-api');

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
if (!TELEGRAM_CHAT_ID) {
	console.warn("No telegram chat id found. No failure messages will be sent.");
}

// Create a bot that uses 'polling' to fetch new updates

let botInfo = null;
if (TELEGRAM_TOKEN) {
    botInfo = new TelegramBot(TELEGRAM_TOKEN, {polling: false});
} else {
    console.warn('No telegram token found. No failure messages will be sent. [Not to worry in dev]')
}

let allowedMembers = [{id: parseInt(TELEGRAM_CHAT_ID), name: 'abc'}]

export function sendMessage(message, alertType='infoAlert', options={}, members = allowedMembers, i=0) {
    return new Promise((resolve, reject)=> {
        let member = allowedMembers[i]
        console.log("Sending messaAGE TO: " + member.id)
        let bot = botInfo
        if (!bot) {
            console.log('No telegram token found')
            resolve()
            return
        }
        bot.sendMessage(member.id, message, options).then(()=> {
            console.log('sent', member.id)
            if((i+1)<allowedMembers.length)
                sendBoth(message, alertType, options, allowedMembers, i+1).then(()=> {
                    resolve()
                }).catch((err)=> {
                    reject(err)
                })
            else
                resolve()
        }).catch((err)=> {
            console.error('message sending failed', i, err);
            resolve()
        })
    })
}
