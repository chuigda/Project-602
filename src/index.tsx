import { h } from 'tsx-dom'
import { invoke } from '@tauri-apps/api/tauri'

import { $ } from './min-jquery'
import { EvaluateRequest, EvaluateResponse } from './protocol'
import { Chess } from 'chess.js'

const game = new Chess()

async function applicationStart() {
    $('body')!.appendChild(<div>
        <code><pre id="gameboard">{ game.ascii() }</pre></code>
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
    ($('move') as HTMLInputElement).value = ''
    try {
        game.move(move)
    } catch (e) {
        $('debuginfo')!.textContent = `Error: invalid move: ${e}`
        return
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
    `Before black move, white score: ${-scores[0]}
Candidate moves:`

for (let i = 0; i < candidateMoves.length; i++) {
    $('debuginfo')!.textContent += `\n${candidateMoves[i].lan}: ${scores[i + 1]}`
}

    // find the move of minimum (white) score
    let minScore = 999999
    let minScoreIdx = -1
    for (let i = 1; i < scores.length; i++) {
        if (scores[i] < minScore) {
            minScore = scores[i]
            minScoreIdx = i
        }
    }

    const bestMove = candidateMoves[minScoreIdx]
    game.move(bestMove)

    $('debuginfo')!.textContent += `\nBest move: ${bestMove.lan}`
    $('gameboard')!.textContent = game.ascii()
}

document.addEventListener('DOMContentLoaded', applicationStart)
