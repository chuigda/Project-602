(() => ({
   CharacterUse: ['白杨', '大如'],
   StartingEvent: '01',
   Event_01: async cx => {
     cx.disableChessboard()
     await cx.showPrompt('system', '这是一个完全虚构的剧本，讲述了某个时空里白杨暴打大如的故事')
     if (!!cx.variables['hasWGX']) {
       await cx.setVariant('chesswith310')
       await cx.setFen('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNW w KQkq -')
     } else {
       await cx.setVariant('chess')
       await cx.setFen('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -')
     }
     await cx.highlightSquare('e4', 'greenyellow', false)
     await cx.highlightSquare('e5', 'greenyellow', false)
     await cx.highlightSquare('d4', 'greenyellow', false)
     await cx.highlightSquare('d5', 'greenyellow', false)
     await cx.showDialogue()
     await cx.speak('大如', '墙头马上遥相顾，一见知君即断肠', '常态')
     await cx.speak('白杨', '摇香菇摇香菇，一天到晚摇你妈了个逼\n带着你的鸡蛋肠赶紧滚你妈的蛋，操你血妈', '黄豆')
     await cx.speak('大如', '你，你放肆，我和皇上青梅竹马，他定不会放过你的', '失控')
     await cx.speak('白杨', '皇上？青梅竹马？\n今天我特地来肃清你们这帮封建余孽', '黄豆')
     await cx.hideDialogue()
     cx.enableChessboard()
     await cx.setupSkirmishMode(1)
     await cx.showPrompt('prompt', '现在你可以操作棋盘了')
   },
 }))()
