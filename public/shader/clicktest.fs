precision mediump float;

uniform float u_ObjectId;
varying vec3 v_Position;

void main() {
   gl_FragColor = vec4(u_ObjectId, 0.0, 0.0, 1.0);
}
