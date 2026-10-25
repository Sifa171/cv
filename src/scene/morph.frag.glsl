precision mediump float;

varying float vRand;
varying float vAlpha;

uniform float uOpacity;

const vec3 CYAN = vec3(0.310, 0.890, 0.757);
const vec3 INDIGO = vec3(0.482, 0.549, 1.0);
const vec3 VIOLET = vec3(0.780, 0.490, 1.0);
const vec3 WHITE = vec3(0.925, 0.929, 0.949);

void main() {
  vec2 c = gl_PointCoord - 0.5;
  float r = length(c);
  if (r > 0.5) discard;
  vec3 col = vRand < 0.5 ? mix(CYAN, INDIGO, vRand * 2.0) : mix(INDIGO, VIOLET, (vRand - 0.5) * 2.0);
  col = mix(col, WHITE, step(0.82, fract(vRand * 13.7)) * 0.7);
  gl_FragColor = vec4(col, vAlpha * uOpacity * smoothstep(0.5, 0.1, r));
}
