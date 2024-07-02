import { h } from 'tsx-dom'
import * as fischer from 'fischer960'
import { DoubleOpenScreen } from '../widgets/double-open-screen'
import { Select } from '../widgets/select'
import { Window } from '../widgets/window'
import { sleep } from '../util/sleep'
import { Button } from '../widgets/button'
import { createSkirmishGameplayWindow } from './gameplay'
import { Ref, ref } from '../util/ref'

import './skirmish.css'
import { globalResource } from '..'
import { PlayerSide } from '../chess/chessgame'

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
   const createInitialPositionPreview = () => {
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

   const openingSelection = <Select title="开局选择" options={openingOptions} onChange={chooseSpecificPosition}/>
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
         openingSelection.style.display = 'none'
      }
      else {
         chess960Selection.style.display = 'none'
         openingSelection.style.display = 'flex'
      }

      createInitialPositionPreview()
   }

   const onChoosePlayerSide = (side: PlayerSide) => {
      playerSide.value = side
   }

   const onChooseAILevel = (level: number) => {
      aiLevel.value = level
   }

   const startGame = async () => {
      createSkirmishGameplayWindow(
         startPosition.value,
         playerSide.value,
         aiLevel.value,
         false
      )

      await sleep(300)
      windowBackground.remove()
   }

   const skirmishWindow = (
      <Window title="遭遇战" height="65vh" onClose={async () => {
         (windowBackground.children[0] as HTMLElement).style.height = '0';
         (windowBackground.children[1] as HTMLElement).style.height = '0';
         await sleep(300)
         windowBackground.remove()
      }}>
         <div class="skirmish-content">
            <div class="skirmish-settings">
               <Select title="游戏模式"
                       options={[
                        {text: '标准国际象棋', value: 'chess'},
                        {text: '国际象棋960', value: 'chess960'}
                       ]}
                       onChange={onChooseGameMode}
               />
               <Select title="玩家颜色"
                       options={[
                        {text: '白色', value: 'white'},
                        {text: '黑色', value: 'black'}
                       ]}
                       onChange={onChoosePlayerSide}
               />
               <Select title="电脑难度"
                       options={[
                        {text: '等级 1', value: 1},
                        {text: '等级 2', value: 2},
                        {text: '等级 3', value: 3},
                        {text: '等级 4', value: 4},
                        {text: '等级 5', value: 5},
                        {text: '等级 6', value: 6},
                        {text: '等级 7', value: 7},
                        {text: '等级 8', value: 8},
                       ]}
                       onChange={onChooseAILevel}
               />
               { openingSelection }
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
      createInitialPositionPreview()
   }, 500)
   document.body.appendChild(windowBackground)
   return windowBackground
}

export function create2DChessboardFromFen(fen: string): HTMLElement[] {
   const elements = []
   const layout = fen.split(' ')[0]
   const ranks = layout.split('/')

   for (let rank = 0; rank < ranks.length; rank++) {
      const rankString = ranks[rank]
      let file = 0
      for (const char of rankString) {
         if (char >= '1' && char <= '8') {
            const spaceCount = parseInt(char)
            for (let i = 0; i < spaceCount; i++) {
               const color = (rank + file) % 2 === 0 ? 'light-square' : 'dark-square'
               elements.push(<div class={`chessboard-square ${color}`} />)
               file += 1
            }
         } else {
            const color = (rank + file) % 2 === 0 ? 'light-square' : 'dark-square'
            elements.push(
               <div class={`chessboard-square ${color}`}>
                  <span class={`chesspiece chesspiece-${char}`} />
               </div>
            )
            file += 1
         }
      }
   }

   return elements
}
