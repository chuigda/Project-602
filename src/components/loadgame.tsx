import { h } from 'tsx-dom'
import { DoubleOpenScreen } from '../widgets/double-open-screen'
import { Window } from '../widgets/window';
import { sleep } from '../util/sleep';
import { loadAllGameSaveData, saveFullGameData } from '../game/saves';
import { ContextSave } from '../game/context';
import { startGameplay } from './gameplay';

import './loadgame.css'

export function showLoadGameWindow(): HTMLElement {
   const windowBackground = <DoubleOpenScreen backgroundColor="black" zIndex={2000} />

   const saves = loadAllGameSaveData<ContextSave>()

   const loadWindow = (
      <Window title="载入游戏" height="65vh" onClose={async () => {
         (windowBackground.children[0] as HTMLElement).style.height = '0';
         (windowBackground.children[1] as HTMLElement).style.height = '0';
         await sleep(300)
         windowBackground.remove()
      }}>
         <div class="saves-list">
            {saves.reverse().map((save, i) => {
               const saveRow = (
                  <div class="save-row">
                     <div class="save-item-detail" onClick={async () => {
                        const p = startGameplay(2000, async cx => {
                           await cx.loadGame(save.data)
                           await cx.handleEvents()
                        });
                        await sleep(500);
                        windowBackground.remove()
                        await p
                     }}>
                        <div class="save-name">{save.name}</div>
                        <div class="save-timestamp">{new Date(save.timestamp).toLocaleString()}</div>
                     </div>
                     <button class="delete-save-btn" onClick={async () => {
                        saves.splice(saves.length - i - 1, 1)
                        saveFullGameData(saves)
                        saveRow.style.maxHeight = window.getComputedStyle(saveRow).height
                        saveRow.classList.add('deleting')
                        saveRow.addEventListener('animationend', () => {
                           saveRow.remove()
                        })
                     }}>删除</button>
                  </div>
               )
               return saveRow
            })}
         </div>
      </Window >
   )

   setTimeout(() => windowBackground.appendChild(loadWindow), 500)
   document.body.appendChild(windowBackground)

   return windowBackground
}
