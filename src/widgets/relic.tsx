import { h } from 'tsx-dom'
import './relic.css'
import { sleep } from '../util/sleep'

export interface RelicWindow {
   element: HTMLElement
   zIndex: number
   smallCount: number
   normalCount: number
}

export async function createRelicWindow(zIndex: number, width?: string): Promise<RelicWindow> {
   const element = (
      <div class="relic-window"
           style={{ zIndex: `${zIndex}`, width: width || '400px' }}
      />
   )

   document.body.appendChild(element)
   await sleep(200)
   return { element, zIndex, smallCount: 0, normalCount: 0 }
}

export async function relicPushSmallText(relic: RelicWindow, text: string): Promise<HTMLElement> {
   relic.smallCount++
   relic.element.style.height = `calc(${relic.smallCount * 14}pt + ${relic.normalCount * 16}pt + ${(relic.smallCount + relic.normalCount) * 2}px)`
   await sleep(200)
   const smallText = <span class="small-text">{text}</span>
   relic.element.appendChild(smallText)
   return smallText
}

export async function relicPushNormalText(relic: RelicWindow, text: string): Promise<HTMLElement> {
   relic.normalCount++
   relic.element.style.height = `calc(${relic.smallCount * 14}pt + ${relic.normalCount * 16}pt + ${(relic.smallCount + relic.normalCount) * 2}px)`
   await sleep(200)
   const normalText = <span class="normal-text">{text}</span>
   relic.element.appendChild(normalText)
   return normalText
}

export async function removeRelicWindow(relic: RelicWindow) {
   relic.element.innerHTML = ''
   await sleep(100)
   relic.element.style.height = '0'
   await sleep(200)
   relic.element.remove()
}
