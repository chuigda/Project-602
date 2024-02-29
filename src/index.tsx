import { h } from 'tsx-dom'

import { $ } from './min-jquery'
import { Chess } from 'chess.js'
import { Chessground } from 'chessground';

import { makeMove, createEngine } from './chess/engine'

const game = new Chess()
const engine = createEngine({
    targetAverageInaccuracy: 125,
    inaccuracyTolerance: 200,
    openingInaccuracyTolerance: 30
})

let chessboard

async function applicationStart() {
    const div = <div id="chessboard" /> as HTMLElement
    $('body')!.appendChild(div)

    setTimeout(() => {
        chessboard = Chessground(div, {})
    }, 50)
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
        return
    }

    const engineMove = await makeMove(game, engine)
    $('debuginfo')!.textContent = `Engine move: ${engineMove}`

    if (game.isGameOver()) {
        $('debuginfo')!.textContent = `Game over`
    }
}

document.addEventListener('DOMContentLoaded', applicationStart)
