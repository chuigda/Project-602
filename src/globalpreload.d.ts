declare function Stockfish(options: { wasmBinary: ArrayBuffer }): StockfishInstance

interface StockfishInstance {
   postMessage: (message: string) => void
   addMessageListener: (listener: (line: string) => void) => void

   FS: {
      writeFile: (path: string, data: Uint8Array) => void
   }
}

interface FakeJQuery {
   get<T>(
      url: string,
      headers?: Record<string, string>,
      responder: (resp: Response) => Promise<T>
   ): Promise<T>

   get(url: string, headers?: Record<string, string>): Promise<string>
   getWithProgressReport(
      url: string,
      headers?: Record<string, string>,
      onProgress: (progress: ProgressEvent) => void
   ): Promise<string | Blob>
}

declare function $(selector: string): HTMLElement
declare function $(): FakeJQuery

declare function setOverallLoadProgress(progress: number)
declare function setItemLoadProgress(progress: number)

declare function importWithoutVite(path: string): Promise<any>
