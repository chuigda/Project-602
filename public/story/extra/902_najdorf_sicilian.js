(() => ({
   StartingEvent: '90201_start',
   CharacterUse: ['黑王'],
   Event_90201_start: async cx => {
   await cx.setVariant('chess')
   await cx.setPlayerSide('black')
   await cx.setFen('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -')
   /* codeblock */
   await cx.sleep(1000)
   /* end codeblock */
   /* [dialogue] */ await cx.showDialogue()
   await cx.speak('黑王', `作为一名棋界新秀执白棋手 —— 我没说你，从开局的那一刻一切就尽在他的掌握之中`)
   await cx.speak('黑王', `不幸的是，在真实的国际象棋对弈中，你有一半的时间都执不到白
而一旦你执黑，那就只能步步为营了`)
   await cx.speak('黑王', `所以，学习黑方开局也是非常重要的一部分。这是白杨不会教给你的，呵呵`, '微笑')
   /* [/dialogue] */ await cx.hideDialogue()
   /* codeblock */
   await cx.playMoveUCI('e2e4')
   await cx.sleep(1000)
   /* end codeblock */
   /* [dialogue] */ await cx.showDialogue()
   await cx.speak('黑王', `西西里防御是黑方应对白方王兵开局的重要武器之一`)
   await cx.speak('黑王', `现在，把 c 兵走到 c5`)
   /* [/dialogue] */ await cx.hideDialogue()
   /* codeblock */
   let failCount = 0
   while (true) {
      await cx.highlightSquare('c7', 'greenyellow')
      await cx.highlightSquare('c5', 'greenyellow')

      const move = await cx.waitForMove()
      if (move === 'c7c5') {
         break
      }
      failCount += 1

      await cx.showDialogue()
      if (failCount >= 5) {
         await cx.speak('黑王', '你是不是以为你自己很幽默？哈？按我说的做有那么难吗？', '生气')
      }
      else {
         switch (move) {
            case 'e7e5':
               await cx.speak('黑王', '对王兵开局也是黑方开局体系里非常值得一提的一种，但这不是我们今天的主题')
               break
            case 'c7c6':
               await cx.speak('黑王', '卡罗康防御，另一个非常有意思的开局，有的时候也被称为“微型西西里防御”')
               await cx.speak('黑王', '不过如果你年轻的时候就下卡罗康防御，等你老了的时候你该下什么呢？', '微笑')
               break
            case 'd7d5':
               await cx.speak('黑王', '斯堪的纳维亚防御？我对这个开局的评价就一句话')
               await cx.speak('黑王', '“两步速通周公瑾，赔了夫人又折兵”', '微笑')
               break
            case 'g7g6': case 'd7d6':
               await cx.speak('黑王', '哟，现代人啊，中心直接不要了', '微笑')
               break
            case 'g8f6':
               await cx.speak('黑王', '阿廖欣防御？你的品味还真是独特', '微笑')
               break
            default:
               await cx.speak('黑王', '真有意思，看来你有一点自己的想法')
               await cx.speak('黑王', '不过，我还是希望你能按照我说的走 c5', '微笑')
               break
         }
      }
      await cx.hideDialogue()
      await cx.setFen('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq -')
   }
   /* end codeblock */
   /* [dialogue] */ await cx.showDialogue()
   await cx.speak('黑王', `干得漂亮，现在我们来审视一下局面：`)
   /* [/dialogue] */ await cx.hideDialogue()
   /* codeblock */
   await cx.highlightSquare('c5', 'greenyellow')
   await cx.highlightSquare('d4', 'red')
   await cx.sleep(1000)
   /* end codeblock */
   /* [dialogue] */ await cx.showDialogue()
   await cx.speak('黑王', `位于 c5 的兵以另一种方式控制住了 d4 格，这是西西里防御的一个重要特点`)
   /* [/dialogue] */ await cx.hideDialogue()
   /* codeblock */
   alert('演示结束')
   /* end codeblock */
   }
}))()
