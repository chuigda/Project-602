import { globalResource } from '..'
import { Context, createContextVariable } from './context'
import { sleep } from '../util/sleep'
import { createCheckmateWindow } from '../components/checkmate'
import { DrawReason } from '../chess/chessgame'
import { randomPickParabola } from '../util/rand'

export function useSkirmishSetup(context: Context, aiLevel?: number) {
   useSkirmishAI(context, aiLevel)

   context.onCheckmate.add(skirmishCheckmate)
   context.onDraw.add(skirmishDraw)
}

export function useSkirmishAI(context: Context, aiLevel?: number) {
   context.onMovePlayed.delete(maybeSkirmishComputerPlayMove)

   if (aiLevel) {
      const elo = 500 + (aiLevel - 1) * 200
      context.variables['ai_level'] = createContextVariable(aiLevel)
      context.variables['ai_elo'] = createContextVariable(elo)
   }
   context.onMovePlayed.add(maybeSkirmishComputerPlayMove)
}

export async function maybeSkirmishComputerPlayMove(cx: Context) {
   if (cx.chessgame.turn === cx.playerSide) {
      return
   }

   if (cx.validMoves.length === 0) {
      return
   }

   const aiLevel = cx.variables['ai_level'] ? cx.variables['ai_level'].value : undefined
   const bookMove = tryBookMove(cx, aiLevel)
   if (bookMove) {
      await sleep(1500)
      cx.playMoveUCI(bookMove)
      return
   }

   const fairyStockfish = globalResource.value.fairyStockfish
   if (aiLevel) {
      const elo = cx.variables['ai_elo'].value
      await fairyStockfish.setElo(elo)
   }
   else {
      await fairyStockfish.unsetElo()
   }
   await fairyStockfish.setPosition(cx.currentFen)
   const [_, bestMove] = await Promise.all([
      sleep(1000),
      fairyStockfish.findBestMoveByDepth(20, 5000)
   ])
   cx.playMoveUCI(bestMove)
}

const openingCPL = [-225, -175, -125, -75, -50, -40, -30, -20]
function tryBookMove(cx: Context, aiLevel?: number): string | undefined {
   const openingBook = globalResource.value.chessData.openingBook
   const position = openingBook[cx.currentFen]
   if (!position) {
      return
   }

   const allMovesOrdered = position
      .moves
      .sort(([_move1, score1], [_move2, score2]) => score2 - score1)
   if (allMovesOrdered.length === 0) {
      return
   }

   if (!aiLevel) {
      return allMovesOrdered[0][0]
   }

   const allowedCPL = openingCPL[aiLevel - 1]

   const allowedMoves = allMovesOrdered.filter(([_move, score]) => score >= allowedCPL)
   if (allowedMoves.length === 0) {
      return allMovesOrdered[0][0]
   }

   return randomPickParabola(allowedMoves, 2)[0]
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
