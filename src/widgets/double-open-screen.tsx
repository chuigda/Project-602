import { h } from 'tsx-dom'
import './double-open-screen.css'

export function DoubleOpenScreen(props: {
   backgroundColor: string,
   zIndex: number
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
