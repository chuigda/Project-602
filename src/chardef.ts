import { CharacterDef } from './assetloader'

export const CharacterDefs: Record<string, CharacterDef> = {
   'NeroRi': {
      baseImage: '/portrait/white_queen_glow.png',
      emotions: {
         '常态': ['base'],
         '扇子': ['/portrait/white_queen_fan.png'],
         '生气': ['base', '/portrait/white_queen_angry.png'],
         '加载中': ['base', '/portrait/white_queen_loading.png'],
         '惊讶': ['base', '/portrait/white_queen_surprised.png'],
         '无语': ['base', '/portrait/white_queen_speachless.png'],
         '黄豆': ['base', '/portrait/white_queen_soybean.png'],
         'wink': ['base', '/portrait/white_queen_wink.png'],
      },

      startX: 0,
      startY: 0,
      width: 0,
      height: 0,
      drawX: 0,
      drawY: 0,
      drawWidth: 0,
      drawHeight: 0
   }
}
