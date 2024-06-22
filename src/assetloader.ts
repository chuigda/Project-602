import { Object3D, loadObject } from './chessboard/glx/object'

export interface GameAsset {
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

export async function loadAsset(): Promise<GameAsset> {
   setItemLoadProgress(0)
   const vertexShader = await $().get('/shader/opaque.vs')
   setItemLoadProgress(1 / 5)
   const fragmentShader = await $().get('/shader/opaque.fs')
   setItemLoadProgress(2 / 5)

   const objFile = await $().get('/chess-pieces/chess-pieces-3d.obj')
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
   fileref.href = '/chess-pieces/2d/svg2css.css'
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
