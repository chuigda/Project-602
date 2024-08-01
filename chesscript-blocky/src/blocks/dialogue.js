export const DialogueBlocks = [
   {
      type: 'speak',
      message0: '%1 以情绪 %2 说 %3',
      args0: [
         {
            type: 'field_input',
            name: 'NAME',
            check: 'String'
         },
         {
            type: 'field_input',
            name: 'EMOTION',
            check: 'String',
            text: '常态'
         },
         {
            type: 'input_value',
            name: 'TEXT',
            check: 'String'
         }
      ],
      colour: 30,
      previousStatement: null,
      nextStatement: null
   },
   {
      type: 'system_info',
      message0: '系统信息 %1',
      args0: [
         {
            type: 'input_value',
            name: 'TEXT',
            check: 'String'
         }
      ],
      colour: 30,
      previousStatement: null,
      nextStatement: null
   },
   {
      type: 'prompt_info',
      message0: '提示信息 %1',
      args0: [
         {
            type: 'input_value',
            name: 'TEXT',
            check: 'String'
         }
      ],
      colour: 30,
      previousStatement: null,
      nextStatement: null
   },
   {
      type: 'show_dialogue',
      message0: '显示对话框',
      colour: 30,
      previousStatement: null,
      nextStatement: null
   },
   {
      type: 'hide_dialogue',
      message0: '隐藏对话框',
      colour: 30,
      previousStatement: null,
      nextStatement: null
   }
]