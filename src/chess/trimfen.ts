// remove the halfmove clock and fullmove number from the FEN, so we can use it
// to index the opening book
export function trimFEN(fen: string): string {
    return fen.split(' ').slice(0, 4).join(' ')
}
