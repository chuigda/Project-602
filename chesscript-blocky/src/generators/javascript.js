import { Order } from 'blockly/javascript'

export const forBlock = {
   multiline_text(block, generator) {
      const text = block.getFieldValue('TEXT')
      const lines = text.split('\n')
      const finalCode = `'${lines.join("\\n")}'`
      return [finalCode, Order.ATOMIC]
   },
   local_variable(block) {
      const name = block.getFieldValue('NAME')
      return [name, Order.ATOMIC]
   },
   context_variable(block) {
      const name = block.getFieldValue('NAME')
      return [`cx.variables['${name}'].value`, Order.ATOMIC]
   },
   is_context_var_defined(block) {
      const name = block.getFieldValue('NAME')
      return [`!!cx.variables['${name}']`, Order.ATOMIC]
   },
   event_def(block, generator) {
      const name = block.getFieldValue('NAME')
      const statements = generator.statementToCode(block, 'STATEMENTS')
      const code = `export const Event_${name} = async cx => {
${statements}}
`
      return code
   },
   startup_event(block) {
      const name = block.getFieldValue('NAME')
      return `export const StartingEvent = '${name}'\n`
   },
   use_character(block, generator) {
      const characters = generator.valueToCode(block, 'CHARACTERS', Order.ATOMIC)
      return `export const CharacterUse = ${characters}\n`
   },
   return_result(block, generator) {
      const result = generator.valueToCode(block, 'RESULT', Order.ATOMIC)
      return `return ${result}\n`
   },
   inline_javascript(block) {
      const text = block.getFieldValue('TEXT')
      return `${text}\n`
   },
   inline_javascript_expr(block) {
      const text = block.getFieldValue('TEXT')
      return [text, Order.ATOMIC]
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
   set_variant(block) {
      const variant = block.getFieldValue('VARIANT')
      return `await cx.setVariant('${variant}')\n`
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
      const color = block.getFieldValue('COLOR')
      const persist = block.getFieldValue('PERSIST') === 'TRUE'
      return `await cx.highlightSquare('${square}', '${color}', ${persist})\n`
   },
   wait_for_position(block, generator) {
      const condition = generator.statementToCode(block, 'CONDITION')
      return `await cx.waitForPosition(chessGame => {
${condition}})\n`
   },
   setup_skirmish_mode() {
      return `await cx.setupSkirmishMode()\n`
   }
}
