import { globalResource } from '..'

export function choosePieceNotation(piece: string): string {
   if (globalResource.value.config.chessPieceNotation === 'latin') {
      return piece
   }

   switch (piece) {
      case 'R': return '车'
      case 'N': return '马'
      case 'B': return '象'
      case 'Q': return '后'
      case 'K': return '王'
      case 'P': return '兵'

      default: return piece
   }
}
