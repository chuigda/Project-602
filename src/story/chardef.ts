import { CharacterDef } from '../assetloader'

export const CharacterDefs: Record<string, CharacterDef> = {
   '白杨': {
      baseImage: '/portrait/white_king_glow',
      emotions: {
         '常态': ['base'],
         '生气': ['base', '/portrait/white_king_angry'],
         '黑线': ['base', '/portrait/white_king_blackline'],
         '尬笑': ['base', '/portrait/white_king_embarrassed'],
         '大笑': ['base', '/portrait/white_king_laugh'],
         '惊讶': ['base', '/portrait/white_king_shocked'],
         '黄豆': ['base', '/portrait/white_king_soybean'],
         'wink': ['base', '/portrait/white_king_wink']
      },

      startX: 700,
      startY: 0,
      width: 1800 - 700,
      height: 1440,
      drawX: 0,
      drawY: 0
   },
   'NeroRi': {
      baseImage: '/portrait/white_queen_glow',
      emotions: {
         '常态': ['base'],
         '扇子': ['/portrait/white_queen_fan_glow'],
         '生气': ['base', '/portrait/white_queen_angry'],
         '加载中': ['base', '/portrait/white_queen_loading'],
         '惊讶': ['base', '/portrait/white_queen_shocked'],
         '无语': ['base', '/portrait/white_queen_speechless'],
         '黄豆': ['base', '/portrait/white_queen_soybean'],
         'wink': ['base', '/portrait/white_queen_wink']
      },

      startX: 800,
      startY: 0,
      width: 1850 - 800,
      height: 1440,
      drawX: 0,
      drawY: 0
   },
   '白主教': {
      baseImage: '/portrait/white_bishop_glow',
      emotions: {
         '常态': ['base'],
         '生气': ['base', '/portrait/white_bishop_angry'],
         '大哭': ['base', '/portrait/white_bishop_cry'],
         '震惊': ['base', '/portrait/white_bishop_shocked']
      },

      startX: 500,
      startY: 0,
      width: 2000,
      height: 3000,
      drawX: 0,
      drawY: 0
   },
   '白骑士': {
      baseImage: '/portrait/white_knight_glow',
      emotions: {
         '常态': ['base'],
         '生气': ['base', '/portrait/white_knight_angry'],
         '大哭': ['base', '/portrait/white_knight_cry'],
         '震惊': ['base', '/portrait/white_knight_shocked'],
         'wink': ['base', '/portrait/white_knight_wink']
      },

      startX: 800,
      startY: 0,
      width: 2750 - 800,
      height: 3000,
      drawX: 0,
      drawY: 0
   },
   '黑王': {
      baseImage: '/portrait/black_king_glow',
      emotions: {
         '常态': ['base'],
         '生气': ['base', '/portrait/black_king_angry'],
         '微笑': ['base', '/portrait/black_king_smile']
      },

      startX: 700,
      startY: 0,
      width: 1900 - 700,
      height: 1440,
      drawX: 0,
      drawY: 0
   },
   '黑后': {
      baseImage: '/portrait/black_queen_base_glow',
      emotions: {
         '常态': ['base', '/portrait/black_queen_normal'],
         '不悦': ['base', '/portrait/black_queen_annoyed'],
         '生气': ['base', '/portrait/black_queen_angry'],
         '大哭': ['base', '/portrait/black_queen_cry'],
         '鬼脸': ['base', '/portrait/black_queen_grimace'],
         '大笑': ['base', '/portrait/black_queen_laugh'],
         '雌小鬼': ['base', '/portrait/black_queen_laugh']
      },

      startX: 700,
      startY: 0,
      width: 1850 - 700,
      height: 1440,
      drawX: 0,
      drawY: 0
   },
   '黑主教': {
      baseImage: '/portrait/black_bishop_glow',
      emotions: {
         '常态': ['base'],
         '生气': ['base', '/portrait/black_bishop_angry'],
         '大哭': ['base', '/portrait/black_bishop_cry'],
         '震惊': ['base', '/portrait/black_bishop_shocked']
      },

      startX: 500,
      startY: 0,
      width: 2500 - 500,
      height: 3000,
      drawX: 0,
      drawY: 0
   },
   '黑骑士': {
      baseImage: '/portrait/black_knight_glow',
      emotions: {
         '常态': ['base'],
         '生气': ['base', '/portrait/black_knight_angry'],
         '大哭': ['base', '/portrait/black_knight_cry'],
         '震惊': ['base', '/portrait/black_knight_shocked'],
         'wink': ['base', '/portrait/black_knight_wink']
      },

      startX: 800,
      startY: 0,
      width: 2750 - 800,
      height: 3000,
      drawX: 0,
      drawY: 0
   }
}
