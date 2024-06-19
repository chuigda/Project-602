const { readFileSync, writeFileSync } = require('fs')

const color = ['white', 'black']
const piece = ['k', 'q', 'r', 'b', 'n', 'p']

let resultString = ''

for (const c of color) {
   for (const p of piece) {
      const svg = readFileSync(`./${c}_${p}.svg`, 'utf8')
      const base64 = Buffer.from(svg).toString('base64')

      const pieceClassName = `chesspiece-${c == 'white' ? p.toUpperCase() : p.toLocaleLowerCase()}`

      resultString += `.${pieceClassName} {\n`
      resultString += `  background-image: url('data:image/svg+xml;base64,${base64}');\n`
      resultString += `}\n`
   }
}

writeFileSync('svg2css.css', resultString)
