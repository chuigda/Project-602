import { h } from 'tsx-dom'
import { sleep } from '../util/sleep'
import { DoubleOpenScreen } from '../widgets/double-open-screen'

import './startmenu.css'
import { showSkirmishWindow } from './skirmish'
import { showSettingsWindow } from './settings'
import { showAboutWindow } from './about'
import { createDialogue, hideDialogue, showDialogue, speak } from '../widgets/dialogue'

export function createStartMenu(): HTMLElement {
   const startMenu = <DoubleOpenScreen backgroundColor="black" zIndex={1000} />

   const startMenuButtons = <div class="start-menu-buttons" />

   const startMenuButtonList = (
      <div class="start-menu-button-list">
         <div class="start-menu-game-title">Project-602</div>
         <div class="start-menu-split" />
         {startMenuButtons}
      </div>
   )

   const asyncUpdates = async () => {
      await sleep(300)
      startMenu.appendChild(startMenuButtonList)

      await sleep(300)
      startMenuButtonList.style.left = '64px'

      await sleep(300)
      startMenuButtons.appendChild(<div>新战役</div>)
      startMenuButtons.style.height = '16pt'
      await sleep(125)
      startMenuButtons.appendChild(<div>载入储存游戏</div>)
      startMenuButtons.style.height = 'calc(16pt * 2 + 2px)'
      await sleep(125)
      startMenuButtons.appendChild(<div onClick={showSkirmishWindow}>遭遇战</div>)
      startMenuButtons.style.height = 'calc(16pt * 3 + 4px)'
      await sleep(125)
      startMenuButtons.appendChild(<div onClick={showSettingsWindow}>系统设定</div>)
      startMenuButtons.style.height = 'calc(16pt * 4 + 4px)'
      await sleep(125)
      startMenuButtons.appendChild(<div onClick={showAboutWindow}>关于</div>)
      startMenuButtons.style.height = 'calc(16pt * 5 + 6px)'
      await sleep(125)

      const d = await createDialogue(1500)
      await showDialogue(d)
      await speak(d, null, '白杨', '你算哪根葱，跟我搁这人五人六的，滚你妈的蛋')
      await speak(d, null, '黑王', '不好意思，我这就滚蛋，对不起\n给您添麻烦了')
      await hideDialogue(d)
   }
   asyncUpdates()

   document.body.appendChild(startMenu)

   return startMenu
}
