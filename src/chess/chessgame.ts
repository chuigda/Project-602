export type Piece =
   'r' | 'n' | 'b' | 'q' | 'k' | 'p' |
   'R' | 'N' | 'B' | 'Q' | 'K' | 'P' | 'W'

export type PieceName =
   'rook' | 'knight' | 'bishop' | 'queen' | 'king' | 'pawn' | 'wgc'

export type PlayerSide = 'white' | 'black'

export function getPieceSide(piece: Piece): PlayerSide {
   return 'PNBRQKW'.includes(piece) ? 'white' : 'black'
}

export function getPieceName(piece: Piece): PieceName {
   switch (piece.toLowerCase()) {
      case 'r': return 'rook'
      case 'n': return 'knight'
      case 'b': return 'bishop'
      case 'q': return 'queen'
      case 'k': return 'king'
      case 'p': return 'pawn'
      case 'w': return 'wgc'
   }

   throw new Error(`invalid piece ${piece}`)
}

export function isPlayerPiece(piece: Piece, side: PlayerSide): boolean {
   return getPieceSide(piece) === side
}

export interface ChessGame {
   position: (Piece | undefined)[][]
   whiteCastling: { k: boolean, q: boolean }
   blackCastling: { k: boolean, q: boolean }
   turn: PlayerSide
   enPassantSquare: [number, number] | null
}

export function createChessGameFromFen(fen: string): ChessGame {
   const [position, turn, castling, enPassant] = fen.split(' ')
   const [whiteCastling, blackCastling] = [
      {
         k: castling.includes('K'),
         q: castling.includes('Q')
      },
      {
         k: castling.includes('k'),
         q: castling.includes('q')
      }
   ]
   const enPassantSquare = enPassant === '-' ? null : [enPassant.charCodeAt(0) - 97, parseInt(enPassant[1])]

   const chessGame: ChessGame = {
      position: [],
      whiteCastling,
      blackCastling,
      turn: turn === 'w' ? 'white' : 'black',
      enPassantSquare: <[number, number] | null>enPassantSquare
   }

   let rank = 7
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
      rank--
   }

   return chessGame
}

export function chessGameToFen(chessGame: ChessGame): string {
   let fen = ''

   for (let rank = 7; rank >= 0; rank--) {
      let emptyCount = 0
      for (let file = 0; file < 8; file++) {
         const piece = chessGame.position[rank][file]
         if (piece) {
            if (emptyCount > 0) {
               fen += emptyCount
               emptyCount = 0
            }
            fen += piece
         } else {
            emptyCount++
         }
      }
      if (emptyCount > 0) {
         fen += emptyCount
      }
      if (rank > 0) {
         fen += '/'
      }
   }

   fen += ` ${chessGame.turn[0]} `
   fen += `${chessGame.whiteCastling.k ? 'K' : ''}${chessGame.whiteCastling.q ? 'Q' : ''}${chessGame.blackCastling.k ? 'k' : ''}${chessGame.blackCastling.q ? 'q' : ''} `
   fen += chessGame.enPassantSquare ? `${String.fromCharCode(chessGame.enPassantSquare[0] + 97)}${chessGame.enPassantSquare[1]}` : '-'

   return fen
}
