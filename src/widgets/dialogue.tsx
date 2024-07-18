import { h } from 'tsx-dom'
import { Character } from '../components/mission'
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
   const speakContent = <div class="speak-content" />
   container.appendChild(speaker)
   container.appendChild(speakContent)
   document.body.appendChild(container)

   await sleep(125)
   return { portrait, container, speaker, speakContent }
}

export async function showDialogue(dialogue: Dialogue) {
   dialogue.portrait.style.opacity = '1'
   dialogue.container.style.opacity = '1'
   await sleep(125)
}

export async function hideDialogue(dialogue: Dialogue) {
   dialogue.portrait.style.opacity = '0'
   dialogue.container.style.opacity = '0'
   await sleep(125)
}

export function speak(
   dialogue: Dialogue,
   character: Character,
   speaker: string,
   text: string
): Promise<void> {
   dialogue.speaker.innerText = speaker
   dialogue.speakContent.innerText = ''

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
