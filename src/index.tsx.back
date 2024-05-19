import { $ } from './min-jquery'
import { Chess, Square } from 'chess.js'
import { Chessground } from 'chessground';

import { makeMove, createEngine, Engine} from './chess/engine'
import { Key, MoveMetadata } from 'chessground/types';
import { Api } from 'chessground/api';

const game = new Chess()
let engine: Engine
let chessboard: Api

async function applicationStart() {
    $('start')?.addEventListener('click', configureAndStartGame)
}

function configureAndStartGame() {
    const targetAverageInaccuracy = parseInt(($('targetAverageInaccuracy')! as HTMLInputElement).value)
    const inaccuracyTolerance = parseInt(($('inaccuracyTolerance')! as HTMLInputElement).value)
    const openingInaccuracyTolerance = parseInt(($('openingInaccuracyTolerance')! as HTMLInputElement).value)

    engine = createEngine({
        targetAverageInaccuracy: targetAverageInaccuracy,
        inaccuracyTolerance: inaccuracyTolerance,
        openingInaccuracyTolerance: openingInaccuracyTolerance
    })
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

    $('config')?.remove()
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
    $('debuginfo')!.textContent = `Engine move: ${engineMove} ${engine.inaccuracyHistory.length === 0 ? "(book move)" : ""}
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
