export function randomInt(l: number, r: number): number {
   if (l >= r) {
      return l
   }

   return Math.floor(Math.random() * (r - l + 1)) + l
}

export function randomPick<T>(arr: T[]): T {
   return arr[randomInt(0, arr.length - 1)]
}

export function randomPickParabola<T>(arr: T[], power: number): T {
   return arr[Math.floor(Math.pow(Math.random(), power) * arr.length)]
}

export function shuffle(input: number[]): number[] {
   const output = [...input]
   for (let i = 0; i < output.length; i++) {
      const j = randomInt(0, output.length - 1)
      const temp = output[i]
      output[i] = output[j]
      output[j] = temp
   }
   return output
}
