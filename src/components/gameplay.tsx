import { h } from 'tsx-dom'
import { DoubleOpenScreen } from '../widgets/double-open-screen'
import { Chessboard3D, chessboardColor, createChessboard3D } from '../chessboard/chessboard'
import { ChessGame, PlayerSide, chessGameToFen, createChessGameFromFen, getPieceName, getPieceOfSide, getPieceSide, isPlayerPiece, rankfile2squareZeroBased, square2rankfileZeroBased } from '../chess/chessgame'
import { Ref, ref } from '../util/ref'
import { sleep } from '../util/sleep'
import { OpeningPosition } from '../chess/opening-book'
import { globalResource } from '..'

import './gameplay.css'
import { openPromotionWindow } from '../widgets/promote'
import { createCheckmateWindow } from './checkmate'
import { trimFEN } from '../chess/trimfen'
import { uci2san } from '../chess/notation'
import { create2DChessboardFromFen } from './skirmish'

function gamePositionToChessboard(game: ChessGame, chessboard: Chessboard3D) {
   chessboard.staticPieces = []

   for (let rank = 0; rank < 8; rank++) {
      for (let file = 0; file < 8; file++) {
         const piece = game.position[rank][file]
         if (piece) {
            const pieceName = getPieceName(piece)
            const pieceColor = getPieceSide(piece)

            chessboard.staticPieces.push({
               piece: pieceName,
               color: pieceColor,
               rank,
               file,
            })
         }
      }
   }
}

function pickBookMove(aiLevel: number, openingPosition: OpeningPosition): string {
   const allowedCPL = [200, 150, 100, 75, 50, 40, 40, 40]
   const possibleMoves = openingPosition.moves
      .filter(move => move[1] <= allowedCPL[aiLevel])
      .sort((a, b) => a[1] - b[1])

   if (possibleMoves.length === 0) {
      // pick the best move
      return openingPosition.moves.sort((a, b) => a[1] - b[1])[0][0]
   }

   const moveIndex = Math.floor(Math.pow(Math.random(), 2) * possibleMoves.length)
   return possibleMoves[moveIndex][0]
}

function isBookMove(openingPosition: OpeningPosition, uciMove: string) {
   const move4chars = uciMove.slice(0, 4)
   return openingPosition.moves.some(move => move[0].startsWith(move4chars))
}

