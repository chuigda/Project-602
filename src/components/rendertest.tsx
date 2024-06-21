import { h } from 'tsx-dom'
import { Chessboard3DAsset, createChessboard3D } from '../chessboard/chessboard';

export function createRenderTest(asset: Chessboard3DAsset): HTMLElement {
   const canvas = <canvas style={{
      position: 'absolute',
      left: '0',
      top: '0',
      width: '100vw',
      height: '100vh',
      zIndex: '2000'
   }}>
   </canvas> as HTMLCanvasElement

   document.body.appendChild(canvas)
   setTimeout(() => {
      const dpi = window.devicePixelRatio || 1
      canvas.width = canvas.clientWidth * dpi
      canvas.height = canvas.clientHeight * dpi
      createChessboard3D(canvas, asset)
   }, 50);

   return canvas
}
