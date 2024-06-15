import { loadChessboardAsset } from './chessboard/chessboard'
import { createFairyStockfish, loadStockfishResource } from './fairy-stockfish/fairy-stockfish'
import { sleep } from './util/sleep'
import { createStartMenu } from './components/startmenu'

async function continueLoadingOperation() {
   setItemLoadProgress(1)

   $('load-item-title').innerText = '载入图形化操作界面'
   setOverallLoadProgress(1 / 4)
   await loadChessboardAsset()

   setOverallLoadProgress(2 / 4)
   $('load-item-title').innerText = '载入泛用型对抗人工智能'
   const stockfishResource = await loadStockfishResource()

   // setOverallLoadProgress(3 / 4)
   // $('load-item-title').innerText = '人工智能系统初始化'
   // setItemLoadProgress(0)
   // await createFairyStockfish(stockfishResource)
   // setItemLoadProgress(1)

   setOverallLoadProgress(1)
   $('load-item-title').innerText = '即将完成...'

   await sleep(500)
   const startMenu = createStartMenu()
}

continueLoadingOperation()
