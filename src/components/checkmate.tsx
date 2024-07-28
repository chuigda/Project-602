import { h } from 'tsx-dom'

import './checkmate.css'
import { sleep } from '../util/sleep'
import { SingleOpenScreen } from '../widgets/single-open-screen'
import { globalResource } from '..'
import { PlayerSide, getOpponentSide } from '../chess/chessgame'
import { EvaluationScore } from '../fairy-stockfish/fairy-stockfish'

export interface CheckmateWindowData {
   title?: string

   startPos: string,
   moves: string[],
   uciMoves: string[],
   moveCount: number
}

export const checkmateText: Record<string, string> = {
   'CHECKMATE': `* 在国际象棋中，当你的王被将军，并且你没有任何方法来消除将军时，你就输掉了这局棋。这种情况被称为“将死”
* 胜败乃兵家常事。我们可以从失败中学到很多东西：学会分析对手的威胁，学会寻找可行的战术，改进自己的策略。不要气馁，继续前进`,
   'STALEMATE': `* 在国际象棋中，如果一方的王没有被将军，同时又无子可动，这种情况被称为“僵局”
* 尽管这一方无路可走，但根据规则，这种情况是和棋
* 如果你处于优势，特别是当你拥有很多子力而对方只剩下王和兵，要特别小心不要陷入僵局`,
   'THREEFOLD': `* 在国际象棋中，如果一个局面重复三次，一方就可以提出和棋
* 通常，这种情况发生在双方都无法取得优势的情况下
* 如果你并不想和棋，要小心不要走出三次重复局面`,
   'INSUFFICIENT': `* 在国际象棋中，如果双方的子力都不足将死对方，则棋局自动以和棋结束
* 要获得更多信息，请查看交互式教学“什么能将杀，什么不能？”`,
   'UNKNOWN': `* 说实话，我对这个错误完全没有头绪，你到底是怎么把它调用出来的？`
}

function getCheckmateText(title?: string): string {
   if (!title) {
      return checkmateText['CHECKMATE']
   }

   if (checkmateText[title]) {
      return checkmateText[title]
   }
   return checkmateText['UNKNOWN']
}

export function createCheckmateWindow(
   data: CheckmateWindowData
): HTMLElement {
   const checkmateWindow = <SingleOpenScreen id="checkmate" backgroundColor='#cd0000' zIndex={5000} />
   const checkmateTitle = <div class="checkmate-title">{ data.title ?? 'CHECKMATE' }</div>
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

      await appendLine('系统遇到致命错误，必须重新启动')
      await sleep(200)
      // const textDiv = <div />
      // checkmateDiagnose.appendChild(textDiv)
      // const typewriterText = getCheckmateText(data.title)
      // for (const char of typewriterText) {
      //    if (char === ' ') {
      //       textDiv.innerHTML += '&nbsp;'
      //    }
      //    else if (char === '\n') {
      //       textDiv.appendChild(<br/>)
      //    }
      //    else {
      //       textDiv.innerText += char
      //    }
      //    await sleep(32)
      // }

      await appendLine('')
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
