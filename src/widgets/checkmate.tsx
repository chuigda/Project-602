import { h } from 'tsx-dom'

import './checkmate.css'
import { sleep } from '../util/sleep'

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
   const element = <div class="checkmate-container">
      <div class="checkmate-background" id="checkmate-background">
      </div>
   </div>

   const checkmateTitle = <div class="checkmate-title">CHECKMATE</div>

   const checkmateDiagnose = <div class="checkmate-diagnose"></div> as HTMLElement

   document.body.appendChild(element)

   const startCheckmate = async () => {
      await sleep(50)
      $('checkmate-background').style.height = '100%'
      await sleep(400)
      $('checkmate-background').appendChild(checkmateTitle)
      await sleep(300)
      checkmateTitle.style.top = '20px';
      checkmateTitle.style.left = '20px';
      checkmateTitle.style.transform = 'none';

      await sleep(500)
      $('checkmate-background').appendChild(checkmateDiagnose)

      await sleep(100)
      checkmateDiagnose.style.height = 'calc(100% - (20px + 24px + 2em + 4px) - 20px - 12px)';

      await sleep(200)

      async function appendLine(text: string) {
         await sleep(200)
         if (text.trim().length === 0) {
            checkmateDiagnose.appendChild(<br/>)
         } else {
            checkmateDiagnose.appendChild(<div>{text}</div>)
         }
      }

      await appendLine('SYSTEM DIAGNOSE')
      await appendLine(`* Initial position: ${data.startPos}`)
      await appendLine(`* Num moves played: ${data.moveCount}`)

      await sleep(200)
      checkmateDiagnose.innerHTML += '* Moves:&nbsp;'
      await new Promise(async (resolve) => {
         for (let i = 0; i < data.movesPlayed.length; i++) {
            await sleep(16)
            if (data.movesPlayed[i] === ' ') {
               checkmateDiagnose.innerHTML += '&nbsp;'
            } else {
               checkmateDiagnose.innerHTML += data.movesPlayed[i]
            }
         }

         checkmateDiagnose.appendChild(<br/>)
         resolve(undefined)
      })

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

               document.body.removeChild(element)
               window.location.reload()
            }}>[CLICK TO REBOOT]</a>
         </div>
      )
   }
   startCheckmate()

   return element as HTMLElement
}
