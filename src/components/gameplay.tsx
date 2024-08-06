import { h } from 'tsx-dom'
import { globalResource } from '..'
import { Context } from '../game/context'
import { createChessboard3D } from '../chessboard/chessboard'
import { DoubleOpenScreen } from '../widgets/double-open-screen'
import { createDialogue } from '../widgets/dialogue'
import { createSystemPrompt } from '../widgets/system-prompt'
import { sleep } from '../util/sleep'
import { dbg_PlayingContext } from './debugconsole'

import './gameplay.css'
import { createToolbar } from './toolbar'

export async function startGameplay(
   zIndex: number,
   afterSetup: (cx: Context) => void | Promise<void>
) {
   const windowBackground = <DoubleOpenScreen backgroundColor="black" zIndex={zIndex} />
   document.body.appendChild(windowBackground)
   await sleep(300)

   const minimap = <div class="gameplay-minimap" />
   const scoreSheet = <div class="gameplay-scoresheet" />
   const scoreSheetContainer = <div class="scoresheet-container">{scoreSheet}</div>
   const gameplayCanvas = <canvas class="gameplay-canvas" style={{ opacity: '0%' }} /> as HTMLCanvasElement
   const gameplayHud = <div class="gameplay-hud" />
   const systemPrompt = createSystemPrompt(zIndex + 20)
   const dialogue = await createDialogue(zIndex + 10)
   const toolbar = await createToolbar(zIndex + 15)

   windowBackground.appendChild(
      <div class="gameplay-container">
         {gameplayCanvas}
         {gameplayHud}
      </div>
   )

   await sleep(300)
   gameplayHud.appendChild(minimap)
   gameplayHud.appendChild(scoreSheetContainer)
   await sleep(300)

   const chessboard = createChessboard3D(gameplayCanvas, globalResource.value.gameAsset, 'white')
   const cx = new Context(zIndex, gameplayCanvas, chessboard, dialogue, systemPrompt, toolbar, minimap, scoreSheet)
   dbg_PlayingContext.value = cx

   afterSetup(cx)
}

window.addEventListener('message', async (event: MessageEvent) => {
   if (event.data.type === 'start-gameplay') {
      await startGameplay(3500, async cx => {
         await cx.enterNonModuleScript(event.data.script)
         await cx.handleEvents()
      })
   }
})
