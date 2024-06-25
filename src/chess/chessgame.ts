export type Piece = undefined |
   'r' | 'n' | 'b' | 'q' | 'k' | 'p' |
   'R' | 'N' | 'B' | 'Q' | 'K' | 'P' | 'W'

export type PlayerSide = 'white' | 'black'

export interface ChessGame {
   position: Piece[][]
   whiteCastling: { k: boolean, q: boolean }
   blackCastling: { k: boolean, q: boolean }
   turn: 'white' | 'black'
   enPassantSquare: [number, number] | null
}

export function createChessGameFromFen(fen: string): ChessGame {
   const [position, turn, castling, enPassant] = fen.split(' ')
   const [whiteCastling, blackCastling] = castling.split('').map(c => c === '-')
   const enPassantSquare = enPassant === '-' ? null : [enPassant.charCodeAt(0) - 97, 8 - parseInt(enPassant[1])]

   const chessGame: ChessGame = {
      position: [],
      whiteCastling: { k: whiteCastling, q: whiteCastling },
      blackCastling: { k: blackCastling, q: blackCastling },
      turn: turn === 'w' ? 'white' : 'black',
      enPassantSquare: <[number, number] | null>enPassantSquare
   }

   let rank = 0
   for (const rankString of position.split('/')) {
      chessGame.position[rank] = [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined]
      let file = 0
      for (const char of rankString) {
         if (char >= '1' && char <= '8') {
            file += parseInt(char)
         } else {
            chessGame.position[rank][file] = char as Piece
            file++
         }
      }
      rank++
   }

   return chessGame
}
