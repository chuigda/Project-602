import { h } from 'tsx-dom'
import './select.css'
import { sleep } from '../util/sleep'

export interface SelectControl<T> {
   element: HTMLElement
   selectCurrentSpan: HTMLElement
   value: T
   options: { value: T, text: string }[]
}

export function setCurrentOption<T>(control: SelectControl<T>, value: T) {
   const option = control.options.find(option => option.value === value)
   if (!option) {
      return
   }

   control.selectCurrentSpan.innerText = option.text
   control.value = option.value
}

export function createSelect<T>(
   title: string,
   options: { value: T, text: string }[],
   onChange?: (value: T) => any,
   value?: T
): SelectControl<T> {
   const closePopUpDiv = () => {
      popUpDiv.innerHTML = ''
      popUpDiv.style.height = '0'
      setTimeout(() => {
         popUpDiv.remove()
      }, 200)
   }

   const selectCurrentSpan = <span class="select-current">{ options[0].text }</span>

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
         popUpDiv.style.height = '10em'
         await sleep(200)

         const optionElements = options.map(option => {
            return <div class="select-option" onClick={() => {
               if (onChange) {
                  onChange(option.value)
               }
               selectCurrentSpan.innerText = option.text
               closePopUpDiv()
            }}>{option.text}</div>
         })

         popUpDiv.innerHTML = ''
         popUpDiv.appendChild(<div>{optionElements}</div>)
      })
   }

   const selectContainerDiv = (
      <div class="select-container">
         <span>{title}</span>
         <div class="select" onClick={showPopUpDiv}>
            { selectCurrentSpan }
            <span>▼</span>
         </div>
      </div>
   )

   if (value) {
      const option = options.find(option => option.value === value)
      if (option) {
         selectCurrentSpan.innerText = option.text
      }
   }

   return {
      element: selectContainerDiv,
      selectCurrentSpan,
      value: value ?? options[0].value,
      options: options
   }
}
