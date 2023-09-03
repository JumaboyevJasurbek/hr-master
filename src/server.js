import TelegramBot from "node-telegram-bot-api";
import { admin, adminText, icon, savollar } from "./context/var.js";
import { a } from "./utils/pg.js";
import { age, allFillial, create, createFillial, createVakansiya, deleteFillial, deleteVakansiya, fillial, findClient, findFillial, findFillialID, findIdVakansiya, findVakansiyaID, ismi, nomer, qayer, talaba, vakansiya, vaqt } from "./sql/index.js";
import { fKeyboard, findVakansiyaFn, ifFillial, vKeyboard, vakansiyaRender } from "./func/index.js";

const token = '6463241240:AAG8WsVRzR25JmB9UVdpKXx1vuz4NLZwHrc'

const bot = new TelegramBot(token, { polling: true });
let fillialVariable = ''

bot.onText(/\/start/, msg => {
    const chatId = msg.chat.id

    if (chatId == admin) {
        bot.sendMessage(chatId, adminText.hello, {
            reply_markup: {
                keyboard: [
                    [adminText.keyboard1, adminText.keyboard2],
                    [adminText.keyboard3, adminText.keyboard4]
                ],
                resize_keyboard: true
            }
        });
    } else {
        bot.sendMessage(chatId, savollar.s0, {
            reply_markup: {
                force_reply: true,
                selective: true
            }
        });
    }
});

