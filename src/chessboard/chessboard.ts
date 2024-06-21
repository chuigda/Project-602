import { Chess, Square } from 'chess.js'

import { ShaderProgram, createShaderProgram } from './glx/shader_program'
import { Object3D, VertexBufferObject, createVertexBufferObject, loadObject } from './glx/object'

import './gl_matrix/types.d.ts'
// @ts-ignore
import * as mat4 from './gl_matrix/mat4.mjs'

export interface Chessboard3DAsset {
   vertexShader: string
   fragmentShader: string

   rookObj: Object3D
   rookLineObj: Object3D
   // knightObj: Object3D
   // knightLineObj: Object3D
   // bishopObj: Object3D
   // bishopLineObj: Object3D
   // queenObj: Object3D
   // queenLineObj: Object3D
   // kingObj: Object3D
   // kingLineObj: Object3D
   // pawnObj: Object3D
   // pawnLineObj: Object3D
   // squareObj: Object3D
}

export async function loadChessboardAsset(): Promise<Chessboard3DAsset> {
   setItemLoadProgress(0)
   const vertexShader = await $().get('/shader/opaque.vs')
   setItemLoadProgress(1 / 5)
   const fragmentShader = await $().get('/shader/opaque.fs')
   setItemLoadProgress(2 / 5)

   const objFile = await $().get('/chess-pieces/chess-pieces.obj')
   setItemLoadProgress(3 / 5)

   const objects = loadObject('chess-pieces.obj', objFile)
   const objectsMap: Record<string, Object3D> = {}
   objects.forEach(obj => objectsMap[obj.objectName] = obj)
   console.info(objectsMap)

   const rookObj = objectsMap['2_rook']
   const rookLineObj = objectsMap['2_rook_line']
   setItemLoadProgress(4 / 5)

   const fileref = document.createElement('link')
   fileref.rel = 'stylesheet'
   fileref.type = 'text/css'
   fileref.href = '/chess-pieces/svg2css.css'
   document.getElementsByTagName('head')[0].appendChild(fileref)
   await new Promise(resolve => fileref.onload = resolve)
   setItemLoadProgress(5 / 5)

   return {
      vertexShader,
      fragmentShader,

      rookObj,
      rookLineObj,
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
   asset: Chessboard3DAsset
): Chessboard3D {
   const gl = canvas.getContext('webgl')
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

   let timer = 0

   function render() {
      if (!gl) {
         return
      }

      timer += 1
      const collapse = 0.5 + 0.5 * Math.sin(timer / 30)

      gl.clearColor(0.0, 0.0, 0.0, 1.0)
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.enable(gl.DEPTH_TEST)
      gl.enable(gl.CULL_FACE)
      // gl.disable(gl.BLEND)

      self.program.useProgram(gl)
      self.program.uniform1f(gl, 'u_FadeOut', collapse)
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

      self.program.uniform4fv(gl, 'u_ObjectColor', /* cyan */ [0.0, 1.0, 1.0, 1.0])
      for (let rank = 0; rank < 2; rank++) {
         for (let file = 0; file < 8; file++) {
            const matrix = allMatrices[rank * 8 + file]
            self.program.uniformMatrix4fv(gl, 'u_ModelViewMatrix', false, matrix)
            self.vbo.rook_line.draw(gl)
         }
      }

      self.program.uniform4fv(gl, 'u_ObjectColor', /* orangered */ [1.0, 0.2, 0.0, 1.0])
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
