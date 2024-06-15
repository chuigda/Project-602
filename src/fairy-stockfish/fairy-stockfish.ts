export interface StockfishResource {
   variantsIni: ArrayBuffer
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
         setItemLoadProgress(0.02 + 0.96 * event.loaded / event.total)
      }
   ) as Blob

   const variantsIni = await $().get('/fairy-stockfish/chess310.ini', undefined, resp => resp.blob())
   setItemLoadProgress(1)

   return {
      variantsIni: await variantsIni.arrayBuffer(),
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
         console.info(line)
         if (line.trim() == 'uciok') {
            fairyStockfish.messageHandler = () => {}
            resolve(fairyStockfish)
         }
      }

      instance.addMessageListener(line => fairyStockfish.messageHandler(line))
      instance.FS.writeFile(`/chess310.ini`, new Uint8Array(stockfishResource.variantsIni))
      instance.postMessage('check /chess310.ini')
      instance.postMessage('load /chess310.ini')
      instance.postMessage('uci')
   })
}
