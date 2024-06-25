import { h } from 'tsx-dom'
import { DoubleOpenScreen } from '../widgets/double-open-screen'
import { Chessboard3D, chessboardColor, createChessboard3D } from '../chessboard/chessboard'
import { ChessGame, PlayerSide, chessGameToFen, createChessGameFromFen, getPieceName, getPieceSide, isPlayerPiece } from '../chess/chessgame'
import { Ref, ref } from '../util/ref'
import { sleep } from '../util/sleep'
import { globalResource } from '..'

import './gameplay.css'
import { OpeningPosition } from '../chess/opening-book'

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
   }

   const computerPlayMove = async () => {
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

         console.info(currentFen.value)
         const openingBookPosition = globalResource.value.chessData.openingBook[currentFen.value]
         console.info(openingBookPosition)

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

      const playMove = async (startRank: number, startFile: number, targetRank: number, targetFile: number) => {
         chessGame.position[targetRank][targetFile] = chessGame.position[startRank][startFile]
         chessGame.position[startRank][startFile] = undefined
         chessGame.turn = playerSide === 'white' ? 'black' : 'white'

         gamePositionToChessboard(chessGame, chessboard)
         await getValidMoves()
         chessboard.highlightSquares = []
         selectedSquare.value = undefined
         currentFen.value = chessGameToFen(chessGame)

         if (chessGame.turn !== playerSide) {
            computerPlayMove()
         }
      }

      chessboard.onClickSquare = async (rank: number, file: number) => {
         if (chessGame.turn === playerSide) {
            if (chessGame.position[rank][file]) {
               if (isPlayerPiece(chessGame.position[rank][file]!, playerSide)) {
                  selectSquare(rank, file)
               }
               return
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
