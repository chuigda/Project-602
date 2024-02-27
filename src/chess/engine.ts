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
        score: -scores[i]
    })).sort((a, b) => b.score - a.score)

    const bestScore = moveScores[0].score
    const tolerableScore = bestScore - engine.config.inaccuracyTolerance
    const acceptableMoveScores = moveScores.filter(({ score }) => score >= tolerableScore)

    console.log('candidate moves:', acceptableMoveScores)
    if (engine.currentAverageInaccuracy > engine.config.targetAverageInaccuracy) {
        // try to play more precisely by using moves inaccuracy < (current - target)
        const inaccuracyDiff = engine.currentAverageInaccuracy - engine.config.targetAverageInaccuracy
        const tolerableScore = bestScore - inaccuracyDiff
        const acceptableMoveScores1 = acceptableMoveScores.filter(({ score }) => score >= tolerableScore)

        // if there're no moves with inaccuracy < (current - target), just play the best move
        if (acceptableMoveScores1.length === 0) {
            const { move } = acceptableMoveScores[0]
            game.move(move)
            engine.inaccuracyHistory.push(0)
            engine.currentAverageInaccuracy = engine.currentInaccuracy / engine.inaccuracyHistory.length
            return move.lan
        } else {
            const randomIndex = Math.floor(Math.random() * acceptableMoveScores1.length)
            const { move, score } = acceptableMoveScores1[randomIndex]
            game.move(move)
            engine.inaccuracyHistory.push(bestScore - score)
            engine.currentInaccuracy += bestScore - score
            engine.currentAverageInaccuracy = engine.currentInaccuracy / engine.inaccuracyHistory.length
            console.info(`playing less inaccurate: ${move.lan}, inaccuracy = ${bestScore - score}, current avg = ${engine.currentAverageInaccuracy}`)
            return move.lan
        }
    } else {
        // try to play less precisely by using moves inaccuracy > (current - target)
        const inaccuracyDiff = engine.config.targetAverageInaccuracy - engine.currentAverageInaccuracy
        const tolerableScore = bestScore - inaccuracyDiff
        let acceptableMoveScores1 = acceptableMoveScores.filter(({ score }) => score >= tolerableScore)

        // if there're no moves with inaccuracy > (current - target), just play a random move
        if (acceptableMoveScores1.length === 0) {
            acceptableMoveScores1 = acceptableMoveScores
        }

        const randomIndex = Math.floor(Math.random() * acceptableMoveScores1.length)
        const { move, score } = acceptableMoveScores1[randomIndex]
        game.move(move)
        engine.inaccuracyHistory.push(bestScore - score)
        engine.currentInaccuracy += bestScore - score
        engine.currentAverageInaccuracy = engine.currentInaccuracy / engine.inaccuracyHistory.length
        console.info(`playing more inaccurate: ${move.lan}, inaccuracy = ${bestScore - score}, current avg = ${engine.currentAverageInaccuracy}`)
        return move.lan
    }
}

export function createEngine(config: EngineConfig): Engine {
    return {
        config,
        inaccuracyHistory: [],
        currentInaccuracy: 0,
        currentAverageInaccuracy: 0
    }
}
