import { loadChessboardAsset } from './chessboard/chessboard'
import { createFairyStockfish, loadStockfishResource } from './fairy-stockfish/fairy-stockfish'
import { sleep } from './util/sleep'
import { createCheckmateWindow } from './widgets/checkmate'

async function continueLoadingOperation() {
   setItemLoadProgress(1)
   await sleep(1000)

   $('load-item-title').innerText = '载入图形化操作界面'
   setOverallLoadProgress(1 / 4)
   await loadChessboardAsset()

   setOverallLoadProgress(2 / 4)
   $('load-item-title').innerText = '载入泛用型对抗人工智能'
   const stockfishResource = await loadStockfishResource()

   setOverallLoadProgress(3 / 4)
   $('load-item-title').innerText = '人工智能系统初始化'
   setItemLoadProgress(0)
   const fairyStockfish = await createFairyStockfish(stockfishResource)
   setItemLoadProgress(1)

   setOverallLoadProgress(1)
   $('load-item-title').innerText = '即将完成...'

   await sleep(1000)
   createCheckmateWindow({
      startPos: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -',
      movesPlayed: '1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6 6. Bg5 e6 7. f4 Qb6 8. Qd2 Qxb2 9. Rb1 Qa3 10. Rb3 Qa5 11. Be2 Nc6 12. Bxf6 gxf6 13. O-O Qc5 14. Kh1 Qxd4 15. Rd1 Qxd2 16. Rxd2 Be7 17. f5 Ne5 18. Na4 b5 19. Nb2 Bb7 20. fxe6 fxe6 21. Bh5+ Kf8 22. Re2 Rg8 23. c4 Rg5 24. Bf3 Bc6 25. cxb5 axb5 26. h4 Rg6 27. Nd3 Nxf3 28. gxf3 Rg3 29. Nf4 Kf7 30. Kh2 Rgg8 31. Rbe3 e5 32. Nd5 Bxd5 33. exd5 Ra4 34. Kh3 f5 0-1',
      moveCount: 34,

      brilliantCount: 0,
      excellentCount: 1,
      goodCount: 26,
      interestingCount: 4,
      inaccuracyCount: 0,
      mistakeCount: 2,
      blunderCount: 1,
   })
}

continueLoadingOperation()