export function createSkirmishGameplayWindow(
   startingPosition: string,
   playerSide: PlayerSide,
   aiLevel: number,
   _chess960: boolean
) {
   const fairyStockfish = globalResource.value.fairyStockfish

   const skirmishGameplayWindow = <DoubleOpenScreen backgroundColor="black" zIndex={3000} />
   const chessGame: Ref<ChessGame> = ref(createChessGameFromFen(startingPosition))

   const selectedSquare: Ref<[number, number] | undefined> = ref(undefined)
   const validMoves: Ref<string[]> = ref([])
   const currentFen: Ref<string> = ref(chessGameToFen(chessGame.value))
   const checkers: Ref<string[]> = ref([])
   const recordedMoves: Ref<string[]> = ref([])

   const getValidMoves = async () => {
      await fairyStockfish.setPosition(currentFen.value)
      validMoves.value = await fairyStockfish.getValidMoves()
   }

   const asyncUpdates = async () => {
      await Promise.all([sleep(300), getValidMoves()])
      await fairyStockfish.uciNewGame()
      await fairyStockfish.setElo(500 + (aiLevel - 1) * 200)

      const minimap = <div class="skirmish-minimap" />
      const scoreSheet = <div class="skirmish-scoresheet" />
      const scoreSheetContainer = <div class="scoresheet-container">{scoreSheet}</div>
      const gameplayCanvas = <canvas class="gameplay-canvas" style={{ opacity: '0%' }} /> as HTMLCanvasElement
      const gameplayHud = <div class="gameplay-hud" />

      skirmishGameplayWindow.appendChild(
         <div class="gameplay-container">
            {gameplayCanvas}
            {gameplayHud}
         </div>
      )

      await sleep(100)
      gameplayHud.style.flex = '0 0 320px'
      await sleep(300)
      gameplayHud.appendChild(minimap)
      gameplayHud.appendChild(scoreSheetContainer)
      await sleep(300)
      const chessboard = createChessboard3D(gameplayCanvas, globalResource.value.gameAsset, playerSide)
      gamePositionToChessboard(chessGame.value, chessboard)
      gameplayCanvas.style.opacity = '100%'
      minimap.append(...create2DChessboardFromFen(startingPosition))

      const selectSquare = async (rank: number, file: number) => {
         selectedSquare.value = [rank, file]
         highlightCheckers()
         chessboard.highlightSquares = [
            {
               rank, file, color: chessboardColor.aquamarine_66
            }
         ]

         const openingBookPosition = globalResource.value.chessData.openingBook[currentFen.value]
         const startSquare = rankfile2squareZeroBased(rank, file)
         for (const validMove of validMoves.value) {
            if (validMove.startsWith(startSquare)) {
               const targetSquare = validMove.slice(2, 4)
               const [targetRank, targetFile] = square2rankfileZeroBased(targetSquare)

               if (openingBookPosition && isBookMove(openingBookPosition, validMove)) {
                  chessboard.highlightSquares.push({
                     rank: targetRank,
                     file: targetFile,
                     color: [0.2, 0.5, 1.0, 0.66]
                  })
               } else {
                  chessboard.highlightSquares.push({
                     rank: targetRank,
                     file: targetFile,
                     color: chessboardColor.aquamarine_66
                  })
               }
            }
         }
      }

      const highlightCheckers = () => {
         if (checkers.value.length === 0) {
            return
         }

         for (const checker of checkers.value) {
            const [rank, file] = square2rankfileZeroBased(checker)
            chessboard.highlightSquares.push({
               rank,
               file,
               color: chessboardColor.red
            })
         }

         // find the king under check
         const kingPiece = getPieceOfSide('k', chessGame.value.turn)
         const kingSquare = chessGame.value.position
            .flatMap((r, rank) => r.map((p, file) => ({ p, rank, file })))
            .find(({ p }) => p === kingPiece)

         if (kingSquare) {
            chessboard.highlightSquares.push({
               rank: kingSquare.rank,
               file: kingSquare.file,
               color: chessboardColor.red
            })
         }
      }

      const playMove = async (startRank: number, startFile: number, targetRank: number, targetFile: number, uci?: string) => {
         // TODO this is just for correct board status update,
         // TODO for animation we still need to some manual check
         if (!uci) {
            uci = rankfile2squareZeroBased(startRank, startFile) + rankfile2squareZeroBased(targetRank, targetFile)
            if (isPromoteMove(chessGame.value, startRank, startFile, targetRank)) {
               const promotionPiece = await openPromotionWindow(chessGame.value.turn, 4000)
               uci += promotionPiece.toLowerCase()
            }
         }

         await fairyStockfish.setPositionWithMoves(currentFen.value, [uci])
         currentFen.value = trimFEN(await fairyStockfish.getCurrentFen())
         minimap.innerHTML = ''
         minimap.append(...create2DChessboardFromFen(currentFen.value))
         const prevGame = chessGame.value
         chessGame.value = createChessGameFromFen(currentFen.value)
         gamePositionToChessboard(chessGame.value, chessboard)

         chessboard.highlightSquares = []
         selectedSquare.value = undefined
         await getValidMoves()

         checkers.value = await fairyStockfish.getCheckers()
         highlightCheckers()

         const sanMove = uci2san(
            prevGame,
            uci,
            checkers.value.length !== 0,
            validMoves.value.length === 0
         )
         recordedMoves.value.push(sanMove)
         if (recordedMoves.value.length % 2 !== 0) {
            scoreSheet.appendChild(<div>{Math.ceil(recordedMoves.value.length / 2)}.</div>)
         }
         scoreSheet.appendChild(<div>{sanMove}</div>)
         scoreSheetContainer.scrollTop = scoreSheetContainer.scrollHeight

         if (chessGame.value.turn !== playerSide) {
            computerPlayMove()
         }
      }

      const computerPlayMove = async () => {
         const openingBookPosition = globalResource.value.chessData.openingBook[currentFen.value]
         if (openingBookPosition && openingBookPosition.moves.length > 0) {
            const move = pickBookMove(aiLevel, openingBookPosition)
            const srcSquare = move.slice(0, 2)
            const targetSquare = move.slice(2, 4)

            const [srcRank, srcFile] = square2rankfileZeroBased(srcSquare)
            const [targetRank, targetFile] = square2rankfileZeroBased(targetSquare)

            await sleep(2000)
            await playMove(srcRank, srcFile, targetRank, targetFile)
            return
         }

         await fairyStockfish.setPosition(currentFen.value)
         const [_unused, bestMove] = await Promise.all([sleep(1000), fairyStockfish.findBestMove(2000)])
         if (bestMove === '(none)') {
            if ((await fairyStockfish.getCheckers()).length > 0) {
               // TODO
               alert("YOU WIN BY CHECKMATE!")
            }
            else {
               // TODO
               alert("STALEMATE!")
            }
            return
         }

         const srcSquare = bestMove.slice(0, 2)
         const targetSquare = bestMove.slice(2, 4)
         const [srcRank, srcFile] = square2rankfileZeroBased(srcSquare)
         const [targetRank, targetFile] = square2rankfileZeroBased(targetSquare)

         await playMove(srcRank, srcFile, targetRank, targetFile, bestMove)

         if (validMoves.value.length === 0) {
            await fairyStockfish.setPosition(currentFen.value)
            if ((await fairyStockfish.getCheckers()).length > 0) {
               await sleep(1000)
               createCheckmateWindow({
                  startPos: startingPosition,
                  movesPlayed: allMovesIntoOneLine(recordedMoves.value),
                  moveCount: Math.ceil(recordedMoves.value.length / 2.0),

                  brilliantCount: 0,
                  excellentCount: 1,
                  goodCount: 26,
                  interestingCount: 4,
                  inaccuracyCount: 0,
                  mistakeCount: 2,
                  blunderCount: 1
               })
            }
            else {
               // TODO
               alert("STALEMATE!")
            }
         }
      }

      chessboard.onClickSquare = async (rank: number, file: number) => {
         if (chessGame.value.turn === playerSide) {
            if (chessGame.value.position[rank][file]) {
               if (isPlayerPiece(chessGame.value.position[rank][file]!, playerSide)) {
                  selectSquare(rank, file)
                  return
               }
            }

            if (selectedSquare.value) {
               const startSquare = rankfile2squareZeroBased(selectedSquare.value[0], selectedSquare.value[1])
               const targetSquare = rankfile2squareZeroBased(rank, file)

               const move = startSquare + targetSquare
               const isValidMove = validMoves.value.find(m => m.startsWith(move)) !== undefined
               if (isValidMove) {
                  playMove(selectedSquare.value[0], selectedSquare.value[1], rank, file)
               }
            }
         }
      }

      chessboard.onRightclick = () => {
         selectedSquare.value = undefined
         chessboard.highlightSquares = []
      }

      if (chessGame.value.turn !== 'white') {
         scoreSheet.appendChild(<div>1.</div>)
         scoreSheet.appendChild(<div>...</div>)
         recordedMoves.value.push('...')
      }

      if (chessGame.value.turn !== playerSide) {
         computerPlayMove()
      }
   }
   asyncUpdates()

   document.body.appendChild(skirmishGameplayWindow)
   return skirmishGameplayWindow
}

