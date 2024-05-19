import { Chess, Square } from 'chess.js'

import { ShaderProgram, createShaderProgram } from './glx/shader_program'
import { VertexBufferObject, createVertexBufferObject, loadObject } from './glx/object'
import { Texture, createTexture } from './glx/texture.ts'

import './gl_matrix/types.d.ts'
// @ts-ignore
import * as mat4 from './gl_matrix/mat4.mjs'

// assets import
// @ts-ignore
import PieceVert from './shader/piece.vs?raw'
// @ts-ignore
import PieceFrag from './shader/piece.fs?raw'
// @ts-ignore
import ClickTestVert from './shader/clicktest.vs?raw'
// @ts-ignore
import ClickTestFrag from './shader/clicktest.fs?raw'

// @ts-ignore
import RookOBJ from './chess-pieces-obj/rook.obj?raw'
// @ts-ignore
import KnightOBJ from './chess-pieces-obj/knight.obj?raw'
// @ts-ignore
import BishopOBJ from './chess-pieces-obj/bishop.obj?raw'
// @ts-ignore
import QueenOBJ from './chess-pieces-obj/queen.obj?raw'
// @ts-ignore
import KingOBJ from './chess-pieces-obj/king.obj?raw'
// @ts-ignore
import PawnOBJ from './chess-pieces-obj/pawn.obj?raw'
// @ts-ignore
import SquareOBJ from './chess-pieces-obj/square.obj?raw'
import { Framebuffer, createFrameBuffer } from './glx/framebuffer_object.ts'

export interface Chessboard3D {
   pieceProgram: ShaderProgram
   clickTestProgram: ShaderProgram

   clickTestingFramebuffer: Framebuffer

   vbo: {
      rook: VertexBufferObject
      knight: VertexBufferObject
      bishop: VertexBufferObject
      queen: VertexBufferObject
      king: VertexBufferObject
      pawn: VertexBufferObject

      square: VertexBufferObject
   },

   // tex: {
   //    rook: Texture,
   //    knight: Texture,
   //    bishop: Texture,
   //    queen: Texture,
   //    king: Texture,
   //    pawn: Texture
   // }

   chessboard: Chess,
   currentObjectId?: number
}

