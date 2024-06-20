import { h } from 'tsx-dom'
import { DoubleOpenScreen } from '../widgets/double-open-screen'
import { Select } from '../widgets/select'
import { Window } from '../widgets/window'
import { sleep } from '../util/sleep'

import './settings.css'

export function showSettingsWindow(): HTMLElement {
   const windowBackground = <DoubleOpenScreen backgroundColor="black" zIndex={2000} />

   const setupThemeColor = (value: string) => {
      $('theme-color').innerText = `
      * {
         --theme-color: rgb(${value});
         --theme-color-semi-transparent: rgba(${value}, 0.5);
         --theme-color-one-third-transparent: rgba(${value}, 0.33);
      }
      `
   }

   const settingsWindow = (
      <Window title="系统设定" height="65vh" onClose={async () => {
         (windowBackground.children[0] as HTMLElement).style.height = '0';
         (windowBackground.children[1] as HTMLElement).style.height = '0';
         await sleep(300)
         windowBackground.remove()
      }}>
         <div class="settings-content">
            <Select title="颜色主题" options={[
               { text: "青色", value: "127, 255, 212" },
               { text: "绿色", value: "173, 255, 47" }
            ]} onChange={setupThemeColor}/>
         </div>
         <div class="settings-button-area">
            <span>[恢复默认]</span>
         </div>
      </Window>
   )

   setTimeout(() => windowBackground.appendChild(settingsWindow), 500)
   document.body.appendChild(windowBackground)
   return windowBackground
}
