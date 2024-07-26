import './mission.css'
import { startGameplay } from './gameplay_v2'

export async function showTestMissionWindow(zIndex: number) {
   await startGameplay(zIndex, async cx => {
      await cx.enterScript('/story/1_awakening.js')
      await cx.handleEvents()
   })
}
