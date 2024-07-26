import {
   ChessGame,
   chessGameToFen,
   createChessGameFromFen,
   createEmptyChessGame,
   DrawReason,
   isPlayerPiece,
   Piece,
   PlayerSide,
   rankfile2squareZeroBased,
   square2rankfileZeroBased
} from '../chess/chessgame'
import { OpeningPosition } from '../chess/opening-book'
import { trimFEN } from '../chess/trimfen'
import { Chessboard3D, chessboardColor, gamePositionToChessboard } from '../chessboard/chessboard'
import { showDialogue, hideDialogue, speak, Dialogue } from '../widgets/dialogue'
import { addPromptLine, clearPrompt, PromptLevel, SystemPrompt } from '../widgets/system-prompt'
import { loadCharacter } from '../assetloader'
import { CharacterDefs } from '../story/chardef'
import { sleep } from '../util/sleep'

import { globalResource } from '..'
import { openPromotionWindow } from '../widgets/promote'

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
export type MovePlayedHandler = (cx: Context, side: PlayerSide, uciMove: string) => Promise<void> | void
export type PositionChangedHandler = (cx: Context) => Promise<void> | void
export type GameTerminationHandler = (cx: Context, winner: PlayerSide) => Promise<void> | void
export type GameDrawHandler = (cx: Context, reason: DrawReason) => Promise<void> | void

export class Context {
   zIndex: number
   chessboardCanvas: HTMLCanvasElement
   chessboard: Chessboard3D
   dialogue: Dialogue
   systemPrompt: SystemPrompt

   chessgame: ChessGame = createEmptyChessGame()
   playerSide: PlayerSide = 'white'
   currentFen: string = '8/8/8/8/8/8/8/8 w - - 0 1'
   variant: SupportedVariant = 'singleplayer'
   validMoves: string[] = []
   checkers: string[] = []

   chessboardInteract: boolean = true
   persistHighlightSquares: [string, string][] = []

   variables: Record<string, ContextVariable> = {}
   eventPool: Record<string, GenericEventHandler> = {}
   sceneEvents: SceneEvent[] = []

   onSquareClicked: Set<SquareClickHandler> = new Set()
   onMovePlayed: Set<MovePlayedHandler> = new Set()
   onPositionChanged: Set<PositionChangedHandler> = new Set()

   onCheckmate: Set<GameTerminationHandler> = new Set()
   onStalemate: Set<GameTerminationHandler> = new Set()
   onThreefold: Set<GameTerminationHandler> = new Set()
   onInsufficientMaterial: Set<GameTerminationHandler> = new Set()
   onCaptureAll: Set<GameTerminationHandler> = new Set()

   constants: Record<string, any> = {
      ...chessboardColor
   }

   selectedSquare: [number, number] | undefined = undefined

