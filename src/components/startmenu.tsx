import { h } from 'tsx-dom'
import { sleep } from '../util/sleep'
import { DoubleOpenScreen } from '../widgets/double-open-screen'

import './startmenu.css'
import { showSkirmishWindow } from './skirmish'
import { showSettingsWindow } from './settings'
import { showAboutWindow } from './about'
// import { evaluatePositionCPL } from './checkmate'

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


      // evaluatePositionCPL(
      //    'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      //    [
      //       "e2e4",
      //       "f7f5",
      //       "e4f5",
      //       "g8f6",
      //       "g1f3",
      //       "d7d5",
      //       "b1c3",
      //       "c8d7",
      //       "d2d4",
      //       "d7f5",
      //       "f1d3",
      //       "f5d7",
      //       "e1g1",
      //       "d7c6",
      //       "f3e5",
      //       "e7e6",
      //       "e5c6",
      //       "d8d7",
      //       "c6b8",
      //       "d7d6",
      //       "f1e1",
      //       "e8e7",
      //       "e1e2",
      //       "e7e8",
      //       "d1e1",
      //       "e8d8",
      //       "e2e6",
      //       "d6b4",
      //       "b8c6",
      //       "d8d7",
      //       "c6b4",
      //       "g7g6",
      //       "d3b5",
      //       "d7d8",
      //       "e1e2",
      //       "d8c8",
      //       "c1g5",
      //       "f8g7",
      //       "g5f6",
      //       "c7c6",
      //       "f6g7",
      //       "c8d7",
      //       "g7h8",
      //       "a8e8",
      //       "e6e8",
      //       "a7a6",
      //       "e2e7"
      //     ],
      //    progress => { console.info("evaluating: " + Math.round(progress * 100) + "%") }
      // ).then(result => console.info('evaluation result: ', result))
   }
   asyncUpdates()

   document.body.appendChild(startMenu)

   return startMenu
}
