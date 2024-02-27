import { h } from 'tsx-dom'

import { $ } from './min-jquery'
import { Chess } from 'chess.js'
import { makeMove, createEngine } from './chess/engine'

const game = new Chess()
const engine = createEngine({
    targetAverageInaccuracy: 125,
    inaccuracyTolerance: 200,
    openingInaccuracyTolerance: 30
})

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

function updateDisplay() {
    $('gameboard')!.textContent = game.ascii()
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

    if (game.isGameOver()) {
        $('debuginfo')!.textContent = `Game over`
        updateDisplay()
        return
    }

    const engineMove = await makeMove(game, engine)
    $('debuginfo')!.textContent = `Engine move: ${engineMove}`

    updateDisplay()
    if (game.isGameOver()) {
        $('debuginfo')!.textContent = `Game over`
    }
}

document.addEventListener('DOMContentLoaded', applicationStart)
