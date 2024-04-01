import { Nullable } from "../../util/nullable"

export interface ShaderProgram {
   program: WebGLProgram
   attributeLocations: Record<string, number>
   uniformLocations: Record<string, Nullable<WebGLUniformLocation>>

   useProgram(gl: WebGLRenderingContext): void
   getAttribLocation(gl: WebGLRenderingContext, name: string): number
   getUniformLocation(gl: WebGLRenderingContext, name: string): Nullable<WebGLUniformLocation>
   enableVertexAttribArray(gl: WebGLRenderingContext, name: string): void
   vertexAttribPointer(gl: WebGLRenderingContext, name: string, size: number, type: number, normalized: boolean, stride: number, offset: number): void
   uniformMatrix4fv(gl: WebGLRenderingContext, name: string, transpose: boolean, value: Float32Array | number[]): void
   uniform3fv(gl: WebGLRenderingContext, name: string, value: Float32Array | number[]): void
   uniform1f(gl: WebGLRenderingContext, name: string, value: number): void

}

export function createShaderProgram(
   gl: WebGLRenderingContext,
   vsSource: string,
   fsSource: string
): ShaderProgram {
   const vertexShader = gl.createShader(gl.VERTEX_SHADER)
   if (!vertexShader) {
      throw new Error('无法创建顶点着色器')
   }

   gl.shaderSource(vertexShader, vsSource)
   gl.compileShader(vertexShader)
   if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
      throw new Error(`编译顶点着色器时遇到错误：${gl.getShaderInfoLog(vertexShader)}`)
   }

   const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)
   if (!fragmentShader) {
      throw new Error('无法创建片元着色器')
   }

   gl.shaderSource(fragmentShader, fsSource)
   gl.compileShader(fragmentShader)
   if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
      throw new Error(`编译片元着色器时遇到错误：${gl.getShaderInfoLog(fragmentShader)}`)
   }

   const program = gl.createProgram()
   if (!program) {
      throw new Error('无法创建着色器程序')
   }

   gl.attachShader(program, vertexShader)
   gl.attachShader(program, fragmentShader)
   gl.linkProgram(program)

   if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(`链接着色器程序时遇到错误：${gl.getProgramInfoLog(program)}`)
   }

   gl.deleteShader(vertexShader)
   gl.deleteShader(fragmentShader)

   return {
      program,
      attributeLocations: {},
      uniformLocations: {},

      useProgram(gl) {
         gl.useProgram(this.program)
      },
      getAttribLocation(gl, name) {
         if (!this.attributeLocations[name]) {
            this.attributeLocations[name] = gl.getAttribLocation(this.program, name)
         }
         return this.attributeLocations[name]
      },
      getUniformLocation(gl, name) {
         if (!this.uniformLocations[name]) {
            this.uniformLocations[name] = gl.getUniformLocation(this.program, name)
         }
         return this.uniformLocations[name]
      },
      enableVertexAttribArray(gl, name) {
         let attribLocation = this.getAttribLocation(gl, name)
         if (attribLocation == -1) {
            throw new Error(`无法获取 attribute 变量 ${name} 的位置`)
         }

         gl.enableVertexAttribArray(attribLocation)
      },
      vertexAttribPointer(gl, name, size, type, normalized, stride, offset) {
         let attribLocation = this.getAttribLocation(gl, name)
         if (attribLocation == -1) {
            throw new Error(`无法获取 attribute 变量 ${name} 的位置`)
         }

         gl.vertexAttribPointer(attribLocation, size, type, normalized, stride, offset)
      },
      uniformMatrix4fv(gl, name, transpose, value) {
         if (value.constructor === Array) {
            value = new Float32Array(value)
         }

         let uniformLocation = this.getUniformLocation(gl, name)
         if (!uniformLocation) {
            throw new Error(`无法获取 uniform 变量 ${name} 的位置`)
         }

         gl.uniformMatrix4fv(uniformLocation, transpose, value)
      },
      uniform3fv(gl, name, value) {
         if (value.constructor === Array) {
            value = new Float32Array(value)
         }

         let uniformLocation = this.getUniformLocation(gl, name)
         if (!uniformLocation) {
            throw new Error(`无法获取 uniform 变量 ${name} 的位置`)
         }

         gl.uniform3fv(uniformLocation, value)
      },
      uniform1f(gl, name, value) {
         let uniformLocation = this.getUniformLocation(gl, name)
         if (!uniformLocation) {
            throw new Error(`无法获取 uniform 变量 ${name} 的位置`)
         }

         gl.uniform1f(uniformLocation, value)
      }
   }
}
