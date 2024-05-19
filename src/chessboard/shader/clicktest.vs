precision mediump float;

attribute vec3 a_Position;

uniform mat4 u_ProjectionMatrix;
uniform mat4 u_ModelViewMatrix;

varying vec3 v_Position;

void main() {
    v_Position = a_Position;
    gl_Position = u_ProjectionMatrix * u_ModelViewMatrix * vec4(a_Position, 1.0);
}
