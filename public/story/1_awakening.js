// currently hand-written (compiled form) JavaScript code
// will be replaced with a compiler-generated thing later on

export const StartingEvent = 'Event_01'

export const CharacterUse = ['NeroRi', '白杨', '黑王', '黑后']

export const Event_01 = async (cx) => {
   await cx.setVariant('singleplayer')
   await cx.setFen('8/8/8/8/8/8/8/4Q3 w - - 0 1')

   await cx.showPrompt('system', '警告: 服务器正受到入侵')
   await cx.showPrompt('system', '威胁等级 15，请尽快前往控制中心')

   await cx.showDialogue()
   await cx.speak('NeroRi', '啊，头好像 ... 非常痛，我这是 ... 在哪？', '加载中')
   await cx.speak('NeroRi', '服务器遭到攻击？明明每个字都看得懂，连起来就...', '加载中')
   await cx.speak('NeroRi', `嘛，虽然不太明白发生了什么
总之好像很严重的样子
我最好赶紧赶过去`)
   await cx.hideDialogue()

   await cx.highlightSquare('e1', 'greenyellow')
   await cx.showPrompt('prompt', '提示: 点击棋子以选中')

   await cx.waitForSquareClicked('e1')
   await cx.showPrompt('prompt', '提示: 你控制的棋子是皇后，她可以直走或者斜走，不限步数')
   await cx.highlightSquare('e8', 'greenyellow')
   await cx.showPrompt('prompt', '提示: 将棋子移动到高亮的格子上')
   await cx.waitForSpecificPosition('4Q3/8/8/8/8/8/8/8 w - - 0 1')

   cx.pushEvent('Event_02')
}

export const Event_02 = async (cx) => {
   await cx.setVariant('chess')
   await cx.setFen('kq6/8/8/8/8/8/PPPPPPPP/RNBQKBNR w KQ - 0 1')

   await cx.showDialogue()
   await cx.speak('白杨', '嘿，你来啦')
   await cx.speak('NeroRi', '说说看这是怎么一回事吧', '扇子')
   await cx.speak('白杨', `简单来说，这个游戏的游玩方式类似于 JRPG
不过你的所有操作都反映为棋盘上的棋子移动`)
   await cx.speak('白杨', `之后除了这种简单移动、对话，以及和敌对单位战斗之外
还会引入数据碎片机制，收集棋盘上的数据碎片可以解锁故事文本和新技能哦~`)
   await cx.speak('黑王', '呵，这种设计也就只有你想得出来')
   await cx.speak('黑后', '杂鱼~ 杂❤鱼~', '雌小鬼')
   await cx.speak('NeroRi', '哎呀你们两个好烦呐', '无语')
   await cx.speak('白杨', `你俩算哪根葱，少跟我搁这人五人六的，滚你妈的蛋`, '黄豆')
   await cx.speak('黑后', '呜呜呜，被骂了', '大哭')

   alert('演示部分到这里就结束了')
}
