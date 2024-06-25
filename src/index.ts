import { FairyStockfish, createFairyStockfish, loadStockfishResource } from './fairy-stockfish/fairy-stockfish'
import { createStartMenu } from './components/startmenu'
import { loadAsset, loadChessData, GameAsset, ChessData } from './assetloader'
import { Ref, ref } from './util/ref'
import { sleep } from './util/sleep'

import './index.css'

export interface GlobalResource {
   gameAsset: GameAsset
   fairyStockfish: FairyStockfish
   chessData: ChessData
}

export const globalResource: Ref<GlobalResource> = <Ref<GlobalResource>>(<any>ref(undefined))

async function continueLoadingOperation() {
   setItemLoadProgress(1)

   $('load-item-title').innerText = '载入图形化操作界面'
   setOverallLoadProgress(1 / 5)
   const gameAsset = await loadAsset()

   setOverallLoadProgress(2 / 5)
   $('load-item-title').innerText = '载入泛用型对抗人工智能'
   const stockfishResource = await loadStockfishResource()

   setOverallLoadProgress(3 / 5)
   $('load-item-title').innerText = '人工智能系统初始化'
   setItemLoadProgress(0)
   const fairyStockfish = await createFairyStockfish(stockfishResource)
   setItemLoadProgress(1)

   setOverallLoadProgress(4 / 5)
   $('load-item-title').innerText = '载入数据库'
   setItemLoadProgress(0)
   const chessData = await loadChessData()
   setItemLoadProgress(1)

   setOverallLoadProgress(1)
   $('load-item-title').innerText = '即将完成...'

   globalResource.value = {
      gameAsset,
      fairyStockfish,
      chessData
   }

   await sleep(500)
   createStartMenu()
}

continueLoadingOperation()
