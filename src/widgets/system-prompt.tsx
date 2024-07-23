import { h } from 'tsx-dom'
import { sleep } from '../util/sleep'

import './system-prompt.css'

export interface SystemPrompt {
   element: HTMLElement
   subElements: HTMLElement[]
}

export function createSystemPrompt(zIndex: number): SystemPrompt {
   const element = <div class="system-prompt" style={{ zIndex: `${zIndex}` }} />
   const subElements: HTMLElement[] = []
   document.body.appendChild(element)

   return { element, subElements }
}

export type PromptLevel = 'system' | 'prompt'

export function addPromptLine(systemPrompt: SystemPrompt, level: PromptLevel, text: string): Promise<void> {
   const line = <div class={`${level}`}></div>
   systemPrompt.element.appendChild(line)
   systemPrompt.subElements.push(line)

   return new Promise(async resolve => {
      for (let i = 0; i < text.length; i++) {
         line.textContent += text[i]
         await sleep(50)
      }

      await sleep(200)
      setTimeout(() => systemPrompt.subElements.shift()?.remove(), 3500)
      resolve()
   })
}