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
   },
   {
      type: 'return_result',
      message0: '返回结果 %1',
      args0: [
         {
            type: 'input_value',
            name: 'RESULT'
         }
      ],
      colour: '%{BKY_PROCEDURES_HUE}',
      previousStatement: null
   },
   {
      type: 'inline_javascript',
      message0: '内联 JavaScript 语句\n%1',
      args0: [
         {
            type: 'field_multilinetext',
            name: 'TEXT',
            check: 'String'
         }
      ],
      colour: '%{BKY_PROCEDURES_HUE}',
      previousStatement: null,
      nextStatement: null
   },
   {
      type: 'inline_javascript_expr',
      message0: '内联 JavaScript 表达式\n%1',
      args0: [
         {
            type: 'field_multilinetext',
            name: 'TEXT',
            check: 'String'
         }
      ],
      colour: '%{BKY_PROCEDURES_HUE}',
      output: null
   },
   {
      type: 'push_next_event',
      message0: '将事件 %1 加入事件队列',
      args0: [
         {
            type: 'field_input',
            name: 'EVENT',
            check: 'String'
         }
      ],
      colour: '%{BKY_PROCEDURES_HUE}',
      previousStatement: null,
      nextStatement: null
   }
]
