import { ShaderProgram, createShaderProgram } from './glx/shader_program'

// @ts-ignore
import PieceVert from './shader/piece.vs?raw'
// @ts-ignore
import PieceFrag from './shader/piece.fs?raw'

interface Chessboard3D {
   pieceProgram: ShaderProgram
}

export function createChessboard3D(canvas: HTMLCanvasElement): Chessboard3D {
   const gl = canvas.getContext('webgl')

   if (!gl) {
      throw new Error('无法创建 WebGL 上下文')
   }

   const program = createShaderProgram(gl, PieceVert, PieceFrag)
   return {
      pieceProgram: program
   }
}
