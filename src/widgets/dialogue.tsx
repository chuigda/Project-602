import { h } from 'tsx-dom'
import { dbgWarn } from '../components/debugconsole'
import { Character } from '../story/character'
import { sleep } from '../util/sleep'
import { ref } from '../util/ref'

import './dialogue.css'

export interface Dialogue {
   portrait: HTMLCanvasElement

   container: HTMLElement
   speaker: HTMLElement
   speakContent: HTMLElement
}

export async function createDialogue(zIndex: number): Promise<Dialogue> {
   const portrait = (
      <canvas class="dialogue-portrait"
              style={{ opacity: '0', zIndex: `${zIndex}` }}
      />
   ) as HTMLCanvasElement
   const container = <div class="dialogue" style={{ opacity: '0', zIndex: `${zIndex + 1}` }}/>
   const speaker = <div class="speaker" />
   const speakContent = <pre class="speak-content" />
   container.appendChild(speaker)
   container.appendChild(speakContent)

   await sleep(125)
   return { portrait, container, speaker, speakContent }
}

export async function showDialogue(dialogue: Dialogue) {
   document.body.appendChild(dialogue.portrait)
   document.body.appendChild(dialogue.container)
   dialogue.speaker.innerText = ''
   dialogue.speakContent.innerText = ''
   await sleep(50)
   dialogue.container.style.opacity = '1'
   await sleep(125)
}

export async function hideDialogue(dialogue: Dialogue) {
   dialogue.portrait.style.opacity = '0'
   dialogue.container.style.opacity = '0'
   await sleep(125)
   dialogue.portrait.remove()
   dialogue.container.remove()
}

export function speak(
   dialogue: Dialogue,
   character: Character | null | undefined,
   speaker: string,
   emotion: string,
   text: string
): Promise<void> {
   const canvasWidth = dialogue.portrait.clientWidth * (window.devicePixelRatio || 1)
   const canvasHeight = dialogue.portrait.clientHeight * (window.devicePixelRatio || 1)

   dialogue.speaker.innerText = speaker
   dialogue.speakContent.innerText = ''
   dialogue.portrait.width = canvasWidth
   dialogue.portrait.height = canvasHeight
   if (dialogue.portrait.style.opacity === '0') {
      dialogue.portrait.style.opacity = '1'
   }

   const ctx = dialogue.portrait.getContext('2d')!
   ctx.clearRect(0, 0, dialogue.portrait.width, dialogue.portrait.height)

   if (character) {
      const emotionImages = character.emotions[emotion]
      if (!emotionImages) {
         dbgWarn(`speak: 角色 ${speaker} 缺少表情图片序列 ${emotion}`)
      }
      else {
         const widthOverHeight = character.width / character.height

         const drawX = canvasWidth * character.drawX
         const drawY = canvasHeight * character.drawY
         const drawHeight = canvasHeight * (1 - character.drawY)
         const drawWidth = drawHeight * widthOverHeight

         for (const image of emotionImages) {
            ctx.drawImage(
               image,
               character.startX,
               character.startY,
               character.width,
               character.height,
               drawX,
               drawY,
               drawWidth,
               drawHeight
            )
         }
      }
   }

   const interrupted = ref(false)
   const promise = new Promise<void>(async resolve => {
      for (let i = 0; i < text.length; i++) {
         if (interrupted.value) {
            break
         }

         dialogue.speakContent.innerText += text[i]
         await sleep(50)
      }

      dialogue.speakContent.removeEventListener('click', interruption)
      dialogue.portrait.removeEventListener('click', interruption)
      const resolveAndRemoveListener = () => {
         dialogue.speakContent.removeEventListener('click', resolveAndRemoveListener)
         dialogue.portrait.removeEventListener('click', resolveAndRemoveListener)
         resolve()
      }

      dialogue.speakContent.addEventListener('click', resolveAndRemoveListener)
      dialogue.portrait.addEventListener('click', resolveAndRemoveListener)
   })

   const interruption = () => {
      interrupted.value = true
      dialogue.speakContent.innerText = text
   }

   dialogue.speakContent.addEventListener('click', interruption)
   dialogue.portrait.addEventListener('click', interruption)

   return promise
}
