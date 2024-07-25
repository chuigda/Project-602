import { h } from 'tsx-dom'
import { Context } from '../context'
import { createCheckmateWindow } from './checkmate'
import { ref, Ref } from '../util/ref'
import { sleep } from '../util/sleep'

import './debugconsole.css'

export const dbg_PlayingContext: Ref<Context | undefined> = ref(undefined)
export const dbg_DisplayElement: Ref<HTMLElement | undefined> = ref(undefined)

export function createDebugConsole() {
   const display = <div class="debug-display" />
   const input = <input class="debug-input" /> as HTMLInputElement

   const debugConsole = (
      <div class="debug-console" style={{ display: 'none' }}>
         {display}
         {input}
      </div>
   )

   input.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
         const inputValue = input.value
         if (inputValue === '') {
            return
         }

         echoback(inputValue)
         input.value = ''

         handleCommand(inputValue)
      }
   })

   dbg_DisplayElement.value = display

   document.addEventListener('keydown', e => {
      if (e.shiftKey && e.ctrlKey && e.key === 'p') {
         debugConsole.style.display = debugConsole.style.display === 'none' ? 'flex' : 'none'
         dbg_DisplayElement.value?.scrollTo(0, dbg_DisplayElement.value.scrollHeight)
         input.focus()
      }
   })

   window.addEventListener('error', e => {
      dbgWarn(`未捕获的错误: ${e.error.message}`)
      if (e.error && e.error.stack) {
         for (const line of e.error.stack.split('\n')) {
            if (line.includes('Error: ')) {
               continue
            }
            else if (line.startsWith('  ')) {
               dbgWarn(sanitizePath(line))
            }
            else {
               dbgWarn(`  ${sanitizePath(line)}`)
            }
         }
      }
      else
      {
         dbgWarn(`位置: ${sanitizePath(e.filename)}}:${e.lineno}:${e.colno}`)
      }
   })

   document.body.appendChild(debugConsole)
}

function handleCommand(inputValue: string) {
   const parts = inputValue.trim().split(' ')
   const cmd = parts[0]
   const args = parts.slice(1)
   switch (cmd) {
      case 'clear': dbg_DisplayElement.value!.innerHTML = ''; break

      case 'setpiece': setPiece(args); break
      case 'checkmate': checkmate(args); break
      case 'nocheckmate': removeCheckmate(); break
      case 'error': makeError(args); break
      case 'help': showHelp(); break

      case 'love': babyDontHurtMe(); break
      default: dbgError(`"${cmd}" 不是内部或外部命令，也不是可运行的程序或批处理文件`)
   }
}

function setPiece(args: string[]) {
   if (dbg_PlayingContext.value === undefined) {
      dbgError('setpiece: 没有正在进行中的对局，请先开始一个对局')
      return
   }

   if (args.length === 0) {
      dbgError('setpiece: 缺少参数')
      return
   }

   const square = args[0]
   if (square.length !== 2
       || square.charCodeAt(0) < 'a'.charCodeAt(0) || square.charCodeAt(0) > 'i'.charCodeAt(0)
       || square.charCodeAt(1) < '1'.charCodeAt(0) || square.charCodeAt(1) > '8'.charCodeAt(0)) {
      dbgError('setpiece: 棋盘坐标格式错误')
   }

   const piece = args.length > 1
      ? (args[1] !== '-' ? args[1] : undefined)
      : undefined
   if (piece) {
      if (piece.length !== 1) {
         dbgError('setpiece: 棋子格式错误')
         return
      }

      const lowerCased = piece.toLowerCase()
      if (![...'prnbqkw'].includes(lowerCased)) {
         dbgError('setpiece: 棋子格式错误')
         return
      }
   }

   dbg_PlayingContext.value.setPiece(square, piece as any)
   dbgInfo(`setpiece: 启用秘籍!`)
}

