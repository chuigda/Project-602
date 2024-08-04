const bezierEasing = require('bezier-easing')
const { readFileSync, writeFileSync } = require('fs')

const f = bezierEasing(0.42, 0, 1.0, 1.0)

function makeBezier(segments) {
   const points = []
   for (let i = 0; i <= segments; i++) {
      points.push(f(i / segments))
   }
   return points
}

writeFileSync('bezier.json', JSON.stringify({
   bezier10: makeBezier(10),
   bezier15: makeBezier(15),
   bezier20: makeBezier(20),
   bezier30: makeBezier(30),
   bezier45: makeBezier(45),
   bezier60: makeBezier(60),
   bezier90: makeBezier(90),
}, null, 3))
