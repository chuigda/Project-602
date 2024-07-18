import { CharacterDef } from '../assetloader'

export const CharacterDefs: Record<string, CharacterDef> = {
   '白杨': {
      baseImage: '/portrait/white_king_glow.png',
      emotions: {
         '常态': ['base'],
         '生气': ['base', '/portrait/white_king_angry.png'],
         '黑线': ['base', '/portrait/white_king_blackline.png'],
         '尬笑': ['base', '/portrait/white_king_embarrassed.png'],
         '大笑': ['base', '/portrait/white_king_laugh.png'],
         '惊讶': ['base', '/portrait/white_king_shocked.png'],
         '黄豆': ['base', '/portrait/white_king_soybean.png'],
         'wink': ['base', '/portrait/white_king_wink.png']
      },

      startX: 0,
      startY: 0,
      width: 0,
      height: 0,
      drawX: 0,
      drawY: 0,
      drawWidth: 0,
      drawHeight: 0
   },
   'NeroRi': {
      baseImage: '/portrait/white_queen_glow.png',
      emotions: {
         '常态': ['base'],
         '扇子': ['/portrait/white_queen_fan_glow.png'],
         '生气': ['base', '/portrait/white_queen_angry.png'],
         '加载中': ['base', '/portrait/white_queen_loading.png'],
         '惊讶': ['base', '/portrait/white_queen_shocked.png'],
         '无语': ['base', '/portrait/white_queen_speechless.png'],
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
   },
   '黑王': {
      baseImage: '/portrait/black_king_glow.png',
      emotions: {
         '常态': ['base']
      },

      startX: 0,
      startY: 0,
      width: 0,
      height: 0,
      drawX: 0,
      drawY: 0,
      drawWidth: 0,
      drawHeight: 0
   },
   '黑后': {
      baseImage: '/portrait/black_queen_base_glow.png',
      emotions: {
         '常态': ['base', '/portrait/black_queen_normal.png'],
         '不悦': ['base', '/portrait/black_queen_annoyed.png'],
         '生气': ['base', '/portrait/black_queen_angry.png'],
         '大哭': ['base', '/portrait/black_queen_cry.png'],
         '雌小鬼': ['base', '/portrait/black_queen_grimace.png'],
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
