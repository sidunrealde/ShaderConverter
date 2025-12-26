export interface ShaderSnippet {
    id: string;
    name: string;
    category: 'basic' | 'math' | 'patterns' | '3d';
    code: string;
}

const COMMON_HEADER = \`
varying vec2 vUv;
uniform float uTime;
uniform vec2 uResolution;
\`;

export const SHADER_LIBRARY: ShaderSnippet[] = [
  // --- BASICS ---
  {
    id: 'basic_red',
    name: 'Basic Red',
    category: 'basic',
    code: \`// Basic Red
\${COMMON_HEADER}
void main() {
    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
}\`
  },
  {
    id: 'basic_gradient',
    name: 'UV Gradient',
    category: 'basic',
    code: \`// UV Gradient
\${COMMON_HEADER}
void main() {
    gl_FragColor = vec4(vUv.x, vUv.y, 0.5 + 0.5 * sin(uTime), 1.0);
}\`
  },
  {
    id: 'basic_checkers',
    name: 'Checkerboard',
    category: 'basic',
    code: \`// Checkerboard Pattern
\${COMMON_HEADER}
void main() {
    float check = step(0.5, fract(vUv.x * 10.0)) * step(0.5, fract(vUv.y * 10.0));
    check += (1.0 - step(0.5, fract(vUv.x * 10.0))) * (1.0 - step(0.5, fract(vUv.y * 10.0)));
    gl_FragColor = vec4(vec3(check * 0.5 + 0.2), 1.0);
}\`
  },

  // --- MATH / SDF ---
  {
    id: 'sdf_circle',
    name: 'SDF Circle',
    category: 'math',
    code: \`// Signed Distance Function: Circle
\${COMMON_HEADER}
void main() {
    vec2 p = vUv * 2.0 - 1.0;
    float d = length(p) - 0.5;
    float c = 1.0 - smoothstep(0.0, 0.02, d);
    gl_FragColor = vec4(vec3(c), 1.0);
}\`
  },
  {
    id: 'sdf_box',
    name: 'SDF Box',
    category: 'math',
    code: \`// Signed Distance Function: Box
\${COMMON_HEADER}
float sdBox( in vec2 p, in vec2 b )
{
    vec2 d = abs(p)-b;
    return length(max(d,0.0)) + min(max(d.x,d.y),0.0);
}

void main() {
    vec2 p = vUv * 2.0 - 1.0;
    float d = sdBox(p, vec2(0.5));
    float c = 1.0 - smoothstep(0.0, 0.02, d);
    gl_FragColor = vec4(vec3(c), 1.0);
}\`
  },
  {
      id: 'polar_coords',
      name: 'Polar Coordinates',
      category: 'math',
      code: \`// Polar Coordinates
\${COMMON_HEADER}
void main() {
    vec2 p = vUv * 2.0 - 1.0;
    float r = length(p);
    float a = atan(p.y, p.x);
    gl_FragColor = vec4(r, a, 0.0, 1.0);
}\`
  },

  // --- PATTERNS ---
  {
      id: 'pattern_waves',
      name: 'Sine Waves',
      category: 'patterns',
      code: \`// Sine Waves
\${COMMON_HEADER}
void main() {
    float wave = sin(vUv.x * 20.0 + uTime) * 0.1;
    float line = 1.0 - step(0.02, abs(vUv.y - 0.5 - wave));
    gl_FragColor = vec4(vec3(line), 1.0);
}\`
  },
  {
      id: 'pattern_noise',
      name: 'Simple Noise',
      category: 'patterns',
      code: \`// Hash Noise
\${COMMON_HEADER}
float hash(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
    float n = hash(vUv * 10.0 + uTime * 0.1);
    gl_FragColor = vec4(vec3(n), 1.0);
}\`
  },
  {
      id: 'pattern_grid',
      name: 'Neon Grid',
      category: 'patterns',
      code: \`// Neon Grid
\${COMMON_HEADER}
void main() {
    vec2 uv = vUv * 10.0;
    vec2 grid = abs(fract(uv - 0.5) - 0.5) / fwidth(uv);
    float line = min(grid.x, grid.y);
    float color = 1.0 - min(line, 1.0);
    gl_FragColor = vec4(vec3(color) * vec3(0.0, 1.0, 1.0), 1.0);
}\`
  },

  // --- 3D / RAYMARCHING ---
  {
      id: 'raymarch_sphere',
      name: 'Raymarch Sphere',
      category: '3d',
      code: \`// Raymarching Basics
\${COMMON_HEADER}
float map(vec3 p) {
    return length(p) - 1.0; // Sphere radius 1.0
}

void main() {
    vec2 uv = vUv * 2.0 - 1.0;
    vec3 ro = vec3(0.0, 0.0, 3.0); // Ray origin
    vec3 rd = normalize(vec3(uv, -1.0)); // Ray direction
    
    float t = 0.0;
    for(int i=0; i<64; i++) {
        vec3 p = ro + rd * t;
        float d = map(p);
        if(d < 0.001) break;
        t += d;
    }
    
    vec3 col = vec3(0.0);
    if(t < 10.0) {
        vec3 p = ro + rd * t;
        vec3 n = normalize(p);
        col = n * 0.5 + 0.5; // Normal as color
    }
    
    gl_FragColor = vec4(col, 1.0);
}\`
  },
];
