import { h } from 'tsx-dom'
import { Chess } from 'chess.js'

import { createChessboard3D } from './chessboard/chessboard'
import { $ } from './min-jquery'
import { createEngine, makeMove } from './chess/engine'

// @ts-ignore
import CanonInD from './resc/CanonInD.mp3'

function showResult(game: Chess) {
   const element = <div class="dialog">
      <h1>游戏结束</h1>
      <p>{game.isDraw() ? '平局' : game.turn() === 'w' ? '黑方胜' : '白方胜'}</p>
   </div>

   document.body.appendChild(element)
}

function showError(err: string) {
   const element = <div class="dialog">
      <h1 style="color: red">错误</h1>
      <p style="color: red">{err}</p>
      <button onClick={() => document.body.removeChild(element)}>关闭</button>
   </div>

   document.body.appendChild(element)

}

let started = false

async function applicationStart() {
   const engine = createEngine({
      targetAverageInaccuracy: 125,
      inaccuracyTolerance: 500,
      openingInaccuracyTolerance: 50
   })

   const canvas = $('chessboard') as HTMLCanvasElement

   const chessboard = createChessboard3D(canvas)

   async function onMove() {
      if (!started) {
         console.log('HiHiHi should play Canon in D')
         started = true
         const audio = $("audio") as HTMLAudioElement
         console.log(CanonInD)
         audio.src = CanonInD
         audio.play()
      
         // set volume to 25%
         audio.volume = 0.25
      }

      if (chessboard.game.isGameOver()) {
         showResult(chessboard.game)
         return
      }

      let engineMove
      try {
         engineMove = await makeMove(chessboard.game, engine)
      } catch (e) {
         showError(`${e}`)
         return
      }

      chessboard.game.move(engineMove)
      if (chessboard.game.isGameOver()) {
         showResult(chessboard.game)
         return
      }
   }

   chessboard.onMovePlayed = onMove

   chessboard.onInvalidMove = () => {
      showError('无效的着法')
   }
}

document.addEventListener('DOMContentLoaded', applicationStart)
