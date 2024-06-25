import { h } from 'tsx-dom'
import './button.css'

export function Button(props: { text: string, onClick: () => void }) {
   return (
      <div class="button" onClick={props.onClick}>
         {props.text}
      </div>
   )
}
