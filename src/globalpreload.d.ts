declare function Stockfish(options: { wasmBinary: ArrayBuffer }): StockfishInstance

interface StockfishInstance {
   postMessage: (message: string) => void
   addMessageListener: (listener: (line: string) => void) => void
}

interface FakeJQuery {
   get<T>(
      url: string,
      headers?: Record<string, string>,
      responder?: (resp: Response) => Promise<T>
   ): Promise<T>
}

declare function $(selector: string): HTMLElement
declare function $(): FakeJQuery
