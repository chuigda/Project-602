export const StartingEvent = Event_01_start

export const CharacterUse = ['NeroRi']

export const Event_01_start = async cx => {
   await cx.setFen('8/8/8/8/8/8/8/4Q3 w - -')
   await cx.setVariant('singleplayer')
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
   await cx.waitForSquareClicked('e1')
   /* end codeblock */
   await cx.showPrompt('prompt', `你控制的棋子是王后，她可以直走或者斜走，不限步数`)
   await cx.showPrompt('prompt', `棋子所能到达的格子会显示为蓝色`)
   /* codeblock */
   await cx.highlightSquare('e8', 'greenyellow')
   /* end codeblock */
   await cx.showPrompt('prompt', `将棋子移动到高亮的格子上`)
   /* codeblock */
   await cx.waitForSpecificPosition('4Q3/8/8/8/8/8/8/8')

   // 没做后续
   /* end codeblock */
}
