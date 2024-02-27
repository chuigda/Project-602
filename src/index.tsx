import { h } from 'tsx-dom'
import { invoke } from '@tauri-apps/api/tauri'

import { $ } from './min-jquery'
import { EvaluateRequest, EvaluateResponse } from './protocol'
import { Chess } from 'chess.js'

const game = new Chess()

async function applicationStart() {
    $('body')!.appendChild(<div>
        <code><pre>{ game.ascii() }</pre></code>
        <span>
            MOVE:
            <input id="move" type="text"></input>
            <button onClick={onMove}>Move</button>
        </span>
        <br />
        <code style="color: red">
            <pre id="debuginfo">
            </pre>
        </code>
    </div>)
}

async function onMove() {
    const move = ($('move')! as HTMLInputElement).value as string
    try {
        game.move(move)
    } catch (e) {
        $('debuginfo')!.textContent = `Error: invalid move: ${e}`
    }

    const initialPosition = game.fen()
    const positions = [initialPosition]

    const candidateMoves = game.moves({ verbose: true })
    if (candidateMoves.length === 0) {
        $('debuginfo')!.textContent = 'Game over'
        return
    }

    for (const move of candidateMoves) {
        game.move(move)
        positions.push(game.fen())
        game.undo()
    }

    const request: EvaluateRequest = { positions, without_king: false }
    const response = await invoke<{
        success: boolean,
        result: EvaluateResponse | undefined,
    }>('evaluate', { request })

    if (!response.success) {
        $('debuginfo')!.textContent = 'Error: evaluation failed'
        return
    }

    const scores = response.result!.scores
    $('debuginfo')!.textContent =
    `Initial position, white score: ${-scores[0]}\n
Candidate moves: ${candidateMoves.map(move => move.lan).join(',')}\n
Scores: ${scores.slice(1).join(',')}`

}

document.addEventListener('DOMContentLoaded', applicationStart)
