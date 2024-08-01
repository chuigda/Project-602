export const ChessBlocks = [
   {
      type: 'set_fen',
      message0: '设置局面 %1',
      args0: [
         {
            type: 'input_value',
            name: 'FEN',
            check: 'String',
         },
      ],
      colour: 30,
      previousStatement: null,
      nextStatement: null
   },
   {
      type: 'enable_chessboard',
      message0: '允许操作棋盘',
      colour: 30,
      previousStatement: null,
      nextStatement: null
   },
   {
      type: 'disable_chessboard',
      message0: '禁止操作棋盘',
      colour: 30,
      previousStatement: null,
      nextStatement: null
   },
   {
      type: 'highlight_square',
      message0: '高亮方格 %1',
      args0: [
         {
            type: 'field_input',
            name: 'SQUARE',
            check: 'String'
         }
      ],
      colour: 30,
      previousStatement: null,
      nextStatement: null
   },
   {
      type: 'wait_for_position',
      message0: '等待局面（按条件）\n%1',
      args0: [
         {
            type: 'input_value',
            name: 'CONDITION'
         }
      ],
      colour: 30,
      previousStatement: null,
      nextStatement: null
   }
]
