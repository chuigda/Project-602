precision mediump float;

uniform vec3 u_LightPos;
uniform vec3 u_LightColor;
uniform sampler2D u_Sampler;

varying vec3 v_Position;
varying vec3 v_Normal;
varying vec2 v_TexCoord;

void main() {
   vec3 normal = normalize(v_Normal);
   vec3 lightDirection = normalize(u_LightPos - v_Position);
   float nDotL = max(dot(lightDirection, normal), 0.0);
   vec4 texColor = texture2D(u_Sampler, v_TexCoord);
   vec3 diffuse = u_LightColor * texColor.rgb * nDotL;

   gl_FragColor = vec4(diffuse, texColor.a);
}