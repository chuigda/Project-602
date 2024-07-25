export function copydeep<T>(obj: T): T {
   return JSON.parse(JSON.stringify(obj))
}