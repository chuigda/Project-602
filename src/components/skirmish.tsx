import { h } from 'tsx-dom'
import * as fischer from 'fischer960'
import { maybeSkirmishComputerPlayMove, useSkirmishSetup } from '../game/skirmish_setup'
import { startGameplay } from './gameplay'
import { DoubleOpenScreen } from '../widgets/double-open-screen'
import { createSelect } from '../widgets/select'
import { Window } from '../widgets/window'
import { sleep } from '../util/sleep'
import { Button } from '../widgets/button'
import { Ref, ref } from '../util/ref'
import { globalResource } from '..'
import { PlayerSide } from '../chess/chessgame'
import { create2DChessboardFromFen } from '../chessboard/chessboard2d'

import './skirmish.css'

export function showSkirmishWindow(): HTMLElement {
   const windowBackground = <DoubleOpenScreen backgroundColor="black" zIndex={2000} />

   const openingOptions = [
      {
         text: '起始局面',
         value: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -',
      }
   ]

   for (const openingPosition of globalResource.value.chessData.commonOpeningPositions) {
      openingOptions.push({
         text: `${openingPosition.eco} ${openingPosition.name}`,
         value: openingPosition.fen,
      })
   }

   const startPosition: Ref<string> = ref('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -')
   const playerSide: Ref<PlayerSide> = ref('white')
   const aiLevel: Ref<number> = ref(1)

   const errorReporter = <span class="error-reporter" />

   const skirmishMapPreview = <div class="skirmish-map-preview" />
   const recreatePositionPreview = () => {
      skirmishMapPreview.innerHTML = ''
      skirmishMapPreview.append(...create2DChessboardFromFen('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -'))
   }

   const chooseSpecificPosition = (positionFen: string) => {
      skirmishMapPreview.innerHTML = ''
      skirmishMapPreview.append(...create2DChessboardFromFen(positionFen))

      startPosition.value = positionFen
   }

   const chooseChess960Position = (event: Event) => {
      const inputElement = event.target as HTMLInputElement
      let positionId

      if (inputElement.value.trim().length != 0) {
         positionId = parseInt(inputElement.value)
         if (isNaN(positionId) || positionId < 1 || positionId > 960) {
            errorReporter.innerText = '错误：局面编号必须是 1~960 之间的整数'
            return
         }
      } else {
         positionId = 518
      }

      const positionString = fischer.decode(positionId).join('')
      const positionStringW = positionString.toUpperCase()
      const positionStringB = positionString.toLowerCase()

      const fen = `${positionStringB}/pppppppp/8/8/8/8/PPPPPPPP/${positionStringW} w KQkq -`
      chooseSpecificPosition(fen)
      errorReporter.innerText = ''
   }

   const openingSelection = createSelect<string>(
      '开局选择',
      openingOptions,
      chooseSpecificPosition
   )

   const chess960Selection = <div class="skirmish-chess960-selection" style="display: none">
      <span>局面编号</span>
      <input type="text"
             placeholder="取值范围 1~960，默认 518"
             onInput={chooseChess960Position}
             onChange={chooseChess960Position}
      />
   </div>

   const onChooseGameMode = (gamemode: string) => {
      if (gamemode === 'chess960') {
         chess960Selection.style.display = 'flex'
         openingSelection.element.style.display = 'none'
      }
      else {
         chess960Selection.style.display = 'none'
         openingSelection.element.style.display = 'flex'
      }

      recreatePositionPreview()
   }

   const onChoosePlayerSide = (side: PlayerSide) => {
      playerSide.value = side
   }

   const onChooseAILevel = (level: number) => {
      aiLevel.value = level
   }

   const startGame = async () => {
      startGameplay(3000, async cx => {
         await cx.setVariant('chess')
         await cx.setPlayerSide(playerSide.value)
         await cx.setFen(startPosition.value)

         useSkirmishSetup(cx, aiLevel.value)
         await maybeSkirmishComputerPlayMove(cx)
      })

      await sleep(300)
      windowBackground.remove()
   }

   const gameModeSelect = createSelect<'chess' | 'chess960'>(
      '游戏模式',
      [
         { text: '标准国际象棋', value: 'chess' },
         { text: '国际象棋960', value: 'chess960' }
      ],
      onChooseGameMode
   )

   const playerColorSelect = createSelect<PlayerSide>(
      '玩家颜色',
      [
         { text: '白色', value: 'white' },
         { text: '黑色', value: 'black' }
      ],
      onChoosePlayerSide
   )

   const aiLevelSelect = createSelect<number>(
      '电脑难度',
      [
         { text: '等级 1', value: 1 },
         { text: '等级 2', value: 2 },
         { text: '等级 3', value: 3 },
         { text: '等级 4', value: 4 },
         { text: '等级 5', value: 5 },
         { text: '等级 6', value: 6 },
         { text: '等级 7', value: 7 },
         { text: '等级 8', value: 8 },
      ],
      onChooseAILevel
   )

   const skirmishWindow = (
      <Window title="遭遇战" height="65vh" onClose={async () => {
         (windowBackground.children[0] as HTMLElement).style.height = '0';
         (windowBackground.children[1] as HTMLElement).style.height = '0';
         await sleep(300)
         windowBackground.remove()
      }}>
         <div class="skirmish-content">
            <div class="skirmish-settings">
               { gameModeSelect.element }
               { playerColorSelect.element }
               { aiLevelSelect.element }
               { openingSelection.element }
               { chess960Selection }
            </div>
            { skirmishMapPreview }
         </div>
         <div class="skirmish-start-button-area">
            { errorReporter }
            <Button onClick={startGame} text="开始游戏" />
         </div>
      </Window>
   )

   setTimeout(() => {
      windowBackground.appendChild(skirmishWindow)
      recreatePositionPreview()
   }, 500)
   document.body.appendChild(windowBackground)
   return windowBackground
}
