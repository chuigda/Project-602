import * as Blockly from 'blockly'

import { javascriptGenerator } from 'blockly/javascript'
import { save, load } from './serialization'
import { toolbox } from './toolbox'

import { ChessBlocks } from './blocks/chess'
import { EventBlocks } from './blocks/event'
import { DialogueBlocks } from './blocks/dialogue'
import { forBlock } from './generators/javascript'

import './index.css'

Blockly.defineBlocksWithJsonArray(DialogueBlocks)
Blockly.defineBlocksWithJsonArray(ChessBlocks)
Blockly.defineBlocksWithJsonArray(EventBlocks)
Object.assign(javascriptGenerator.forBlock, forBlock)

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
