import { ChessGame, createEmptyChessGame } from "../chess/chessgame"
import { Chessboard3D } from "../chessboard/chessboard"
import { Character } from "../widgets/dialogue"
import { SystemPrompt } from "../widgets/system-prompt"

export interface ContextVariable {
   value: any
   onChange: ((value: any) => void)[]
}

export class Context {
   chessboard: Chessboard3D
   systemPrompt: SystemPrompt

   characters: Record<string, Character>

   chessgame: ChessGame = createEmptyChessGame()
   variables: Record<string, ContextVariable> = {}
   pendingEvents: ((cx: Context) => Promise<void> | any)[] = []

   constructor(
      chessboard: Chessboard3D,
      systemPrompt: SystemPrompt,
      characters: Record<string, Character>
   ) {
      this.chessboard = chessboard
      this.systemPrompt = systemPrompt
      this.characters = characters
   }
}
