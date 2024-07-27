export function randomPick<T>(arr: T[]): T {
   return arr[Math.floor(Math.random() * arr.length)]
}

export function randomPickParabola<T>(arr: T[], power: number): T {
   return arr[Math.floor(Math.pow(Math.random(), power) * arr.length)]
}