import { h } from 'tsx-dom'
import { globalResource } from '..'
import { Context } from '../game/context'
import { createChessboard3D } from '../chessboard/chessboard'
import { showConfirmWindow } from '../widgets/confirm-window'
import { createSystemPrompt } from '../widgets/system-prompt'
import { createDialogue } from '../widgets/dialogue'
import { DoubleOpenScreen } from '../widgets/double-open-screen'
import { dbg_PlayingContext } from './debugconsole'
import { sleep } from '../util/sleep'
import './custom.css'

export async function runCustomMission() {
   if (!localStorage.getItem('warn_custom_mission')) {
      const play = await showConfirmWindow(2000, '自定战役', (
         <div class="custom-warn-text">
            <div>注意：</div>
            <div>运行自定战役需要从文件系统上加载可执行的 JavaScript 代码。第三方战役中的 JavaScript 代码未经本游戏原作者团队审计，因而可能包含恶意代码。</div>
            <div>在载入代码前，请确保你可以信任该文件的作者，或者你已审查过该文件的内容。点击右下方的“确认”按钮表示你已知晓并接受风险，并选择要载入的文件。之后本游戏将不再显示此警告。</div>
         </div>
      ))

      if (!play) {
         return
      }
      localStorage.setItem('warn_custom_mission', 'true')
   }

   // limit to JS file
   const input = <input type="file" style="display: none" accept=".js" /> as HTMLInputElement
   document.body.appendChild(input)
   input.click()
   await new Promise<void>(resolve => {
      input.addEventListener('change', () => resolve())
   })
   input.remove()

   if (!input.files) {
      return
   }

   const file = input.files[0]
   const reader = new FileReader()
   await new Promise<void>(resolve => {
      reader.onload = () => resolve()
      reader.readAsText(file)
   })

   const text = reader.result as string

   const windowBackground = <DoubleOpenScreen backgroundColor="black" zIndex={2000} />
   document.body.appendChild(windowBackground)
   await sleep(300)
   const gameplayCanvas = <canvas class="gameplay-canvas" style={{ opacity: '0%' }} /> as HTMLCanvasElement
   const systemPrompt = createSystemPrompt(2001)
   const dialogue = await createDialogue(2002)

   windowBackground.appendChild(
      <div class="gameplay-container">
         {gameplayCanvas}
      </div>
   )
   await sleep(300)

   const chessboard = createChessboard3D(gameplayCanvas, globalResource.value.gameAsset, 'white')

   const cx = new Context(2000, gameplayCanvas, chessboard, dialogue, systemPrompt)
   dbg_PlayingContext.value = cx
   await cx.enterNonModuleScript(text)
   await cx.handleEvents()
}
