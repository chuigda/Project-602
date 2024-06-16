import { h } from 'tsx-dom'
import { DoubleOpenScreen } from '../widgets/double-open-screen'
import { Select } from '../widgets/select'
import { Window } from '../widgets/window'
import { sleep } from '../util/sleep'

import './skirmish.css'

export interface CommonOpeningPosition {
   eco: string
   name: string
   fen: string
}

export function showSkirmishWindow(commonOpeningPositions: CommonOpeningPosition[]): HTMLElement {
   const skirmishWindowBackground = <DoubleOpenScreen backgroundColor="black" zIndex={2000} />

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

   const openingSelection = <Select title="开局选择" options={openingOptions} />
   const chess960Selection = <div class="skirmish-chess960-selection">
      <span>局面编号</span>
      <input type="text" placeholder="取值范围 1~960，默认 518" />
   </div>

   const skirmishWindow = (
      <Window title="遭遇战" height="65vh" onClose={async () => {
         (skirmishWindowBackground.children[0] as HTMLElement).style.height = '0';
         (skirmishWindowBackground.children[1] as HTMLElement).style.height = '0';
         await sleep(300)
         skirmishWindowBackground.remove()
      }}>
         <div class="skirmish-content">
            <div class="skirmish-settings">
               <Select title="游戏模式"
                       options={[
                        {text: '标准国际象棋', value: ''},
                        {text: '国际象棋960', value: ''},
                        {text: '让一后', value: ''},
                        {text: '让一车', value: ''},
                        {text: '让一马', value: ''}
                       ]}
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
            <div class="skirmish-map-preview" />
         </div>
         <div class="skirmish-start-button-area">
            <span>[开始游戏]</span>
         </div>
      </Window>
   )

   setTimeout(() => skirmishWindowBackground.appendChild(skirmishWindow), 500)
   document.body.appendChild(skirmishWindowBackground)
   return skirmishWindowBackground
}
