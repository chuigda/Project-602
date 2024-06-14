precision highp float;

attribute vec3 a_Position;
attribute vec3 a_Normal;
attribute vec2 a_TexCoord;

uniform mat4 u_ProjectionMatrix;
uniform mat4 u_ModelViewMatrix;
uniform float u_Explode;

varying vec3 v_Position;
varying vec2 v_TexCoord;
varying vec3 v_Normal;

void main() {
   v_Position = vec3(u_ModelViewMatrix * vec4(a_Position, 1.0)) * (1.0 + u_Explode);
   v_TexCoord = a_TexCoord;
   v_Normal = vec3(u_ModelViewMatrix * vec4(a_Normal, 0.0) * (1.0 + u_Explode));
   gl_Position = u_ProjectionMatrix * vec4(v_Position, 1.0);
}
