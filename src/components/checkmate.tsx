import { h } from 'tsx-dom'

import './checkmate.css'
import { sleep } from '../util/sleep'
import { SingleOpenScreen } from '../widgets/single-open-screen'

export interface CheckmateWindowData {
   startPos: string,
   movesPlayed: string,
   moveCount: number,

   brilliantCount: number,
   excellentCount: number,
   goodCount: number,
   interestingCount: number,
   inaccuracyCount: number,
   mistakeCount: number,
   blunderCount: number,
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
      await appendLine(`* 棋谱: ${data.movesPlayed}`)
      await appendLine('')
      await appendLine(`* 惊天妙手: ${data.brilliantCount}`)
      await appendLine(`* 秒棋: ${data.excellentCount}`)
      await appendLine(`* 好棋: ${data.goodCount}`)
      await appendLine(`* 有趣: ${data.interestingCount}`)
      await appendLine(`* 失准: ${data.inaccuracyCount}`)
      await appendLine(`* 错误: ${data.mistakeCount}`)
      await appendLine(`* 漏着: ${data.blunderCount}`)
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
   }
   asyncUpdates()

   return checkmateWindow
}
