(() => ({
   StartingEvent: '90101_start',
   CharacterUse: ['黑王', '黑后', '黑主教', '黑骑士'],
   Event_90101_start: async cx => {
   await cx.setVariant('singleplayer')
   await cx.setFen('r2q1rk1/ppp2ppp/1bnp1n2/6B1/2BPP1b1/2N2N2/PPPQ2PP/2KR3R b - -')
   /* codeblock */
   cx.setChessboardInteract(false)
   /* end codeblock */
   /* [dialogue] */ await cx.showDialogue()
   await cx.speak('黑主教', `目前的局面对我们不是很有利。白方的两个中心兵牢牢地把控住了中心
并且在子力发育上占据优势`)
   await cx.speak('黑主教', `同时由于反向易位的关系，我们的王城目前面临一定威胁`)
   await cx.speak('黑王', `只要黑后发动进攻，我相信我们一定能够扭转局势`, '微笑')
   await cx.speak('黑骑士', `国王，黑后她`, '震惊')
   await cx.speak('黑主教', `黑后她以保护位于 f6 的王翼马为由，拒绝发动进攻`, '生气')
   await cx.speak('黑王', `主教、王后和骑士留下，其他人出去。`)
   /* [/dialogue] */ await cx.hideDialogue()
   await cx.setFen('2bnkq2/8/8/8/8/8/8/8 b - -')
   /* [dialogue] */ await cx.showDialogue()
   await cx.speak('黑王', `That's why I'm 悲愤！黑后我顶你个肺！
这星期，因为 NeroRi 的关系我们在前线吃了一堆败仗`, '生气')
   await cx.speak('黑王', `现在我们急需要一场胜利，结果你居然为了保护那该死的王翼马
拒绝发动进攻`, '生气')
   /* [/dialogue] */ await cx.hideDialogue()
   /* codeblock */
   alert('演示结束')
   /* end codeblock */
   }
}))()
