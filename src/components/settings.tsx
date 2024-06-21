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
               { text: "绿色", value: "173, 255, 47" },
               { text: "青色", value: "127, 255, 212" }
            ]} onChange={setupThemeColor} />
            <Select title="记谱格式" options={[
               { text: "SAN (e4, Nf3)", value: "san" },
               { text: "UCI (e2e4, g1f3)", value: "uci" },
               { text: "LAN (e2-e4, Ng1-f3)", value: "lan" },
               { text: "1900 (P-K4, N-KB3)", value: "1900" }
            ]} />
            <Select title="棋子标记" options={[
               { text: "拉丁字母 (RNBQKP)", value: "latin" },
               { text: "特殊符号 (♖♘♗♕♔♙)", value: "chess" },
               { text: "汉字 (车马象后王兵)", value: "chinese" }
            ]} />
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
