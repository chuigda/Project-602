export interface Texture {
    texture: WebGLTexture

    bind(gl: WebGLRenderingContext, unit: number): void
    release(gl: WebGLRenderingContext, unit: number): void
}

export function createTexture(
    gl: WebGLRenderingContext,
    image: ImageData
): Texture {
    const texture = gl.createTexture()
    if (!texture) {
        throw new Error('无法创建纹理对象')
    }

    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.bindTexture(gl.TEXTURE_2D, null)

    return {
        texture,

        bind(gl, unit) {
            gl.activeTexture(gl.TEXTURE0 + unit)
            gl.bindTexture(gl.TEXTURE_2D, this.texture)
        },
        release(gl, unit) {
            gl.activeTexture(gl.TEXTURE0 + unit)
            gl.bindTexture(gl.TEXTURE_2D, null)
        }
    }
}
