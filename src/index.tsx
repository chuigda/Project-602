import { createChessboard3D } from './chessboard/chessboard'
import { $ } from './min-jquery'

async function applicationStart() {
   const canvas = $('chessboard') as HTMLCanvasElement
   
   const chessboard = createChessboard3D(canvas)
}

document.addEventListener('DOMContentLoaded', applicationStart)
