import * as Blockly from 'blockly'
import { javascriptGenerator } from 'blockly/javascript'
import { save, load } from './serialization'
import { toolbox } from './toolbox'
import './index.css'

const blocklyDiv = $('blocklyDiv')
const ws = Blockly.inject(blocklyDiv, {
   toolbox,
   transcan: true
})
load(ws)
updateGeneratedCode()

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

function updateGeneratedCode() {
   const code = javascriptGenerator.workspaceToCode(ws)
   $('generatedCode').textContent = code
}
