export interface StockfishResource {
   stockfishWasmBinary: ArrayBuffer
}

export async function loadStockfishResource(): Promise<StockfishResource> {
   setItemLoadProgress(0)

   await new Promise(resolve => {
      const scriptElement = document.createElement('script')
      scriptElement.id = 'stockfish-script'
      scriptElement.onload = resolve
      scriptElement.src = '/fairy-stockfish/stockfish.js'
      document.head.appendChild(scriptElement)
   })
   setItemLoadProgress(0.02)

   const wasmBinary = await $().getWithProgressReport(
      '/fairy-stockfish/stockfish.wasm',
      undefined,
      (event: ProgressEvent) => {
         setItemLoadProgress(0.02 + 0.98 * event.loaded / event.total)
      }
   ) as Blob
   setItemLoadProgress(1)

   return {
      stockfishWasmBinary: await wasmBinary.arrayBuffer()
   }
}

export class FairyStockfish {
   instance: StockfishInstance
   messageHandler: (line: string) => void = () => {}

   constructor(instance: StockfishInstance) {
      this.instance = instance
   }
}

export async function createFairyStockfish(stockfishResource: StockfishResource): Promise<FairyStockfish> {
   const instance = await Stockfish({ wasmBinary: stockfishResource.stockfishWasmBinary })

   return new Promise(resolve => {
      const fairyStockfish = new FairyStockfish(instance)
      fairyStockfish.messageHandler = line => {
         if (line.trim() == "uciok") {
            fairyStockfish.messageHandler = () => {}
            resolve(fairyStockfish)
         }
      }

      instance.addMessageListener(line => fairyStockfish.messageHandler(line))
      instance.postMessage("uci")
   })
}
