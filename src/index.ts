import { loadChessboardAsset } from './chessboard/chessboard'
import { createFairyStockfish, loadStockfishResource } from './fairy-stockfish/fairy-stockfish'
import { sleep } from './util/sleep'
import { createStartMenu } from './components/startmenu'

import './index.css'
import { CommonOpeningPosition } from './components/skirmish'

async function continueLoadingOperation() {
   setItemLoadProgress(1)

   $('load-item-title').innerText = '载入图形化操作界面'
   setOverallLoadProgress(1 / 5)
   await loadChessboardAsset()

   setOverallLoadProgress(2 / 5)
   $('load-item-title').innerText = '载入泛用型对抗人工智能'
   const stockfishResource = await loadStockfishResource()

   setOverallLoadProgress(3 / 5)
   $('load-item-title').innerText = '人工智能系统初始化'
   setItemLoadProgress(0)
   await createFairyStockfish(stockfishResource)
   setItemLoadProgress(1)

   setOverallLoadProgress(4 / 5)
   $('load-item-title').innerText = '载入数据库'
   setItemLoadProgress(0)
   const commonOpeningPositions =
      (await $().get('/chessdata/common-opening-positions.json', undefined, resp => resp.json())) as CommonOpeningPosition[]
   setItemLoadProgress(1)

   setOverallLoadProgress(1)
   $('load-item-title').innerText = '即将完成...'

   await sleep(500)
   const startMenu = createStartMenu({ commonOpeningPositions })
}

continueLoadingOperation()