function checkmate(args: string[]) {
   const title = args.length > 0 ? args[0].toUpperCase() : undefined

   createCheckmateWindow({
      title,

      startPos: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -',
      moves: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'a6'],
      uciMoves: ['e2e4', 'c7c5', 'g1f3', 'd7d6', 'd2d4', 'c5d4', 'f3d4', 'g8f6', 'b1c3', 'a7a6'],
      moveCount: 5
   })
}

function showHelp() {
   dbgInfo('可用命令:')
   addElementToDisplay(
      <table class="debug-console-table debug-info">
         <tbody>
            <tr>
               <th>命令</th>
               <th>参数</th>
               <th>描述</th>
            </tr>
            <tr>
               <td>checkmate</td>
               <td>&lt;标题&gt;</td>
               <td>展示将死窗口，标题是可选的</td>
            </tr>
            <tr>
               <td>clear</td>
               <td />
               <td>清空控制台</td>
            </tr>
            <tr>
               <td>error</td>
               <td>&lt;消息&gt;</td>
               <td>抛出一个错误</td>
            </tr>
            <tr>
               <td>help</td>
               <td />
               <td>显示此帮助</td>
            </tr>
            <tr>
               <td>nocheckmate</td>
               <td />
               <td>移除将死窗口</td>
            </tr>
            <tr>
               <td>setpiece</td>
               <td>&lt;坐标&gt; &lt;棋子&gt;</td>
               <td>在指定坐标放置棋子，第二个参数留空或设为 - 表示清空该格</td>
            </tr>
         </tbody>
      </table>
   )
}

function removeCheckmate() {
   const checkmate = $('checkmate')
   if (!checkmate) {
      dbgWarn('nocheckmate: 目前没有将死窗口')
      return
   }

   checkmate.remove()
}

function makeError(args: string[]) {
   throw new Error(args.join(' '))
}

async function babyDontHurtMe() {
   const div = <pre class="debug-info" />
   addElementToDisplay(div)

   const string = `All I want is a room somewhere
Far away from the cold night air
With one enormous chair
Aow, wouldn't it be loverly?

Lots of choc'lates for me to eat
Lots of coal makin' lots of 'eat
Warm face, warm 'ands, warm feet
Aow, wouldn't it be loverly?

Aow, so loverly sittin' abso-bloomin'-lutely still
I would never budge 'till spring
Crept over me windowsill

Someone's 'ead restin' on my knee
Warm an' tender as 'e can be
Who takes good care of me
Aow, wouldn't it be loverly?

Loverly, loverly
Loverly, loverly`

   for (const line of string.split('\n')) {
      await sleep(80)
      div.innerText += `${line}\n`
      dbg_DisplayElement.value?.scrollTo(0, dbg_DisplayElement.value.scrollHeight)
   }
}

function addElementToDisplay(element: HTMLElement) {
   dbg_DisplayElement.value?.appendChild(element)
   dbg_DisplayElement.value?.scrollTo(0, dbg_DisplayElement.value.scrollHeight)
}

function echoback(text: string) {
   addElementToDisplay(<pre class="debug-echo">&gt; {text}</pre>)
}

function sanitizePath(path: string): string {
   if (path.includes('http://') || path.includes('https://')) {
      path = path.replace('http://localhost:5173/', '')
         .replace('http://localhost:5174', '')
         .replace('https://nerori.7dg.tech', '')
   }

   if (path.includes('?')) {
      path = path.replace(/\?t=[0-9]+/, '')
   }

   return path
}

export function dbgError(message: string) {
   addElementToDisplay(<pre class="debug-error">{message}</pre>)
}

export function dbgWarn(message: string) {
   addElementToDisplay(<pre class="debug-warn">{message}</pre>)
}

export function dbgInfo(message: string) {
   addElementToDisplay(<pre class="debug-info">{message}</pre>)
}

export function dbg(message: string) {
   addElementToDisplay(<pre class="debug-log">{message}</pre>)
}
