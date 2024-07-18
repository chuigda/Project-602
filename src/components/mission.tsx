import { h } from 'tsx-dom'
import { globalResource } from '..'
import { ChessGame, createChessGameFromFen, createEmptyChessGame, PlayerSide, square2rankfileZeroBased } from '../chess/chessgame'
import { Chessboard3D, chessboardColor, createChessboard3D, gamePositionToChessboard } from '../chessboard/chessboard'
import { Character, showDialogue, hideDialogue, speak, createDialogue, Dialogue } from '../widgets/dialogue'
import { DoubleOpenScreen } from '../widgets/double-open-screen'
import { addPromptLine, createSystemPrompt, PromptLevel, SystemPrompt } from '../widgets/system-prompt'
import { sleep } from '../util/sleep'

import './mission.css'

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
   variables: Record<string, ContextVariable> = {}
   pendingEvents: PendingEvent[] = []
   variant: SupportedVariant = 'singleplayer'
   validMoves: string[] = []

   onSquareClicked: Set<SquareClickHandler> = new Set()
   onMovePlayed: Set<MovePlayedHandler> = new Set()
   onPositionChanged: Set<PositionChangedHandler> = new Set()

   constants: Record<string, any> = {
      ...chessboardColor
   }

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
   }

   async setVariant(variant: SupportedVariant) {
      this.variant = variant
   }

   async setFen(fen: string, autoFade?: boolean) {
      if (autoFade && this.chessboardCanvas.style.opacity === '1') {
         this.chessboardCanvas.style.opacity = '0'
         await sleep(300)
      }

      const fairyStockfish = globalResource.value.fairyStockfish

      this.chessgame = createChessGameFromFen(fen)
      gamePositionToChessboard(this.chessgame, this.chessboard)
      await fairyStockfish.setPosition(fen)
      this.validMoves = await fairyStockfish.getValidMoves()

      if (autoFade && this.chessboardCanvas.style.opacity === '0') {
         this.chessboardCanvas.style.opacity = '1'
         await sleep(300)
      }
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

   pushEvent(handler: (cx: Context, ...args: any[]) => Promise<void> | any, ...args: any[]) {
      this.pendingEvents.push({ handler: handler, args })
   }

   async handleEvents(): Promise<void> {
      while (true) {
         const event = this.pendingEvents.shift()
         if (event) {
            await event.handler(this, ...event.args)
         }
         else {
            break
         }
      }
   }
}

export function showTestMissionWindow(zIndex: number): HTMLElement {
   const windowBackground = <DoubleOpenScreen backgroundColor="black" zIndex={zIndex} />
   const gameplayCanvas = <canvas class="gameplay-canvas" style={{ opacity: '0%' }} /> as HTMLCanvasElement
   const systemPrompt = createSystemPrompt(zIndex + 1)
   const dialogue = createDialogue(zIndex + 2)

   const asyncUpdates = async () => {
      await sleep(300)
      windowBackground.appendChild(<div class="gameplay-container">
         {gameplayCanvas}
      </div>)
      await sleep(300)

      const chessboard = createChessboard3D(gameplayCanvas, globalResource.value.gameAsset, 'white')
   }
   asyncUpdates()

   document.body.appendChild(windowBackground)
   return windowBackground
}
