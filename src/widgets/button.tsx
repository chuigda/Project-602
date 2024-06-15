import { h } from 'tsx-dom'
import './button.css'

export function Button(props: { text: string, onClick: () => void }) {
   return (
      <button class="button" onClick={props.onClick}>
         <b>[</b>
         {props.text}
         <b>]</b>
      </button>
   )
}