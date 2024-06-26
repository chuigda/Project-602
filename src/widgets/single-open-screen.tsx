import { h } from 'tsx-dom'
import './single-open-screen.css'

export function SingleOpenScreen(props: {
   backgroundColor: string,
   zIndex: number
}): HTMLElement {
   const innerDiv = (
      <div class="single-open-screen-background"
           style={`background-color: ${props.backgroundColor}`}
      />
   )

   const ret = (
      <div class="single-open-screen-background-container"
           style={`z-index: ${props.zIndex}`}>
         { innerDiv }
      </div>
   )

   setTimeout(() => innerDiv.style.height = '100%', 32)
   return ret
}
