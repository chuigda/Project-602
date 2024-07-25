export interface StockfishResource {
   variantsIni: ArrayBuffer
   stockfishWasmBinary: ArrayBuffer
}

export type EvaluationScore = { $k: 'cp', score: number } | { $k: 'mate', inMoves: number }

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

   private sendCommandAndWaitReadyOk(command: string): Promise<void> {
      const self = this
      const r = new Promise<void>(resolve => {
         self.messageHandler = line => {
            if (line.includes('readyok')) {
               self.messageHandler = () => {}
               resolve()
            }
         }
      })

      self.instance.postMessage(command)
      self.instance.postMessage('isready')
      return r
   }

   setThreadCount(threadCount: number): Promise<void> {
      return this.sendCommandAndWaitReadyOk(`setoption name Threads value ${threadCount}`)
   }

   setHashSize(hashSize: number): Promise<void> {
      return this.sendCommandAndWaitReadyOk(`setoption name Hash value ${hashSize}`)
   }

   uciNewGame(): Promise<void> {
      return this.sendCommandAndWaitReadyOk('ucinewgame')
   }

   setVariant(variant: string): Promise<void> {
      return this.sendCommandAndWaitReadyOk(`setoption name UCI_Variant value ${variant}`)
   }

   setPosition(fen: string): Promise<void> {
      console.info(`stockfish: setting position to ${fen}`)
      return this.sendCommandAndWaitReadyOk(`position fen ${fen}`)
   }

   setPositionWithMoves(fen: string, moves: string[]): Promise<void> {
      console.info(`stockfish: setting position to ${fen} with moves ${moves.join(' ')}`)
      return this.sendCommandAndWaitReadyOk(`position fen ${fen} moves ${moves.join(' ')}`)
   }

   setElo(elo: number): Promise<void> {
      console.info(`stockfish: setting ELO to ${elo}`)
      const self = this
      self.instance.postMessage(`setoption name UCI_Elo value ${elo}`)
      self.instance.postMessage(`setoption name UCI_LimitStrength value true`)

      const r = new Promise<void>(resolve => {
         self.messageHandler = line => {
            if (line.includes('readyok')) {
               self.messageHandler = () => {}
               resolve()
            }
         }
      })

      self.instance.postMessage('isready')
      return r
   }

   unsetElo(): Promise<void> {
      console.info(`stockfish: unsetting ELO`)
      return this.sendCommandAndWaitReadyOk(`setoption name UCI_LimitStrength value false`)
   }

   setAnalyseMode(analyseMode: boolean): Promise<void> {
      return this.sendCommandAndWaitReadyOk(`setoption name UCI_AnalyseMode value ${analyseMode ? 'true' : 'false'}`)
   }

   getCurrentFen(): Promise<string> {
      const self = this
      const r = new Promise<string>(resolve => {
         self.messageHandler = line => {
            if (line.startsWith('Fen:')) {
               self.messageHandler = () => {}
               resolve(line.split(':')[1].trim())
            }
         }
      })

      self.instance.postMessage('d')
      return r
   }

   getValidMoves(): Promise<string[]> {
      const self = this

      const r = new Promise<string[]>(resolve => {
         const collectedMoves: string[] = []
         self.messageHandler = line => {
            if (line.startsWith('Nodes searched')) {
               self.messageHandler = () => {}
               resolve(collectedMoves)
               return
            }

            line = line.trim()
            if (line.length === 0 || !line.includes(':')) {
               return
            }

            const parts = line.split(':')
            if (parts.length !== 2) {
               return
            }

            const move = parts[0].trim()
            if (move.length === 0) {
               return
            }

            collectedMoves.push(move)
         }
      })

      self.instance.postMessage('go perft 1')
      return r
   }

   findBestMoveByDepth(depth: number, timeLimit?: number): Promise<string> {
      const self = this
      let maxDepth = 0
      const r = new Promise<string>(resolve => {
         self.messageHandler = line => {
            if (line.startsWith('info depth')) {
               const depth = parseInt(line.split(' ')[2])
               if (depth > maxDepth) {
                  maxDepth = depth
               }
            }

            if (line.startsWith('bestmove')) {
               self.messageHandler = () => {}
               console.info(`stockfish: max depth searched: ${maxDepth}, bestmove line: ${line}`)
               resolve(line.split(' ')[1])
            }
            else {
               console.info(line)
            }
         }
      })

      if (timeLimit) {
         self.instance.postMessage(`go depth ${depth} movetime ${timeLimit}`)
      } else {
         self.instance.postMessage(`go depth ${depth}`)
      }
      return r
   }

   evaluatePosition(depth: number): Promise<EvaluationScore> {
      const self = this
      const r = new Promise<EvaluationScore>(resolve => {
         let lastRecordedScore: EvaluationScore = { $k: 'cp', score: 0 }
         self.messageHandler = line => {
            if (line.startsWith('info depth')) {
               const parts = line.split(' ')
               const scoreIndex = parts.indexOf('cp')
               if (scoreIndex !== -1) {
                  console.info(parts, parts[scoreIndex + 1])
                  lastRecordedScore = { $k: 'cp', score: parseInt(parts[scoreIndex + 1]) }
               } else {
                  const mateIndex = parts.indexOf('mate')
                  if (mateIndex !== -1) {
                     const mateInMoves = parseInt(parts[mateIndex + 1])
                     lastRecordedScore = { $k: 'mate', inMoves: mateInMoves }
                  }
               }
            }
            else if (line.startsWith('bestmove')) {
               console.warn('unsetting?')
               self.messageHandler = () => {}
               resolve(lastRecordedScore)
            }
         }
      })

      self.instance.postMessage(`go depth ${depth}`)
      return r
   }

   getCheckers(): Promise<string[]> {
      const self = this
      const r = new Promise<string[]>(resolve => {
         self.messageHandler = line => {
            if (line.startsWith('Checkers:')) {
               const checkersLine = line.replace('Checkers:', '').trim()
               self.messageHandler = () => {}
               if (checkersLine.length === 0) {
                  resolve([])
               } else {
                  resolve(checkersLine.split(' '))
               }
            }
         }
      })

      self.instance.postMessage('d')
      return r
   }
}

export async function createFairyStockfish(stockfishResource: StockfishResource): Promise<FairyStockfish> {
   const instance = await Stockfish({ wasmBinary: stockfishResource.stockfishWasmBinary })

   return new Promise(resolve => {
      const fairyStockfish = new FairyStockfish(instance)
      fairyStockfish.messageHandler = line => {
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
