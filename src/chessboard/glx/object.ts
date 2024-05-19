export interface Object3D {
   vertices: number[]
   normals: number[]
   texCoords: number[]

   indices: number[]
}

export function loadObject(source: string): Object3D {
   const lines = source.split('\n')

   const vertices = []
   const normals = []
   const texCoords = []

   const indices = []

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
         for (let i = 1; i < 4; i++) {
            const indicesParts = parts[i].split('/')
            indices.push(parseInt(indicesParts[0]) - 1, parseInt(indicesParts[1]) - 1, parseInt(indicesParts[2]) - 1)
         }
      } else {
         throw new Error(`无法识别的 Wavefront OBJ 行: ${line}`)
      }
   }

   return {
      vertices,
      normals,
      texCoords,
      indices
   }
}

export interface VertexBufferObject {
   vbo: WebGLBuffer
   nbo: WebGLBuffer
   tbo: WebGLBuffer
   ibo: WebGLBuffer
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

   gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo)
   gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(obj.indices), gl.STATIC_DRAW)

   const outerGl = gl
   return {
      vbo,
      nbo,
      tbo,
      ibo,
      count: obj.indices.length,

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

         gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo)
         gl.drawElements(gl.TRIANGLES, obj.indices.length, gl.UNSIGNED_SHORT, 0)
      }
   }
}