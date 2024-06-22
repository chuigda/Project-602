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
