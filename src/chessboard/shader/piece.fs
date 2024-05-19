precision mediump float;

uniform vec3 u_LightPos;
uniform float u_LightIntensity;
uniform sampler2D u_Sampler;
uniform vec4 u_ObjectColor;

varying vec3 v_Position;
varying vec3 v_Normal;
varying vec2 v_TexCoord;

void main() {
   vec3 normal = normalize(v_Normal);
   vec3 lightDirection = normalize(u_LightPos - v_Position);
   float nDotL = max(dot(lightDirection, normal), 0.0);

   vec4 texColor = texture2D(u_Sampler, v_TexCoord) + 1.0;
   vec3 diffuse = u_LightIntensity * texColor.rgb * nDotL + 0.1;

   gl_FragColor = vec4(diffuse, 1.0) * u_ObjectColor;
}
