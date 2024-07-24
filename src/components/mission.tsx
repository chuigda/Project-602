import { h } from 'tsx-dom'
import { globalResource } from '..'
import { Context } from '../context'
import { createChessboard3D } from '../chessboard/chessboard'
import { createDialogue } from '../widgets/dialogue'
import { DoubleOpenScreen } from '../widgets/double-open-screen'
import { createSystemPrompt } from '../widgets/system-prompt'
import { sleep } from '../util/sleep'

import './mission.css'

export async function showTestMissionWindow(zIndex: number): Promise<HTMLElement> {
   const windowBackground = <DoubleOpenScreen backgroundColor="black" zIndex={zIndex} />

   const asyncUpdates = async () => {
      await sleep(300)
      const gameplayCanvas = <canvas class="gameplay-canvas" style={{ opacity: '0%' }} /> as HTMLCanvasElement
      const systemPrompt = createSystemPrompt(zIndex + 1)
      const dialogue = await createDialogue(zIndex + 2)

      windowBackground.appendChild(
         <div class="gameplay-container">
            {gameplayCanvas}
         </div>
      )
      await sleep(300)

      const chessboard = createChessboard3D(gameplayCanvas, globalResource.value.gameAsset, 'white')

      const cx = new Context(gameplayCanvas, chessboard, dialogue, systemPrompt)
      await cx.enterScript('/story/1_awakening.js')
      await cx.handleEvents()
   }
   asyncUpdates()

   document.body.appendChild(windowBackground)
   return windowBackground
}
