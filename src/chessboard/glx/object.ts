export interface Object3D {
   objectName: string
   vertices: number[]
}

export function loadObject(fileName: string, source: string): Object3D[] {
   const lines = source.split('\n')
   const ret = []

   let currentObjectName: string | undefined = undefined
   const verticesPool: number[] = []
   let vertices: number[] = []

   for (const lineIdx in lines) {
      const line = lines[lineIdx].trim()

      if (line.length === 0 || line.startsWith('#')) {
         continue
      }

      const tokens = line.split(' ')
      const cmd = tokens[0]
      const args = tokens.slice(1)

      switch (cmd) {
         case 'o':
            if (currentObjectName !== undefined) {
               ret.push({ objectName: currentObjectName, vertices })
            }

            currentObjectName = args.join(' ')
            vertices = []
            break

         case 'v':
            if (args.length !== 3) {
               throw new Error(`ObjParser: ${fileName}:${lineIdx}: ${line}: 必须提供三个顶点`)
            }

            verticesPool.push(parseFloat(args[0]))
            verticesPool.push(parseFloat(args[1]))
            verticesPool.push(parseFloat(args[2]))
            break

         case 'f':
            if (args.length !== 3) {
               throw new Error(`ObjParser: ${fileName}:${lineIdx}: ${line}: 必须提供三个顶点`)
            }

            for (const arg of args) {
               const indices = arg.split('/').map(x => parseInt(x) - 1)

               vertices.push(verticesPool[indices[0] * 3])
               vertices.push(verticesPool[indices[0] * 3 + 1])
               vertices.push(verticesPool[indices[0] * 3 + 2])
            }
            break

         case 'l': case 'vn': case 'vt': case 'mtllib': case 'usemtl':
            console.warn(`ObjParser: ${fileName}:${lineIdx}: ${line}: 未实现的命令`)
            break
      }
   }

   if (currentObjectName !== undefined) {
      ret.push({ objectName: currentObjectName, vertices })
   }

   return ret
}

export interface VertexBufferObject {
   vbo: WebGLBuffer
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

   const outerGl= gl
   const self = {
      vbo,
      count: obj.vertices.length / 3,

      draw: (gl: WebGLRenderingContext) => {
         if (gl !== outerGl) {
            throw new Error('无法在不同的 WebGL 上下文中绘制')
         }

         gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
         gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0)
         gl.enableVertexAttribArray(0)
         gl.drawArrays(gl.TRIANGLES, 0, self.count)
      }
   }

   return self
}
