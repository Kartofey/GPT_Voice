import { Telegraf } from 'telegraf'
import { message } from 'telegraf/filters';
import { code } from 'telegraf/format';
import config from 'config';
import { ogg } from './ogg.js';
import { openai } from './openai.js'

const bot = new Telegraf(config.get('TELEGRAM_TOKEN'))

bot.on(message('voice'), async ctx => {
  try {
    await ctx.reply(code('Ожидание ответа...'))
    const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id)
    const userID = String(ctx.message.from.id)
    const oggPath = await ogg.create(link.href, userID)
    const mp3Path = await ogg.toMp3(oggPath, userID)

    const text = await openai.transcription(mp3Path)
    const messages = [{role: openai.roles.USER, content: text}]
    // const response = await openai.chat(message)

    await ctx.reply(text)
  } catch (e) {
    console.log(`Error while voice message`, e.message)
  }
})

bot.command('start', async (ctx) => {
  await ctx.reply(JSON.stringify(ctx.message, null, 2))
})

bot.launch()

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
