import { h } from 'tsx-dom'
import { ChessGame } from '../chess/chessgame'

export function create2DChessboardFromFen(fen: string): HTMLElement[] {
   const elements = []
   const layout = fen.split(' ')[0]
   const ranks = layout.split('/')

   for (let rank = 0; rank < ranks.length; rank++) {
      const rankString = ranks[rank]
      let file = 0
      for (const char of rankString) {
         if (char >= '1' && char <= '8') {
            const spaceCount = parseInt(char)
            for (let i = 0; i < spaceCount; i++) {
               const color = (rank + file) % 2 === 0 ? 'light-square' : 'dark-square'
               elements.push(<div class={`chessboard-square ${color}`} />)
               file += 1
            }
         } else {
            const color = (rank + file) % 2 === 0 ? 'light-square' : 'dark-square'
            elements.push(
               <div class={`chessboard-square ${color}`}>
                  <span class={`chesspiece chesspiece-${char}`} />
               </div>
            )
            file += 1
         }
      }
   }

   return elements
}

export function create2DChessboardFromChessGame(chessgame: ChessGame): HTMLElement[] {
   const elements = []

   for (let rank = 0; rank < 8; rank++) {
      for (let file = 0; file < 8; file++) {
         const piece = chessgame.position[rank][file]
         const color = (rank + file) % 2 === 0 ? 'light-square' : 'dark-square'
         elements.push(
            <div class={`chessboard-square ${color}`}>
               {piece && <span class={`chesspiece chesspiece-${piece}`} />}
            </div>
         )
      }
   }

   return elements
}
