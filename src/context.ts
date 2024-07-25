import {
   ChessGame,
   chessGameToFen,
   createChessGameFromFen,
   createEmptyChessGame,
   isPlayerPiece,
   Piece,
   PlayerSide,
   rankfile2squareZeroBased,
   square2rankfileZeroBased
} from './chess/chessgame'
import { OpeningPosition } from './chess/opening-book'
import { trimFEN } from './chess/trimfen'
import { Chessboard3D, chessboardColor, gamePositionToChessboard } from './chessboard/chessboard'
import { showDialogue, hideDialogue, speak, Dialogue } from './widgets/dialogue'
import { addPromptLine, clearPrompt, PromptLevel, SystemPrompt } from './widgets/system-prompt'
import { loadCharacter } from './assetloader'
import { CharacterDefs } from './story/chardef'
import { sleep } from './util/sleep'

import { globalResource } from '.'

export interface ContextVariable {
   value: any
   onChange: ((value: any) => void)[]
}

export type SupportedVariant =
   'chess'
   | 'captureall'
   | 'chesswith310'
   | 'captureall310'
   | 'singleplayer'

export type GenericEventHandler = (cx: Context, ...args: any[]) => Promise<void> | void
export type SceneEvent = (cx: Context) => Promise<void> | void
export type SquareClickHandler = (cx: Context, square: string) => Promise<void> | void
export type MovePlayedHandler = (cx: Context, side: PlayerSide, square: string) => Promise<void> | void
export type PositionChangedHandler = (cx: Context) => Promise<void> | void

export class Context {
   chessboardCanvas: HTMLCanvasElement
   chessboard: Chessboard3D
   dialogue: Dialogue
   systemPrompt: SystemPrompt

   chessgame: ChessGame = createEmptyChessGame()
   playerSide: PlayerSide = 'white'
   currentFen: string = '8/8/8/8/8/8/8/8 w - - 0 1'
   variant: SupportedVariant = 'singleplayer'
   validMoves: string[] = []
   chessboardInteract: boolean = true

   variables: Record<string, ContextVariable> = {}
   eventPool: Record<string, GenericEventHandler> = {}
   sceneEvents: SceneEvent[] = []

   onSquareClicked: Set<SquareClickHandler> = new Set()
   onMovePlayed: Set<MovePlayedHandler> = new Set()
   onPositionChanged: Set<PositionChangedHandler> = new Set()

   constants: Record<string, any> = {
      ...chessboardColor
   }

   selectedSquare: [number, number] | undefined = undefined

   constructor(
      chessboardCanvas: HTMLCanvasElement,
      chessboard: Chessboard3D,
      dialogue: Dialogue,
      systemPrompt: SystemPrompt
   ) {
      this.chessboardCanvas = chessboardCanvas
      this.chessboard = chessboard
      this.dialogue = dialogue
      this.systemPrompt = systemPrompt

      const self = this
      this.chessboard.onClickSquare = async (rank: number, file: number) => {
         if (!this.chessboardInteract) {
            return
         }

         if (self.chessgame.turn === this.playerSide) {
            if (self.chessgame.position[rank][file]) {
               if (isPlayerPiece(self.chessgame.position[rank][file]!, this.playerSide)) {
                  self.selectSquare(rank, file)
                  return
               }
            }

            if (self.selectedSquare) {
               const startSquare = rankfile2squareZeroBased(...self.selectedSquare)
               const targetSquare = rankfile2squareZeroBased(rank, file)

               const move = startSquare + targetSquare
               const isValidMove = self.validMoves.find(m => m.startsWith(move)) !== undefined
               if (isValidMove) {
                  await self.playMove(...self.selectedSquare, rank, file)
               }
            }
         }
      }

      this.chessboard.onRightclick = async () => {
         if (!this.chessboardInteract) {
            return
         }

         if (self.selectedSquare) {
            self.selectedSquare = undefined
            self.chessboard.highlightSquares = []
         }
      }
   }

   async selectSquare(rank: number, file: number) {
      this.selectedSquare = [rank, file]
      this.chessboard.highlightSquares = [{ rank, file, color: chessboardColor.aquamarine_66 }]

      const openingBookPosition = globalResource.value.chessData.openingBook[this.currentFen]
      const startSquare = rankfile2squareZeroBased(rank, file)

      for (const validMove of this.validMoves) {
         if (validMove.startsWith(startSquare)) {
            const targetSquare = validMove.slice(2, 4)
            const [targetRank, targetFile] = square2rankfileZeroBased(targetSquare)

            if (openingBookPosition && isBookMove(openingBookPosition, validMove)) {
               this.chessboard.highlightSquares.push({
                  rank: targetRank,
                  file: targetFile,
                  color: [0.2, 0.5, 1.0, 0.66]
               })
            } else {
               this.chessboard.highlightSquares.push({
                  rank: targetRank,
                  file: targetFile,
                  color: chessboardColor.aquamarine_66
               })
            }
         }
      }

      for (const handler of this.onSquareClicked) {
         await handler(this, rankfile2squareZeroBased(rank, file))
      }
   }

