export const StartingEvent = '01_start'

export const CharacterUse = ['NeroRi', '白杨', '黑王', '黑后']

export const Event_01_start = async cx => {
   await cx.setFen('8/8/8/8/8/8/8/4Q3 w - -')
   await cx.setVariant('singleplayer')
   /* codeblock */
   cx.setChessboardInteract(false)
   /* end codeblock */
   await cx.showPrompt('system', `警告：服务器正被入侵`)
   await cx.showPrompt('system', `警告：请尽快前往控制中心，防线需要支援`)
   /* [dialogue] */ await cx.showDialogue()
   await cx.speak('NeroRi', `啊，头好像... 非常痛，我这是... 在哪？`, '加载中')
   await cx.speak('NeroRi', `服务器... 入侵... 什么情况`, '加载中')
   await cx.speak('NeroRi', `虽然不太明白发生了什么
总之好像很严重的样子
按照指示行动应该没有问题吧？`)
   /* [/dialogue] */ await cx.hideDialogue()
   /* codeblock */
   await cx.highlightSquare('e1', 'greenyellow')
   /* end codeblock */
   await cx.showPrompt('prompt', `点击棋子以选中`)
   /* codeblock */
   cx.enableChessboard()
   await cx.waitForSquareClicked('e1')
   cx.disableChessboard()
   /* end codeblock */
   await cx.showPrompt('prompt', `你控制的棋子是王后，她可以直走或者斜走，不限步数`)
   await cx.showPrompt('prompt', `棋子所能到达的格子会显示为蓝色`)
   /* codeblock */
   await cx.highlightSquare('e8', 'greenyellow')
   cx.enableChessboard()
   /* end codeblock */
   await cx.showPrompt('prompt', `将棋子移动到高亮的格子上`)
   /* codeblock */
   await cx.waitForSpecificPosition('4Q3/8/8/8/8/8/8/8')
   cx.disableChessboard()
   /* end codeblock */
   await cx.pushEvent('02_intro')
}

export const Event_02_intro = async cx => {
   await cx.setFen('kq6/8/8/8/8/8/PPPPPPPP/RNBQKBNR w KQ -')
   /* [dialogue] */ await cx.showDialogue()
   await cx.speak('白杨', `嘿，你来啦`)
   await cx.speak('NeroRi', `说说看这是怎么一回事吧`, '扇子')
   await cx.speak('白杨', `简单来说，这个游戏的游玩方式类似于 JRPG
不过你的所有操作都是通过移动棋子来完成的`)
   await cx.speak('白杨', `之后除了这种简单移动、对话，以及和敌对单位战斗之外
还会引入数据碎片机制，收集这些数据碎片来解锁故事文本和技能`)
   await cx.speak('黑王', `呵，这种设计也就只有你想得出来`)
   await cx.speak('黑后', `杂鱼~杂❤鱼~`, '雌小鬼')
   await cx.speak('NeroRi', `哎呀你们两个好烦呐`, '无语')
   await cx.speak('白杨', `你算哪根葱，少跟我搁这人五人六的，滚你妈的蛋`, '黄豆')
   await cx.speak('黑后', `呜呜呜，被骂了`, '大哭')
   /* [/dialogue] */ await cx.hideDialogue()
   /* codeblock */
   await new Promise(resolve => setTimeout(resolve, 2000))
   alert('演示部分到这里就结束了')
   /* end codeblock */
}
