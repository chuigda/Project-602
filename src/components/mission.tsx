import { h } from 'tsx-dom'
import { globalResource } from '..'
import { ChessGame, chessGameToFen, createChessGameFromFen, createEmptyChessGame, isPlayerPiece, PlayerSide, rankfile2squareZeroBased, square2rankfileZeroBased } from '../chess/chessgame'
import { Chessboard3D, chessboardColor, createChessboard3D, gamePositionToChessboard } from '../chessboard/chessboard'
import { Character, showDialogue, hideDialogue, speak, createDialogue, Dialogue } from '../widgets/dialogue'
import { DoubleOpenScreen } from '../widgets/double-open-screen'
import { addPromptLine, createSystemPrompt, PromptLevel, SystemPrompt } from '../widgets/system-prompt'
import { sleep } from '../util/sleep'

import './mission.css'
import { OpeningPosition } from '../chess/opening-book'
import { trimFEN } from '../chess/trimfen'
import { loadCharacter } from '../assetloader'
import { CharacterDefs } from '../story/chardef'

export interface ContextVariable {
   value: any
   onChange: ((value: any) => void)[]
}

export type SupportedVariant = 'chess' | 'captureall' | 'chesswith310' | 'captureall310' | 'singleplayer'

export type GenericEventHandler = (cx: Context, ...args: any[]) => Promise<void> | void
export type SquareClickHandler = (cx: Context, square: string) => Promise<void> | void
export type MovePlayedHandler = (cx: Context, side: PlayerSide, square: string) => Promise<void> | void
export type PositionChangedHandler = (cx: Context) => Promise<void> | void

export interface PendingEvent {
   handler: GenericEventHandler,
   args: any[]
}

export class Context {
   chessboardCanvas: HTMLCanvasElement
   chessboard: Chessboard3D
   dialogue: Dialogue
   systemPrompt: SystemPrompt

   characters: Record<string, Character> = {}

   chessgame: ChessGame = createEmptyChessGame()
   currentFen: string = '8/8/8/8/8/8/8/8 w - - 0 1'
   variables: Record<string, ContextVariable> = {}
   eventPool: Record<string, GenericEventHandler> = {}
   pendingEvents: PendingEvent[] = []
   variant: SupportedVariant = 'singleplayer'
   validMoves: string[] = []

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
         if (self.chessgame.turn === 'white') {
            if (self.chessgame.position[rank][file]) {
               if (isPlayerPiece(self.chessgame.position[rank][file]!, 'white')) {
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

   async playMove(startRank: number, startFile: number, targetRank: number, targetFile: number, uci?: string) {
      // TODO migrate from skirmish code

      const fairyStockfish = globalResource.value.fairyStockfish
      await fairyStockfish.setPositionWithMoves(
         this.currentFen,
         [uci || rankfile2squareZeroBased(startRank, startFile) + rankfile2squareZeroBased(targetRank, targetFile)]
      )

      this.currentFen = trimFEN(await fairyStockfish.getCurrentFen())
      if (this.variant === 'singleplayer') {
         this.currentFen = this.currentFen.replace('b', 'w')
      }

      this.chessgame = createChessGameFromFen(this.currentFen)
      gamePositionToChessboard(this.chessgame, this.chessboard)

      await fairyStockfish.setPosition(this.currentFen)
      this.validMoves = await fairyStockfish.getValidMoves()
      console.info(this.validMoves)
      this.selectedSquare = undefined
      this.chessboard.highlightSquares = []

      for (const handler of this.onPositionChanged) {
         await handler(this)
      }
      console.info(this)
   }

   // public APIs

   async enterScript(scriptFile: string) {
      const code = await importWithoutVite(scriptFile)
      for (const characterName of code.CharacterUse) {
         if (!this.characters[characterName]) {
            this.characters[characterName] = await loadCharacter(characterName, CharacterDefs[characterName], () => {})
         }
      }

      this.eventPool = code
      this.pushEvent(code.StartingEvent)
      this.handleEvents()
   }

   async setVariant(variant: SupportedVariant) {
      this.variant = variant
      await globalResource.value.fairyStockfish.setVariant(variant)
   }

   async setFen(fen: string, noAutoFade?: boolean) {
      if (!noAutoFade && this.chessboardCanvas.style.opacity === '1') {
         this.chessboardCanvas.style.opacity = '0'
         await sleep(300)
      }

      const fairyStockfish = globalResource.value.fairyStockfish

      this.chessgame = createChessGameFromFen(fen)
      gamePositionToChessboard(this.chessgame, this.chessboard)
      this.currentFen = fen
      await fairyStockfish.setPosition(fen)
      this.validMoves = await fairyStockfish.getValidMoves()

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
      await speak(this.dialogue, this.characters[speaker], speaker, emotion || '常态', text)
   }

   async showPrompt(level: PromptLevel, text: string): Promise<void> {
      await addPromptLine(this.systemPrompt, level, text)
   }

   async highlightSquare(square: string, color: string) {
      const [rank, file] = square2rankfileZeroBased(square)
      this.chessboard.highlightSquares.push({ rank, file, color: this.constants[color] })
   }

   pushEvent(handlerName: string, ...args: any[]) {
      this.pendingEvents.push({ handler: this.eventPool[handlerName], args })
   }

   async handleEvents(): Promise<void> {
      while (true) {
         const event = this.pendingEvents.shift()
         if (event) {
            console.info(event)
            await event.handler(this, ...event.args)
         }
         else {
            break
         }
      }
   }
}

export async function showTestMissionWindow(zIndex: number): Promise<HTMLElement> {
   const windowBackground = <DoubleOpenScreen backgroundColor="black" zIndex={zIndex} />

   const asyncUpdates = async () => {
      await sleep(300)
      const gameplayCanvas = <canvas class="gameplay-canvas" style={{ opacity: '0%' }} /> as HTMLCanvasElement
      const systemPrompt = createSystemPrompt(zIndex + 1)
      const dialogue = await createDialogue(zIndex + 2)

      windowBackground.appendChild(<div class="gameplay-container">
         {gameplayCanvas}
      </div>)
      await sleep(300)

      const chessboard = createChessboard3D(gameplayCanvas, globalResource.value.gameAsset, 'white')

      const cx = new Context(gameplayCanvas, chessboard, dialogue, systemPrompt)
      cx.enterScript('/story/1_awakening.js')
   }
   asyncUpdates()

   document.body.appendChild(windowBackground)
   return windowBackground
}

function isBookMove(openingPosition: OpeningPosition, uciMove: string) {
   const move4chars = uciMove.slice(0, 4)
   return openingPosition.moves.some(move => move[0].startsWith(move4chars))
}