export const VariableBlocks = [
   {
      type: 'local_variable',
      message0: '局部变量 %1',
      args0: [
         {
            type: 'field_input',
            name: 'NAME',
            text: '变量名'
         }
      ],
      output: null,
      colour: '%{BKY_VARIABLES_HUE}'
   },
   {
      type: 'context_variable',
      message0: '上下文变量 %1',
      args0: [
         {
            type: 'field_input',
            name: 'NAME',
            text: '变量名'
         }
      ],
      output: null,
      colour: '%{BKY_VARIABLES_HUE}'
   },
   {
      type: 'is_context_var_defined',
      message0: '上下文变量 %1 已定义',
      args0: [
         {
            type: 'field_input',
            name: 'NAME',
            text: '变量名'
         }
      ],
      output: 'Boolean',
      colour: '%{BKY_VARIABLES_HUE}'
   }
]
