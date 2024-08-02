import * as Blockly from 'blockly'
import {registerFieldMultilineInput} from '@blockly/field-multilineinput'
import { javascriptGenerator } from 'blockly/javascript'
import { save, load } from './serialization'
import { toolbox } from './toolbox'
import * as zhCN from 'blockly/msg/zh-hans';

import { BaseBlocks } from './blocks/base'
import { VariableBlocks } from './blocks/variable'
import { ChessBlocks } from './blocks/chess'
import { EventBlocks } from './blocks/event'
import { DialogueBlocks } from './blocks/dialogue'
import { forBlock } from './generators/javascript'

import './index.css'

registerFieldMultilineInput()

Blockly.setLocale(zhCN)
Blockly.defineBlocksWithJsonArray(BaseBlocks)
Blockly.defineBlocksWithJsonArray(VariableBlocks)
Blockly.defineBlocksWithJsonArray(DialogueBlocks)
Blockly.defineBlocksWithJsonArray(ChessBlocks)
Blockly.defineBlocksWithJsonArray(EventBlocks)
Object.assign(javascriptGenerator.forBlock, forBlock)

let anotherWindow = window.open("/code-preview.html")
anotherWindow.onload = () => {
   updateGeneratedCode()
}

anotherWindow.onbeforeunload = () => {
   anotherWindow = null
}

window.onbeforeunload = () => {
   anotherWindow.close()
}

const blocklyDiv = $('blocklyDiv')
const ws = Blockly.inject(blocklyDiv, {
   toolbox,
   transcan: true,
   grid: {
      spacing: 20,
      length: 3,
      colour: '#ccc',
      snap: true
   }
})
load(ws)

ws.addChangeListener((e) => {
   if (e.isUiEvent) return
   save(ws)
})

ws.addChangeListener((e) => {
   if (
      e.isUiEvent ||
      e.type == Blockly.Events.FINISHED_LOADING ||
      ws.isDragging()
   ) {
      return
   }
   updateGeneratedCode()
})

$('createnew').onclick = () => {
   ws.clear()
   save(ws)
}

$('load').onclick = () => {
   const fileInput = document.createElement('input')
   fileInput.type = 'file'
   fileInput.accept = '.json'
   fileInput.onchange = () => {
      const file = fileInput.files[0]
      const reader = new FileReader()
      reader.onload = (e) => {
         const jsonText = e.target.result
         const workspaceObject = JSON.parse(jsonText)
         Blockly.Events.disable()
         Blockly.serialization.workspaces.load(workspaceObject, ws, false)
         Blockly.Events.enable()

         save(ws)
         updateGeneratedCode()
      }
      reader.readAsText(file)
   }
   fileInput.click()
}

$('save').onclick = () => {
   save(ws)

   const workspaceObject = Blockly.serialization.workspaces.save(ws)
   const jsonText = JSON.stringify(workspaceObject)

   const blob = new Blob([jsonText], { type: 'application/json' })
   const url = URL.createObjectURL(blob)
   const a = document.createElement('a')
   a.href = url
   a.download = 'workspace.json'
   a.click()
}

$('compile').onclick = () => {
   const code = `(() => ({
${indentCode(javascriptGenerator.workspaceToCode(ws))}
}))()
`

   const blob = new Blob([code], { type: 'text/javascript' })
   const url = URL.createObjectURL(blob)
   const a = document.createElement('a')
   a.href = url
   a.download = 'code.js'
   a.click()
}

$('run').onclick = () => {
   const script = `(() => ({
${indentCode(javascriptGenerator.workspaceToCode(ws))}
}))()
`

   const executeWindow = window.open('/index.html')
   executeWindow.addEventListener('message', (e) => {
      if (e.data.type === 'ready') {
         executeWindow.postMessage({
            type: 'start-gameplay',
            script
         })
      }
   })
}

function updateGeneratedCode() {
   const code = `(() => ({
${indentCode(javascriptGenerator.workspaceToCode(ws))}
}))()
`
   anotherWindow.document.getElementById('mainTextArea').textContent = code
}

function indentCode(code) {
   return code.split('\n').map((line) => `  ${line}`).join('\n')
}
