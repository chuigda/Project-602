precision lowp float;

uniform vec4 u_ObjectColor;
uniform float u_FadeOut;

varying vec3 v_Position;

void main() {
   gl_FragColor = u_ObjectColor * (1.0 - u_FadeOut);
}
