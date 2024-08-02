export const ChessBlocks = [
   {
      type: 'current_fen',
      message0: '当前局面',
      output: 'String',
      colour: 30
   },
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
      type: 'set_variant',
      message0: '设置变体 %1',
      args0: [
         {
            type: 'field_dropdown',
            name: 'VARIANT',
            options: [
               ['标准国际象棋', 'chess'],
               ['吃光敌子', 'captureall'],
               ['单人游戏', 'singleplayer'],
               ['标准国际象棋 + WGC0310', 'chesswith310'],
               ['吃光敌子 + WGC0310', 'captureall310']
            ]
         }
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
      type: 'highlight_square_const',
      message0: '高亮方格 %1 为颜色 %2 持久化 %3',
      args0: [
         {
            type: 'field_input',
            name: 'SQUARE',
            check: 'String'
         },
         {
            type: 'field_dropdown',
            name: 'COLOR',
            options: [
               ['绿色', 'greenyellow'],
               ['青色', 'cyan'],
               ['橘红', 'orangered']
            ]
         },
         {
            type: 'field_checkbox',
            name: 'PERSIST'
         }
      ],
      colour: 30,
      previousStatement: null,
      nextStatement: null
   },
   {
      type: 'highlight_square',
      message0: '高亮方格 %1 为颜色 %2 持久化 %3',
      args0: [
         {
            type: 'input_value',
            name: 'SQUARE',
            check: 'String'
         },
         {
            type: 'field_dropdown',
            name: 'COLOR',
            options: [
               ['绿色', 'greenyellow'],
               ['青色', 'cyan'],
               ['橘红', 'orangered']
            ]
         },
         {
            type: 'field_checkbox',
            name: 'PERSIST'
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
            type: 'input_statement',
            name: 'CONDITION'
         }
      ],
      colour: 30,
      previousStatement: null,
      nextStatement: null
   },
   {
      type: 'setup_skirmish_mode',
      message0: '启用遭遇战模式逻辑，AI 等级 %1',
      args0: [
         {
            type: 'field_input',
            name: 'LEVEL',
            check: 'Number'
         }
      ],
      colour: 30,
      previousStatement: null,
      nextStatement: null
   },
   {
      type: 'sleep',
      message0: '等待 %1 毫秒',
      args0: [
         {
            type: 'field_input',
            name: 'TIME',
            check: 'Number'
         }
      ],
      colour: 30,
      previousStatement: null,
      nextStatement: null
   },
   {
      type: 'play_move',
      message0: '走棋 (UCI) %1',
      args0: [
         {
            type: 'field_input',
            name: 'MOVE',
            check: 'String'
         }
      ],
      colour: 30,
      previousStatement: null,
      nextStatement: null
   }
]
