precision mediump float;

uniform float u_ObjectId;
varying vec3 v_Position;

void main() {
   gl_FragColor = vec4(u_ObjectId, u_ObjectId, u_ObjectId, 1.0);
}
