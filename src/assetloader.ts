import { CommonOpeningPosition, OpeningPosition } from './chess/opening-book'
import { Object3D, loadObject } from './chessboard/glx/object'

export interface GameAsset {
   // 2D chess piece CSS
   svgCss: HTMLElement

   // shader
   vertexShader: string
   fragmentShader: string

   // 3D chess pieces (merged into 1 object file)
   pawnObj: Object3D
   pawnLineObj: Object3D
   rookObj: Object3D
   rookLineObj: Object3D
   knightObj: Object3D
   knightLineObj: Object3D
   bishopObj: Object3D
   bishopLineObj: Object3D
   queenObj: Object3D
   queenLineObj: Object3D
   kingObj: Object3D
   kingLineObj: Object3D
   squareObj: Object3D
   squareFrameObj: Object3D
   boardFrameObj: Object3D
}

export interface ChessData {
   // opening book
   openingBook: Record<string, OpeningPosition>
   // common opening book positions
   commonOpeningPositions: CommonOpeningPosition[]
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

   setItemLoadProgress(4 / 5)

   const fileref = document.createElement('link')
   fileref.rel = 'stylesheet'
   fileref.type = 'text/css'
   fileref.href = '/chess-pieces/2d/svg2css.css'
   document.getElementsByTagName('head')[0].appendChild(fileref)
   await new Promise(resolve => fileref.onload = resolve)
   setItemLoadProgress(5 / 5)

   return {
      svgCss: fileref,

      vertexShader,
      fragmentShader,

      pawnObj: objectsMap['1_pawn'],
      pawnLineObj: objectsMap['1_pawn_line'],
      rookObj: objectsMap['2_rook'],
      rookLineObj: objectsMap['2_rook_line'],
      knightObj: objectsMap['3_knight'],
      knightLineObj: objectsMap['3_knight_line'],
      bishopObj: objectsMap['4_bishop'],
      bishopLineObj: objectsMap['4_bishop_line'],
      queenObj: objectsMap['5_queen'],
      queenLineObj: objectsMap['5_queen_line'],
      kingObj: objectsMap['6_king'],
      kingLineObj: objectsMap['6_king_line'],
      squareObj: objectsMap['square'],
      squareFrameObj: objectsMap['square_frame'],
      boardFrameObj: objectsMap['boardframe']
   }
}

export async function loadChessData(): Promise<ChessData> {
   setItemLoadProgress(0)
   const openingBookBlob = await $().getWithProgressReport(
      '/chessdata/opening-book.json',
      undefined,
      (progress: ProgressEvent) => setItemLoadProgress((progress.loaded / progress.total) * 0.98)
   ) as Blob
   const openingBook = JSON.parse(await openingBookBlob.text()) as Record<string, OpeningPosition>
   setItemLoadProgress(0.98)

   const commonOpeningPositions = await $().get('/chessdata/common-opening-positions.json', undefined, resp => resp.json())
   setItemLoadProgress(1)

   return {
      openingBook,
      commonOpeningPositions
   }
}
