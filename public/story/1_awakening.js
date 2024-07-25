export const StartingEvent = '01_start'

export const CharacterUse = ['NeroRi', '白杨', '黑王', '黑后']

export const Event_01_start = async cx => {
   await cx.setVariant('singleplayer')
   await cx.setFen('8/8/8/8/8/8/8/4Q3 w - -')
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
   await cx.pushEvent('02_capture_pawn')
}

export const Event_02_capture_pawn = async cx => {
   await cx.setVariant('captureall310')
   await cx.setFen('8/8/8/p7/8/8/8/4Q3 w - -')
   await cx.showPrompt('system', `警告：侦测到敌对魔偶`)
   await cx.showPrompt('system', `不过对于你，无所不能的 NeroRi 来说，消灭它应该不是问题`)
   /* [dialogue] */ await cx.showDialogue()
   await cx.speak('NeroRi', `那当然，毕竟我可是最强的`)
   /* [/dialogue] */ await cx.hideDialogue()
   /* codeblock */
   await cx.highlightSquare('a5', 'orangered')
   /* end codeblock */
   await cx.showPrompt('prompt', `以红色标识的棋子均为敌对单位`)
   /* codeblock */
   await cx.highlightSquare('e1', 'greenyellow')
   /* end codeblock */
   await cx.showPrompt('prompt', `点击绿色高亮的己方棋子`)
   /* codeblock */
   cx.enableChessboard()
   await cx.waitForSquareClicked('e1')
   cx.disableChessboard()
   await cx.highlightSquare('a5', 'orangered')
   /* end codeblock */
   await cx.showPrompt('prompt', `点击红色高亮的敌方棋子`)
   /* codeblock */
   cx.enableChessboard()
   await cx.waitForSpecificPosition('8/8/8/Q7/8/8/8/8')
   cx.disableChessboard()
   /* end codeblock */
   await cx.showPrompt('system', `干得漂亮，敌对魔偶已被消灭`)
   await cx.showPrompt('system', `现在赶快前往控制中心吧`)
   await cx.setVariant('singleplayer')
   /* codeblock */
   cx.highlightSquare('e8', 'greenyellow')
   cx.enableChessboard()
   await cx.waitForSpecificPosition('4Q3/8/8/8/8/8/8/8')
   cx.disableChessboard()

   await new Promise(resolve => setTimeout(resolve, 1000))
   alert('演示结束')
   /* end codeblock */
}
