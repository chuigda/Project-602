import { ShaderProgram, createShaderProgram } from './glx/shader_program'
import { VertexBufferObject, createVertexBufferObject } from './glx/object'
import './gl_matrix/types.d.ts'
// @ts-ignore
import * as mat4 from './gl_matrix/mat4.mjs'
import { Framebuffer, createFrameBuffer } from './glx/framebuffer_object.ts'
import { GameAsset } from '../assetloader.ts'
import { ChessGame, getPieceName, getPieceSide, PieceName, PlayerSide } from '../chess/chessgame.ts'
import {
   blackMvMatrics,
   blackViewMatrix,
   whiteMvMatrics,
   whiteViewMatrix,

   chessboardSquareCoordinates as cscoord,
   rankfile2linearZeroBased as rf2linear,
} from './coordinate.ts'
import bezier from '../util/bezier.json'

export const chessboardColor: Record<string, [number, number, number, number]> = {
   cyan: [0.0, 0.85, 0.8, 1.0],
   cyan_20: [0.0, 0.17, 0.16, 1.0],
   orangered: [1.0, 0.3, 0.1, 1.0],
   orangered_20: [0.2, 0.06, 0.02, 1.0],
   aquamarine: [0.498, 1.0, 0.831, 1.0],
   aquamarine_33: [0.498, 1.0, 0.831, 0.33],
   aquamarine_66: [0.498, 1.0, 0.831, 0.66],
   greenyellow: [0.678, 1.0, 0.184, 1.0],
   greenyellow_33: [0.678, 1.0, 0.184, 0.33],
   yellow: [1.0, 1.0, 0.0, 1.0],
   yellow_20: [0.2, 0.2, 0.0, 1.0],
   red: [0.9, 0.0, 0.0, 1.0],
}

export interface StaticPiece {
   rank: number
   file: number
   color: PlayerSide
   piece: PieceName
}

export interface AnimatingPiece {
   piece: PieceName
   color: PlayerSide

   startRank: number
   startFile: number
   endRank?: number
   endFile?: number
   horseJump?: boolean

   fading?: 'in' | 'out'

   frameCount: number
   totalFrameCount: 10 | 15 | 20 | 30 | 45 | 60 | 90

   resolve: (...args: any[]) => void
}

export interface HighlightSquare {
   rank: number,
   file: number,
   color: [number, number, number, number]
}

export interface Chessboard3D {
   program: ShaderProgram
   clickTestingFramebuffer: Framebuffer

   vbo: {
      pawn: VertexBufferObject
      pawnLine: VertexBufferObject
      rook: VertexBufferObject
      rookLine: VertexBufferObject
      knight: VertexBufferObject
      knightLine: VertexBufferObject
      bishop: VertexBufferObject,
      bishopLine: VertexBufferObject
      queen: VertexBufferObject
      queenLine: VertexBufferObject
      king: VertexBufferObject
      kingLine: VertexBufferObject
      wgc: VertexBufferObject
      wgcLine: VertexBufferObject
      immovable: VertexBufferObject,
      immovableLine: VertexBufferObject,

      square: VertexBufferObject
      squareFrame: VertexBufferObject

      boardFrame: VertexBufferObject
   },

   orientation: PlayerSide
   staticPieces: StaticPiece[]
   animatingPieces: AnimatingPiece[]
   highlightSquares: HighlightSquare[]

   currentObjectId?: number,
   selectedObjectId?: number,

   onClickSquare?: (rank: number, file: number) => void
   onRightclick?: () => void

   resizing: boolean
}

