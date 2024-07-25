precision lowp float;

attribute vec3 a_Position;

uniform mat4 u_ProjectionMatrix;
uniform mat4 u_ModelViewMatrix;

varying vec3 v_Position;

void main() {
   v_Position = vec3(u_ModelViewMatrix * vec4(a_Position, 1.0));
   gl_Position = u_ProjectionMatrix * vec4(v_Position, 1.0);
}
