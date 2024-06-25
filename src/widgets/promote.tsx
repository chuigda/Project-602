import { h } from 'tsx-dom'
import { Piece, PlayerSide, getPieceOfSide } from '../chess/chessgame'

import './promote.css'
import { sleep } from '../util/sleep'

export function openPromotionWindow(playerSide: PlayerSide, zIndex: number): Promise<Piece> {
   return new Promise<Piece>(resolve => {
      const queen = getPieceOfSide('q', playerSide)
      const rook = getPieceOfSide('r', playerSide)
      const knight = getPieceOfSide('n', playerSide)
      const bishop = getPieceOfSide('b', playerSide)

      const resolveAndClose = async (piece: Piece) => {
         windowContent.remove()
         promotionWindow.style.height = 'calc(16px + 1em)'
         await sleep(300)
         resolve(piece)
         promotionWindow.remove()
      }

      const windowContent = <div class="promote-window-content">
         <div class={`chesspiece chesspiece-${queen}`} onClick={() => resolveAndClose(queen)} />
         <div class={`chesspiece chesspiece-${rook}`} onClick={() => resolveAndClose(rook)} />
         <div class={`chesspiece chesspiece-${knight}`} onClick={() => resolveAndClose(knight)} />
         <div class={`chesspiece chesspiece-${bishop}`} onClick={() => resolveAndClose(bishop)} />
      </div>

      const promotionWindow = <div class="promote-window" style={{ zIndex: `${zIndex}` }}>
         <span>升变</span>
         <hr />
      </div>

      document.body.appendChild(promotionWindow)

      const asyncUpdate = async () => {
         await sleep(100)
         promotionWindow.style.height = '160px'
         await sleep(200)
         promotionWindow.appendChild(windowContent)
      }

      asyncUpdate()
   })
}
