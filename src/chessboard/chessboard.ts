import { Chess } from 'chess.js'

import { ShaderProgram, createShaderProgram } from './glx/shader_program'
import { VertexBufferObject, createVertexBufferObject } from './glx/object'
import './gl_matrix/types.d.ts'
// @ts-ignore
import * as mat4 from './gl_matrix/mat4.mjs'
import { Framebuffer, createFrameBuffer } from './glx/framebuffer_object.ts'
import { GameAsset } from '../assetloader.ts'

export interface Chessboard3D {
   program: ShaderProgram
   clickTestingFramebuffer: Framebuffer

   vbo: {
      rook: VertexBufferObject
      rook_line: VertexBufferObject
      // knight: VertexBufferObject
      // knight_line: VertexBufferObject
      // bishop: VertexBufferObject,
      // bishop_line: VertexBufferObject
      // queen: VertexBufferObject
      // queen_line: VertexBufferObject
      // king: VertexBufferObject
      // king_line: VertexBufferObject
      // pawn: VertexBufferObject
      // pawn_line: VertexBufferObject
      // square: VertexBufferObject
   },

   game: Chess,
   currentObjectId?: number,
   selectedObjectId?: number,

   onMovePlayed?: () => void
   onInvalidMove?: () => void
}

export function createChessboard3D(
   canvas: HTMLCanvasElement,
   asset: GameAsset
): Chessboard3D {
   const gl = canvas.getContext('webgl2')
   if (!gl) {
      throw new Error('无法创建 WebGL 上下文')
   }

   const self: Chessboard3D = {
      program: createShaderProgram(gl, asset.vertexShader, asset.fragmentShader),

      clickTestingFramebuffer: createFrameBuffer(gl, canvas.width, canvas.height, true),

      vbo: {
         rook: createVertexBufferObject(gl, asset.rookObj),
         rook_line: createVertexBufferObject(gl, asset.rookLineObj)
      },

      game: new Chess(),
      currentObjectId: undefined,
      selectedObjectId: undefined
   }

   const projection = mat4.create()
   mat4.perspective(projection, Math.PI / 3, canvas.width / canvas.height, 0.1, 100)
   self.program.useProgram(gl)
   self.program.uniformMatrix4fv(gl, 'u_ProjectionMatrix', false, projection)

   const modelMatrix = mat4.create()
   mat4.lookAt(modelMatrix, [0, 8, 5], [0, 0, 0], [0, 1, 0])

   const allMatrices: any[] = []
   for (let file = 0; file < 8; file++) {
      for (let rank = 0; rank < 8; rank++) {
         const x = (file - 3.5)
         const z = (rank - 3.5)

         const thisMatrix = mat4.create()
         mat4.copy(thisMatrix, modelMatrix)
         mat4.translate(thisMatrix, thisMatrix, [x, 0, z])
         mat4.rotate(thisMatrix, thisMatrix, Math.PI / 6, [0, 1, 0])
         allMatrices.push(thisMatrix)
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
      gl.enable(gl.CULL_FACE)
      gl.enable(gl.BLEND)
      gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA)

      self.program.useProgram(gl)
      self.program.uniform4fv(gl, 'u_ObjectColor', /* black */ [0.0, 0.0, 0.0, 1.0])
      for (let rank = 0; rank < 8; rank++) {
         if (rank !== 0 && rank !== 1 && rank !== 6 && rank !== 7) {
            continue
         }

         for (let file = 0; file < 8; file++) {
            const matrix = allMatrices[rank * 8 + file]
            self.program.uniformMatrix4fv(gl, 'u_ModelViewMatrix', false, matrix)
            self.vbo.rook.draw(gl)
         }
      }

      self.program.uniform4fv(gl, 'u_ObjectColor', /* cyan */ [0.0, 0.85, 0.8, 1.0])
      for (let rank = 0; rank < 2; rank++) {
         for (let file = 0; file < 8; file++) {
            const matrix = allMatrices[rank * 8 + file]
            self.program.uniformMatrix4fv(gl, 'u_ModelViewMatrix', false, matrix)
            self.vbo.rook_line.draw(gl)
         }
      }

      self.program.uniform4fv(gl, 'u_ObjectColor', /* orangered */ [1.0, 0.3, 0.1, 1.0])
      for (let rank = 6; rank < 8; rank++) {
         for (let file = 0; file < 8; file++) {
            const matrix = allMatrices[rank * 8 + file]
            self.program.uniformMatrix4fv(gl, 'u_ModelViewMatrix', false, matrix)
            self.vbo.rook_line.draw(gl)
         }
      }

      self.clickTestingFramebuffer.bind(gl)
      gl.clearColor(0, 0, 1, 1)
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
      gl.disable(gl.BLEND)
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
   })

   return self
}
