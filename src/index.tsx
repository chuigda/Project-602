import { loadChessboardAsset } from './chessboard/chessboard'
import { loadStockfishResource } from './fairy-stockfish/fairy-stockfish'

async function continueLoadingOperation() {
   $('load-item-title').innerText = '正在加载战场图像数据'
   setOverallLoadProgress(1 / 3)
   await loadChessboardAsset()

   setOverallLoadProgress(2 / 3)
   $('load-item-title').innerText = '正在加载泛用型对抗人工智能'
   await loadStockfishResource()

   setOverallLoadProgress(1)
   $('load-item-title').innerText = '正在完成...'
}

continueLoadingOperation()
