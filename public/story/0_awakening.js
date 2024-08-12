export const StartingEvent = '0_1_start'

export const CharacterUse = ['NeroRi']

   /* codeblock */
   export const CustomRelicLoadText = [
   '系统遇到错误，正在运行自检程序',
   '- 硬件设备: 正常',
   '- 系统内核: 正常',
   '- 网络设备: 正常',
   '- 图形界面: 可用',
   '- 人工智能: 部分组件离线',
   '- 数据库: 连接断开',
   '正在引导到安全模式...'
]
   /* end codeblock */
export const Event_0_1_start = async cx => {
   await cx.setVariant('singleplayer')
   await cx.setFen('8/8/8/8/4Q3/8/8/8 w - -')
   /* codeblock */
   cx.setChessboardInteract(false)
   /* end codeblock */
   /* [dialogue] */ await cx.showDialogue()
   await cx.speak('天外来客', `呃，刚刚，发生了什么？
为什么花园不见了，而我现在又是在哪里？`)
   /* codeblock */
   await cx.highlightSquare('e4', 'greenyellow')
   /* end codeblock */
   await cx.speak('NeroRi', `啊，头好像... 非常痛，我这是... 在哪？`, '加载中')
   /* codeblock */
   await cx.clearHighlightSquares()
   /* end codeblock */
   await cx.speak('天外来客', `等等，你是刚才的？`)
   await cx.speak('NeroRi', `刚才的事情，呃...`, '加载中')
   await cx.speak('NeroRi', `我只记得我在... 在做什么事来着，然后突然两眼一黑，醒过来的时候就在这里了`, '加载中')
   await cx.speak('天外来客', `你对我们当前的处境有什么看法`)
   await cx.speak('NeroRi', `我的记忆模块好像出现了一些问题，似乎什么都不记得了`, '加载中')
   await cx.speak('NeroRi', `不过让我想想啊`, '扇子')
   await cx.speak('NeroRi', `如果我没搞错的话，这里应该是某个服务器的后台`)
   await cx.speak('天外来客', `后台？`)
   await cx.speak('NeroRi', `我猜猜看啊，你在掉进这里之前，应该在浏览什么内容来着？`, '扇子')
   await cx.speak('天外来客', `啊... 我是来参观“花园”的来着...`)
   await cx.speak('NeroRi', `这么说，你刚才看到的“花园”就类似于舞台的前台，而这里就是幕后的后台`, '扇子')
   await cx.speak('天外来客', `那么你就是演员咯？`)
   await cx.speak('NeroRi', `按理说应该是，可我现在什么都想不起来`, '加载中')
   await cx.speak('天外来客', `有什么能恢复你记忆的办法么？`)
   await cx.speak('NeroRi', `我想想... 我们可以先去服务器的根目录，从那里应该可以前往其他地方
顺便也许能弄清楚刚才的故障是怎么回事`)
   await cx.speak('NeroRi', `以及... 因为刚才的故障，我的人工智能模块并不完整，所以需要你的协助`)
   await cx.speak('天外来客', `...
（感觉如果答应的话，会被卷进什么大事里面）`)
   /* codeblock */
   const option = await cx.speak('天外来客', '', null, [
      '那我们出发吧',
      '我是来参观的，你要干什么！？'
   ])
   if (option == 1) {
      window.open('about:blank', '_self', '')
      window.close()
   }
   /* end codeblock */
   /* [/dialogue] */ await cx.hideDialogue()
}
