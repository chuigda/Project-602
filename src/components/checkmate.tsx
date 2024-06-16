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
      console.log('hihihi?')

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

      await appendLine('SYSTEM DIAGNOSE')
      await appendLine(`* Initial position: ${data.startPos}`)
      await appendLine(`* Num moves played: ${data.moveCount}`)
      await appendLine('')
      await appendLine(`* Moves: ${data.movesPlayed}`)
      await appendLine('')
      await appendLine(`* Brilliant moves: ${data.brilliantCount}`)
      await appendLine(`* Excellent moves: ${data.excellentCount}`)
      await appendLine(`* Good moves: ${data.goodCount}`)
      await appendLine(`* Interesting moves: ${data.interestingCount}`)
      await appendLine(`* Inaccuracies: ${data.inaccuracyCount}`)
      await appendLine(`* Mistakes: ${data.mistakeCount}`)
      await appendLine(`* Blunders: ${data.blunderCount}`)
      await appendLine('')

      checkmateDiagnose.appendChild(
         <div>
            <a>[EXPORT DIAGNOSE]</a>
            &nbsp;
            <a onClick={async () => {
               await appendLine('SYSTEM REBOOT IN 5 SECONDS!')
               await sleep(300)
               await appendLine('REBOOTING...')
               await sleep(1000)

               document.body.removeChild(checkmateWindow)
               window.location.reload()
            }}>[CLICK TO REBOOT]</a>
         </div>
      )
   }
   asyncUpdates()

   return checkmateWindow
}
