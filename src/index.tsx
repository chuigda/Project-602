import { h } from 'tsx-dom'
import { Chess, Move } from 'chess.js'

import { createChessboard3D } from './chessboard/chessboard'
import { $ } from './min-jquery'

import { createEngine, makeMove } from './chess/engine'

function showResult(game: Chess) {
   const element = <div style="background-color: white; border: 1px solid black; display: flex; flex-direction: column; align-items: center; padding: 1em; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">
      <h1>游戏结束</h1>
      <hr />
      <p>{game.isDraw() ? '平局' : game.turn() === 'w' ? '黑方胜' : '白方胜'}</p>
   </div>

   document.body.appendChild(element)
}

function showError(err: string) {
   const element = <div style="background-color: white; border: 1px solid red; display: flex; flex-direction: column; align-items: center; padding: 1em; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">
      <h1 style="color: red">错误</h1>
      <hr />
      <p style="color: red">{err}</p>
   </div>

   document.body.appendChild(element)

}

async function applicationStart() {
   const engine = createEngine({
      targetAverageInaccuracy: 125,
      inaccuracyTolerance: 500,
      openingInaccuracyTolerance: 50
   })

   const canvas = $('chessboard') as HTMLCanvasElement

   const chessboard = createChessboard3D(canvas)

   async function onMove(move: Move) {
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
}

document.addEventListener('DOMContentLoaded', applicationStart)
