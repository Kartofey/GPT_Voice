import { openai } from './openai.js'
import { textConverter } from './text.js'

export const INITIAL_SESSION = {
  messages: [],
}

export let OUTPUT_FORMAT = {
  'audio': false,
  'text': true,
}

export async function initCommand(ctx) {
  ctx.session = { ...INITIAL_SESSION }
  await ctx.reply('Жду нового сообщения')
}

export async function outputAudioCommand(ctx) {
  OUTPUT_FORMAT = {
    'audio': true,
    'text': false,
  }
  await ctx.reply('Аудио формат ответа')
  return OUTPUT_FORMAT
}

export async function outputTextCommand(ctx) {
  OUTPUT_FORMAT = {
    'audio': false,
    'text': true,
  }
  await ctx.reply('Текстовый формат ответа')
  return OUTPUT_FORMAT
}

export async function processTextToChat(ctx, content) {
  try {
    ctx.session.messages.push({ role: openai.roles.USER, content })

    const response = await openai.chat(ctx.session.messages)

    ctx.session.messages.push({
      role: openai.roles.ASSISTANT,
      content: response.content,
    })

    
    if (OUTPUT_FORMAT.audio) {
      const source = await textConverter.textToSpeech(response.content)
      await ctx.sendAudio(
        { source },
        { title: 'Ответ от ассистента', performer: 'ChatGPT' }
      )
    } else {
      await ctx.reply(response.content)
    }

  } catch (e) {
    console.log('Error while proccesing text to gpt', e.message)
  }
}