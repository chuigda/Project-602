import { h } from 'tsx-dom'
import { DoubleOpenScreen } from '../widgets/double-open-screen'
import { Select } from '../widgets/select'
import { Window } from '../widgets/window'
import { sleep } from '../util/sleep'

import './training.css'

export function showTrainingWindow(): HTMLElement {
   const trainingWindowBackground = <DoubleOpenScreen backgroundColor="black" zIndex={2000} />

   const trainingWindow = (
      <Window title="主题训练" height="65vh" onClose={async () => {
         (trainingWindowBackground.children[0] as HTMLElement).style.height = '0';
         (trainingWindowBackground.children[1] as HTMLElement).style.height = '0';
         await sleep(300)
         trainingWindowBackground.remove()
      }}>
         <div>
            <Select title="训练类别" options={[
               { value: '1', text: '开局' },
               { value: '2', text: '中局' },
               { value: '3', text: '残局' }
            ]} />
            <Select title="训练项目" options={[
               { value: '1', text: '双车擒王' },
               { value: '2', text: '单后擒王' },
               { value: '3', text: '单车擒王' },
               { value: '4', text: '后对二路兵' },
               { value: '5', text: '后对二路兵: b/g 列' },
               { value: '6', text: '基本对王' },
               { value: '7', text: '高地优势' },
               { value: '8', text: '适应格与三角换先' },
               { value: '9', text: '卢塞纳局面' },
               { value: '10', text: '菲利道尔局面' },
               { value: '11', text: '车对二路兵' },
               { value: '11', text: '车对三路兵' },
            ]} />
         </div>
         <div />
      </Window>
   )

   setTimeout(() => trainingWindowBackground.appendChild(trainingWindow), 500)

   document.body.appendChild(trainingWindowBackground)
   return trainingWindowBackground
}
