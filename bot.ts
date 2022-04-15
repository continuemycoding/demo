// BotFather /setcommands
// help - 帮助
// clear - 删除所有消息
// autodelete - 自动删除

import axios from 'axios';
const fs = require('fs');
const { Telegraf } = require('telegraf');
// const LocalSession = require('telegraf-session-local');

process.env.BOT_TOKEN = "5251357725:AAHLPvwIKGREn0kusIdnPotOSJzKdWcxAh4";

const bot = new Telegraf(process.env.BOT_TOKEN);
// bot.use((new LocalSession({ database: 'example_db.json' })).middleware())

// const GoogleSearch = require('google-search');
// let googleSearch = new GoogleSearch({
//     key: '',
//     cx: ''
// });
//https://cse.google.com/cse?cx=010712285056890214890:fkcsbt0jiu8

let autoDeleteAfterHours = {};
let messages = {};//保存所有未删除的消息id
let chats = {};//保存所有聊天id
let responses = {};//保存所有搜索结果

let dataPath = "data.json";

let developer = 2083959025;//开发人员chat_id

// bot.start((ctx) => ctx.reply('我是定时删除消息的机器人，默认1天后删除。\n拉我入群并设置我为管理员，我就能定时删除群消息。'));
// bot.help((ctx) => {
//     ctx.reply('拉我入群并设置我为管理员，我就能定时删除群消息。\n当前消息删除时间：' + (autoDeleteAfterHours[ctx.chat.id] || 24) + "小时。");
// });
bot.on('sticker', (ctx) => ctx.reply('👍'));
// bot.hears('开发者', (ctx) => ctx.reply('@game325'));

// const autoDeleteMenu = Telegraf.Extra
//     .markdown()
//     .markup((m) => m.inlineKeyboard([
//         m.callbackButton('1小时', '1hourdelete'),
//         m.callbackButton('3小时', '3hourdelete'),
//         m.callbackButton('6小时', '6hourdelete'),
//         m.callbackButton('12小时', '12hourdelete'),
//         m.callbackButton('1天', '1daydelete'),
//         m.callbackButton('3天', '3daydelete')
//     ]));

// bot.command('autodelete', (ctx) => {
//     ctx.reply('请选择消息自动删除时间', autoDeleteMenu);
// });

// bot.action('1hourdelete', (ctx) => {
//     autoDeleteAfterHours[ctx.chat.id] = 1;
//     ctx.answerCbQuery('已设置1小时后后删除！');
// });

// bot.action('3hourdelete', (ctx) => {
//     autoDeleteAfterHours[ctx.chat.id] = 3;
//     ctx.answerCbQuery('已设置3小时后后删除！');
// });

// bot.action('6hourdelete', (ctx) => {
//     autoDeleteAfterHours[ctx.chat.id] = 6;
//     ctx.answerCbQuery('已设置6小时后后删除！');
// });

// bot.action('12hourdelete', (ctx) => {
//     autoDeleteAfterHours[ctx.chat.id] = 12;
//     ctx.answerCbQuery('已设置12小时后后删除！');
// });

// bot.action('1daydelete', (ctx) => {
//     autoDeleteAfterHours[ctx.chat.id] = 24;
//     ctx.answerCbQuery('已设置1天后后删除！');
// });

// bot.action('3daydelete', (ctx) => {
//     autoDeleteAfterHours[ctx.chat.id] = 24 * 3;
//     ctx.answerCbQuery('已设置3天后后删除！');
// });

bot.command('/clear', (ctx) => {

    let chat_id = ctx.chat.id;

    if (messages[chat_id] == null) {
        ctx.reply('没有可清理的消息。');
        return;
    }

    for (let message_id in messages[chat_id]) {
        ctx.tg.deleteMessage(chat_id, message_id);
    }

    ctx.reply('已清理' + Object.keys(messages[chat_id]).length + '条消息。');

    messages[chat_id] = {};
});

bot.command('/save', (ctx) => {
    if (ctx.message.from.id != developer) {
        ctx.reply("您的权限不够！");
        return;
    }

    let data = { autoDeleteAfterHours: autoDeleteAfterHours, messages: messages, chats: chats };

    fs.writeFileSync(dataPath, JSON.stringify(data, null, 4));

    ctx.reply("保存成功");
});

bot.command("/stop", (ctx) => {
    if (ctx.message.from.id != developer) {
        ctx.reply(`您的权限不够！${ctx.message.from.id}`);
        return;
    }

    //不能马上停止，否则启动时会再次接收到此命令
    setTimeout(() => {
        bot.stop();
        ctx.reply("服务已停止。");

        let data = { autoDeleteAfterHours: autoDeleteAfterHours, messages: messages, chats: chats };

        fs.writeFileSync(dataPath, JSON.stringify(data, null, 4));

        process.exit(0);
    }, 0);
});

bot.use((ctx, next) => {

    const start = Date.now();

    return next(ctx).then(() => {
        const ms = Date.now() - start;
        console.log('响应时间：' + ms + "ms");
    })
});

// const pageMenu = bot.Extra
//     .markdown()
//     .markup((m) => m.inlineKeyboard([
//         m.callbackButton('上一页', 'previousPage'),
//         m.callbackButton('下一页', 'nextPage')
//     ]));

// delete pageMenu.parse_mode;

// bot.action('previousPage', (ctx) => {
//     let chat_id = ctx.update.callback_query.message.chat.id;
//     let message_id = ctx.update.callback_query.message.message_id;

//     let response = responses[chat_id][message_id];
//     let previousPage = response.queries.previousPage;

