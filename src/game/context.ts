import {
   ChessGame,
   chessGameToFen,
   createChessGameFromFen,
   createEmptyChessGame,
   DrawReason,
   getPieceOfSide,
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

export type SceneEvent = (cx: Context) => Promise<void> | void
export type SquareClickHandler = (cx: Context, square: string) => Promise<void> | void
export type MovePlayedHandler = (cx: Context, side: PlayerSide, uciMove: string) => Promise<void> | void
export type PositionChangedHandler = (cx: Context) => Promise<void> | void
export type GameWLHandler = (cx: Context, winner: PlayerSide) => Promise<void> | void
export type GameDrawHandler = (cx: Context, reason: DrawReason) => Promise<void> | void

export class Context {
   // UI 组件
   zIndex: number
   chessboardCanvas: HTMLCanvasElement
   chessboard: Chessboard3D
   dialogue: Dialogue
   systemPrompt: SystemPrompt

   // 游戏逻辑数据
   chessgame: ChessGame = createEmptyChessGame()
   playerSide: PlayerSide = 'white'
   currentFen: string = '8/8/8/8/8/8/8/8 w - - 0 1'
   variant: SupportedVariant = 'singleplayer'
   validMoves: string[] = []
   checkers: string[] = []

   halfMovesSinceLastCaptureOrPawnMove: number = 0
   positionHistory: Record<string, number> = {}

   // 棋盘交互数据
   chessboardInteract: boolean = true
   persistHighlightSquares: [string, string][] = []
   selectedSquare: [number, number] | undefined = undefined

   // 变量与事件处理
   eventPool: Record<string, SceneEvent> = {}
   variables: Record<string, ContextVariable> = {}
   onSquareClicked: Set<SquareClickHandler> = new Set()
   onMovePlayed: Set<MovePlayedHandler> = new Set()
   onPositionChanged: Set<PositionChangedHandler> = new Set()
   // 对局结束事件
   onCheckmate: Set<GameWLHandler> = new Set()
   onCaptureAll: Set<GameWLHandler> = new Set()
   onDraw: Set<GameDrawHandler> = new Set()

   // 场景事件队列
   sceneEvents: SceneEvent[] = []

   // 常量表
   constants: Record<string, any> = {
      ...chessboardColor
   }

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
      this.postProcessPosition()
   }

   postProcessPosition() {
      // 当处于单人模式时，需要手动切换棋手
      if (this.variant === 'singleplayer') {
         this.chessgame.turn = this.playerSide
         if (this.playerSide === 'white') {
            this.currentFen = this.currentFen.replace('b', 'w')
         }
         else {
            this.currentFen = this.currentFen.replace('w', 'b')
         }
      }

      if (this.chessgame.turn === 'white') {
         // 如果当前轮到白棋走，把所有的屏障单位都设置为白方单位，这样就能阻止白方吃掉屏障单位
         this.currentFen = this.currentFen.replace(/i/g, 'I')
      }
      else {
         // 同样地，如果当前轮到黑棋走，把所有的屏障单位都设置为黑方单位
         this.currentFen = this.currentFen.replace(/I/g, 'i')
      }
      // 如此一来屏障单位就对游戏双方表现为完全的屏障
   }

   async updateValidMoves() {
      if (this.currentFen.startsWith('8/8/8/8/8/8/8/8')) {
         // 在特定的游戏模式下，喂给 fairy-stockfish 一个空棋盘可能引起崩溃
         this.validMoves = []
      }
      else {
         await globalResource.value.fairyStockfish.setPosition(this.currentFen)
         this.validMoves = await globalResource.value.fairyStockfish.getValidMoves()
      }
   }

   async updateCheckers() {
      if (this.variant !== 'chess' && this.variant !== 'chesswith310') {
         // 在单人模式或者 captureall 模式下没有将军的概念
         this.checkers = []
         return
      }

      this.checkers = await globalResource.value.fairyStockfish.getCheckers()
   }

   updateHighlightSquares() {
      // 清空所有高亮
      this.chessboard.highlightSquares = []

      // 高亮所有将军者
      for (const square of this.checkers) {
         const [rank, file] = square2rankfileZeroBased(square)
         this.chessboard.highlightSquares.push({ rank, file, color: this.constants.red })
      }

      if (this.checkers.length > 0) {
         // 高亮被将军的王
         const kingPiece = getPieceOfSide('k', this.chessgame.turn)
         const kingSquare = this.chessgame.position
            .flatMap((r, rank) => r.map((p, file) => ({ p, rank, file })))
            .find(({ p }) => p === kingPiece)

         if (kingSquare) {
            this.chessboard.highlightSquares.push({
               rank: kingSquare.rank,
               file: kingSquare.file,
               color: this.constants.red
            })
         }
      }

      // 高亮被持久化的方格
      for (const [square, color] of this.persistHighlightSquares) {
         const [rank, file] = square2rankfileZeroBased(square)
         this.chessboard.highlightSquares.push({ rank, file, color: this.constants[color] })
      }
   }

   async runEndgameCheck() {
      if (this.variant === 'singleplayer') {
         // 原则上来说单人模式下游戏不会结束，结束场景是使用用户定义事件来实现的
         // 这里不需要考虑
         return
      }
   }

   // 调试用 API
   async setPiece(square: string, piece: Piece | undefined) {
      const [rank, file] = square2rankfileZeroBased(square)
      this.chessgame.position[rank][file] = piece
      gamePositionToChessboard(this.chessgame, this.chessboard)
      this.updateFenFromChessgame()
      await this.updateValidMoves()
      await this.updateCheckers()
   }

   // 公共 API，可以给剧本代码使用
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
         // 使用 chesswith310 规则并手动切换控制方

         // 当使用常规国际象棋（包括 chesswith310）规则时，如果一方没有王，fairy-stockfish 仍然会为另一方继续
         // 生成合法的着法；然而如果使用 captureall 规则，fairy-stockfish 会认为这是一方胜利的局面，不会继续搜索
         await globalResource.value.fairyStockfish.setVariant('chesswith310')
         if (this.chessgame.turn != this.playerSide) {
            this.chessgame.turn = this.playerSide
         }
      }
      else {
         await globalResource.value.fairyStockfish.setVariant(variant)
      }

      if (variant === 'chess' || variant === 'chesswith310') {
         // 重置三次重复局面和五十步计数器
         this.halfMovesSinceLastCaptureOrPawnMove = 0
         this.positionHistory = {}
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
      this.postProcessPosition()
      gamePositionToChessboard(this.chessgame, this.chessboard)
      await this.updateValidMoves()
      await this.updateCheckers()

      if (this.variant === 'chess' || this.variant === 'chesswith310') {
         // 重置三次重复局面和五十步计数器
         this.halfMovesSinceLastCaptureOrPawnMove = 0
         this.positionHistory = {}
      }

      if (!noAutoFade && this.chessboardCanvas.style.opacity === '0') {
         this.chessboardCanvas.style.opacity = '1'
         await sleep(300)
      }
   }

   async playMoveUCI(uciMove: string) {
      const currentSide = this.chessgame.turn

      const isCapture = isCaptureMove(this.chessgame, uciMove)
      if (this.variant === 'chess' || this.variant === 'chesswith310') {
         const movedPawn = isPawnMove(this.chessgame, uciMove)
         if (isCapture || movedPawn) {
            this.halfMovesSinceLastCaptureOrPawnMove = 0
         }
         else {
            this.halfMovesSinceLastCaptureOrPawnMove++
         }
      }

      const fairyStockfish = globalResource.value.fairyStockfish
      await fairyStockfish.setPositionWithMoves(this.currentFen, [uciMove])

      this.currentFen = trimFEN(await fairyStockfish.getCurrentFen())
      this.postProcessPosition()

      if (this.variant === 'chess' || this.variant === 'chesswith310') {
         const fenCount = this.positionHistory[this.currentFen] || 0
         this.positionHistory[this.currentFen] = fenCount + 1
      }

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

   async addCheckmateHandler(handler: GameWLHandler) {
      this.onCheckmate.add(handler)
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

function isCaptureMove(game: ChessGame, uciMove: string) {
   const targetSquare = uciMove.slice(2, 4)
   const [targetRank, targetFile] = square2rankfileZeroBased(targetSquare)
   return game.position[targetRank][targetFile] !== undefined
}

function isPawnMove(game: ChessGame, uciMove: string) {
   const startSquare = uciMove.slice(0, 2)
   const [startRank, startFile] = square2rankfileZeroBased(startSquare)
   return game.position[startRank][startFile] === 'p' || game.position[startRank][startFile] === 'P'
}
