import { h } from 'tsx-dom'
import { createChessboard3D } from '../chessboard/chessboard';
import { globalResource } from '..';

export function createRenderTest(): HTMLElement {
   const canvas = <canvas style={{
      position: 'absolute',
      left: '0',
      top: '0',
      width: '100vw',
      height: '100vh',
      zIndex: '2000'
   }} /> as HTMLCanvasElement

   document.body.appendChild(canvas)
   setTimeout(() => {
      const dpi = window.devicePixelRatio || 1
      canvas.width = canvas.clientWidth * dpi
      canvas.height = canvas.clientHeight * dpi
      createChessboard3D(canvas, globalResource.value.gameAsset, 'white')
   }, 50);

   return canvas
}