export function createChessboard3D(canvas: HTMLCanvasElement): Chessboard3D {
   const gl = canvas.getContext('webgl')
   if (!gl) {
      throw new Error('无法创建 WebGL 上下文')
   }

   const self: Chessboard3D = {
      pieceProgram: createShaderProgram(gl, PieceVert, PieceFrag),
      clickTestProgram: createShaderProgram(gl, ClickTestVert, ClickTestFrag),

      clickTestingFramebuffer: createFrameBuffer(gl, canvas.width, canvas.height, true),

      vbo: {
         rook: createVertexBufferObject(gl, loadObject(RookOBJ)),
         knight: createVertexBufferObject(gl, loadObject(KnightOBJ)),
         bishop: createVertexBufferObject(gl, loadObject(BishopOBJ)),
         queen: createVertexBufferObject(gl, loadObject(QueenOBJ)),
         king: createVertexBufferObject(gl, loadObject(KingOBJ)),
         pawn: createVertexBufferObject(gl, loadObject(PawnOBJ)),
         square: createVertexBufferObject(gl, loadObject(SquareOBJ))
      },

      chessboard: new Chess(),
      currentObjectId: undefined
   }

   const projection = mat4.create()
   mat4.perspective(projection, Math.PI / 3, canvas.width / canvas.height, 0.1, 100)
   self.pieceProgram.useProgram(gl)
   self.pieceProgram.uniformMatrix4fv(gl, 'u_ProjectionMatrix', false, projection)
   self.pieceProgram.uniform3fv(gl, 'u_LightPos', [0, 2.5, 6])
   self.pieceProgram.uniform1f(gl, 'u_LightIntensity', 0.7)

   self.clickTestProgram.useProgram(gl)
   self.clickTestProgram.uniformMatrix4fv(gl, 'u_ProjectionMatrix', false, projection)

   const modelMatrix = mat4.create()
   mat4.lookAt(modelMatrix, [0, 7.5, 9], [0, 0, 0], [0, 1, 0])

   const allMatrices: any[] = []
   for (let file = 0; file < 8; file++) {
      for (let rank = 0; rank < 8; rank++) {
         const thisMatrix = mat4.create()
         mat4.copy(thisMatrix, modelMatrix)
         mat4.translate(thisMatrix, thisMatrix, [file - 3.5, 0, (rank - 3.5)])
         allMatrices.push(thisMatrix)
      }
   }

   const allMatricesRotated: any[] = []
   for (let file = 0; file < 8; file++) {
      for (let rank = 0; rank < 8; rank++) {
         const thisMatrix = mat4.create()
         mat4.copy(thisMatrix, modelMatrix)
         mat4.translate(thisMatrix, thisMatrix, [file - 3.5, 0, (rank - 3.5)])
         mat4.rotate(thisMatrix, thisMatrix, 240 / 180 * Math.PI / 2, [0, 1, 0])
         allMatricesRotated.push(thisMatrix)
      }
   }

   function render() {
      if (!gl) {
         return
      }

      gl.clearColor(0.0, 0.0, 0.0, 1.0)
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.enable(gl.DEPTH_TEST)
      gl.enable(gl.BLEND)
      gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
      gl.disable(gl.CULL_FACE)

      self.pieceProgram.useProgram(gl)

      const fileLetters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
      for (let file = 0; file < 8; file++) {
         for (let rank = 1; rank <= 8; rank++) {
            const objectId = file * 8 + (rank - 1)
            const colorDelta = self.currentObjectId === objectId ? 0.15 : 0

            const isWhiteSquare = (file + rank) % 2 === 0

            let modelMatrix = allMatrices[file * 8 + (8 - rank)]
            self.pieceProgram.uniformMatrix4fv(gl, 'u_ModelViewMatrix', false, modelMatrix)

            const squareColor = isWhiteSquare ? 
               [0.8 + colorDelta, 0.8 + colorDelta, 0.8 + colorDelta, 0.8] : 
               [0.2 + colorDelta, 0.2 + colorDelta, 0.2 + colorDelta, 1];
            self.pieceProgram.uniform4fv(gl, 'u_ObjectColor', squareColor)
            self.vbo.square.draw(gl)

            const piece = self.chessboard.get(<Square>`${fileLetters[file]}${rank}`)
            if (piece) {
               const pieceColor = piece.color === 'w' ? 
                  [0.1 + colorDelta, 0.55 + colorDelta, 0.9 + colorDelta, 0.65] :
                  [0.9 + colorDelta, 0.15 + colorDelta, 0.05 + colorDelta, 0.65]
               self.pieceProgram.uniform4fv(gl, 'u_ObjectColor', pieceColor)
               switch (piece.type) {
                  case 'r':
                     self.vbo.rook.draw(gl)
                     break
                  case 'n': {
                     const rotatedMatrix = allMatricesRotated[file * 8 + (8 - rank)]
                     self.pieceProgram.uniformMatrix4fv(gl, 'u_ModelViewMatrix', false, rotatedMatrix)
                     self.vbo.knight.draw(gl)
                     break
                  }
                  case 'b':
                     self.vbo.bishop.draw(gl)
                     break
                  case 'q':
                     self.vbo.queen.draw(gl)
                     break
                  case 'k':
                     self.vbo.king.draw(gl)
                     break
                  case 'p':
                     self.vbo.pawn.draw(gl)
                     break
               }
            }
         }
      }

      self.clickTestProgram.useProgram(gl)
      self.clickTestingFramebuffer.bind(gl)
      gl.clearColor(0, 0, 0, 1)
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
      gl.disable(gl.BLEND)

      for (let file = 0; file < 8; file++) {
         for (let rank = 1; rank <= 8; rank++) {
            const modelMatrix = allMatrices[file * 8 + (8 - rank)]
            self.clickTestProgram.uniformMatrix4fv(gl, 'u_ModelViewMatrix', false, modelMatrix)
            self.clickTestProgram.uniform1f(gl, 'u_ObjectId', (file * 8 + (rank - 1)) / 64.0)
            self.vbo.square.draw(gl)

            const piece = self.chessboard.get(<Square>`${fileLetters[file]}${rank}`)
            if (piece) {
               switch (piece.type) {
                  case 'r':
                     self.vbo.rook.draw(gl)
                     break
                  case 'n': {
                     const rotatedMatrix = allMatricesRotated[file * 8 + (8 - rank)]
                     self.clickTestProgram.uniformMatrix4fv(gl, 'u_ModelViewMatrix', false, rotatedMatrix)
                     self.vbo.knight.draw(gl)
                     break
                  }
                  case 'b':
                     self.vbo.bishop.draw(gl)
                     break
                  case 'q':
                     self.vbo.queen.draw(gl)
                     break
                  case 'k':
                     self.vbo.king.draw(gl)
                     break
                  case 'p':
                     self.vbo.pawn.draw(gl)
                     break
               }
            }
         }
      }
      self.clickTestingFramebuffer.release(gl)

      requestAnimationFrame(render)
   }
   render()

   canvas.addEventListener('mousemove', event => {
      const x = event.offsetX * 2
      const y = canvas.height - event.offsetY * 2

      const pixel = new Uint8Array(4)
      self.clickTestingFramebuffer.bind(gl)
      gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel)
      self.clickTestingFramebuffer.release(gl)

      if (pixel[0] != 0) {
         self.currentObjectId = Math.round(pixel[0] / 4.0)
         canvas.style.cursor = 'pointer'
      } else {
         canvas.style.cursor = 'default'
      }
   })

   return self
}
