import { h } from 'tsx-dom'
import { Context } from '../context'
import { ref, Ref } from '../util/ref'

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
      if (e.ctrlKey && e.key === '`') {
         debugConsole.style.display = debugConsole.style.display === 'none' ? 'flex' : 'none'
         input.focus()
      }
   })

   document.body.appendChild(debugConsole)
}

function handleCommand(inputValue: string) {
   const parts = inputValue.trim().split(' ')
   const cmd = parts[0]
   const args = parts.slice(1)
   switch (cmd) {
      case 'setpiece': setPiece(args); break
      default: dbgError(`"${cmd}" 不是内部或外部命令，也不是可运行的程序或批处理文件`)
   }
}

function setPiece(parts: string[]) {
   if (dbg_PlayingContext.value === undefined) {
      dbgError('setpiece: 没有正在进行中的对局，请先开始一个对局')
      return
   }

   if (parts.length === 0) {
      dbgError('setpiece: 缺少参数')
      return
   }

   const square = parts[0]
   if (square.length !== 2
       || square.charCodeAt(0) < 'a'.charCodeAt(0) || square.charCodeAt(0) > 'i'.charCodeAt(0)
       || square.charCodeAt(1) < '1'.charCodeAt(0) || square.charCodeAt(1) > '8'.charCodeAt(0)) {
      dbgError('setpiece: 棋盘坐标格式错误')
   }

   const piece = parts.length > 1
      ? (parts[1] !== '-' ? parts[1] : undefined)
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

function addElementToDisplay(element: HTMLElement) {
   dbg_DisplayElement.value?.appendChild(element)
   dbg_DisplayElement.value?.scrollTo(0, dbg_DisplayElement.value.scrollHeight)
}

function echoback(text: string) {
   addElementToDisplay(<div class="debug-echo">&gt; {text}</div>)
}

export function dbgError(message: string) {
   addElementToDisplay(<div class="debug-error">{message}</div>)
}

export function dbgWarn(message: string) {
   addElementToDisplay(<div class="debug-warn">{message}</div>)
}

export function dbgInfo(message: string) {
   addElementToDisplay(<div class="debug-info">{message}</div>)
}

export function dbg(message: string) {
   addElementToDisplay(<div class="debug-log">{message}</div>)
}