//     if(!previousPage)
//     {
//         ctx.answerCbQuery('没有上一页了！');
//         return;
//     }

//     previousPage = previousPage[0];

//     doSearch(previousPage.searchTerms, previousPage.startIndex, ctx);
// });

// bot.action('nextPage', (ctx) => {
//     let chat_id = ctx.update.callback_query.message.chat.id;
//     let message_id = ctx.update.callback_query.message.message_id;

//     let response = responses[chat_id][message_id];
//     let nextPage = response.queries.nextPage;

//     if(!nextPage)
//     {
//         ctx.answerCbQuery('没有上一页了！');
//         return;
//     }

//     nextPage = nextPage[0];

//     doSearch(nextPage.searchTerms, nextPage.startIndex, ctx);
// });

bot.on('message', async (ctx) => {

    console.log(ctx.updateType);

    const text = ctx.message.text;

    if (text) {
        if (text.includes("美女")) {

            const match = /美女 (\d+),\s?(\d+)/gm.exec(text);

            if (!match)
                return;

            const vertical = (await axios.get(`https://service.picasso.adesk.com/v1/vertical/category/4e4d610cdf714d2966000000/vertical?skip=${match[1]}&limit=${match[2]}`)).data.res.vertical;

            for (let i = 0; i < vertical.length; i++) {
                await ctx.replyWithPhoto({ url: vertical[i].img }, { caption: `${i + 1}/${match[1] + i + 1}` });
            }
            return;
        }

        console.log(text, new Date(ctx.message.date * 1000).toLocaleString());

        return;
    }

    // console.log(ctx.message);

    // let chat_id = ctx.chat.id;
    // let message_id = ctx.message.message_id;

    // bot.last_chat_id = chat_id;

    // autoDeleteAfterHours[chat_id] = autoDeleteAfterHours[chat_id] || 24;

    // let timeout = autoDeleteAfterHours[chat_id] * 60 * 60;

    // messages[chat_id] = messages[chat_id] || {};
    // messages[chat_id][message_id] = { date: ctx.message.date, expires: ctx.message.date + timeout };

    // chats[chat_id] = chats[chat_id] || {};
    // chats[chat_id] = ctx.chat.type == "supergroup" ? ctx.chat.title : ctx.from.username;

    // console.log(chat_id, "总共收到" + Object.keys(messages[chat_id]).length + "条消息");

    // setTimeout(() => {
    //     if (messages[chat_id][message_id]) {
    //         ctx.tg.deleteMessage(chat_id, message_id);
    //         delete messages[chat_id][message_id];
    //     }
    // }, timeout * 1000);

    // if (ctx.message.chat.type != 'group')
    //     return;

    // let forwardChatId = ctx.message.from.id == developer ? chat_id : developer;

    // let callback = (data) => {
    //     autoDeleteAfterHours[forwardChatId] = autoDeleteAfterHours[forwardChatId] || 24;

    //     let timeout = autoDeleteAfterHours[forwardChatId] * 60 * 60;

    //     messages[forwardChatId] = messages[forwardChatId] || {};
    //     messages[forwardChatId][data.message_id] = { date: data.date, expires: data.date + timeout, forward: true };

    //     setTimeout(() => {
    //         ctx.tg.deleteMessage(forwardChatId, data.message_id);
    //         delete messages[forwardChatId][data.message_id];
    //     }, timeout * 1000);
    // };

    // // bot.telegram.forwardMessage(forwardChatId, chat_id, message_id).then(callback);

    // if (ctx.message.text && forwardChatId != developer)
    //     bot.telegram.sendMessage(forwardChatId, ctx.message.text).then(callback);

    // if (ctx.message.photo && forwardChatId != developer) {
    //     //ctx.message.media_group_id

    //     bot.telegram.sendPhoto(forwardChatId, ctx.message.photo[ctx.message.photo.length - 1].file_id).then(callback);
    // }

    // // if(ctx.message.audio)
    // //     bot.telegram.sendAudio(forwardChatId, ctx.message.audio.file_id).then(callback);

    // if (ctx.message.video)
    //     bot.telegram.sendVideo(forwardChatId, ctx.message.video.file_id).then(callback);

    // if (ctx.message.animation)
    //     bot.telegram.sendAnimation(forwardChatId, ctx.message.animation.file_id).then(callback);

    // if (ctx.message.document && !ctx.message.animation)
    //     bot.telegram.sendDocument(forwardChatId, ctx.message.document.file_id).then(callback);

    // if (forwardChatId != developer) {
    //     ctx.tg.deleteMessage(chat_id, message_id);
    //     delete messages[chat_id][message_id];
    // }
});

bot.catch((err) => {
    console.error(err);

    bot.last_chat_id && bot.telegram.sendMessage(bot.last_chat_id, err.stack);
});

bot.launch().then(() => {
    console.log("启动成功");
    //bot.telegram.sendMessage(developer, "服务已重启");
});

if (fs.existsSync(dataPath)) {
    let data = fs.readFileSync(dataPath);

    data = JSON.parse(data.toString());

    autoDeleteAfterHours = data.autoDeleteAfterHours || {};
    messages = data.messages || {};
    chats = data.chats || {};

    for (let chat_id in messages) {
        for (let message_id in messages[chat_id]) {
            let message = messages[chat_id][message_id];

            setTimeout(() => {
                bot.telegram.deleteMessage(chat_id, message_id);
                delete messages[chat_id][message_id];
            }, message.expires * 1000 - Date.now());
        }
    }
}

process.on("uncaughtException", function (e) {
    console.error("error uncaughtException\t", e.stack);
});
