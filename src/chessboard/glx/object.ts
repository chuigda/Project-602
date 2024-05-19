export interface Object3D {
   vertices: number[]
   normals: number[]
   texCoords: number[]
}

export function loadObject(source: string): Object3D {
   const lines = source.split('\n')

   const vertices: number[] = []
   const normals: number[] = []
   const texCoords: number[] = []

   const vertexIndices: number[] = []
   const normalIndices: number[] = []
   const texCoordIndices: number[] = []

   for (const lineIdx in lines) {
      const line = lines[lineIdx]
      const trimmed = line.trim()
      if (trimmed.length === 0 || trimmed.startsWith('#')) {
         continue
      }

      const parts = trimmed.split(/\s+/)
      if (parts[0] === 'v') {
         vertices.push(parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3]))
      } else if (parts[0] === 'vn') {
         normals.push(parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3]))
      } else if (parts[0] === 'vt') {
         texCoords.push(parseFloat(parts[1]), parseFloat(parts[2]))
      } else if (parts[0] === 'f') {
         if (parts.length !== 4) {
            throw new Error(`无法处理非三角形的面: ${line}`)
         }

         for (let i = 1; i < 4; i++) {
            const indicesParts = parts[i].split('/')

            vertexIndices.push(parseInt(indicesParts[0]) - 1)
            texCoordIndices.push(parseInt(indicesParts[1]) - 1)
            normalIndices.push(parseInt(indicesParts[2]) - 1)
         }
      } else if (parts[0] === 'o' || parts[0] === 'g' || parts[0] === 's') {
         // do nothing, we don't care about these
      } else {
         throw new Error(`无法识别的 Wavefront OBJ 行: ${line}`)
      }
   }

   const ret: Object3D = {
      vertices: [],
      normals: [],
      texCoords: []
   }

   for (let i = 0; i < vertexIndices.length; i++) {
      ret.vertices.push(vertices[vertexIndices[i] * 3], vertices[vertexIndices[i] * 3 + 1], vertices[vertexIndices[i] * 3 + 2])
      ret.normals.push(normals[normalIndices[i] * 3], normals[normalIndices[i] * 3 + 1], normals[normalIndices[i] * 3 + 2])
      ret.texCoords.push(texCoords[texCoordIndices[i] * 2], texCoords[texCoordIndices[i] * 2 + 1])
   }

   return ret
}

export interface VertexBufferObject {
   vbo: WebGLBuffer
   nbo: WebGLBuffer
   tbo: WebGLBuffer
   count: number

   draw: (gl: WebGLRenderingContext) => void
}

export function createVertexBufferObject(gl: WebGLRenderingContext, obj: Object3D): VertexBufferObject {
   const vbo = gl.createBuffer()
   if (!vbo) {
      throw new Error('无法创建顶点缓冲对象')
   }
   gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
   gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(obj.vertices), gl.STATIC_DRAW)

   const nbo = gl.createBuffer()
   if (!nbo) {
      throw new Error('无法创建法向量缓冲对象')
   }
   gl.bindBuffer(gl.ARRAY_BUFFER, nbo)
   gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(obj.normals), gl.STATIC_DRAW)

   const tbo = gl.createBuffer()
   if (!tbo) {
      throw new Error('无法创建纹理坐标缓冲对象')
   }

   gl.bindBuffer(gl.ARRAY_BUFFER, tbo)
   gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(obj.texCoords), gl.STATIC_DRAW)
   const ibo = gl.createBuffer()
   if (!ibo) {
      throw new Error('无法创建索引缓冲对象')
   }

   const outerGl = gl
   const self = {
      vbo,
      nbo,
      tbo,
      count: obj.vertices.length / 3,

      draw: (gl: WebGLRenderingContext) => {
         if (gl !== outerGl) {
            throw new Error('无法在不同的 WebGL 上下文中绘制')
         }

         gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
         gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0)
         gl.enableVertexAttribArray(0)

         gl.bindBuffer(gl.ARRAY_BUFFER, nbo)
         gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0)
         gl.enableVertexAttribArray(1)

         gl.bindBuffer(gl.ARRAY_BUFFER, tbo)
         gl.vertexAttribPointer(2, 2, gl.FLOAT, false, 0, 0)
         gl.enableVertexAttribArray(2)

         gl.drawArrays(gl.TRIANGLES, 0, self.count)
      }
   }

   return self
}
