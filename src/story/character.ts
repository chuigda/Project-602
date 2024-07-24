export interface Character {
   name: string,
   emotions: Record<string, HTMLImageElement[]>

   startX: number,
   startY: number,
   width: number,
   height: number,

   drawX: number,
   drawY: number,
   drawWidth: number,
   drawHeight: number
}
