import { globalResource } from '..'
import { Context, createContextVariable } from './context'
import { sleep } from '../util/sleep'
import { createCheckmateWindow } from '../components/checkmate'
import { DrawReason } from '../chess/chessgame'

export function useSkirmishSetup(context: Context, aiLevel: number) {
   useSkirmishAI(context, aiLevel)

   context.onCheckmate.add(skirmishCheckmate)
   context.onDraw.add(skirmishDraw)
}

export function useSkirmishAI(context: Context, aiLevel: number) {
   context.onMovePlayed.delete(maybeSkirmishComputerPlayMove)

   const elo = 500 + (aiLevel - 1) * 200
   context.variables['ai_elo'] = createContextVariable(elo)
   context.onMovePlayed.add(maybeSkirmishComputerPlayMove)
}

export async function maybeSkirmishComputerPlayMove(cx: Context) {
   if (cx.chessgame.turn === cx.playerSide) {
      return
   }

   const elo = cx.variables['ai_elo'].value

   const fairyStockfish = globalResource.value.fairyStockfish
   await fairyStockfish.setElo(elo)
   await fairyStockfish.setPosition(cx.currentFen)
   const [_, bestMove] = await Promise.all([
      sleep(1000),
      fairyStockfish.findBestMoveByDepth(20, 5000)
   ])
   cx.playMoveUCI(bestMove)
}

async function skirmishCheckmate(cx: Context) {
   const checkmatedSide = cx.chessgame.turn
   if (checkmatedSide === cx.playerSide) {
      await sleep(1000)
      createCheckmateWindow({
         startPos: cx.startFen,
         moves: cx.moveHistory,
         uciMoves: cx.moveHistoryUCI,
         moveCount: Math.ceil(cx.moveHistory.length / 2)
      })
   }
   else {
      // TODO
      alert('You won by checkmate')
   }
}

async function skirmishDraw(cx: Context, reason: DrawReason) {
   createCheckmateWindow({
      title: reason.toUpperCase(),
      startPos: cx.startFen,
      moves: cx.moveHistory,
      uciMoves: cx.moveHistoryUCI,
      moveCount: Math.ceil(cx.moveHistory.length / 2)
   })
}
