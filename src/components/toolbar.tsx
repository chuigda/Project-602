import { h } from 'tsx-dom'

import './toolbar.css'

export interface Toolbar {
    container: HTMLElement
    buttons: HTMLElement[]
}

export async function createToolbar(zIndex: number): Promise<Toolbar> {
    const container = <div class="toolbar" style={{ zIndex: `${zIndex}` }} />
    const buttons: HTMLElement[] = []
    document.body.appendChild(container)

    return { container, buttons }
}

export function addToolbarButton(toolbar: Toolbar, text: string, onClick: () => any): HTMLElement {
    const button = <button type='button' class="toolbar-button" onClick={onClick}>{text}</button>
    toolbar.container.appendChild(button)
    toolbar.buttons.push(button)
    return button
}

export function removeToolbarButton(toolbar: Toolbar, button: HTMLElement) {
    button.remove()
    toolbar.buttons = toolbar.buttons.filter(b => b !== button)
}

export function clearToolbar(toolbar: Toolbar) {
    toolbar.buttons.forEach(button => button.remove())
    toolbar.buttons = []
}
