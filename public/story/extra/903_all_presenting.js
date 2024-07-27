(() => ({
   StartingEvent: '90301_all_present',
   CharacterUse: ['白杨', 'NeroRi', '白主教', '白骑士', '黑王', '黑后', '黑主教', '黑骑士'],
   Event_90301_all_present: async cx => {
   await cx.setVariant('singleplayer')
   await cx.setFen('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -')
   /* codeblock */
   cx.setChessboardInteract(false)
   /* end codeblock */
   /* [dialogue] */ await cx.showDialogue()
   await cx.speak('白杨', `大烟杆嘴里塞，我只抽第五代！`, '大笑')
   await cx.speak('NeroRi', `不用打火真痛快，byd 快尝尝，我现在肺痒痒！`)
   await cx.speak('白主教', `你想抽芙蓉王？`)
   await cx.speak('白骑士', `还不如抽喜之郎！`)
   await cx.speak('黑王', `抽~`)
   await cx.speak('黑后', `抽~`)
   await cx.speak('黑主教', `抽~`)
   await cx.speak('黑骑士', `抽~`)
   await cx.speak('白杨', `我测试你的二维码~`)
   /* [/dialogue] */ await cx.hideDialogue()
   }
}))()
