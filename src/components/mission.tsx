import { globalResource } from ".."
import { ChessGame, createChessGameFromFen, createEmptyChessGame } from "../chess/chessgame"
import { Chessboard3D } from "../chessboard/chessboard"
import { Character, Dialogue, showDialogue, hideDialogue, speak } from "../widgets/dialogue"
import { addPromptLine, PromptLevel, SystemPrompt } from "../widgets/system-prompt"

export interface ContextVariable {
   value: any
   onChange: ((value: any) => void)[]
}

export type SupportedVariant = 'chess' | 'captureall' | 'chesswith310' | 'captureall310' | 'singleplayer'

export class Context {
   chessboard: Chessboard3D
   dialogue: Dialogue
   systemPrompt: SystemPrompt

   characters: Record<string, Character>

   chessgame: ChessGame = createEmptyChessGame()
   variables: Record<string, ContextVariable> = {}
   pendingEvents: ((cx: Context) => Promise<void> | any)[] = []
   variant: SupportedVariant = 'singleplayer'

   validMoves: string[] = []

   constructor(
      chessboard: Chessboard3D,
      dialogue: Dialogue,
      systemPrompt: SystemPrompt,
      characters: Record<string, Character>
   ) {
      this.chessboard = chessboard
      this.dialogue = dialogue
      this.systemPrompt = systemPrompt
      this.characters = characters
   }

   async setVariant(variant: SupportedVariant) {
      this.variant = variant
   }

   async setFen(fen: string) {
      const fairyStockfish = globalResource.value.fairyStockfish

      this.chessgame = createChessGameFromFen(fen)
      await fairyStockfish.setPosition(fen)
      this.validMoves = await fairyStockfish.getValidMoves()
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
}
