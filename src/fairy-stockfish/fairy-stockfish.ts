export interface StockfishResource {
   stockfishScript: string
   stockfishWasmBinary: ArrayBuffer
}

export async function loadStockfishResource(): Promise<StockfishResource> {
   setItemLoadProgress(0)

   const script = await $().get('/fairy-stockfish/stockfish.js')
   const scriptElement = document.createElement('script')
   scriptElement.text = script
   document.head.appendChild(scriptElement)
   setItemLoadProgress(0.02)

   const wasmBinary = await $().getWithProgressReport(
      '/fairy-stockfish/stockfish.wasm',
      undefined,
      (event: ProgressEvent) => {
         setItemLoadProgress(0.02 + 0.98 * event.loaded / event.total)
      }
   )
   console.log('wasmBinary=', wasmBinary)
   setItemLoadProgress(1)

   return {
      stockfishScript: script,
      stockfishWasmBinary: wasmBinary
   }
}
