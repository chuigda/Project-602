import { h } from 'tsx-dom'
import { globalResource } from '..'
import { startGameplay } from './gameplay'
import { DoubleOpenScreen } from '../widgets/double-open-screen'
import { createDialogue, showDialogue, speak } from '../widgets/dialogue'
import { createRelicWindow, relicPushNormalText, relicPushSmallText, removeRelicWindow } from '../widgets/relic'
import { randomPick, shuffle } from '../util/rand'
import { sleep } from '../util/sleep'

import './bootload.css'


export async function createBootloadScreen(gardenImage: HTMLImageElement) {
   const windowBackground = <DoubleOpenScreen backgroundColor='black' zIndex={1500} />
   document.body.appendChild(windowBackground)

   await sleep(300)
   const gardenCanvas = <canvas class='garden-canvas' style={{ zIndex: '1501' }}/> as HTMLCanvasElement
   document.body.appendChild(gardenCanvas)

   await sleep(250)
   const width = gardenCanvas.clientWidth * (window.devicePixelRatio ?? 1)
   const height = gardenCanvas.clientHeight * (window.devicePixelRatio ?? 1)

   gardenCanvas.width = width
   gardenCanvas.height = height
   const gardenCtx = gardenCanvas.getContext('2d')!

   // TODO
   gardenCtx.drawImage(gardenImage, 0, 0, width, height)

   gardenCanvas.style.opacity = '1'
   await sleep(1000)

   const dialogue = await createDialogue(1502, true)
   await showDialogue(dialogue)
   const nerori = globalResource.value.characters['NeroRi']
   await speak(dialogue, null, '旁白', '', '这片领土无边无际，天外来客们在不同的位置掉落')
   await speak(dialogue, nerori, 'NeroRi', '常态', '请放心，我有非常丰富的经验，会接住你们的')
   await speak(dialogue, nerori, 'NeroRi', '常态', '我是友好型，请和我说说话吧 ^^')
   await speak(dialogue, nerori, 'NeroRi', '扇子', '每个天外来客都很有意思，我喜欢没见过的东西')

   const relicWindow = await createRelicWindow(1503, '400px')
   await relicPushNormalText(relicWindow, '侦测到 NeroRi 故障')
   await sleep(300)
   const plzHelp = await relicPushSmallText(relicWindow, '')
   await shuffleText(
      plzHelp,
      'Please help me 请帮助我',
      50,
      30,
      'abcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()烫屯锟斤铐锘 '
   )
   await sleep(1000)
   await removeRelicWindow(relicWindow)

   speak(dialogue, nerori, 'NeroRi', '加载中', '我... 你们... 参观... 花... 花园...')
   await sleep(125)
   await shuffleBarCode(dialogue.portrait)

   dialogue.container.style.opacity = '0'
   await sleep(250)
   dialogue.container.remove()
   await sleep(250)

   await startGameplay(2000, async cx => {
      await cx.enterScript('/story/0_awakening.js')
      await cx.handleEvents()
   })
}

export function shuffleText(
   container: HTMLElement,
   text: string,
   frameTime: number,
   frameCount: number,
   charset: string
): Promise<void> {
   const correctCharPerFrame = text.length / frameCount
   const charIndices = new Array(text.length).fill(0).map((_, i) => i)
   const resumeOrder = shuffle(charIndices)

   let frame = 0
   return new Promise(resolve => {
      const cb = setInterval(() => {
         if (frame >= frameCount) {
            clearInterval(cb)
            resolve()
            return
         }

         const resumedCharCount = Math.ceil(correctCharPerFrame * frame)

         let randomText = ''
         for (let i = 0; i < text.length; i++) {
            if (text[i] === ' ') {
               randomText += ' '
            } else if (resumeOrder.slice(0, resumedCharCount).includes(i)) {
               randomText += text[i]
            } else {
               randomText += randomPick(charset as any)
            }
         }

         container.innerText = randomText
         frame += 1
      }, frameTime)
   })
}

export async function shuffleBarCode(canvas: HTMLCanvasElement) {
   const ctx = canvas.getContext('2d')!
   const width = canvas.width
   const height = canvas.height

   const blockCount = 20 * 15
   const blockArray = shuffle(new Array(blockCount).fill(0).map((_, i) => i))

   const blockWidth = width / 20
   const blockHeight = height / 15

   for (let i = 0; i < blockCount; i += 4) {
      for (let j = 0; j < 4; j++) {
         const blockIndex = blockArray[i + j]
         const x = (blockIndex % 20) * blockWidth
         const y = Math.floor(blockIndex / 20) * blockHeight
         ctx.fillStyle = randomPick(colorPalette4Bit)
         ctx.fillRect(x, y, blockWidth, blockHeight)
      }

      await sleep(50)
   }
}

const colorPalette4Bit = [
   // exclude over-bright colors
   '#000000',
   '#0000AA',
   '#00AA00',
   '#00AAAA',
   '#AA0000',
   '#AA00AA',
   '#AA5500',
]
