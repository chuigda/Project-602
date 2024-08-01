export const EventBlocks = [
   {
      type: 'event_def',
      message0: '定义事件 %1 \n%2',
      args0: [
         {
            type: 'field_input',
            name: 'NAME',
            check: 'String'
         },
         {
            type: 'input_statement',
            name: 'STATEMENTS'
         }
      ],
      colour: '%{BKY_PROCEDURES_HUE}'
   },
   {
      type: 'anonymous_fndef',
      message0: '匿名函数\n%1',
      args0: [
         {
            type: 'input_statement',
            name: 'STATEMENTS'
         }
      ],
      colour: '%{BKY_PROCEDURES_HUE}',
      output: null
   },
   {
      type: 'startup_event',
      message0: '定义事件 %1 为起始事件',
      args0: [
         {
            type: 'field_input',
            name: 'NAME',
            check: 'String'
         }
      ],
      colour: '%{BKY_PROCEDURES_HUE}'
   },
   {
      type: 'use_character',
      message0: '导入角色 %1',
      args0: [
         {
            type: 'input_value',
            name: 'CHARACTERS',
            check: 'Array'
         }
      ],
      colour: '%{BKY_PROCEDURES_HUE}'
   }
]
