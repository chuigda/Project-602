export const toolbox = {
   kind: 'categoryToolbox',
   contents: [
      {
         kind: 'category',
         name: '棋盘',
         colour: 30,
         contents: [
            {
               kind: 'block',
               type: 'current_fen'
            },
            {
               kind: 'block',
               type: 'set_fen',
            },
            {
               kind: 'block',
               type: 'set_variant',
            },
            {
               kind: 'block',
               type: 'enable_chessboard',
            },
            {
               kind: 'block',
               type: 'disable_chessboard',
            },
            {
               kind: 'block',
               type: 'highlight_square_const',
            },
            {
               kind: 'block',
               type: 'highlight_square',
            },
            {
               kind: 'block',
               type: 'wait_for_position',
            },
            {
               kind: 'block',
               type: 'setup_skirmish_mode',
            },
            {
               kind: 'block',
               type: 'sleep',
            },
            {
               kind: 'block',
               type: 'play_move',
            }
         ]
      },
      {
         kind: 'category',
         name: '对话',
         colour: 30,
         contents: [
            {
               kind: 'block',
               type: 'speak'
            },
            {
               kind: 'block',
               type: 'system_info'
            },
            {
               kind: 'block',
               type: 'prompt_info'
            },
            {
               kind: 'block',
               type: 'show_dialogue'
            },
            {
               kind: 'block',
               type: 'hide_dialogue'
            }
         ]
      },
      {
         kind: 'category',
         name: '逻辑',
         categorystyle: 'logic_category',
         contents: [
            {
               kind: 'block',
               type: 'controls_if',
            },
            {
               kind: 'block',
               type: 'logic_compare',
            },
            {
               kind: 'block',
               type: 'logic_operation',
            },
            {
               kind: 'block',
               type: 'logic_negate',
            },
            {
               kind: 'block',
               type: 'logic_boolean',
            },
            {
               kind: 'block',
               type: 'logic_null',
            },
            {
               kind: 'block',
               type: 'logic_ternary',
            },
         ],
      },
      {
         kind: 'category',
         name: '循环',
         categorystyle: 'loop_category',
         contents: [
            {
               kind: 'block',
               type: 'controls_repeat_ext',
               inputs: {
                  TIMES: {
                     shadow: {
                        type: 'math_number',
                        fields: {
                           NUM: 10,
                        },
                     },
                  },
               },
            },
            {
               kind: 'block',
               type: 'controls_whileUntil',
            },
            {
               kind: 'block',
               type: 'controls_for',
               inputs: {
                  FROM: {
                     shadow: {
                        type: 'math_number',
                        fields: {
                           NUM: 1,
                        },
                     },
                  },
                  TO: {
                     shadow: {
                        type: 'math_number',
                        fields: {
                           NUM: 10,
                        },
                     },
                  },
                  BY: {
                     shadow: {
                        type: 'math_number',
                        fields: {
                           NUM: 1,
                        },
                     },
                  },
               },
            },
            {
               kind: 'block',
               type: 'controls_forEach',
            },
            {
               kind: 'block',
               type: 'controls_flow_statements',
            },
         ],
      },
      {
         kind: 'category',
         name: '数学',
         categorystyle: 'math_category',
         contents: [
            {
               kind: 'block',
               type: 'math_number',
               fields: {
                  NUM: 123,
               },
            },
            {
               kind: 'block',
               type: 'math_arithmetic',
               inputs: {
                  A: {
                     shadow: {
                        type: 'math_number',
                        fields: {
                           NUM: 1,
                        },
                     },
                  },
                  B: {
                     shadow: {
                        type: 'math_number',
                        fields: {
                           NUM: 1,
                        },
                     },
                  },
               },
            },
            {
               kind: 'block',
               type: 'math_single',
               inputs: {
                  NUM: {
                     shadow: {
                        type: 'math_number',
                        fields: {
                           NUM: 9,
                        },
                     },
                  },
               },
            },
            {
               kind: 'block',
               type: 'math_trig',
               inputs: {
                  NUM: {
                     shadow: {
                        type: 'math_number',
                        fields: {
                           NUM: 45,
                        },
                     },
                  },
               },
            },
            {
               kind: 'block',
               type: 'math_constant',
            },
            {
               kind: 'block',
               type: 'math_number_property',
               inputs: {
                  NUMBER_TO_CHECK: {
                     shadow: {
                        type: 'math_number',
                        fields: {
                           NUM: 0,
                        },
                     },
                  },
               },
            },
            {
               kind: 'block',
               type: 'math_round',
               fields: {
                  OP: 'ROUND',
               },
               inputs: {
                  NUM: {
                     shadow: {
                        type: 'math_number',
                        fields: {
                           NUM: 3.1,
                        },
                     },
                  },
               },
            },
            {
               kind: 'block',
               type: 'math_on_list',
               fields: {
                  OP: 'SUM',
               },
            },
            {
               kind: 'block',
               type: 'math_modulo',
               inputs: {
                  DIVIDEND: {
                     shadow: {
                        type: 'math_number',
                        fields: {
                           NUM: 64,
                        },
                     },
                  },
                  DIVISOR: {
                     shadow: {
                        type: 'math_number',
                        fields: {
                           NUM: 10,
                        },
                     },
                  },
               },
            },
            {
               kind: 'block',
               type: 'math_constrain',
               inputs: {
                  VALUE: {
                     shadow: {
                        type: 'math_number',
                        fields: {
                           NUM: 50,
                        },
                     },
                  },
                  LOW: {
                     shadow: {
                        type: 'math_number',
                        fields: {
                           NUM: 1,
                        },
                     },
                  },
                  HIGH: {
                     shadow: {
                        type: 'math_number',
                        fields: {
                           NUM: 100,
                        },
                     },
                  },
               },
            },
            {
               kind: 'block',
               type: 'math_random_int',
               inputs: {
                  FROM: {
                     shadow: {
                        type: 'math_number',
                        fields: {
                           NUM: 1,
                        },
                     },
                  },
                  TO: {
                     shadow: {
                        type: 'math_number',
                        fields: {
                           NUM: 100,
                        },
                     },
                  },
               },
            },
            {
               kind: 'block',
               type: 'math_random_float',
            },
            {
               kind: 'block',
               type: 'math_atan2',
               inputs: {
                  X: {
                     shadow: {
                        type: 'math_number',
                        fields: {
                           NUM: 1,
                        },
                     },
                  },
                  Y: {
                     shadow: {
                        type: 'math_number',
                        fields: {
                           NUM: 1,
                        },
                     },
                  },
               },
            },
         ],
      },
      {
         kind: 'category',
         name: '文本',
         categorystyle: 'text_category',
         contents: [
            {
               kind: 'block',
               type: 'text',
            },
            {
               kind: 'block',
               type: 'multiline_text'
            },
            {
               kind: 'block',
               type: 'text_join',
            },
            {
               kind: 'block',
               type: 'text_append',
               inputs: {
                  TEXT: {
                     shadow: {
                        type: 'text',
                        fields: {
                           TEXT: '',
                        },
                     },
                  },
               },
            },
            {
               kind: 'block',
               type: 'text_length',
               inputs: {
                  VALUE: {
                     shadow: {
                        type: 'text',
                        fields: {
                           TEXT: 'abc',
                        },
                     },
                  },
               },
            },
            {
               kind: 'block',
               type: 'text_isEmpty',
               inputs: {
                  VALUE: {
                     shadow: {
                        type: 'text',
                        fields: {
                           TEXT: '',
                        },
                     },
                  },
               },
            },
            {
               kind: 'block',
               type: 'text_indexOf',
               inputs: {
                  VALUE: {
                     block: {
                        type: 'variables_get',
                     },
                  },
                  FIND: {
                     shadow: {
                        type: 'text',
                        fields: {
                           TEXT: 'abc',
                        },
                     },
                  },
               },
            },
            {
               kind: 'block',
               type: 'text_charAt',
               inputs: {
                  VALUE: {
                     block: {
                        type: 'variables_get',
                     },
                  },
               },
            },
            {
               kind: 'block',
               type: 'text_getSubstring',
               inputs: {
                  STRING: {
                     block: {
                        type: 'variables_get',
                     },
                  },
               },
            },
            {
               kind: 'block',
               type: 'text_changeCase',
               inputs: {
                  TEXT: {
                     shadow: {
                        type: 'text',
                        fields: {
                           TEXT: 'abc',
                        },
                     },
                  },
               },
            },
            {
               kind: 'block',
               type: 'text_trim',
               inputs: {
                  TEXT: {
                     shadow: {
                        type: 'text',
                        fields: {
                           TEXT: 'abc',
                        },
                     },
                  },
               },
            },
            {
               kind: 'block',
               type: 'text_count',
               inputs: {
                  SUB: {
                     shadow: {
                        type: 'text',
                     },
                  },
                  TEXT: {
                     shadow: {
                        type: 'text',
                     },
                  },
               },
            },
            {
               kind: 'block',
               type: 'text_replace',
               inputs: {
                  FROM: {
                     shadow: {
                        type: 'text',
                     },
                  },
                  TO: {
                     shadow: {
                        type: 'text',
                     },
                  },
                  TEXT: {
                     shadow: {
                        type: 'text',
                     },
                  },
               },
            },
            {
               kind: 'block',
               type: 'text_reverse',
               inputs: {
                  TEXT: {
                     shadow: {
                        type: 'text',
                     },
                  },
               },
            }
         ],
      },
      {
         kind: 'category',
         name: '列表',
         categorystyle: 'list_category',
         contents: [
            {
               kind: 'block',
               type: 'lists_create_with',
            },
            {
               kind: 'block',
               type: 'lists_repeat',
               inputs: {
                  NUM: {
                     shadow: {
                        type: 'math_number',
                        fields: {
                           NUM: 5,
                        },
                     },
                  },
               },
            },
            {
               kind: 'block',
               type: 'lists_length',
            },
            {
               kind: 'block',
               type: 'lists_isEmpty',
            },
            {
               kind: 'block',
               type: 'lists_indexOf',
               inputs: {
                  VALUE: {
                     block: {
                        type: 'variables_get',
                     },
                  },
               },
            },
            {
               kind: 'block',
               type: 'lists_getIndex',
               inputs: {
                  VALUE: {
                     block: {
                        type: 'variables_get',
                     },
                  },
               },
            },
            {
               kind: 'block',
               type: 'lists_setIndex',
               inputs: {
                  LIST: {
                     block: {
                        type: 'variables_get',
                     },
                  },
               },
            },
            {
               kind: 'block',
               type: 'lists_getSublist',
               inputs: {
                  LIST: {
                     block: {
                        type: 'variables_get',
                     },
                  },
               },
            },
            {
               kind: 'block',
               type: 'lists_split',
               inputs: {
                  DELIM: {
                     shadow: {
                        type: 'text',
                        fields: {
                           TEXT: ',',
                        },
                     },
                  },
               },
            },
            {
               kind: 'block',
               type: 'lists_sort',
            },
            {
               kind: 'block',
               type: 'lists_reverse',
            },
         ],
      },
      {
         kind: 'sep',
      },
      {
         kind: 'category',
         name: '变量',
         categorystyle: 'variable_category',
         contents: [
            {
               kind: 'block',
               type: 'local_variable',
            },
            {
               kind: 'block',
               type: 'context_variable',
            },
            {
               kind: 'block',
               type: 'is_context_var_defined'
            }
         ]
      },
      {
         kind: 'category',
         name: '事件',
         categorystyle: 'procedure_category',
         contents: [
            {
               kind: 'block',
               type: 'event_def',
            },
            {
               kind: 'block',
               type: 'startup_event'
            },
            {
               kind: 'block',
               type: 'use_character'
            },
            {
               kind: 'block',
               type: 'return_result'
            },
            {
               kind: 'block',
               type: 'inline_javascript'
            },
            {
               kind: 'block',
               type: 'inline_javascript_expr'
            },
            {
               kind: 'block',
               type: 'push_next_event'
            }
         ],
      },
   ],
};
