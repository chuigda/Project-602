export interface OpeningPosition {
   name: string,
   eco: string,
   moves: [string, number][]
}

export interface CommonOpeningPosition {
   eco: string
   name: string
   fen: string
}

export function isBookMove(openingPosition: OpeningPosition, uciMove: string) {
   const move4chars = uciMove.slice(0, 4)
   return openingPosition.moves.some(move => move[0].startsWith(move4chars))
}