export function createChessboard3D(
   canvas: HTMLCanvasElement,
   asset: GameAsset,
   orientation: PlayerSide
): Chessboard3D {
   const gl = canvas.getContext('webgl')
   if (!gl) {
      throw new Error('无法创建 WebGL 上下文')
   }

   const self: Chessboard3D = {
      program: createShaderProgram(gl, asset.vertexShader, asset.fragmentShader),
      clickTestingFramebuffer: createFrameBuffer(gl, canvas.clientWidth, canvas.clientHeight, true),

      vbo: {
         pawn: createVertexBufferObject(gl, asset.pawnObj),
         pawnLine: createVertexBufferObject(gl, asset.pawnLineObj),
         rook: createVertexBufferObject(gl, asset.rookObj),
         rookLine: createVertexBufferObject(gl, asset.rookLineObj),
         knight: createVertexBufferObject(gl, asset.knightObj),
         knightLine: createVertexBufferObject(gl, asset.knightLineObj),
         bishop: createVertexBufferObject(gl, asset.bishopObj),
         bishopLine: createVertexBufferObject(gl, asset.bishopLineObj),
         queen: createVertexBufferObject(gl, asset.queenObj),
         queenLine: createVertexBufferObject(gl, asset.queenLineObj),
         king: createVertexBufferObject(gl, asset.kingObj),
         kingLine: createVertexBufferObject(gl, asset.kingLineObj),
         // TODO WGC modelling
         wgc: createVertexBufferObject(gl, asset.rookObj),
         wgcLine: createVertexBufferObject(gl, asset.rookLineObj),
         immovable: createVertexBufferObject(gl, asset.immovableObj),
         immovableLine: createVertexBufferObject(gl, asset.immovableLineObj),

         square: createVertexBufferObject(gl, asset.squareObj),
         squareFrame: createVertexBufferObject(gl, asset.squareFrameObj),

         boardFrame: createVertexBufferObject(gl, asset.boardFrameObj)
      },

      orientation,
      staticPieces: [],
      animatingPieces: [],
      highlightSquares: [],

      currentObjectId: undefined,

      resizing: false
   }

   canvas.width = canvas.clientWidth * (window.devicePixelRatio || 1.0)
   canvas.height = canvas.clientHeight * (window.devicePixelRatio || 1.0)

   const projection = mat4.create()
   mat4.perspective(projection, Math.PI / 7, canvas.width / canvas.height, 0.1, 100)
   self.program.useProgram(gl)
   self.program.uniformMatrix4fv(gl, 'u_ProjectionMatrix', false, projection)

   const centreMatrix = whiteViewMatrix

   const windowResizeHandler = () => {
      canvas.width = canvas.clientWidth * (window.devicePixelRatio || 1.0)
      canvas.height = canvas.clientHeight * (window.devicePixelRatio || 1.0)

      self.clickTestingFramebuffer = createFrameBuffer(gl, canvas.clientWidth, canvas.clientHeight, true)

      self.program.useProgram(gl)
      const neueProjection = mat4.create()
      mat4.perspective(neueProjection, Math.PI / 7, canvas.width / canvas.height, 0.1, 100)
      self.program.uniformMatrix4fv(gl, 'u_ProjectionMatrix', false, neueProjection)
   }

   window.addEventListener('resize', () => {
      self.resizing = true
      windowResizeHandler()
   })

   function render() {
      if (!gl) {
         return
      }

      gl.clearColor(0.0, 0.0, 0.0, 1.0)
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.enable(gl.DEPTH_TEST)
      gl.enable(gl.CULL_FACE)
      gl.enable(gl.BLEND)
      gl.depthFunc(gl.LEQUAL)
      gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA)

      self.program.useProgram(gl)

      self.program.uniform4fv(gl, 'u_ObjectColor', chessboardColor.aquamarine_33)
      self.program.uniformMatrix4fv(gl, 'u_ModelViewMatrix', false, centreMatrix)
      self.vbo.boardFrame.draw(gl)

      const mvMatrics = self.orientation === 'white' ? whiteMvMatrics : blackMvMatrics
      const viewMatrix = self.orientation === 'white' ? whiteViewMatrix : blackViewMatrix

      for (let rank = 0; rank < 8; rank++) {
         for (let file = 0; file < 8; file++) {
            if ((file + rank) % 2 === 0) {
               continue
            }

            const mvMatrix = mvMatrics[rf2linear(rank, file)]
            self.program.uniformMatrix4fv(gl, 'u_ModelViewMatrix', false, mvMatrix)
            self.vbo.square.draw(gl)
         }
      }

      if (self.currentObjectId !== undefined) {
         const rank = Math.floor(self.currentObjectId / 8)
         const file = self.currentObjectId % 8
         const mvMatrix = mvMatrics[rf2linear(rank, file)]
         self.program.uniformMatrix4fv(gl, 'u_ModelViewMatrix', false, mvMatrix)
         self.program.uniform4fv(gl, 'u_ObjectColor', chessboardColor.aquamarine_66)
         self.vbo.squareFrame.draw(gl)
      }

      for (const staticPiece of self.staticPieces) {
         const mvMatrix = mvMatrics[rf2linear(staticPiece.rank, staticPiece.file)]
         self.program.uniformMatrix4fv(gl, 'u_ModelViewMatrix', false, mvMatrix)

         const objectId = staticPiece.rank * 8 + staticPiece.file
         if (objectId === self.currentObjectId) {
            self.program.uniform4fv(gl, 'u_ObjectColor', choosePieceHoverColor(staticPiece.piece, staticPiece.color))
         }
         else {
            self.program.uniform4fv(gl, 'u_ObjectColor', [0, 0, 0, 1.0])
         }
         const vbo = self.vbo[staticPiece.piece]
         vbo.draw(gl)

         self.program.uniform4fv(gl, 'u_ObjectColor', choosePieceColor(staticPiece.piece, staticPiece.color))
         const vboLine = self.vbo[`${staticPiece.piece}Line`]
         vboLine.draw(gl)
      }

      for (const animatingPiece of self.animatingPieces) {
         const curve = bezier[`bezier${animatingPiece.totalFrameCount}`]
         const t = animatingPiece.frameCount >= animatingPiece.totalFrameCount ? 1.0 : curve[animatingPiece.frameCount]

         let x, z
         const [x0, y0] = cscoord[rf2linear(animatingPiece.startRank, animatingPiece.startFile)]
         if (animatingPiece.endRank !== undefined && animatingPiece.endFile !== undefined) {
            const [x1, y1] = cscoord[rf2linear(animatingPiece.endRank, animatingPiece.endFile)]
            x = x0 + (x1 - x0) * t
            z = y0 + (y1 - y0) * t
         } else {
            x = x0
            z = y0
         }

         const mvMatrix = mat4.create()
         mat4.copy(mvMatrix, viewMatrix)
         mat4.translate(mvMatrix, mvMatrix, [x, 0, z])
         mat4.rotate(mvMatrix, mvMatrix, -Math.PI / 2, [0, 1, 0])
         self.program.uniformMatrix4fv(gl, 'u_ModelViewMatrix', false, mvMatrix)

         let fadeOut = 0.0
         if (animatingPiece.fading === 'in') {
            fadeOut = 1.0 - t
         } else if (animatingPiece.fading === 'out') {
            fadeOut = t
         }
         self.program.uniform1f(gl, 'u_FadeOut', fadeOut)

         self.program.uniform4fv(gl, 'u_ObjectColor', [0, 0, 0, 1.0])
         const vbo = self.vbo[animatingPiece.piece]
         vbo.draw(gl)
         self.program.uniform4fv(gl, 'u_ObjectColor', choosePieceColor(animatingPiece.piece, animatingPiece.color))
         const vboLine = self.vbo[`${animatingPiece.piece}Line`]
         vboLine.draw(gl)

         animatingPiece.frameCount++
         if (animatingPiece.frameCount >= animatingPiece.totalFrameCount) {
            animatingPiece.resolve()
         }
      }

      self.program.uniform1f(gl, 'u_FadeOut', 0.0)
      for (const highlightSquare of self.highlightSquares) {
         const mvMatrix = mvMatrics[rf2linear(highlightSquare.rank, highlightSquare.file)]
         self.program.uniformMatrix4fv(gl, 'u_ModelViewMatrix', false, mvMatrix)
         self.program.uniform4fv(gl, 'u_ObjectColor', highlightSquare.color)
         self.vbo.squareFrame.draw(gl)
      }

      self.clickTestingFramebuffer.bind(gl)
      gl.viewport(0, 0, canvas.clientWidth, canvas.clientHeight)
      gl.clearColor(0, 0, 1, 1)
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
      gl.disable(gl.BLEND)

      for (let rank = 0; rank < 8; rank++) {
         for (let file = 0; file < 8; file++) {
            const mvMatrix = mvMatrics[rf2linear(rank, file)]
            const linearIndex = rank * 8 + file
            self.program.uniformMatrix4fv(gl, 'u_ModelViewMatrix', false, mvMatrix)
            self.program.uniform4fv(gl, 'u_ObjectColor', [linearIndex / 64.0, 0, 0, 1])
            self.vbo.square.draw(gl)
         }
      }

      for (const staticPiece of self.staticPieces) {
         const mvMatrix = mvMatrics[rf2linear(staticPiece.rank, staticPiece.file)]
         const linearIndex = staticPiece.rank * 8 + staticPiece.file
         self.program.uniformMatrix4fv(gl, 'u_ModelViewMatrix', false, mvMatrix)
         self.program.uniform4fv(gl, 'u_ObjectColor', [linearIndex / 64.0, 0, 0, 1])
         self.vbo[staticPiece.piece].draw(gl)
      }

      self.clickTestingFramebuffer.release(gl)

      requestAnimationFrame(render)
   }
   render()

   canvas.addEventListener('mousemove', event => {
      const x = event.offsetX
      const y = canvas.clientHeight - event.offsetY

      const pixel = new Uint8Array(4)
      self.clickTestingFramebuffer.bind(gl)
      gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel)
      self.clickTestingFramebuffer.release(gl)

      if (pixel[2] < 1) {
         self.currentObjectId = Math.round(pixel[0] / 4.0)
         canvas.style.cursor = 'pointer'
      } else {
         self.currentObjectId = undefined
         canvas.style.cursor = 'default'
      }
   })

   canvas.addEventListener('contextmenu', event => {
      event.preventDefault()

      if (self.onRightclick) {
         self.onRightclick()
      }
   })

   canvas.addEventListener('click', () => {
      if (self.animatingPieces.length !== 0) {
         return
      }

      if (self.onClickSquare && self.currentObjectId !== undefined) {
         const rank = Math.floor(self.currentObjectId / 8)
         const file = self.currentObjectId % 8
         self.onClickSquare(rank, file)
      }
   })

   return self
}

export function gamePositionToChessboard(game: ChessGame, chessboard: Chessboard3D) {
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

export function removePieceFromChessboard(chessboard: Chessboard3D, rank: number, file: number) {
   chessboard.staticPieces = chessboard
      .staticPieces
      .filter(piece => piece.rank !== rank || piece.file !== file)
}

function choosePieceColor(piece: PieceName, side: PlayerSide): [number, number, number, number] {
   if (piece === 'immovable') {
      return chessboardColor.yellow
   }
   if (side === 'white') {
      return chessboardColor.cyan
   }
   return chessboardColor.orangered
}

function choosePieceHoverColor(piece: PieceName, side: PlayerSide): [number, number, number, number] {
   if (piece === 'immovable') {
      return chessboardColor.yellow_20
   }
   if (side === 'white') {
      return chessboardColor.cyan_20
   }
   return chessboardColor.orangered_20
}
