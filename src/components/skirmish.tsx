import { h } from 'tsx-dom'
import * as fischer from 'fischer960'
import { DoubleOpenScreen } from '../widgets/double-open-screen'
import { Select } from '../widgets/select'
import { Window } from '../widgets/window'
import { sleep } from '../util/sleep'
import { CommonOpeningPosition } from '../chess/opening-book'
import { Button } from '../widgets/button'
import { createSkirmishGameplayWindow } from './gameplay'
import { GameAsset } from '../assetloader'
import { Ref, ref } from '../util/ref'

import './skirmish.css'

export function showSkirmishWindow(
   asset: GameAsset,
   commonOpeningPositions: CommonOpeningPosition[]
): HTMLElement {
   const windowBackground = <DoubleOpenScreen backgroundColor="black" zIndex={2000} />

   const openingOptions = [
      {
         text: '起始局面',
         value: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -',
      }
   ]

   for (const openingPosition of commonOpeningPositions) {
      openingOptions.push({
         text: `${openingPosition.eco} ${openingPosition.name}`,
         value: openingPosition.fen,
      })
   }

   const startPosition: Ref<string> = ref('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -')
   const playerSide: Ref<'white' | 'black'> = ref('white')

   const errorReporter = <span class="error-reporter" />

   const skirmishMapPreview = <div class="skirmish-map-preview" />
   const createInitialPositionPreview = () => {
      skirmishMapPreview.innerHTML = ''
      skirmishMapPreview.append(...createChessboardFromFen('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -'))
   }

   const chooseSpecificPosition = (positionFen: string) => {
      skirmishMapPreview.innerHTML = ''
      skirmishMapPreview.append(...createChessboardFromFen(positionFen))

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

   const startGame = () => createSkirmishGameplayWindow(
      asset,
      startPosition.value,
      playerSide.value,
      false
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
               />
               <Select title="电脑难度"
                       options={[
                        {text: '等级 1', value: '1'},
                        {text: '等级 2', value: '2'},
                        {text: '等级 3', value: '3'},
                        {text: '等级 4', value: '4'},
                        {text: '等级 5', value: '5'},
                        {text: '等级 6', value: '6'},
                        {text: '等级 7', value: '7'},
                        {text: '等级 8', value: '8'},
                       ]}
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

function createChessboardFromFen(fen: string): HTMLElement[] {
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
