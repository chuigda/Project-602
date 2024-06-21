import { h } from 'tsx-dom'
import { DoubleOpenScreen } from '../widgets/double-open-screen'
import { Window } from '../widgets/window'
import { sleep } from '../util/sleep'

import './about.css'

export function showAboutWindow(): HTMLElement {
   const windowBackground = <DoubleOpenScreen backgroundColor="black" zIndex={2000} />

   const aboutWindow = (
      <Window title="关于" height="65vh" onClose={async () => {
         (windowBackground.children[0] as HTMLElement).style.height = '0';
         (windowBackground.children[1] as HTMLElement).style.height = '0';
         await sleep(300)
         windowBackground.remove()
      }}>
         <div class="about-content">
            <div>第七通用设计公司荣誉出品</div>
            <br />
            <div class="about-content-inner">
               <div class="about-content-left">
                  <div>开发人员</div>
                  <div class="item">
                     主程序员：
                     <a href="https://github.com/chuigda" target="_blank">Chuigda</a>
                  </div>
                  <div class="item">
                     脚本引擎：
                     <a href="https://space.bilibili.com/3537124399778686" target="_blank">NeroRi-</a>
                  </div>
                  <br />
                  <div>文本工作</div>
                  <div class="item">
                     策划：
                     <a href="https://github.com/chuigda" target="_blank">Chuigda</a>
                  </div>
                  <div class="item">
                     剧本：
                     <a href="https://space.bilibili.com/3537124399778686" target="_blank">NeroRi-</a>
                  </div>
                  <br />
                  <div>美术</div>
                  <div class="item">
                     三维建模：
                     <a href="https://huajia.163.com/main/profile/MrjmvONE" target="_blank">石硴</a>
                  </div>
                  <div class="item">
                     角色设计与立绘：
                     <a>昏睡白糖</a>，
                     <a href="https://huajia.163.com/main/profile/YBPbpbqr" target="_blank">缸脑萝</a>
                  </div>
                  <br />
                  <div>国际象棋</div>
                  <div class="item">
                     教学设计：
                     <a href="https://lichess.org/learn" target="_blank">Lichess</a>
                  </div>
                  <div class="item">
                     引擎：
                     <a href="https://github.com/fairy-stockfish/Fairy-Stockfish" target="_blank">Fairy-Stockfish</a>；
                     <a href="https://github.com/fairy-stockfish/fairy-stockfish.wasm" target="_blank">WASM 移植</a>
                  </div>
                  <div class="item">
                     开局书：
                     <a href="https://github.com/lichess-org/chess-openings" target="_blank">lichess-org/chess-openings</a>
                  </div>
                  <div class="item">
                     平面棋：
                     <a href="https://commons.wikimedia.org/wiki/Category:SVG_chess_pieces" target="_blank">Wikimedia</a>
                  </div>
               </div>
               <div class="about-content-right">
                  <div>特别鸣谢</div>
                  <div class="item">
                     <a href="https://space.bilibili.com/14980676" target="_blank">快乐小凤w</a>
                  </div>
                  <div class="item">
                     <a href="https://github.com/flaribbit" target="_blank">Flaribbit</a>
                  </div>
                  <div class="item">
                     <a href="https://github.com/Shimogawa" target="_blank">Shimogawa</a>
                  </div>
                  <div class="item">
                     <a href="https://github.com/eoiles" target="_blank">eoiles</a>
                  </div>
               </div>
            </div>
            <br />
         </div>
         <div class="about-content-bottom">
            <div>
               本程序是开源软件，源码托管在 <a href="https://github.com/chuigda/Project-602" target="_blank">chuigda/project602</a>
            </div>
            <div>
               程序源码以 <a href="https://www.gnu.org/licenses/agpl-3.0.en.html" target="_blank">AGPLv3</a> 协议发布；
               美术素材除白后立绘外均以 <a href="https://creativecommons.org/licenses/by-sa/4.0/deed.zh-hans" target="_blank">CC-BY-SA 4.0</a> 协议发布
            </div>
         </div>
      </Window>
   )

   setTimeout(() => windowBackground.appendChild(aboutWindow), 500)
   document.body.appendChild(windowBackground)
   return windowBackground
}