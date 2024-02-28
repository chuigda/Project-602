export type LevelType =
    'battle'
    | 'tutorial'
    | 'puzzle'

export interface LevelBase<K extends LevelType> {
    k: K
}

export interface BattleLevel extends LevelBase<'battle'> {
}

export interface TutorialLevel extends LevelBase<'tutorial'> {
}

export interface PuzzleLevel extends LevelBase<'puzzle'> {
}

export type Level =
    | BattleLevel
    | TutorialLevel
    | PuzzleLevel
