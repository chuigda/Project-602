import { h } from "tsx-dom"
import './system-prompt.css'
import { sleep } from "../util/sleep"

export interface SystemPrompt {
   element: HTMLElement
   subElements: HTMLElement[]
   interval: number
}

export function createSystemPrompt(zIndex: number): SystemPrompt {
   const element = <div class="system-prompt" style={{ zIndex: `${zIndex}` }} />
   const subElements: HTMLElement[] = []
   document.body.appendChild(element)

   const interval = setInterval(() => {
      if (!element.isConnected) {
         clearInterval(interval)
      }

      subElements.shift()?.remove()
   }, 3000)

   return { element, subElements, interval }
}

export function addPromptLine(
   systemPrompt: SystemPrompt,
   role: 'system' | 'prompt',
   text: string
): Promise<void> {
   const line = <div class={`${role}`}></div>
   systemPrompt.element.appendChild(line)
   systemPrompt.subElements.push(line)

   return new Promise(async resolve => {
      for (let i = 0; i < text.length; i++) {
         line.textContent += text[i]
         await sleep(50)
      }

      await sleep(200)
      resolve()
   })
}
