import { Chess } from 'chess.js'

import { trimFEN } from './trimfen'
import { OpeningBook } from './opening-book'
import { invoke } from '@tauri-apps/api'
import { EvaluateResponse } from '../protocol'

export interface EngineConfig {
    inaccuracyTolerance: number
    openingInaccuracyTolerance?: number
    targetAverageInaccuracy: number
}

export interface Engine {
    config: EngineConfig
    inaccuracyHistory: number[]
    currentInaccuracy: number
    currentAverageInaccuracy: number
}

export async function makeMove(game: Chess, engine: Engine): Promise<string> {
    const fen = trimFEN(game.fen())

    if (fen in OpeningBook && OpeningBook[fen].moves.length !== 0) {
        const openingInaccuracyTolerance = engine.config.openingInaccuracyTolerance ??
            engine.config.inaccuracyTolerance

        const opening = OpeningBook[fen]
        const bestMoveScore = opening.moves[0][1]
        const mostTolerableScore = bestMoveScore - openingInaccuracyTolerance

        const acceptableMoves = opening.moves.filter(([, score]) => score >= mostTolerableScore)
        if (acceptableMoves.length === 0) {
            const randomIndex = Math.floor(Math.random() * opening.moves.length)
            const [move, _] = opening.moves[randomIndex]
            game.move(move)
            return move
        }
        const randomIndex = Math.floor(Math.random() * acceptableMoves.length)

        const [move, _] = acceptableMoves[randomIndex]
        game.move(move)
        return move
    }

    const candidateMoves = game.moves({ verbose: true })
    const positions = []
    for (const move of candidateMoves) {
        game.move(move)
        positions.push(game.fen())
        game.undo()
    }

    const request = { positions, without_king: false }
    const response = await invoke<{
        success: boolean,
        result?: EvaluateResponse
    }>('evaluate', { request })

    if (!response.success) {
        throw new Error('evaluation failed')
    }

    const scores = response.result!.scores
    const moveScores = candidateMoves.map((move, i) => ({
        move,
        score: -scores[i],
        inaccuracy: 0
    })).sort((a, b) => b.score - a.score)
    const bestScore = moveScores[0].score

    for (const moveScore of moveScores) {
        moveScore.inaccuracy = Math.abs(bestScore - moveScore.score)
    }

    const acceptableMoveScores = moveScores.filter(({ inaccuracy }) => inaccuracy <= engine.config.inaccuracyTolerance)
    console.log('acceptable candidate moves: ', acceptableMoveScores)

    let moveScore
    console.log('current ACPL:', engine.currentAverageInaccuracy, 'target ACPL:', engine.config.targetAverageInaccuracy)
    if (engine.currentAverageInaccuracy <= engine.config.targetAverageInaccuracy) {
        const moreInaccurateMoveScores = acceptableMoveScores.filter(({ inaccuracy }) => inaccuracy > engine.config.targetAverageInaccuracy)
        if (moreInaccurateMoveScores.length !== 0) {
            moveScore = moreInaccurateMoveScores[Math.floor(Math.random() * moreInaccurateMoveScores.length)]
        } else {
            moveScore = acceptableMoveScores[Math.floor(Math.random() * moveScores.length)]
        }
    } else {
        const lessInaccurateMoveScores = acceptableMoveScores.filter(({ inaccuracy }) => inaccuracy <= engine.config.targetAverageInaccuracy)
        if (lessInaccurateMoveScores.length !== 0) {
            moveScore = lessInaccurateMoveScores[Math.floor(Math.random() * lessInaccurateMoveScores.length)]
        } else {
            moveScore = acceptableMoveScores[Math.floor(Math.random() * moveScores.length)]
        }
    }

    console.log('choosen move:', moveScore.move.lan, 'inaccuracy:', moveScore.inaccuracy)
    game.move(moveScore.move)
    recomputeAverageInaccuracy(engine, moveScore.inaccuracy)
    return moveScore.move.lan
}

function recomputeAverageInaccuracy(engine: Engine, newMoveInaccuracy: number) {
    const history = engine.inaccuracyHistory
    const n = history.length
    const newAverage = (engine.currentAverageInaccuracy * n + newMoveInaccuracy) / (n + 1)
    engine.inaccuracyHistory.push(newMoveInaccuracy)
    engine.currentAverageInaccuracy = newAverage
}

export function createEngine(config: EngineConfig): Engine {
    return {
        config,
        inaccuracyHistory: [],
        currentInaccuracy: 0,
        currentAverageInaccuracy: 0
    }
}
