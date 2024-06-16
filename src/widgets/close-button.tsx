import { h } from 'tsx-dom'
import './close-button.css'

export function CloseButton(props: { onClick?: () => any, size?: number }): HTMLElement {
   return (
      <span class="close-button"
           style={`width: ${props.size || 32}px; height: ${props.size || 32}px`}
           onClick={props.onClick}>
         ×
      </span>
   )
}
