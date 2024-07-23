export const StartingEvent = Event_001

export const CharacterUse = ['白王', '黑王', '白后']

export const Event_001 = async cx => {
   await cx.setFen('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
   /* [dialogue] */ await cx.showDialogue()
   await cx.speak('白王', `你算哪根葱，跟我搁这人五人六的
赶紧滚你妈的蛋`, '愤怒')
   await cx.speak('黑王', `好的，我这就滚`)
   /* [/dialogue] */ await cx.hideDialogue()
   /* [dialogue] */ await cx.showDialogue()
   /* codeblock */
   await cx.speak('白王', "真是有趣...")
   /* end codeblock */
   await cx.speak('白后', `不是你干嘛骂人啊`)
   /* codeblock */
   await cx.speak('白王', "打得一拳开，免得百拳来")
   /* end codeblock */
   /* [/dialogue] */ await cx.hideDialogue()
}

export const Event_002 = async cx => {
   await cx.setFen('8/8/8/8/8/8/8/4K3 w - -')
   await cx.speak('白王', `在这么冷的天，想抽根电子烟，可锐克没有电`)
}