// function isCastlingMove(game: ChessGame, startRank: number, startFile: number, targetRank: number, targetFile: number) {
//    const piece = game.position[startRank][startFile]
//    if (piece !== 'k' && piece !== 'K') {
//       return false
//    }

//    if (startRank !== targetRank || startRank !== 0 && startRank !== 7) {
//       return false
//    }

//    if (startFile === 4 && (targetFile === 2 || targetFile === 6)) {
//       return true
//    }

//    return false
// }

function isPromoteMove(game: ChessGame, startRank: number, startFile: number, targetRank: number) {
   const piece = game.position[startRank][startFile]
   if (piece !== 'p' && piece !== 'P') {
      return false
   }

   if (targetRank === 0 || targetRank === 7) {
      return true
   }

   return false
}

// function isEnpassantMove(game: ChessGame, startRank: number, startFile: number, targetRank: number, targetFile: number) {
//    const piece = game.position[startRank][startFile]
//    if (piece !== 'p' && piece !== 'P') {
//       return false
//    }

//    if (targetFile === game.enPassantSquare?.[0] && targetRank === game.enPassantSquare?.[1]) {
//       return true
//    }

//    return false
// }

function allMovesIntoOneLine(moves: string[]): string {
   let halfMove = 0
   let ret = ''

   if (moves[0] === '...') {
      ret += `1... ${moves[1]} `
      halfMove = 2
   }

   for (; halfMove < moves.length; halfMove += 2) {
      ret += `${Math.round(halfMove / 2) + 1}. ${moves[halfMove]} `
      if (halfMove + 1 < moves.length) {
         ret += `${moves[halfMove + 1]} `
      }
   }

   return ret
}
