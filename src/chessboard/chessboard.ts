import { ShaderProgram, createShaderProgram } from './glx/shader_program'
import { VertexBufferObject, createVertexBufferObject } from './glx/object'
import './gl_matrix/types.d.ts'
// @ts-ignore
import * as mat4 from './gl_matrix/mat4.mjs'
import { Framebuffer, createFrameBuffer } from './glx/framebuffer_object.ts'
import { GameAsset } from '../assetloader.ts'

export interface StaticPiece {
   rank: number
   file: number
   color: 'white' | 'black'
   piece: 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king'
}

export interface AnimatingPiece {
   startRank: number
   startFile: number
   endRank?: number
   endFile?: number

   fade?: number
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
      // square: VertexBufferObject
   },

   staticPieces: StaticPiece[]
   animatingPieces: AnimatingPiece[]

   currentObjectId?: number,
   selectedObjectId?: number,

   onMovePlayed?: () => void
   onInvalidMove?: () => void
}

function createInitialPosition(): StaticPiece[] {
   const ret: StaticPiece[] = []
   // white pieces
   ret.push({ rank: 0, file: 0, color: 'white', piece: 'rook' })
   ret.push({ rank: 0, file: 1, color: 'white', piece: 'knight' })
   ret.push({ rank: 0, file: 2, color: 'white', piece: 'bishop' })
   ret.push({ rank: 0, file: 3, color: 'white', piece: 'queen' })
   ret.push({ rank: 0, file: 4, color: 'white', piece: 'king' })
   ret.push({ rank: 0, file: 5, color: 'white', piece: 'bishop' })
   ret.push({ rank: 0, file: 6, color: 'white', piece: 'knight' })
   ret.push({ rank: 0, file: 7, color: 'white', piece: 'rook' })
   for (let file = 0; file < 8; file++) {
      ret.push({ rank: 1, file, color: 'white', piece: 'pawn' })
   }

   // black pieces
   ret.push({ rank: 7, file: 0, color: 'black', piece: 'rook' })
   ret.push({ rank: 7, file: 1, color: 'black', piece: 'knight' })
   ret.push({ rank: 7, file: 2, color: 'black', piece: 'bishop' })
   ret.push({ rank: 7, file: 3, color: 'black', piece: 'queen' })
   ret.push({ rank: 7, file: 4, color: 'black', piece: 'king' })
   ret.push({ rank: 7, file: 5, color: 'black', piece: 'bishop' })
   ret.push({ rank: 7, file: 6, color: 'black', piece: 'knight' })
   ret.push({ rank: 7, file: 7, color: 'black', piece: 'rook' })
   for (let file = 0; file < 8; file++) {
      ret.push({ rank: 6, file, color: 'black', piece: 'pawn' })
   }

   return ret
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
      },

      staticPieces: createInitialPosition(),
      animatingPieces: [],

      currentObjectId: undefined,
      selectedObjectId: undefined
   }

   const projection = mat4.create()
   mat4.perspective(projection, Math.PI / 7, canvas.width / canvas.height, 0.1, 100)
   self.program.useProgram(gl)
   self.program.uniformMatrix4fv(gl, 'u_ProjectionMatrix', false, projection)

   const viewMatrix = mat4.create()
   mat4.lookAt(viewMatrix, [0, 15, 15], [0, 0, 0], [0, 1, 0])

   const mvMatrics: any[] = []
   for (let file = 0; file < 8; file++) {
      for (let rank = 0; rank < 8; rank++) {
         const x = (file - 3.5) * 1.1
         const z = (4.0 - rank) * 1.1

         const thisMatrix = mat4.create()
         mat4.copy(thisMatrix, viewMatrix)
         mat4.translate(thisMatrix, thisMatrix, [x, 0, z])
         mat4.rotate(thisMatrix, thisMatrix, -Math.PI / 2, [0, 1, 0])
         mvMatrics.push(thisMatrix)
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
      gl.depthFunc(gl.LEQUAL)
      gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA)

      self.program.useProgram(gl)
      self.program.uniform4fv(gl, 'u_ObjectColor', /* black */ [0.0, 0.0, 0.0, 1.0])

      for (const staticPiece of self.staticPieces) {
         const mvMatrix = mvMatrics[staticPiece.file * 8 +staticPiece.rank]
         self.program.uniformMatrix4fv(gl, 'u_ModelViewMatrix', false, mvMatrix)

         self.program.uniform4fv(gl, 'u_ObjectColor', /* black */ [0.0, 0.0, 0.0, 1.0])
         const vbo = self.vbo[staticPiece.piece]
         vbo.draw(gl)

         if (staticPiece.color === 'white') {
            self.program.uniform4fv(gl, 'u_ObjectColor', /* cyan */ [0.0, 0.85, 0.8, 1.0])
         }
         else {
            self.program.uniform4fv(gl, 'u_ObjectColor', /* orangered */ [1.0, 0.3, 0.1, 1.0])
         }
         const vboLine = self.vbo[`${staticPiece.piece}Line`]
         vboLine.draw(gl)
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
