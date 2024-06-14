declare function Stockfish(options: { wasmBinary: ArrayBuffer }): StockfishInstance

interface StockfishInstance {
   postMessage: (message: string) => void
   addMessageListener: (listener: (line: string) => void) => void
}
