import { h } from 'tsx-dom'
import { DoubleOpenScreen } from '../widgets/double-open-screen'
import { Select } from '../widgets/select'
import { Window } from '../widgets/window'
import { sleep } from '../util/sleep'

import './skirmish.css'

export function showSkirmishWindow(): HTMLElement {
   const skirmishWindowBackground = <DoubleOpenScreen backgroundColor="black" zIndex={2000} />

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
                        {text: '白色', value: ''},
                        {text: '黑色', value: ''}
                       ]}
               />
               <Select title="电脑难度"
                       options={[
                        {text: '简单的电脑', value: ''},
                        {text: '中等的电脑', value: ''},
                        {text: '冷酷的电脑', value: ''}
                       ]}
               />
               <Select title="开局选择"
                       options={[
                        {text: '起始局面', value: ''},
                       ]}
               />
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
