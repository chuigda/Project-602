import { h } from 'tsx-dom'

import './checkmate.css'
import { sleep } from '../util/sleep'
import { SingleOpenScreen } from '../widgets/single-open-screen'
import { globalResource } from '..'
import { PlayerSide, getOpponentSide } from '../chess/chessgame'
import { EvaluationScore } from '../fairy-stockfish/fairy-stockfish'

export interface CheckmateWindowData {
   startPos: string,
   moves: string[],
   uciMoves: string[],
   moveCount: number
}

export function createCheckmateWindow(
   data: CheckmateWindowData
): HTMLElement {
   const checkmateWindow = <SingleOpenScreen backgroundColor='#cd0000' zIndex={5000} />
   const checkmateTitle = <div class="checkmate-title">CHECKMATE</div>
   const checkmateDiagnose = <div class="checkmate-diagnose"></div>

   document.body.appendChild(checkmateWindow)

   const asyncUpdates = async () => {
      await sleep(300)
      checkmateWindow.appendChild(checkmateTitle)
      await sleep(300)
      checkmateTitle.style.top = '20px';
      checkmateTitle.style.left = '20px';
      checkmateTitle.style.transform = 'none';

      await sleep(500)
      checkmateWindow.appendChild(checkmateDiagnose)

      await sleep(100)
      checkmateDiagnose.style.height = 'calc(100% - (20px + 24px + 2em + 4px) - 20px - 12px)';

      await sleep(200)

      async function appendLine(text: string) {
         await sleep(80)
         if (text.trim().length === 0) {
            checkmateDiagnose.appendChild(<br/>)
         } else {
            checkmateDiagnose.appendChild(<div>{text}</div>)
         }
      }

      await appendLine('系统诊断')
      await appendLine(`* 起始局面: ${data.startPos}`)
      await appendLine(`* 步着数: ${data.moveCount}`)
      await appendLine('')
      await appendLine(`* 棋谱: ${allMovesIntoOneLine(data.moves)}`)
      await appendLine('')

      checkmateDiagnose.appendChild(
         <div>
            <a>[导出诊断]</a>
            &nbsp;
            <a onClick={async () => {
               await appendLine('即将重启系统!')
               await sleep(300)
               await appendLine('重启中...')
               await sleep(1000)

               document.body.removeChild(checkmateWindow)
               window.location.reload()
            }}>[重启系统]</a>
         </div>
      )

      await evaluatePositionCPL(data.startPos, data.uciMoves, progress => { console.info("evaluating: " + Math.round(progress * 100) + "%") })
   }
   asyncUpdates()

   return checkmateWindow
}

function allMovesIntoOneLine(moves: string[]): string {
   let halfMove = 0
   let ret = ''

   if (moves[0] === '...') {
      ret += `1... ${moves[1]} `
      halfMove = 2
   }

   for (; halfMove < moves.length; halfMove += 2) {
      ret += `${Math.round(halfMove / 2) + 1}. ${moves[halfMove]} `
      if (halfMove + 1 < moves.length) {
         ret += `${moves[halfMove + 1]} `
      }
   }

   return ret
}

export async function evaluatePositionCPL(
   startPos: string,
   uciMoves: string[],
   reportProgress?: (progress: number) => void
): Promise<EvaluationScore[]> {
   console.info("analysing uci moves:", uciMoves)
   const fairyStockfish = globalResource.value.fairyStockfish
   const scores: EvaluationScore[] = []

   await fairyStockfish.unsetElo()
   await fairyStockfish.setAnalyseMode(true)

   let mover = currentMover(startPos)
   await fairyStockfish.setPosition(startPos)
   scores.push(await fairyStockfish.evaluatePosition(20))
   if (reportProgress) {
      reportProgress(1 / (uciMoves.length + 1))
   }

   const currentMoves = []
   for (let i = 0; i < uciMoves.length; i++) {
      currentMoves.push(uciMoves[i])
      mover = getOpponentSide(mover)
      await fairyStockfish.setPositionWithMoves(startPos, currentMoves)
      scores.push(await fairyStockfish.evaluatePosition(20))
      if (reportProgress) {
         reportProgress((i + 2) / (uciMoves.length + 1))
      }
   }

   if (reportProgress) {
      reportProgress(1)
   }
   return scores
}

function currentMover(fen: string): PlayerSide {
   return fen.split(' ')[1] === 'w' ? 'white' : 'black'
}
