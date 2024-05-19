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
import RookTex from './chess-pieces-obj/rook.png?raw'
// @ts-ignore
import KnightTex from './chess-pieces-obj/knight.png?raw'
// @ts-ignore
import BishopTex from './chess-pieces-obj/bishop.png?raw'
// @ts-ignore
import QueenTex from './chess-pieces-obj/queen.png?raw'
// @ts-ignore
import KingTex from './chess-pieces-obj/king.png?raw'
// @ts-ignore
import PawnTex from './chess-pieces-obj/pawn.png?raw'

export interface Chessboard3D {
   pieceProgram: ShaderProgram
   clickTestProgram: ShaderProgram

   vbo: {
      rook: VertexBufferObject
      knight: VertexBufferObject
      bishop: VertexBufferObject
      queen: VertexBufferObject
      king: VertexBufferObject
      pawn: VertexBufferObject
   },

   // tex: {
   //    rook: Texture,
   //    knight: Texture,
   //    bishop: Texture,
   //    queen: Texture,
   //    king: Texture,
   //    pawn: Texture
   // }

   chessboard: Chess
}

export function createChessboard3D(canvas: HTMLCanvasElement): Chessboard3D {
   const gl = canvas.getContext('webgl')
   if (!gl) {
      throw new Error('无法创建 WebGL 上下文')
   }

   gl.viewport(0, 0, canvas.width, canvas.height)
   // enable blending
   gl.enable(gl.DEPTH_TEST)
   gl.enable(gl.BLEND)
   gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
   gl.disable(gl.CULL_FACE)

   const self: Chessboard3D = {
      pieceProgram: createShaderProgram(gl, PieceVert, PieceFrag),
      clickTestProgram: createShaderProgram(gl, ClickTestVert, ClickTestFrag),

      vbo: {
         rook: createVertexBufferObject(gl, loadObject(RookOBJ)),
         knight: createVertexBufferObject(gl, loadObject(KnightOBJ)),
         bishop: createVertexBufferObject(gl, loadObject(BishopOBJ)),
         queen: createVertexBufferObject(gl, loadObject(QueenOBJ)),
         king: createVertexBufferObject(gl, loadObject(KingOBJ)),
         pawn: createVertexBufferObject(gl, loadObject(PawnOBJ))
      },

      chessboard: new Chess()
   }

   const projection = mat4.create()
   mat4.perspective(projection, Math.PI / 3, canvas.width / canvas.height, 0.1, 100)
   self.pieceProgram.useProgram(gl)
   self.pieceProgram.uniformMatrix4fv(gl, 'u_ProjectionMatrix', false, projection)
   self.pieceProgram.uniform3fv(gl, 'u_LightPos', [0, 2.5, 6])
   self.pieceProgram.uniform1f(gl, 'u_LightIntensity', 0.7)
   
   const modelMatrix = mat4.create()
   mat4.lookAt(modelMatrix, [0, 7.5, 9], [0, 0, 0], [0, 1, 0])

   const allMatrices: any[] = []
   for (let file = 0; file < 8; file++) {
      for (let rank = 0; rank < 8; rank++) {
         const thisMatrix = mat4.create()
         mat4.copy(thisMatrix, modelMatrix)
         mat4.translate(thisMatrix, thisMatrix, [file - 3.5, 0, (rank - 3.5)])
         mat4.rotateY(thisMatrix, thisMatrix, 120 / 180 * Math.PI)
         allMatrices.push(thisMatrix)
      }
   }

   function render() {
      if (!gl) {
         return
      }

      gl.clearColor(0.0, 0.0, 0.0, 1.0)
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

      self.pieceProgram.useProgram(gl)

      const fileLetters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
      for (let file = 0; file < 8; file++) {
         for (let rank = 1; rank <= 8; rank++) {
            const piece = self.chessboard.get(<Square>`${fileLetters[file]}${rank}`)
            if (piece) {
               const modelMatrix = allMatrices[file * 8 + (8 - rank)]
               self.pieceProgram.uniformMatrix4fv(gl, 'u_ModelViewMatrix', false, modelMatrix)
               self.pieceProgram.uniform4fv(gl, 'u_ObjectColor', piece.color === 'w' ? [0.1, 0.55, 1, 0.85] : [0.95, 0.15, 0.05, 0.85])

               switch (piece.type) {
                  case 'r':
                     self.vbo.rook.draw(gl)
                     break
                  case 'n':
                     self.vbo.knight.draw(gl)
                     break
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

      requestAnimationFrame(render)
   }
   render()

   return self
}
