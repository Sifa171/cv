attribute vec3 aFrom;
attribute vec3 aTo;
attribute float aRand;

uniform float uMorph;
uniform float uTime;
uniform float uPixelRatio;
uniform float uScale;
uniform vec2 uFromOffset;
uniform vec2 uToOffset;
uniform vec2 uPointer;
uniform float uPointerStrength;
uniform float uSpin;

varying float vRand;
varying float vAlpha;

vec3 spinY(vec3 p, float a) {
  float c = cos(a);
  float s = sin(a);
  return vec3(c * p.x + s * p.z, p.y, -s * p.x + c * p.z);
}

void main() {
  vec3 from = spinY(aFrom, uSpin * uTime * 0.05) + vec3(uFromOffset, 0.0);
  vec3 to = aTo + vec3(uToOffset, 0.0);
  float t = smoothstep(0.0, 1.0, clamp((uMorph * 1.4) - aRand * 0.4, 0.0, 1.0));
  vec3 pos = mix(from, to, t);
  pos.xy += vec2(sin(uTime * 0.4 + aRand * 40.0), cos(uTime * 0.3 + aRand * 25.0)) * 0.015;

  vec2 d = pos.xy - uPointer;
  float dist = length(d);
  float push = uPointerStrength * smoothstep(1.2, 0.0, dist);
  pos.xy += normalize(d + 1e-5) * push * 0.35;

  vRand = aRand;
  vAlpha = 0.35 + 0.55 * fract(aRand * 7.31);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  gl_PointSize = (1.0 + 1.4 * fract(aRand * 3.17) + max(pos.z, 0.0) * 0.6) * uPixelRatio * uScale;
}
