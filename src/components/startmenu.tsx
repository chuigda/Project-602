import { h } from 'tsx-dom'
import './startmenu.css'
import { sleep } from '../util/sleep'
import { createCheckmateWindow } from './checkmate'

export function createStartMenu(): HTMLElement {
   const startMenu = (<div class="start-menu-container">
      <div class="start-menu-background-half" id="start-menu-background-upper" />
      <div class="start-menu-background-half" id="start-menu-background-lower" />
   </div>) as HTMLElement

   setTimeout(() => {
      $('start-menu-background-upper').style.height = '50%'
      $('start-menu-background-lower').style.height = '50%'
   }, 50)

   const startMenuButtons = <div class="start-menu-buttons" />

   const startMenuButtonList = (
      <div class="start-menu-button-list">
         <div class="start-menu-game-title">Project-602</div>
         <div class="start-menu-split" />
         {startMenuButtons}
      </div>
   )

   const asyncUpdates = async () => {
      await sleep(300)
      startMenu.appendChild(startMenuButtonList)

      await sleep(300)
      startMenuButtonList.style.left = '100px'

      await sleep(300)
      startMenuButtons.appendChild(<div>新战役</div>)
      startMenuButtons.style.height = '14pt'
      await sleep(125)
      startMenuButtons.appendChild(<div>载入储存游戏</div>)
      startMenuButtons.style.height = 'calc(14pt * 2 + 2px)'
      await sleep(125)
      startMenuButtons.appendChild(<div>遭遇战</div>)
      startMenuButtons.style.height = 'calc(14pt * 3 + 4px)'
      await sleep(125)
      startMenuButtons.appendChild(<div>系统设定</div>)
      startMenuButtons.style.height = 'calc(14pt * 4 + 4px)'
      await sleep(125)
      startMenuButtons.appendChild(<div>关于</div>)
      startMenuButtons.style.height = 'calc(14pt * 5 + 6px)'
      await sleep(125)
      startMenuButtons.appendChild(<div onClick={testCheckmate}>测试将死页面</div>)
      startMenuButtons.style.height = 'calc(14pt * 6 + 6px)'
      await sleep(125)
   }
   asyncUpdates()

   document.body.appendChild(startMenu)
   return startMenu
}

function testCheckmate() {
   createCheckmateWindow({
      startPos: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -',
      movesPlayed: '1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6 6. Bg5 e6 7. f4 Qb6 8. Qd2 Qxb2 9. Rb1 Qa3 10. Rb3 Qa5 11. Be2 Nc6 12. Bxf6 gxf6 13. O-O Qc5 14. Kh1 Qxd4 15. Rd1 Qxd2 16. Rxd2 Be7 17. f5 Ne5 18. Na4 b5 19. Nb2 Bb7 20. fxe6 fxe6 21. Bh5+ Kf8 22. Re2 Rg8 23. c4 Rg5 24. Bf3 Bc6 25. cxb5 axb5 26. h4 Rg6 27. Nd3 Nxf3 28. gxf3 Rg3 29. Nf4 Kf7 30. Kh2 Rgg8 31. Rbe3 e5 32. Nd5 Bxd5 33. exd5 Ra4 34. Kh3 f5 0-1',
      moveCount: 34,

      brilliantCount: 0,
      excellentCount: 1,
      goodCount: 26,
      interestingCount: 4,
      inaccuracyCount: 0,
      mistakeCount: 2,
      blunderCount: 1,
   })
}
