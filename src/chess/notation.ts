import { ChessGame, Piece, rankfile2squareZeroBased, square2rankfileZeroBased } from './chessgame'

export function uci2san(
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
         return `${from[0]}x${to}=${promotion.toUpperCase()}${tail}`
      }
      else {
         return `${to}=${promotion.toUpperCase()}${tail}`
      }
   }

   const srcPiece = game.position[fromRank][fromFile]!
   const dstPiece = game.position[toRank][toFile]

   if (srcPiece === 'p' || srcPiece === 'P') {
      if (fromFile !== toFile) {
         // must be capture
         return `${from[0]}x${to}${tail}`
      }
      else {
         // must be advance
         return `${to}${tail}`
      }
   }

   if (srcPiece === 'k' || srcPiece === 'K') {
      if (fromFile === 4 && toFile === 6) {
         return `O-O${tail}`
      }

      if (fromFile === 4 && toFile === 2) {
         return `O-O-O${tail}`
      }

      // chess960 castle
      if ((srcPiece === 'k' && dstPiece === 'r') ||
         (srcPiece === 'K' && dstPiece === 'R')) {
         if (fromFile < toFile) {
            return `O-O${tail}`
         }
         else {
            return `O-O-O${tail}`
         }
      }
   }

   const capture = dstPiece ? 'x' : ''

   let reachable: string[]
   if (srcPiece === 'Q' || srcPiece === 'q') {
      reachable = [
         ...findReachablePiece(game, toRank, toFile, 1, 1, srcPiece),
         ...findReachablePiece(game, toRank, toFile, 1, -1, srcPiece),
         ...findReachablePiece(game, toRank, toFile, -1, 1, srcPiece),
         ...findReachablePiece(game, toRank, toFile, -1, -1, srcPiece),
         ...findReachablePiece(game, toRank, toFile, 1, 0, srcPiece),
         ...findReachablePiece(game, toRank, toFile, -1, 0, srcPiece),
         ...findReachablePiece(game, toRank, toFile, 0, 1, srcPiece),
         ...findReachablePiece(game, toRank, toFile, 0, -1, srcPiece)
      ]
   }
   else if (srcPiece === 'R' || srcPiece === 'r') {
      reachable = [
         ...findReachablePiece(game, toRank, toFile, 0, 1, srcPiece),
         ...findReachablePiece(game, toRank, toFile, 0, -1, srcPiece),
         ...findReachablePiece(game, toRank, toFile, 1, 0, srcPiece),
         ...findReachablePiece(game, toRank, toFile, -1, 0, srcPiece)
      ]
   }
   else if (srcPiece === 'B' || srcPiece === 'b') {
      reachable = [
         ...findReachablePiece(game, toRank, toFile, 1, 1, srcPiece),
         ...findReachablePiece(game, toRank, toFile, 1, -1, srcPiece),
         ...findReachablePiece(game, toRank, toFile, -1, 1, srcPiece),
         ...findReachablePiece(game, toRank, toFile, -1, -1, srcPiece)
      ]
   }
   else if (srcPiece === 'N' || srcPiece === 'n') {
      reachable = findReachableKnights(game, toRank, toFile, srcPiece)
   }
   else {
      reachable = []
   }

   const srcPieceUpper = srcPiece.toUpperCase()

   const hasSameFile_ = hasSameFile(reachable)
   const hasSameRank_ = hasSameRank(reachable)
   if (reachable.length >= 2) {
      if (hasSameFile_ && hasSameRank_) {
         return `${srcPieceUpper}${from}${capture}${to}${tail}`
      }
      else if (hasSameFile_) {
         return `${srcPieceUpper}${from[1]}${capture}${to}${tail}`
      }
      else {
         return `${srcPieceUpper}${from[0]}${capture}${to}${tail}`
      }
   }
   else {
      return `${srcPieceUpper}${capture}${to}${tail}`
   }
}

function findReachablePiece(
   game: ChessGame,
   startRank: number,
   startFile: number,
   dRank: number,
   dFile: number,
   specificPiece: Piece
): string[] {
   const squares: string[] = []

   let rank = startRank + dRank
   let file = startFile + dFile
   while (rank >= 0 && rank < 8 && file >= 0 && file < 8) {
      const piece = game.position[rank][file]
      if (piece) {
         if (piece === specificPiece) {
            squares.push(rankfile2squareZeroBased(rank, file))
            break
         }
         else {
            break
         }
      }

      rank += dRank
      file += dFile
   }

   return squares
}

const knightDistance: [number, number][] = [
   [-2, -1],
   [-2, 1],
   [-1, -2],
   [-1, 2],
   [1, -2],
   [1, 2],
   [2, -1],
   [2, 1]
]

function findReachableKnights(
   game: ChessGame,
   startRank: number,
   startFile: number,
   piece: Piece
): string[] {
   const ret = []
   for (const [dRank, dFile] of knightDistance) {
      const rank = startRank + dRank
      const file = startFile + dFile
      if (rank >= 0 && rank < 8 && file >= 0 && file < 8) {
         const dstPiece = game.position[rank][file]
         if (dstPiece === piece) {
            ret.push(rankfile2squareZeroBased(rank, file))
         }
      }
   }

   return ret
}

function hasSameRank(squares: string[]): boolean {
   const ranks = new Set<string>()
   for (const square of squares) {
      if (ranks.has(square[0])) {
         return true
      }
      ranks.add(square[0])
   }
   return false
}

function hasSameFile(squares: string[]): boolean {
   const files = new Set<string>()
   for (const square of squares) {
      if (files.has(square[1])) {
         return true
      }
      files.add(square[1])
   }
   return false
}
