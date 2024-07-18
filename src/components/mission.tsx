import { ChessGame, createEmptyChessGame } from "../chess/chessgame"
import { Chessboard3D } from "../chessboard/chessboard"
import { SystemPrompt } from "../widgets/system-prompt"

export interface ContextVariable {
   value: any
   onChange: ((value: any) => void)[]
}

export interface PortraitImage {
   images: ImageData[]
   startX: number
   startY: number
   imageWidth: number
   imageHeight: number
}

export interface Character {
   name: string,
   emotions: Record<string, PortraitImage[]>
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