   constructor(
      zIndex: number,
      chessboardCanvas: HTMLCanvasElement,
      chessboard: Chessboard3D,
      dialogue: Dialogue,
      systemPrompt: SystemPrompt
   ) {
      this.zIndex = zIndex
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
                  await self.humanPlayMove(...self.selectedSquare, rank, file)
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
            self.updateHighlightSquares()
         }
      }
   }

   async selectSquare(rank: number, file: number) {
      this.selectedSquare = [rank, file]
      this.chessboard.highlightSquares = [{ rank, file, color: chessboardColor.aquamarine_66 }]

      const openingBookPosition = globalResource.value.chessData.openingBook[this.currentFen]
      const startSquare = rankfile2squareZeroBased(rank, file)

      this.updateHighlightSquares()
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

   async humanPlayMove(
      startRank: number,
      startFile: number,
      targetRank: number,
      targetFile: number,
   ) {
      let uci = rankfile2squareZeroBased(startRank, startFile) + rankfile2squareZeroBased(targetRank, targetFile)
      if (isPromoteMove(this.chessgame, startRank, startFile, targetRank)) {
         this.disableChessboard()
         const promotionPiece = await openPromotionWindow(this.chessgame.turn, this.zIndex + 1000)
         uci += promotionPiece
         this.enableChessboard()
      }

      await this.playMoveUCI(uci)
   }

   updateFenFromChessgame() {
      this.currentFen = chessGameToFen(this.chessgame)
      this.postprocessFen()
   }

   postprocessFen() {
      // if player is white, then replace all black immovable pieces (i) with white immovable pieces (I)
      // so that immovable pieces act as barriers for white player
      if (this.playerSide === 'white') {
         this.currentFen = this.currentFen.replace(/i/g, 'I')
      }
      // on the contray, if player is black, then replace all white immovable pieces (I) with black immovable pieces (i)
      else {
         this.currentFen = this.currentFen.replace(/I/g, 'i')
      }

      // when in single player mode, always set turn to this.playerSide
      if (this.variant === 'singleplayer') {
         if (this.playerSide === 'white') {
            this.currentFen = this.currentFen.replace('b', 'w')
         }
         else {
            this.currentFen = this.currentFen.replace('w', 'b')
         }
      }
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

   async updateCheckers() {
      if (this.variant !== 'chess' && this.variant !== 'chesswith310') {
         // in single player or capture all mode, we don't need to check for checkers
         this.checkers = []
         return
      }

      this.checkers = await globalResource.value.fairyStockfish.getCheckers()
   }

   updateHighlightSquares() {
      this.chessboard.highlightSquares = []
      // first, highlight squares that are persisted
      for (const [square, color] of this.persistHighlightSquares) {
         const [rank, file] = square2rankfileZeroBased(square)
         this.chessboard.highlightSquares.push({ rank, file, color: this.constants[color] })
      }

      // then, draw check highlights
      for (const square of this.checkers) {
         const [rank, file] = square2rankfileZeroBased(square)
         this.chessboard.highlightSquares.push({ rank, file, color: this.constants.red })
      }
   }

   async runEndgameCheck() {
      if (this.variant === 'singleplayer') {
         // game principally never ends in singleplayer mode,
         // so we don't need to check for endgame
         return
      }
   }

   // debug API
   async setPiece(square: string, piece: Piece | undefined) {
      const [rank, file] = square2rankfileZeroBased(square)
      this.chessgame.position[rank][file] = piece
      gamePositionToChessboard(this.chessgame, this.chessboard)
      this.updateFenFromChessgame()
      await this.updateValidMoves()
      await this.updateCheckers()
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

   async enterNonModuleScript(script: string) {
      const pseudoModule = eval(script)
      for (const characterName of pseudoModule.CharacterUse) {
         if (!globalResource.value.characters[characterName]) {
            globalResource.value.characters[characterName] =
               await loadCharacter(characterName, CharacterDefs[characterName], () => {})
         }
      }

      this.eventPool = pseudoModule
      this.pushEvent(pseudoModule.StartingEvent)
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
      await this.updateCheckers()
   }

   setPlayerSide(side: PlayerSide) {
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
      this.postprocessFen()
      gamePositionToChessboard(this.chessgame, this.chessboard)
      await this.updateValidMoves()
      await this.updateCheckers()

      if (!noAutoFade && this.chessboardCanvas.style.opacity === '0') {
         this.chessboardCanvas.style.opacity = '1'
         await sleep(300)
      }
   }

   async playMoveUCI(uciMove: string) {
      const currentSide = this.chessgame.turn

      const fairyStockfish = globalResource.value.fairyStockfish
      await fairyStockfish.setPositionWithMoves(this.currentFen, [uciMove])

      this.currentFen = trimFEN(await fairyStockfish.getCurrentFen())
      this.postprocessFen()

      this.chessgame = createChessGameFromFen(this.currentFen)
      gamePositionToChessboard(this.chessgame, this.chessboard)

      await this.updateValidMoves()
      await this.updateCheckers()
      this.selectedSquare = undefined
      this.chessboard.highlightSquares = []

      for (const handler of this.onMovePlayed) {
         await handler(this, currentSide, uciMove)
      }

      for (const handler of this.onPositionChanged) {
         await handler(this)
      }

      this.runEndgameCheck()
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

   waitForPosition(condition: (chessGame: ChessGame) => boolean): Promise<void> {
      return new Promise<void>(resolve => {
         const handler = async (cx: Context) => {
            if (condition(cx.chessgame)) {
               cx.onPositionChanged.delete(handler)
               resolve()
            }
         }
         this.onPositionChanged.add(handler)
      })
   }

   waitForSpecificMove(expectedUciMove: string, expectedSide?: PlayerSide): Promise<void> {
      return new Promise<void>(resolve => {
         const handler = async (cx: Context, side: PlayerSide, uciMove: string) => {
            if (expectedSide && side !== expectedSide) {
               return
            }

            if (uciMove === expectedUciMove) {
               cx.onMovePlayed.delete(handler)
               resolve()
            }
         }
         this.onMovePlayed.add(handler)
      })
   }

   waitForMove(): Promise<string> {
      return new Promise<string>(resolve => {
         const handler = async (cx: Context, _: PlayerSide, uciMove: string) => {
            cx.onMovePlayed.delete(handler)
            resolve(uciMove)
         }
         this.onMovePlayed.add(handler)
      })
   }

   async addCheckmateHandler(handler: GameTerminationHandler) {
      this.onCheckmate.add(handler)
   }

   async addStalemateHandler(handler: GameTerminationHandler) {
      this.onStalemate.add(handler)
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

   async highlightSquare(square: string, color: string, persist?: boolean) {
      if (persist) {
         this.persistHighlightSquares.push([square, color])
      }
      this.updateHighlightSquares()
      if (!persist) {
         const [rank, file] = square2rankfileZeroBased(square)
         this.chessboard.highlightSquares.push({ rank, file, color: this.constants[color] })
      }
   }

   async sleep(ms: number) {
      await sleep(ms)
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
