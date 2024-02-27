export interface OpeningPosition {
    name: string,
    eco: string,
    moves: [string, number][]
}

import RawOpeningBook from './opening-book.json'

export const OpeningBook = RawOpeningBook as unknown as Record<string, OpeningPosition>
