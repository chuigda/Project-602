import { h } from 'tsx-dom'
import { sleep } from '../util/sleep'

import './double-open-screen.css'

export function DoubleOpenScreen(props: {
   backgroundColor: string,
   zIndex: number,
   children?: HTMLElement[]
}): HTMLElement {
   const upperDiv = (
      <div class="double-open-screen-background-half"
           style={`background-color: ${props.backgroundColor}`}
      />
   )
   const lowerDiv = (
      <div class="double-open-screen-background-half"
           style={`background-color: ${props.backgroundColor}`}
      />
   )

   const ret = (
      <div class="double-open-screen-background-container"
           style={`z-index: ${props.zIndex}`}>
         { upperDiv }
         { lowerDiv }
      </div>
   )

   setTimeout(() => {
      upperDiv.style.height = '50%'
      lowerDiv.style.height = '50%'
   }, 50)

   return ret
}

export async function closeDoubleOpenScreen(screen: HTMLElement) {
   const upperDiv = screen.children[0] as HTMLElement
   const lowerDiv = screen.children[1] as HTMLElement

   upperDiv.style.height = '0'
   lowerDiv.style.height = '0'

   await sleep(300)
   screen.remove()
}
