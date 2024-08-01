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
   }
]
