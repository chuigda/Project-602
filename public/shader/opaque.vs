precision highp float;

attribute vec3 a_Position;

uniform mat4 u_ProjectionMatrix;
uniform mat4 u_ModelViewMatrix;
uniform float u_Collapse;

varying vec3 v_Position;

void main() {
   v_Position = vec3(u_ModelViewMatrix * vec4(a_Position, 1.0));
   v_Position.y = v_Position.y * (1.0 - u_Collapse);

   gl_Position = u_ProjectionMatrix * vec4(v_Position, 1.0);
}
