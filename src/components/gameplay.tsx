import { h } from 'tsx-dom'
import { DoubleOpenScreen } from '../widgets/double-open-screen'
import { Chessboard3D, chessboardColor, createChessboard3D } from '../chessboard/chessboard'
import { ChessGame, Piece, PlayerSide, chessGameToFen, createChessGameFromFen, getPieceName, getPieceOfSide, getPieceSide, isPlayerPiece } from '../chess/chessgame'
import { Ref, ref } from '../util/ref'
import { sleep } from '../util/sleep'
import { OpeningPosition } from '../chess/opening-book'
import { globalResource } from '..'

import './gameplay.css'

const fileChars = 'abcdefgh'

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
      // just pick a random move
      return openingPosition.moves[Math.floor(Math.random() * openingPosition.moves.length)][0]
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
   chess960: boolean
) {
   const fairyStockfish = globalResource.value.fairyStockfish

   const skirmishGameplayWindow = <DoubleOpenScreen backgroundColor="black" zIndex={3000} />
   const chessGame = createChessGameFromFen(startingPosition)

   const selectedSquare: Ref<[number, number] | undefined> = ref(undefined)
   const validMoves: Ref<string[]> = ref([])
   const currentFen: Ref<string> = ref(chessGameToFen(chessGame))

   const getValidMoves = async () => {
      await fairyStockfish.setPosition(currentFen.value)
      validMoves.value = await fairyStockfish.getValidMoves()
      console.info('valid moves: ', validMoves.value)
   }

   const asyncUpdates = async () => {
      await Promise.all([sleep(300), getValidMoves()])

      const gameplayCanvas = <canvas class="gameplay-canvas" /> as HTMLCanvasElement
      skirmishGameplayWindow.appendChild(gameplayCanvas)

      await sleep(100)
      const chessboard = createChessboard3D(gameplayCanvas, globalResource.value.gameAsset, playerSide)
      gamePositionToChessboard(chessGame, chessboard)

      const selectSquare = async (rank: number, file: number) => {
         selectedSquare.value = [rank, file]
         chessboard.highlightSquares = [
            {
               rank, file, color: [1.0, 1.0, 0.0, 0.66]
            }
         ]

         const openingBookPosition = globalResource.value.chessData.openingBook[currentFen.value]
         const startSquare = fileChars[file] + (rank + 1)
         for (const validMove of validMoves.value) {
            if (validMove.startsWith(startSquare)) {
               const targetSquare = validMove.slice(2, 4)
               const targetRank = parseInt(targetSquare[1]) - 1
               const targetFile = fileChars.indexOf(targetSquare[0])

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

      const playMove = async (startRank: number, startFile: number, targetRank: number, targetFile: number, uci?: string) => {
         if (isCastlingMove(chessGame, startRank, startFile, targetRank, targetFile)) {
            const rookFile = targetFile === 2 ? 0 : 7
            const rookTargetFile = targetFile === 2 ? 3 : 5

            chessGame.position[targetRank][targetFile] = chessGame.position[startRank][startFile]
            chessGame.position[startRank][startFile] = undefined
            chessGame.position[targetRank][rookTargetFile] = chessGame.position[targetRank][rookFile]
            chessGame.position[targetRank][rookFile] = undefined
         }
         else if (isPromoteMove(chessGame, startRank, startFile, targetRank, targetFile)) {
            if (uci) {
               chessGame.position[targetRank][targetFile] = getPieceOfSide(uci[4] as Piece, chessGame.turn)
            }
            else {
               console.info(chessGame.turn)
               chessGame.position[targetRank][targetFile] = getPieceOfSide('q', chessGame.turn)
            }
            chessGame.position[startRank][startFile] = undefined
         }
         else if (isEnpassantMove(chessGame, startRank, startFile, targetRank, targetFile)) {
            chessGame.position[targetRank][targetFile] = chessGame.position[startRank][startFile]
            chessGame.position[startRank][startFile] = undefined
            chessGame.position[startRank][targetFile] = undefined
         }
         else {
            chessGame.position[targetRank][targetFile] = chessGame.position[startRank][startFile]
            chessGame.position[startRank][startFile] = undefined
         }
         chessGame.turn = chessGame.turn === 'white' ? 'black' : 'white'

         gamePositionToChessboard(chessGame, chessboard)
         chessboard.highlightSquares = []
         selectedSquare.value = undefined
         currentFen.value = chessGameToFen(chessGame)
         await getValidMoves()

         if (chessGame.turn !== playerSide) {
            computerPlayMove()
         }
      }

      const computerPlayMove = async () => {
         const openingBookPosition = globalResource.value.chessData.openingBook[currentFen.value]
         if (openingBookPosition && openingBookPosition.moves.length > 0) {
            const move = pickBookMove(aiLevel, openingBookPosition)
            const srcSquare = move.slice(0, 2)
            const targetSquare = move.slice(2, 4)
            const srcRank = parseInt(srcSquare[1]) - 1
            const srcFile = fileChars.indexOf(srcSquare[0])
            const targetRank = parseInt(targetSquare[1]) - 1
            const targetFile = fileChars.indexOf(targetSquare[0])

            await sleep(2000)
            await playMove(srcRank, srcFile, targetRank, targetFile)
            return
         }

         await fairyStockfish.setPosition(currentFen.value)
         await fairyStockfish.setElo(500 + aiLevel * 200)
         const bestMove = await fairyStockfish.findBestMove(5000)
         console.info('bestmove', bestMove)
         const srcSquare = bestMove.slice(0, 2)
         const targetSquare = bestMove.slice(2, 4)
         const srcRank = parseInt(srcSquare[1]) - 1
         const srcFile = fileChars.indexOf(srcSquare[0])
         const targetRank = parseInt(targetSquare[1]) - 1
         const targetFile = fileChars.indexOf(targetSquare[0])

         await playMove(srcRank, srcFile, targetRank, targetFile, bestMove)
      }

      chessboard.onClickSquare = async (rank: number, file: number) => {
         if (chessGame.turn === playerSide) {
            if (chessGame.position[rank][file]) {
               if (isPlayerPiece(chessGame.position[rank][file]!, playerSide)) {
                  selectSquare(rank, file)
                  return
               }
            }

            if (selectedSquare.value) {
               const startSquare = fileChars[selectedSquare.value[1]] + (selectedSquare.value[0] + 1)
               const targetSquare = fileChars[file] + (rank + 1)

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

      if (chessGame.turn !== playerSide) {
         computerPlayMove()
      }
   }
   asyncUpdates()

   document.body.appendChild(skirmishGameplayWindow)
   return skirmishGameplayWindow
}

function isCastlingMove(game: ChessGame, startRank: number, startFile: number, targetRank: number, targetFile: number) {
   const piece = game.position[startRank][startFile]
   if (piece !== 'k' && piece !== 'K') {
      return false
   }

   if (startRank !== targetRank || startRank !== 0 && startRank !== 7) {
      return false
   }

   if (startFile === 4 && (targetFile === 2 || targetFile === 6)) {
      return true
   }

   if (startFile === 4 && (targetFile === 2 || targetFile === 6)) {
      return true
   }

   return false
}

function isPromoteMove(game: ChessGame, startRank: number, startFile: number, targetRank: number, targetFile: number) {
   const piece = game.position[startRank][startFile]
   if (piece !== 'p' && piece !== 'P') {
      return false
   }

   if (targetRank === 0 || targetRank === 7) {
      return true
   }

   return false
}

function isEnpassantMove(game: ChessGame, startRank: number, startFile: number, targetRank: number, targetFile: number) {
   const piece = game.position[startRank][startFile]
   if (piece !== 'p' && piece !== 'P') {
      return false
   }

   if (targetFile === game.enPassantSquare?.[0] && targetRank === game.enPassantSquare?.[1]) {
      return true
   }

   return false
}
