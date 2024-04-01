export interface Framebuffer {
   fbo: WebGLFramebuffer
   texture: WebGLTexture

   bind(gl: WebGLRenderingContext): void
   release(gl: WebGLRenderingContext): void
   bindTexture(gl: WebGLRenderingContext): void
}

export function createFrameBuffer(
   gl: WebGLRenderingContext,
   width: number,
   height: number
): Framebuffer {
   const fbo = gl.createFramebuffer()
   if (!fbo) {
      throw new Error('无法创建帧缓冲对象')
   }

   gl.bindFramebuffer(gl.FRAMEBUFFER, fbo)

   const texture = gl.createTexture()
   if (!texture) {
      throw new Error('无法创建纹理对象')
   }

   gl.bindTexture(gl.TEXTURE_2D, texture)
   gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
   gl.bindTexture(gl.TEXTURE_2D, null)

   gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0)

   gl.bindFramebuffer(gl.FRAMEBUFFER, null)

   return {
      fbo,
      texture,

      bind(gl) {
         gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo)
         gl.viewport(0, 0, width, height)
      },
      release(gl) {
         gl.bindFramebuffer(gl.FRAMEBUFFER, null)
      },
      bindTexture(gl) {
         gl.bindTexture(gl.TEXTURE_2D, this.texture)
      }
   }
}
