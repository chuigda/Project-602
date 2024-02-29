import { h } from 'tsx-dom'

import { $ } from './min-jquery'
import { Chess, Square } from 'chess.js'
import { Chessground } from 'chessground';

import { makeMove, createEngine } from './chess/engine'
import { Key, MoveMetadata } from 'chessground/types';
import { Api } from 'chessground/api';

const game = new Chess()
const engine = createEngine({
    targetAverageInaccuracy: 125,
    inaccuracyTolerance: 200,
    openingInaccuracyTolerance: 30
})

let chessboard: Api

async function applicationStart() {
    setTimeout(() => {
        chessboard = Chessground($('chessground') as HTMLElement, {
            turnColor: 'white',
            movable: {
                free: true,
                color: 'white',
                events: {
                    after: onMove
                }
            }
        })
    }, 50)
}

async function onMove(orig: Key, dest: Key, metadata: MoveMetadata) {
    console.log('onMove', orig, dest, metadata)

    let move = `${orig}${dest}`
    const sourceSquarePiece = game.get(orig as Square)
    if (sourceSquarePiece.type === 'p' && (dest[1] === '1' || dest[1] === '8')) {
        move += 'q'
    }

    try {
        game.move(move)
    } catch (e) {
        $('debuginfo')!.textContent = `Error: invalid move: ${e}`
        chessboard.set({
            fen: game.fen(),
            turnColor: game.turn() === 'w' ? 'white' : 'black',
            movable: {
                free: true,
                color: game.turn() === 'w' ? 'white' : 'black'
            }
        })
        return
    }

    chessboard.set({
        turnColor: game.turn() === 'w' ? 'white' : 'black',
        movable: {
            free: false,
            color: game.turn() === 'w' ? 'white' : 'black'
        }
    })

    if (game.isGameOver()) {
        $('debuginfo')!.textContent = `Game over`
        return
    }

    let engineMove
    try {
        engineMove = await makeMove(game, engine)
    } catch (e) {
        $('debuginfo')!.textContent = `Error: engine move: ${e}`
        return
    }
    $('debuginfo')!.textContent = `Engine move: ${engineMove}
current average inaccuracy: ${engine.currentAverageInaccuracy}
target average inaccuracy: ${engine.config.targetAverageInaccuracy}`
    if (engine.inaccuracyHistory.length != 0) {
        $('debuginfo')!.textContent += `\nLast move Inaccuracy: ${engine.inaccuracyHistory[engine.inaccuracyHistory.length - 1]}`
    }

    if (game.isGameOver()) {
        $('debuginfo')!.textContent = `Game over`
    }

    chessboard.set({
        fen: game.fen(),
        turnColor: game.turn() === 'w' ? 'white' : 'black',
        movable: {
            free: true,
            color: game.turn() === 'w' ? 'white' : 'black'
        }
    })
}

document.addEventListener('DOMContentLoaded', applicationStart)
