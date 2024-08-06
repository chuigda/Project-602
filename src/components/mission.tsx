import './mission.css'
import { h } from 'tsx-dom'
import { startGameplay } from './gameplay'
import { hasSaveData } from '../game/saves'
import { Window } from '../widgets/window'

export async function showTestMissionWindow(zIndex: number) {
   await startGameplay(zIndex, async cx => {
      await cx.enterScript('/story/1_awakening.js')
      await cx.handleEvents()
   })
}

export async function loadGame(zIndex: number) {
   if (!hasSaveData()) {
      const w = (<Window title="错误" height="15vh" zindex={3000}>
         <div class="settings-content">
            <div class="load-game-error">没有存档数据</div>
         </div>
      </Window>);
      w.style.outline = '2px solid red'
      w.style.backgroundColor = 'rgba(255, 0, 0, 0.5)'
      document.body.appendChild(w)
      return
   }
   await startGameplay(zIndex, async cx => {
      if (await cx.loadGame()) {
         await cx.handleEvents()
      }
   })
}
