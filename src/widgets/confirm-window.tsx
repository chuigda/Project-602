import { h } from 'tsx-dom'
import { sleep } from '../util/sleep'
import { Button } from './button'

import './confirm-window.css'

export async function showConfirmWindow(
   zIndex: number,
   title: string,
   content: HTMLElement
): Promise<boolean> {
   const window = (
      <div class="confirm-window">
      </div>
   )

   const background = (
      <div class="confirm-window-background" style={`z-index: ${zIndex}`}>
         { window }
      </div>
   )

   document.body.appendChild(background)
   await sleep(125)
   window.style.height = '50%'
   await sleep(250)

   window.appendChild(<div class="title">{ title }</div>)
   window.appendChild(<hr />)
   content.classList.add('content')
   window.appendChild(content)

   const r = await new Promise<boolean>(resolve => {
      window.appendChild(
         <div class="button-area">
            <Button onClick={() => resolve(false)} text="取消" />
            <Button onClick={() => resolve(true)} text="确认" />
         </div>
      )
   })

   window.innerHTML = ''
   await sleep(125)
   window.style.height = '1em'
   await sleep(250)
   background.remove()

   return r
}

