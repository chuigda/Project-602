import { Chess, Square } from 'chess.js'

import { ShaderProgram, createShaderProgram } from './glx/shader_program'
import { VertexBufferObject, createVertexBufferObject, loadObject } from './glx/object'

import './gl_matrix/types.d.ts'
// @ts-ignore
import * as mat4 from './gl_matrix/mat4.mjs'

export interface Chessboard3DAsset {
   pieceVert: string
   pieceFrag: string
   clickTestVert: string
   clickTestFrag: string

   rookObj: string
   knightObj: string
   bishopObj: string
   queenObj: string
   kingObj: string
   pawnObj: string
   squareObj: string
}

export async function loadChessboardAsset(): Promise<Chessboard3DAsset> {
   setItemLoadProgress(0)
   const pieceVert = await $().get("/shader/piece.vs")
   setItemLoadProgress(1 / 12)
   const pieceFrag = await $().get("/shader/piece.fs")
   setItemLoadProgress(2 / 12)
   const clickTestVert = await $().get("/shader/clicktest.vs")
   setItemLoadProgress(3 / 12)
   const clickTestFrag = await $().get("/shader/clicktest.fs")
   setItemLoadProgress(4 / 12)

   const rookObj = await $().get("/chess-pieces-obj/rook.obj")
   setItemLoadProgress(5 / 12)
   const knightObj = await $().get("/chess-pieces-obj/knight.obj")
   setItemLoadProgress(6 / 12)
   const bishopObj = await $().get("/chess-pieces-obj/bishop.obj")
   setItemLoadProgress(7 / 12)
   const queenObj = await $().get("/chess-pieces-obj/queen.obj")
   setItemLoadProgress(8 / 12)
   const kingObj = await $().get("/chess-pieces-obj/king.obj")
   setItemLoadProgress(9 / 12)
   const pawnObj = await $().get("/chess-pieces-obj/pawn.obj")
   setItemLoadProgress(10 / 12)
   const squareObj = await $().get("/chess-pieces-obj/square.obj")
   setItemLoadProgress(11 / 12)

   const fileref = document.createElement('link')
   fileref.rel = 'stylesheet'
   fileref.type = 'text/css'
   fileref.href = '/2d-chess-pieces/svg2css.css'
   document.getElementsByTagName('head')[0].appendChild(fileref)
   await new Promise(resolve => fileref.onload = resolve)
   setItemLoadProgress(12 / 12)

   return {
      pieceVert,
      pieceFrag,
      clickTestVert,
      clickTestFrag,

      rookObj,
      knightObj,
      bishopObj,
      queenObj,
      kingObj,
      pawnObj,
      squareObj
   }
}

import { Framebuffer, createFrameBuffer } from './glx/framebuffer_object.ts'

const ObjectIdToSquareMap: string[] = [
   'a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7', 'a8',
   'b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7', 'b8',
   'c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8',
   'd1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'd8',
   'e1', 'e2', 'e3', 'e4', 'e5', 'e6', 'e7', 'e8',
   'f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8',
   'g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'g7', 'g8',
   'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'h7', 'h8'
]

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

   game: Chess,
   currentObjectId?: number,
   selectedObjectId?: number,

   onMovePlayed?: () => void
   onInvalidMove?: () => void
}

export function createChessboard3D(
   canvas: HTMLCanvasElement,
   asset: Chessboard3DAsset
): Chessboard3D {
   const gl = canvas.getContext('webgl')
   if (!gl) {
      throw new Error('无法创建 WebGL 上下文')
   }

   const self: Chessboard3D = {
      pieceProgram: createShaderProgram(gl, asset.pieceVert, asset.pieceFrag),
      clickTestProgram: createShaderProgram(gl, asset.clickTestVert, asset.clickTestFrag),

      clickTestingFramebuffer: createFrameBuffer(gl, canvas.width, canvas.height, true),

      vbo: {
         rook: createVertexBufferObject(gl, loadObject(asset.rookObj)),
         knight: createVertexBufferObject(gl, loadObject(asset.knightObj)),
         bishop: createVertexBufferObject(gl, loadObject(asset.bishopObj)),
         queen: createVertexBufferObject(gl, loadObject(asset.queenObj)),
         king: createVertexBufferObject(gl, loadObject(asset.kingObj)),
         pawn: createVertexBufferObject(gl, loadObject(asset.pawnObj)),
         square: createVertexBufferObject(gl, loadObject(asset.squareObj))
      },

      game: new Chess(),
      currentObjectId: undefined,
      selectedObjectId: undefined
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
   mat4.lookAt(modelMatrix, [0, 9, 6.5], [0, 0, 0], [0, 1, 0])

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
            const colorDelta = (self.currentObjectId === objectId || self.selectedObjectId === objectId) ? 0.15 : 0

            const isWhiteSquare = (file + rank) % 2 === 0

            let modelMatrix = allMatrices[file * 8 + (8 - rank)]
            self.pieceProgram.uniformMatrix4fv(gl, 'u_ModelViewMatrix', false, modelMatrix)

            const squareColor = isWhiteSquare ?
               [0.8 + colorDelta, 0.8 + colorDelta, 0.8 + colorDelta, 0.8] :
               [0.2 + colorDelta, 0.2 + colorDelta, 0.2 + colorDelta, 1];
            self.pieceProgram.uniform4fv(gl, 'u_ObjectColor', squareColor)
            self.vbo.square.draw(gl)

            const piece = self.game.get(<Square>`${fileLetters[file]}${rank}`)
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
      gl.clearColor(0, 0, 1, 1)
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
      gl.disable(gl.BLEND)

      for (let file = 0; file < 8; file++) {
         for (let rank = 1; rank <= 8; rank++) {
            const modelMatrix = allMatrices[file * 8 + (8 - rank)]
            self.clickTestProgram.uniformMatrix4fv(gl, 'u_ModelViewMatrix', false, modelMatrix)
            self.clickTestProgram.uniform1f(gl, 'u_ObjectId', (file * 8 + rank - 1) / 64.0)
            self.vbo.square.draw(gl)

            const piece = self.game.get(<Square>`${fileLetters[file]}${rank}`)
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

      if (pixel[2] < 1.0) {
         self.currentObjectId = Math.round(pixel[0] / 4.0)
         canvas.style.cursor = 'pointer'
      } else {
         self.currentObjectId = undefined
         canvas.style.cursor = 'default'
      }
   })

   canvas.addEventListener('contextmenu', event => {
      event.preventDefault()
      self.selectedObjectId = undefined
   })

   canvas.addEventListener('click', () => {
      if (self.currentObjectId !== undefined) {
         const newlyClickedSquare = ObjectIdToSquareMap[self.currentObjectId]

         if (self.selectedObjectId !== undefined) {
            const fromSquare = ObjectIdToSquareMap[self.selectedObjectId]
            try {
               const move = self.game.move({
                  from: fromSquare,
                  to: newlyClickedSquare,
                  promotion: 'q'
               })

               if (move) {
                  self.selectedObjectId = undefined
                  if (self.onMovePlayed) {
                     self.onMovePlayed()
                  }
               }
            } catch (e) {
               self.selectedObjectId = undefined
               if (self.onInvalidMove) {
                  self.onInvalidMove()
               }
            }
         } else {
            const piece = self.game.get(<Square>newlyClickedSquare)
            if (!piece) {
               return
            }

            self.selectedObjectId = self.currentObjectId
         }
      }
   })

   return self
}
