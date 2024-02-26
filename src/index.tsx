import { h } from 'tsx-dom'
import { invoke } from '@tauri-apps/api/tauri'

import { $ } from './min-jquery'
import { EvaluateRequest, EvaluateResponse } from './protocol'

async function evalPosition() {
    const fen = ($('fen') as HTMLInputElement).value
    const request: EvaluateRequest = {
        positions: [fen],
        without_king: true,
    }

    const response = await invoke('evaluate', { request }) as { success: boolean, result?: EvaluateResponse }
    const evalResult = $('evalResult')!
    evalResult.innerHTML = ''
    if (response.success) {
        evalResult.appendChild(<div>
            <span>Score: {response.result!.scores[0]}</span>
        </div>)
    }
}

async function applicationStart() {
    $('body')!.appendChild(<div>
        <span>
            FEN: <input id="fen" type="text"></input>
            <button onClick={evalPosition}>Evaluate</button>
        </span>
        <div id="evalResult"></div>
    </div>)
}

document.addEventListener('DOMContentLoaded', applicationStart)
