import './gl_matrix/types.d.ts'
// @ts-ignore
import * as mat4 from './gl_matrix/mat4.mjs'

export type Coordinate = [number, number]

export const chessboardSquareCoordinates: Coordinate[] = (() => {
   const result: Coordinate[] = []
   for (let file = 0; file < 8; file++) {
      for (let rank = 0; rank < 8; rank++) {
         const x = (file - 3.5) * 1.1
         const z = (3.5 - rank) * 1.1

         result.push([x, z])
      }
   }
   return result
})()

export function rankfile2linearZeroBased(rank: number, file: number): number {
   return file * 8 + rank
}

export const whiteViewMatrix = (() => {
   const result = mat4.create()
   mat4.lookAt(result, [0, 17, 13], [0, 0, 0], [0, 1, 0])
   return result
})()

export const blackViewMatrix = (() => {
   const result = mat4.create()
   mat4.lookAt(result, [0, 17, -13], [0, 0, 0], [0, 1, 0])
   return result
})()

function makeViewTransformer(viewMatrix: any) {
   return (coordinate: Coordinate) => {
      const [x, z] = coordinate

      const result = mat4.create()
      mat4.copy(result, viewMatrix)
      mat4.translate(result, result, [x, 0, z])
      mat4.rotate(result, result, -Math.PI / 2, [0, 1, 0])
      return result
   }
}

export const whiteMvMatrics = chessboardSquareCoordinates.map(makeViewTransformer(whiteViewMatrix))
export const blackMvMatrics = chessboardSquareCoordinates.map(makeViewTransformer(blackViewMatrix))