bot.on('message', async (msg) => {
    const { chat: { id: chatId }, text, reply_to_message } = msg
    try {
        if (chatId != admin) {
            if (!msg?.document) {
                if (text !== '/start' && reply_to_message?.text) {
                    const reply = reply_to_message.text
                    const allUser = await a(findClient, chatId)
                    const findUser = allUser[0]
                    if (!findUser) {
                        await a(create, chatId)
                    }
                    if (reply == savollar.s0) {
                        await a(ismi, text, chatId)
                        bot.sendMessage(chatId, savollar.s1, {
                            reply_markup: {
                                force_reply: true,
                                selective: true
                            }
                        });
                    } else if (reply == savollar.s1) {
                        if (Number(text)) {
                            await a(age, Number(text), chatId)
                            bot.sendMessage(chatId, savollar.s2, {
                                reply_markup: {
                                    force_reply: true,
                                    selective: true
                                }
                            });
                        } else {
                            bot.sendMessage(chatId, 'Yoshingizni tolliq kiriting! Masalan: 18');
                            bot.sendMessage(chatId, savollar.s1, {
                                reply_markup: {
                                    force_reply: true,
                                    selective: true
                                }
                            }); 
                        }
                    } else if (reply == savollar.s3) {
                        if (Number(text.split('+')[1])) {
                            await a(nomer, Number(text.split('+')[1]), chatId)
                            bot.sendMessage(chatId, savollar.s4, {
                                reply_markup: {
                                    keyboard: [
                                        [savollar.ha, savollar.yoq]
                                    ],
                                    resize_keyboard: true
                                }
                            });
                        } else {
                            bot.sendMessage(chatId, 'Nomer Tolliq kiriting! Masalan: +998901234567');
                            bot.sendMessage(chatId, savollar.s3, {
                                reply_markup: {
                                    force_reply: true,
                                    selective: true
                                }
                            });
                        }
                    } else if (reply == savollar.s2) {
                        await a(qayer, text, chatId)
                        bot.sendMessage(chatId, savollar.s3, {
                            reply_markup: {
                                force_reply: true,
                                selective: true
                            }
                        });
                    }
               }
               // ismdan qayerdaligigacha
        
               if (text == savollar.ha || text == savollar.yoq) {
                    await a(talaba, text == savollar.ha ? 'Ha' : 'Yoq', chatId)
        
                    bot.sendMessage(chatId, savollar.s5, {
                        reply_markup: {
                            keyboard: [
                                [savollar.full, savollar.part]
                            ],
                            resize_keyboard: true
                        }
                    });
               }
               // Talaba save vaqt create
        
               if (text == savollar.full || text == savollar.part) {
                    await a(vaqt, text == savollar.full ? savollar.full.split(' ')[0] : savollar.part.split(' ')[0], chatId)
                    const fillials = await a(allFillial)
                    bot.sendMessage(chatId, savollar.fil, {
                        reply_markup: {
                            keyboard: fKeyboard(fillials),
                            resize_keyboard: true
                        }
                    });
               }
                // Vaqt save fillial create
        
                if (await ifFillial(text)) {
                    const fillialFind = await a(findFillial, text)
                    await a(fillial, fillialFind[0]?.id, chatId)
                    const render = await vakansiyaRender(text)
                    if (render?.length) {
                        bot.sendMessage(chatId, savollar.yonalish, {
                            reply_markup: {
                                keyboard: render,
                                resize_keyboard: true
                            }
                        });
                    } else {
                        bot.sendMessage(chatId, savollar.yoqVakansiya);
                    }
                }
                // Fillial save Vakansiya create
        
                if (await findVakansiyaFn(chatId, text)) {
                    await a(vakansiya, await findVakansiyaFn(chatId, text), chatId)
                    bot.sendMessage(chatId, savollar.CV, {
                        reply_markup: {
                            remove_keyboard: true
                        }
                    });
                }
                // Vakansiya save PDF create    
            } else {
                const client = await a(findClient, chatId)
                const find = client[0]
                const fillial = await a(findFillialID, find.fillial)
                const vakansiya = await a(findVakansiyaID, find.vakansiya)
                const malumot = `
                    Telegram id: ${find.id},\nIsmi: ${find.ism},\nYoshi: ${find.age},\nNomeri: ${find.number},\nQayerda Yashashi: ${find.qayer},\nTalabami: ${find.talaba},\nIshlash Vaqti: ${find.vaqt},\nQayerda Ishlamoqchi: ${fillial[0]?.shahar},\nQaysi Yonalish: ${vakansiya[0]?.vakansiya}
                `
    
                bot.sendMessage('6538161335', malumot)
                bot.sendDocument('6538161335', msg.document?.file_id)
                bot.sendMessage(chatId, savollar.finish)
            }
    
        } else {
            const reply = reply_to_message?.text

            if (text == adminText.keyboard1) {
                bot.sendMessage(chatId, adminText.fillialAdd, {
                    reply_markup: {
                        force_reply: true,
                        selective: true,
                    }
                });
            } else if (text == adminText.keyboard2) {
                const fillial = await a(allFillial)
                bot.sendMessage(chatId, adminText.fTanla, {
                    reply_markup: {
                        keyboard: fKeyboard(fillial, icon.vakansiya),
                        resize_keyboard: true
                    }
                });
            } else if (text == adminText.keyboard3) {
                const fillial = await a(allFillial)
                bot.sendMessage(chatId, adminText.delFillial, {
                    reply_markup: {
                        keyboard: fKeyboard(fillial, icon.fillialDel),
                        resize_keyboard: true
                    }
                }); 
            } else if (text == adminText.keyboard4) {
                const fillial = await a(allFillial)
                bot.sendMessage(chatId, adminText.fTanla, {
                    reply_markup: {
                        keyboard: fKeyboard(fillial, icon.findFillial),
                        resize_keyboard: true
                    }
                });
            } else if (reply == adminText.fillialAdd) {
                await a(createFillial, text)
                bot.sendMessage(chatId, adminText.qoshish, {
                    reply_markup: {
                        keyboard: [
                            [adminText.keyboard1, adminText.keyboard2],
                            [adminText.keyboard3, adminText.keyboard4]
                        ],
                        resize_keyboard: true
                    }
                });
            } else if (reply == adminText.vakansiyaAdd) {
                await a(createVakansiya, text, fillialVariable)
                bot.sendMessage(chatId, adminText.qoshish, {
                    reply_markup: {
                        keyboard: [
                            [adminText.keyboard1, adminText.keyboard2],
                            [adminText.keyboard3, adminText.keyboard4]
                        ],
                        resize_keyboard: true
                    }
                });
            } else if (text.split(' ').reverse()[0] == icon.vakansiya) {
                const arrFillial = await a(findFillial, text.split(' ').slice(0, -1).join(' '))
                fillialVariable = arrFillial[0]?.id
                bot.sendMessage(chatId, adminText.vakansiyaAdd, {
                    reply_markup: {
                        force_reply: true,
                        selective: true,
                    }
                });
            } else if (text.split(' ').reverse()[0] == icon.fillialDel) {
                await a(deleteFillial, text.split(' ').slice(0, -1).join(' '))
                bot.sendMessage(chatId, adminText.ochirish, {
                    reply_markup: {
                        keyboard: [
                            [adminText.keyboard1, adminText.keyboard2],
                            [adminText.keyboard3, adminText.keyboard4]
                        ],
                        resize_keyboard: true
                    }
                });
            } else if (text.split(' ').reverse()[0] == icon.findFillial) {
                const arrFillial = await a(findFillial, text.split(' ').slice(0, -1).join(' '))
                fillialVariable = arrFillial[0]?.id
                const allVakansiya = await a(findIdVakansiya, fillialVariable)
                bot.sendMessage(chatId, adminText.delVk, {
                    reply_markup: {
                        keyboard: vKeyboard(allVakansiya, icon.delVakansiya),
                        resize_keyboard: true
                    }
                });
            } else if (text.split(' ').reverse()[0] == icon.delVakansiya) {
                await a(deleteVakansiya, text.split(' ').slice(0, -1).join(' '))
                bot.sendMessage(chatId, adminText.ochirish, {
                    reply_markup: {
                        keyboard: [
                            [adminText.keyboard1, adminText.keyboard2],
                            [adminText.keyboard3, adminText.keyboard4]
                        ],
                        resize_keyboard: true
                    }
                });
            }
        }
    } catch (error) {   
        console.log(error)
        bot.sendMessage(chatId, "Malumotda hatolik ERROR")
    }
})