   async playMove(
      startRank: number,
      startFile: number,
      targetRank: number,
      targetFile: number,
      uci?: string
   ) {
      // TODO migrate from skirmish code, implement promotion
      uci = uci ?? rankfile2squareZeroBased(startRank, startFile) + rankfile2squareZeroBased(targetRank, targetFile)

      const fairyStockfish = globalResource.value.fairyStockfish
      await fairyStockfish.setPositionWithMoves(
         this.currentFen,
         [uci]
      )

      this.currentFen = trimFEN(await fairyStockfish.getCurrentFen())
      if (this.variant === 'singleplayer') {
         if (this.playerSide === 'white') {
            this.currentFen = this.currentFen.replace('b', 'w')
         }
         else {
            this.currentFen = this.currentFen.replace('w', 'b')
         }
      }

      this.chessgame = createChessGameFromFen(this.currentFen)
      gamePositionToChessboard(this.chessgame, this.chessboard)

      await this.updateValidMoves()
      this.selectedSquare = undefined
      this.chessboard.highlightSquares = []

      for (const handler of this.onPositionChanged) {
         await handler(this)
      }
   }

   updateFenFromChessgame() {
      this.currentFen = chessGameToFen(this.chessgame)
   }

   async updateValidMoves() {
      if (this.currentFen.startsWith('8/8/8/8/8/8/8/8')) {
         this.validMoves = []
      }
      else {
         await globalResource.value.fairyStockfish.setPosition(this.currentFen)
         this.validMoves = await globalResource.value.fairyStockfish.getValidMoves()
      }
   }

   // debug API
   async setPiece(square: string, piece: Piece | undefined) {
      const [rank, file] = square2rankfileZeroBased(square)
      this.chessgame.position[rank][file] = piece
      gamePositionToChessboard(this.chessgame, this.chessboard)
      this.updateFenFromChessgame()
      await this.updateValidMoves()
   }

   // public APIs

   async setChessboardInteract(enable: boolean) {
      this.chessboardInteract = enable
   }

   async enableChessboard() {
      this.chessboardInteract = true
   }

   async disableChessboard() {
      this.chessboardInteract = false
   }

   async enterScript(scriptFile: string) {
      const code = await importNoVite(scriptFile)
      for (const characterName of code.CharacterUse) {
         if (!globalResource.value.characters[characterName]) {
            globalResource.value.characters[characterName] =
               await loadCharacter(characterName, CharacterDefs[characterName], () => {})
         }
      }

      this.eventPool = code
      this.pushEvent(code.StartingEvent)
   }

   async setVariant(variant: SupportedVariant) {
      this.variant = variant
      if (variant === 'singleplayer') {
         // use "chesswith310" rules, and we will manually switch side
         // when in normal chess mode, when there's no opponent king, fairy-stockfish could search moves for one player normally
         // but if captureall rule is used, fairy-stockfish will determine the position is winning for one side
         // and will not do any search
         await globalResource.value.fairyStockfish.setVariant('chesswith310')
         if (this.chessgame.turn != this.playerSide) {
            this.chessgame.turn = this.playerSide
         }
      }
      else {
         await globalResource.value.fairyStockfish.setVariant(variant)
      }

      this.updateFenFromChessgame()
      await this.updateValidMoves()
   }

   async setPlayerSide(side: PlayerSide) {
      this.playerSide = side
      this.chessboard.orientation = side
   }

   async setChessboardDisplay(display: boolean) {
      if (display) {
         this.chessboardCanvas.style.opacity = '1'
         await sleep(300)
      }
      else {
         this.chessboardCanvas.style.opacity = '0'
         await sleep(300)
      }
   }

   async setFen(fen: string, noAutoFade?: boolean) {
      if (!noAutoFade && this.chessboardCanvas.style.opacity === '1') {
         this.chessboardCanvas.style.opacity = '0'
         await sleep(300)
      }

      this.chessgame = createChessGameFromFen(fen)
      this.currentFen = fen
      gamePositionToChessboard(this.chessgame, this.chessboard)
      await this.updateValidMoves()

      if (!noAutoFade && this.chessboardCanvas.style.opacity === '0') {
         this.chessboardCanvas.style.opacity = '1'
         await sleep(300)
      }
   }

   waitForSquareClicked(square: string): Promise<void> {
      return new Promise<void>(resolve => {
         const handler = async (cx: Context, clickedSquare: string) => {
            if (clickedSquare === square) {
               cx.onSquareClicked.delete(handler)
               resolve()
            }
         }
         this.onSquareClicked.add(handler)
      })
   }

   waitForSpecificPosition(fen: string): Promise<void> {
      return new Promise<void>(resolve => {
         const handler = async (cx: Context) => {
            if (chessGameToFen(cx.chessgame).startsWith(fen)) {
               cx.onPositionChanged.delete(handler)
               resolve()
            }
         }
         this.onPositionChanged.add(handler)
      })
   }

   async showDialogue() {
      await showDialogue(this.dialogue)
   }

   async hideDialogue() {
      await hideDialogue(this.dialogue)
   }

   async speak(speaker: string, text: string, emotion?: string): Promise<void> {
      await speak(
         this.dialogue,
         globalResource.value.characters[speaker],
         speaker,
         emotion || '常态',
         text
      )
   }

   async showPrompt(level: PromptLevel, text: string): Promise<void> {
      await addPromptLine(this.systemPrompt, level, text)
   }

   async highlightSquare(square: string, color: string) {
      const [rank, file] = square2rankfileZeroBased(square)
      this.chessboard.highlightSquares.push({ rank, file, color: this.constants[color] })
   }

   pushEvent(handlerName: string) {
      this.sceneEvents.push(this.eventPool[`Event_${handlerName}`])
   }

   async handleEvents(): Promise<void> {
      while (true) {
         const eventFn = this.sceneEvents.shift()
         clearPrompt(this.systemPrompt)
         if (!eventFn) {
            break
         }

         await eventFn(this)
      }
   }
}

function isBookMove(openingPosition: OpeningPosition, uciMove: string) {
   const move4chars = uciMove.slice(0, 4)
   return openingPosition.moves.some(move => move[0].startsWith(move4chars))
}
