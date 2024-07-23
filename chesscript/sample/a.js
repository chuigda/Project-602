export const StartingEvent = Event_001
export const Event_001 = async cx => {
   cx.setFen('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
   await cx.showDialogue()
   await cx.speak('白王', `你算哪根葱，跟我搁这人五人六的
赶紧滚你妈的蛋`, '愤怒')
   await cx.speak('黑王', `好的，我这就滚`)
   await cx.hideDialogue()
   await cx.showDialogue()
   // CODE_BLOCK
   await cx.speak('白王', "真是有趣...")
   // END_CODE_BLOCK
   await cx.speak('白后', `不是你干嘛骂人啊`)
   // CODE_BLOCK
   await cx.speak('白王', "打得一拳开，免得百拳来")
   // END_CODE_BLOCK
   await cx.hideDialogue()
}
