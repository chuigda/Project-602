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

   if (srcPiece === 'Q' || srcPiece === 'q') {
      const reachable = [
         ...findReachablePiece(game, toRank, toFile, 1, 1, srcPiece, fromRank, fromFile),
         ...findReachablePiece(game, toRank, toFile, 1, -1, srcPiece, fromRank, fromFile),
         ...findReachablePiece(game, toRank, toFile, -1, 1, srcPiece, fromRank, fromFile),
         ...findReachablePiece(game, toRank, toFile, -1, -1, srcPiece, fromRank, fromFile),
         ...findReachablePiece(game, toRank, toFile, 1, 0, srcPiece, fromRank, fromFile),
         ...findReachablePiece(game, toRank, toFile, -1, 0, srcPiece, fromRank, fromFile),
         ...findReachablePiece(game, toRank, toFile, 0, 1, srcPiece, fromRank, fromFile),
         ...findReachablePiece(game, toRank, toFile, 0, -1, srcPiece, fromRank, fromFile)
      ]

      const sameRankReachable = reachable.filter(square => square[0] === from[0])
      const sameFileReachable = reachable.filter(square => square[1] === from[1])
      const otherReachable = reachable.filter(square => square[0] !== from[0] && square[1] !== from[1])

      if (otherReachable.length !== 0 || (sameRankReachable.length !== 0 && sameFileReachable.length !== 0)) {
         return `Q${from}${capture}${to}${tail}`
      }
      else if (sameRankReachable.length !== 0) {
         return `Q${from[0]}${capture}${to}${tail}`
      }
      else if (sameFileReachable.length !== 0) {
         return `Q${from[1]}${capture}${to}${tail}`
      }
      else
      {
         return `Q${capture}${to}${tail}`
      }
   }
   if (srcPiece === 'R' || srcPiece === 'r') {
      const sameRankReachable = [
         ...findReachablePiece(game, toRank, toFile, 0, 1, srcPiece, fromRank, fromFile),
         ...findReachablePiece(game, toRank, toFile, 0, -1, srcPiece, fromRank, fromFile)
      ]
      const sameFileReachable = [
         ...findReachablePiece(game, toRank, toFile, 1, 0, srcPiece, fromRank, fromFile),
         ...findReachablePiece(game, toRank, toFile, -1, 0, srcPiece, fromRank, fromFile)
      ]

      if (sameRankReachable.length !== 0 && sameFileReachable.length !== 0) {
         return `R${from}${capture}${to}${tail}`
      }
      else if (sameRankReachable.length !== 0) {
         return `R${from[0]}${capture}${to}${tail}`
      }
      else if (sameFileReachable.length !== 0) {
         return `R${from[1]}${capture}${to}${tail}`
      }
      else {
         return `R${capture}${to}${tail}`
      }
   }
   else if (srcPiece === 'B' || srcPiece === 'b') {
      const reachable = [
         ...findReachablePiece(game, toRank, toFile, 1, 1, srcPiece, fromRank, fromFile),
         ...findReachablePiece(game, toRank, toFile, 1, -1, srcPiece, fromRank, fromFile),
         ...findReachablePiece(game, toRank, toFile, -1, 1, srcPiece, fromRank, fromFile),
         ...findReachablePiece(game, toRank, toFile, -1, -1, srcPiece, fromRank, fromFile)
      ]

      if (reachable.length !== 0) {
         return `B${from}${capture}${to}${tail}`
      }
      else {
         return `B${capture}${to}${tail}`
      }
   }
   else if (srcPiece === 'N' || srcPiece === 'n') {
      const reachable = findReachableKnights(game, toRank, toFile, srcPiece, fromRank, fromFile)
      if (reachable.length !== 0) {
         const sameRankReachable = reachable.filter(square => square[0] === from[0])
         const sameFileReachable = reachable.filter(square => square[1] === from[1])
         const otherReachable = reachable.filter(square => square[0] !== from[0] && square[1] !== from[1])

         if (otherReachable.length !== 0 || (sameRankReachable.length !== 0 && sameFileReachable.length !== 0)) {
            return `N${from}${capture}${to}${tail}`
         }
         else if (sameRankReachable.length !== 0) {
            return `N${from[0]}${capture}${to}${tail}`
         }
         else if (sameFileReachable.length !== 0) {
            return `N${from[1]}${capture}${to}${tail}`
         }
      }
      else {
         return `N${capture}${to}${tail}`
      }
   }

   return `${srcPiece.toUpperCase()}${capture}${to}${tail}`
}

// find squares of all pieces that can reach a specific square
function findReachablePiece(
   game: ChessGame,
   startRank: number,
   startFile: number,
   dRank: number,
   dFile: number,
   specificPiece: Piece,
   excludeRank: number,
   excludeFile: number
): string[] {
   const squares: string[] = []

   let rank = startRank + dRank
   let file = startFile + dFile
   while (rank >= 0 && rank < 8 && file >= 0 && file < 8) {
      const piece = game.position[rank][file]
      if (piece) {
         if (piece === specificPiece) {
            if (rank !== excludeRank || file !== excludeFile) {
               squares.push(rankfile2squareZeroBased(rank, file))
            }
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
   piece: Piece,
   excludeRank: number,
   excludeFile: number
): string[] {
   const ret = []
   for (const [dRank, dFile] of knightDistance) {
      const rank = startRank + dRank
      const file = startFile + dFile
      if (rank >= 0 && rank < 8 && file >= 0 && file < 8) {
         const dstPiece = game.position[rank][file]
         if (dstPiece === piece && (rank !== excludeRank || file !== excludeFile)) {
            ret.push(rankfile2squareZeroBased(rank, file))
         }
      }
   }

   return ret
}
