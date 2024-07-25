import { dbgError } from "./components/debugconsole"
import { copydeep } from "./util/copydeep"

export type ChessNotation = 'san' | 'lan' | 'uci'
export type ChessPieceNotation = 'latin' | 'chinese'

export interface Config {
   chessNotation: ChessNotation
   chessPieceNotation: ChessPieceNotation
   highResPortrait: boolean
}

export const defaultConfig: Config = {
   chessNotation: 'san',
   chessPieceNotation: 'latin',
   highResPortrait: false
}

export function loadConfig() {
   const configText = localStorage.getItem('config')
   if (!configText) {
      return copydeep(defaultConfig)
   }

   try {
      return JSON.parse(configText)
   }
   catch (e) {
      dbgError(`loadConfig: 读取配置信息遇到问题 ${e}`)
      localStorage.removeItem('config')
      return copydeep(defaultConfig)
   }
}

export function saveConfig(config: Config) {
   localStorage.setItem('config', JSON.stringify(config))
}
