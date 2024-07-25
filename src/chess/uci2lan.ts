import {
   ChessGame,
   square2rankfileZeroBased
} from './chessgame'
import { choosePieceNotation } from './pieceNotation'

export function uci2lan(
   game: ChessGame,
   uci: string,
   inCheck: boolean,
   checkmateOrStalemate: boolean
): string {
   const tail = checkmateOrStalemate ? '#' : inCheck ? '+' : ''

   const from = uci.slice(0, 2)
   const to = uci.slice(2, 4)
   const promotion = uci.slice(4, 5)

   const [fromRank, fromFile] = square2rankfileZeroBased(from)
   const [toRank, toFile] = square2rankfileZeroBased(to)

   if (promotion) {
      if (fromFile !== toFile) {
         return `${from}x${to}=${choosePieceNotation(promotion.toUpperCase())}${tail}`
      }
      else {
         return `${from}-${to}=${choosePieceNotation(promotion.toUpperCase())}${tail}`
      }
   }

   const srcPiece = game.position[fromRank][fromFile]!
   const dstPiece = game.position[toRank][toFile]

   if (srcPiece === 'p' || srcPiece === 'P') {
      if (fromFile !== toFile) {
         return `${from}x${to}${tail}`
      }
      else {
         return `${from}-${to}${tail}`
      }
   }

   const capture = dstPiece ? 'x' : '-'
   return `${choosePieceNotation(srcPiece.toUpperCase())}${from}${capture}${to}${tail}`
}
