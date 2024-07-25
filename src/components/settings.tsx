import { h } from 'tsx-dom'
import { globalResource } from '..'
import { ChessNotation, ChessPieceNotation, defaultConfig, saveConfig } from '../config'
import { DoubleOpenScreen } from '../widgets/double-open-screen'
import { createSelect, setCurrentOption } from '../widgets/select'
import { Window } from '../widgets/window'
import { Button } from '../widgets/button'
import { sleep } from '../util/sleep'
import { copydeep } from '../util/copydeep'

import './settings.css'

export function showSettingsWindow(): HTMLElement {
   const windowBackground = <DoubleOpenScreen backgroundColor="black" zIndex={2000} />

   // const setupThemeColor = (value: string) => {
   //    $('theme-color').innerText = `
   //    * {
   //       --theme-color: rgb(${value});
   //       --theme-color-semi-transparent: rgba(${value}, 0.5);
   //       --theme-color-one-third-transparent: rgba(${value}, 0.33);
   //    }
   //    `
   // }

   const chessNotationSelect = createSelect<ChessNotation>(
      '记谱格式',
      [
         { text: 'SAN (e4, Nf3)', value: 'san' },
         { text: 'LAN (e2-e4, Ng1-f3)', value: 'lan' },
         { text: 'UCI (e2e4, g1f3)', value: 'uci' }
      ],
      setChessNotation,
      globalResource.value.config.chessNotation
   )

   const chessPieceNotationSelect = createSelect<ChessPieceNotation>(
      '棋子标记',
      [
         { text: '拉丁字母 (RNBQKP)', value: 'latin' },
         { text: '汉字 (车马象后王兵)', value: 'chinese' }
      ],
      setChessPieceNotation,
      globalResource.value.config.chessPieceNotation
   )

   const highResPortraitSelect = createSelect<boolean>(
      '高清素材',
      [
         { text: '关', value: false },
         { text: '开', value: true }
      ],
      setHighResPortrait,
      globalResource.value.config.highResPortrait
   )

   const restoreDefault = () => {
      globalResource.value.config = copydeep(defaultConfig)

      setCurrentOption(chessNotationSelect, defaultConfig.chessNotation)
      setCurrentOption(chessPieceNotationSelect, defaultConfig.chessPieceNotation)
      setCurrentOption(highResPortraitSelect, defaultConfig.highResPortrait)
   }

   const settingsWindow = (
      <Window title="系统设定" height="65vh" onClose={async () => {
         (windowBackground.children[0] as HTMLElement).style.height = '0';
         (windowBackground.children[1] as HTMLElement).style.height = '0';
         await sleep(300)
         windowBackground.remove()
      }}>
         <div class="settings-content">
            {/* <Select title="颜色主题" options={[
               { text: "青色", value: "127, 255, 212" },
               { text: "绿色", value: "173, 255, 47" },
            ]} onChange={setupThemeColor} /> */}
            { chessNotationSelect.element }
            { chessPieceNotationSelect.element }
            { highResPortraitSelect.element }
         </div>
         <div class="settings-button-area">
            <Button text="恢复默认" onClick={restoreDefault} />
         </div>
      </Window>
   )

   setTimeout(() => windowBackground.appendChild(settingsWindow), 500)
   document.body.appendChild(windowBackground)
   return windowBackground
}

function setChessNotation(value: ChessNotation) {
   globalResource.value.config.chessNotation = value
   saveConfig(globalResource.value.config)
}

function setChessPieceNotation(value: ChessPieceNotation) {
   globalResource.value.config.chessPieceNotation = value
   saveConfig(globalResource.value.config)
}

function setHighResPortrait(value: boolean) {
   globalResource.value.config.highResPortrait = value
   saveConfig(globalResource.value.config)
}