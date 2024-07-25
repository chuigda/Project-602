import { h } from 'tsx-dom'
import { sleep } from '../util/sleep'

import './system-prompt.css'

export interface SystemPrompt {
   element: HTMLElement
   subElements: HTMLElement[]
   timeouts: any[]
}

export function createSystemPrompt(zIndex: number): SystemPrompt {
   const element = <div class="system-prompt" style={{ zIndex: `${zIndex}` }} />
   const subElements: HTMLElement[] = []
   const timeouts: any[] = []
   document.body.appendChild(element)

   return { element, subElements, timeouts }
}

export type PromptLevel = 'system' | 'prompt'

export function addPromptLine(systemPrompt: SystemPrompt, level: PromptLevel, text: string): Promise<void> {
   const line = <div class={`${level}`}></div>
   systemPrompt.element.appendChild(line)
   systemPrompt.subElements.push(line)

   if (level === 'prompt') {
      text = `提示: ${text}`
   }

   return new Promise(async resolve => {
      for (let i = 0; i < text.length; i++) {
         line.textContent += text[i]
         await sleep(50)
      }

      await sleep(200)
      systemPrompt.timeouts.push(setTimeout(() => {
         systemPrompt.subElements.shift()?.remove()
      }, 5000))
      resolve()
   })
}

export function clearPrompt(systemPrompt: SystemPrompt) {
   systemPrompt.subElements.forEach(element => element.remove())
   systemPrompt.subElements = []
   systemPrompt.timeouts.forEach(timeout => clearTimeout(timeout))
   systemPrompt.timeouts = []
}
