import { h } from 'tsx-dom'
import { DoubleOpenScreen } from '../widgets/double-open-screen'
import { showTestMissionWindow } from './mission'
import { showSkirmishWindow } from './skirmish'
import { runCustomMission } from './custom'
import { showSettingsWindow } from './settings'
import { showAboutWindow } from './about'
import { sleep } from '../util/sleep'

import './startmenu.css'

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
      startMenuButtons.appendChild(<div onClick={() => showTestMissionWindow(2000)}>新战役</div>)
      startMenuButtons.style.height = '16pt'
      await sleep(125)
      startMenuButtons.appendChild(<div>载入储存游戏</div>)
      startMenuButtons.style.height = 'calc(16pt * 2 + 2px)'
      await sleep(125)
      startMenuButtons.appendChild(<div onClick={showSkirmishWindow}>遭遇战</div>)
      startMenuButtons.style.height = 'calc(16pt * 3 + 4px)'
      await sleep(125)
      startMenuButtons.appendChild(<div onClick={runCustomMission}>自定战役</div>)
      startMenuButtons.style.height = 'calc(16pt * 4 + 4px)'
      await sleep(125)
      startMenuButtons.appendChild(<div onClick={showSettingsWindow}>系统设定</div>)
      startMenuButtons.style.height = 'calc(16pt * 5 + 4px)'
      await sleep(125)
      startMenuButtons.appendChild(<div onClick={showAboutWindow}>关于</div>)
      startMenuButtons.style.height = 'calc(16pt * 6 + 6px)'
      await sleep(125)
   }
   asyncUpdates()

   document.body.appendChild(startMenu)

   return startMenu
}
