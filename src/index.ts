import { loadAsset, loadChessData, GameAsset, ChessData, loadCharacter } from './assetloader'
import { Config, loadConfig } from './config'
import { FairyStockfish, createFairyStockfish, loadStockfishResource } from './fairy-stockfish/fairy-stockfish'
import { createBootloadScreen } from './components/bootload'
import { createDebugConsole } from './components/debugconsole'
import { createStartMenu } from './components/startmenu'
import { Character } from './story/character'
import { CharacterDefs } from './story/chardef'
import { Ref, ref } from './util/ref'
import { loadImage } from './util/image'
import { sleep } from './util/sleep'

import './index.css'

export interface GlobalResource {
   config: Config

   gameAsset: GameAsset
   fairyStockfish: FairyStockfish
   chessData: ChessData
   characters: Record<string, Character>
}

export const globalResource: Ref<GlobalResource> = <Ref<GlobalResource>>(<any>ref(undefined))

async function continueLoadingOperation() {
   const haveFinishedBootloading = !!localStorage.getItem('bootloaded')
   const totalLoadingStages = haveFinishedBootloading ? 5 : 6

   setItemLoadProgress(1)

   $('load-item-title').innerText = '载入图形化操作界面'
   setOverallLoadProgress(1 / totalLoadingStages)
   const gameAsset = await loadAsset()

   setOverallLoadProgress(2 / totalLoadingStages)
   $('load-item-title').innerText = '载入泛用型对抗人工智能'
   const stockfishResource = await loadStockfishResource()

   setOverallLoadProgress(3 / totalLoadingStages)
   $('load-item-title').innerText = '人工智能系统初始化'
   setItemLoadProgress(0)
   const fairyStockfish = await createFairyStockfish(stockfishResource)
   setItemLoadProgress(1)

   setOverallLoadProgress(4 / totalLoadingStages)
   $('load-item-title').innerText = '载入数据库'
   setItemLoadProgress(0)
   const chessData = await loadChessData()
   setItemLoadProgress(1)

   globalResource.value = {
      config: loadConfig(),

      gameAsset,
      fairyStockfish,
      chessData,
      characters: {}
   }

   let garden
   if (!haveFinishedBootloading) {
      setOverallLoadProgress(5 / totalLoadingStages)
      $('load-item-title').innerText = '系统冷启动'
      globalResource.value.characters['NeroRi'] = await loadCharacter(
         'NeroRi',
         CharacterDefs['NeroRi'],
         progress => setItemLoadProgress(progress / 2.0)
      )

      garden = await loadImage('/garden.jpg')
      setItemLoadProgress(1)
   }

   setOverallLoadProgress(1)
   $('load-item-title').innerText = '即将完成...'

   createDebugConsole()

   if (!haveFinishedBootloading) {
      createBootloadScreen(garden!)
   }

   await sleep(500)
   window.postMessage({ type: 'ready' })
   createStartMenu()
}

continueLoadingOperation()
