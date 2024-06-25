import { h } from 'tsx-dom'
import { DoubleOpenScreen } from '../widgets/double-open-screen'
import { sleep } from '../util/sleep'
import { createChessboard3D } from '../chessboard/chessboard'
import { GameAsset } from '../assetloader'

import './gameplay.css'

export function createSkirmishGameplayWindow(
   asset: GameAsset,
   startingPosition: string,
   playerSide: 'white' | 'black',
   chess960: boolean
) {
   const skirmishGameplayWindow = <DoubleOpenScreen backgroundColor="black" zIndex={3000} />

   const asyncUpdates = async () => {
      await sleep(300)

      const gameplayCanvas = <canvas class="gameplay-canvas" /> as HTMLCanvasElement
      skirmishGameplayWindow.appendChild(gameplayCanvas)

      await sleep(100)
      const chessboard = createChessboard3D(gameplayCanvas, asset, playerSide)
   }
   asyncUpdates()

   document.body.appendChild(skirmishGameplayWindow)

   return skirmishGameplayWindow
}
