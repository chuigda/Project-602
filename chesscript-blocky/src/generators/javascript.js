import { Order } from 'blockly/javascript'

export const forBlock = {
   multiline_text(block, generator) {
      const text = block.getFieldValue('TEXT')
      const lines = text.split('\n')
      const finalCode = `'${lines.join("\\n")}'`
      return [finalCode, Order.ATOMIC]
   },
   event_def(block, generator) {
      const name = block.getFieldValue('NAME')
      const statements = generator.statementToCode(block, 'STATEMENTS')
      const code = `export const Event_${name} = async cx => {
${statements}}
`
      return code
   },
   anonymous_fndef(block, generator) {
      const statements = generator.statementToCode(block, 'STATEMENTS')
      const code = `async (...args: any[]) => {
${statements}}`
      return code
   },
   speak(block, generator) {
      const name = block.getFieldValue('NAME')
      const emotion = block.getFieldValue('EMOTION')
      const text = generator.valueToCode(block, 'TEXT', Order.ATOMIC)
      if (emotion) {
         return `await cx.speak('${name}', ${text}, '${emotion}')\n`
      } else {
         return `await cx.speak('${name}', ${text})\n`
      }
   },
   system_info(block, generator) {
      const text = generator.valueToCode(block, 'TEXT', Order.ATOMIC)
      return `await cx.showPrompt('system', ${text})\n`
   },
   prompt_info(block, generator) {
      const text = generator.valueToCode(block, 'TEXT', Order.ATOMIC)
      return `await cx.showPrompt('prompt', ${text})\n`
   },
   set_fen(block, generator) {
      const fen = generator.valueToCode(block, 'FEN', Order.ATOMIC)
      return `await cx.setFen(${fen})\n`
   },
   show_dialogue() {
      return `await cx.showDialogue()\n`
   },
   hide_dialogue() {
      return `await cx.hideDialogue()\n`
   },
   enable_chessboard() {
      return `cx.enableChessboard()\n`
   },
   disable_chessboard() {
      return `cx.disableChessboard()\n`
   },
   highlight_square(block, generator) {
      const square = block.getFieldValue('SQUARE')
      return `await cx.highlightSquare('${square}')\n`
   },
   wait_for_position(block, generator) {
      const condition = generator.statementToCode(block, 'CONDITION')
      return `await cx.waitForPosition(
${condition}
)\n`
   }
}
