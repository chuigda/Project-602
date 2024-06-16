import { h } from 'tsx-dom'
import './select.css'
import { sleep } from '../util/sleep'

export function Select<T>(props: {
   title: string,
   options: { value: T, text: string }[],
   onChange?: (value: T) => any,
   value?: string
}): HTMLElement {
   const closePopUpDiv = () => {
      popUpDiv.innerHTML = ''
      popUpDiv.style.height = '0'
      setTimeout(() => {
         popUpDiv.remove()
      }, 200)
   }

   const popUpDiv = <div class="select-popup" tabIndex={0} onBlur={closePopUpDiv} />

   const showPopUpDiv = () => {
      if (popUpDiv.isConnected) {
         return;
      }

      const selectDiv = selectContainerDiv.querySelector('.select') as HTMLElement
      const x = selectDiv.getBoundingClientRect().left
      const y = selectDiv.getBoundingClientRect().bottom + 4

      // set position of popUpDiv
      popUpDiv.style.left = `${x}px`
      popUpDiv.style.top = `${y}px`
      document.body.appendChild(popUpDiv)
      setTimeout(async () => {
         popUpDiv.focus()
         popUpDiv.style.height = '12em'
         await sleep(200)

         const options = props.options.map(option => {
            return <div class="select-option" onClick={() => {
               if (props.onChange) {
                  props.onChange(option.value)
               }
               (selectDiv.querySelector('.select-current') as HTMLElement).innerText = option.text
               closePopUpDiv()
            }}>{option.text}</div>
         })

         popUpDiv.innerHTML = ''
         popUpDiv.appendChild(<div>{options}</div>)
      })
   }

   const selectContainerDiv = (
      <div class="select-container">
         <span>{props.title}</span>
         <div class="select" onClick={showPopUpDiv}>
            <span class="select-current">{ props.options[0].text }</span>
            <span>▼</span>
         </div>
      </div>
   )

   return selectContainerDiv
}
