import { h } from 'tsx-dom'
import './window.css'
import { sleep } from '../util/sleep'
import { CloseButton } from './close-button'

export function Window(props: {
   title: string,
   height: string,
   children: HTMLElement[] | HTMLElement,
   zindex?: number,
   onClose?: () => any
}): HTMLElement {
   const closeWindow = async () => {
      windowDiv.style.opacity = '0'
      await sleep(500)
      windowDiv.remove()
      props.onClose?.()
   }

   const windowContent = <div class="window-content"></div>
   const windowDiv = (
      <div class="window">
         <div class="window-title-bar">
            <span>{ props.title }</span>
            <CloseButton onClick={closeWindow} />
         </div>
         <hr />
         { windowContent }
      </div>
   )
   if (props.zindex) {
      windowDiv.style.zIndex = props.zindex.toString()
   }

   setTimeout(async () => {
      await sleep(500)
      windowDiv.style.transform = 'translate(-50%, -50%)'
      await sleep(500)
      windowContent.style.height = props.height
      await sleep(500)
      if (props.children instanceof HTMLElement) {
         windowContent.appendChild(props.children)
      } else {
         props.children.forEach(child => windowContent.appendChild(child))
      }
   }, 32)

   return windowDiv
}
