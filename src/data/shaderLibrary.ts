export interface ShaderSnippet {
    id: string;
    name: string;
    category: 'basic' | 'math' | 'patterns' | '3d' | 'art';
    code: string;
}

// Pure GLSL without version/precision for compatibility
// Three.js prepends #version 300 es
// Rust Engine will prepend/wrap as needed
const HEADER = `
in vec2 vUv;
in vec3 vNormal;
in vec3 vViewPosition;

uniform float uTime;
uniform vec2 uResolution;

out vec4 fragColor;
`;

export const SHADER_LIBRARY: ShaderSnippet[] = [
    // --- BASICS ---
    {
        id: 'basic_red',
        name: 'Basic Red',
        category: 'basic',
        code: `${HEADER}
void main() {
    fragColor = vec4(1.0, 0.2, 0.2, 1.0);
}`
    },
    {
        id: 'basic_normals',
        name: 'Show Normals',
        category: 'basic',
        code: `${HEADER}
void main() {
    fragColor = vec4(vNormal * 0.5 + 0.5, 1.0);
}`
    },
    {
        id: 'basic_uvs',
        name: 'Show UVs',
        category: 'basic',
        code: `${HEADER}
void main() {
    fragColor = vec4(vUv.x, vUv.y, 0.0, 1.0);
}`
    },
    {
        id: 'basic_depth',
        name: 'Fake Depth',
        category: 'basic',
        code: `${HEADER}
void main() {
    float d = 1.0 / length(vViewPosition) * 5.0;
    fragColor = vec4(vec3(d), 1.0);
}`
    },

    // --- MATH / SDF ---
    {
        id: 'math_circle',
        name: 'Smooth Circle',
        category: 'math',
        code: `${HEADER}
void main() {
    vec2 p = vUv * 2.0 - 1.0;
    float d = length(p);
    float c = 1.0 - smoothstep(0.8, 0.82, d);
    fragColor = vec4(vec3(c), 1.0);
}`
    },
    {
        id: 'math_rect',
        name: 'Rectangle SDF',
        category: 'math',
        code: `${HEADER}
float sdBox( in vec2 p, in vec2 b ) {
    vec2 d = abs(p)-b;
    return length(max(d,0.0)) + min(max(d.x,d.y),0.0);
}
void main() {
    vec2 p = vUv * 2.0 - 1.0;
    float d = sdBox(p, vec2(0.6, 0.3));
    float c = 1.0 - smoothstep(0.0, 0.02, d);
    fragColor = vec4(vec3(c), 1.0);
}`
    },
    {
        id: 'math_polar',
        name: 'Polar Flower',
        category: 'math',
        code: `${HEADER}
void main() {
    vec2 p = vUv * 2.0 - 1.0;
    float r = length(p);
    float a = atan(p.y, p.x);
    float f = cos(a * 5.0 + uTime);
    float c = 1.0 - smoothstep(f * 0.2 + 0.5, f * 0.2 + 0.52, r);
    fragColor = vec4(c, 0.2, 0.5, 1.0);
}`
    },

    // --- PATTERNS ---
    {
        id: 'pattern_checkers',
        name: 'Checkers',
        category: 'patterns',
        code: `${HEADER}
void main() {
    vec2 uv = vUv * 10.0;
    vec2 f = fract(uv);
    float c = step(0.5, f.x) * step(0.5, f.y) + (1.0 - step(0.5, f.x)) * (1.0 - step(0.5, f.y));
    fragColor = vec4(vec3(c), 1.0);
}`
    },
    {
        id: 'pattern_grid',
        name: 'Cyber Grid',
        category: 'patterns',
        code: `${HEADER}
void main() {
    vec2 uv = vUv * 20.0;
    vec2 g = abs(fract(uv - 0.5) - 0.5) / fwidth(uv);
    float l = 1.0 - min(min(g.x, g.y), 1.0);
    fragColor = vec4(0.0, l, l * 0.8, 1.0);
}`
    },
    {
        id: 'pattern_noise',
        name: 'Static Noise',
        category: 'patterns',
        code: `${HEADER}
float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
void main() {
    float n = hash(vUv * 50.0 + uTime);
    fragColor = vec4(vec3(n), 1.0);
}`
    },
    {
        id: 'pattern_voronoi',
        name: 'Voronoi Cells',
        category: 'patterns',
        code: `${HEADER}
vec2 hash2(vec2 p) {
    p = vec2(dot(p,vec2(127.1,311.7)), dot(p,vec2(269.5,183.3)));
    return fract(sin(p)*43758.5453);
}
void main() {
    vec2 uv = vUv * 5.0;
    vec2 i_st = floor(uv);
    vec2 f_st = fract(uv);
    float m_dist = 1.0;
    for (int y= -1; y <= 1; y++) {
        for (int x= -1; x <= 1; x++) {
            vec2 neighbor = vec2(float(x),float(y));
            vec2 point = hash2(i_st + neighbor);
            point = 0.5 + 0.5*sin(uTime + 6.2831*point);
            vec2 diff = neighbor + point - f_st;
            float dist = length(diff);
            m_dist = min(m_dist, dist);
        }
    }
    fragColor = vec4(vec3(m_dist), 1.0);
}`
    },

    // --- 3D / LIGHTING ---
    {
        id: '3d_rim',
        name: 'Rim Lighting',
        category: '3d',
        code: `${HEADER}
void main() {
    vec3 n = normalize(vNormal);
    vec3 v = normalize(vViewPosition);
    float rim = 1.0 - max(dot(v, n), 0.0);
    rim = pow(rim, 3.0);
    fragColor = vec4(0.2, 0.4, 0.8, 1.0) + vec4(rim);
}`
    },
    {
        id: '3d_fresnel',
        name: 'Fresnel Glow',
        category: '3d',
        code: `${HEADER}
void main() {
    vec3 color = vec3(0.1, 0.0, 0.2);
    vec3 n = normalize(vNormal);
    vec3 v = normalize(vViewPosition);
    float fresnel = pow(1.0 - max(dot(n, v), 0.0), 3.0);
    fragColor = vec4(mix(color, vec3(0.0, 1.0, 1.0), fresnel), 1.0);
}`
    },
    {
        id: '3d_phong',
        name: 'Simple Phong',
        category: '3d',
        code: `${HEADER}
void main() {
    vec3 lightPos = vec3(10.0, 10.0, 10.0);
    vec3 l = normalize(lightPos);
    vec3 n = normalize(vNormal);
    vec3 v = normalize(vViewPosition);
    vec3 h = normalize(l + v);
    
    // Ambient
    vec3 ambient = vec3(0.1);
    
    // Diffuse
    float diff = max(dot(n, l), 0.0);
    vec3 diffuse = diff * vec3(1.0, 0.5, 0.0);
    
    // Specular
    float spec = pow(max(dot(n, h), 0.0), 32.0);
    vec3 specular = vec3(1.0) * spec;
    
    fragColor = vec4(ambient + diffuse + specular, 1.0);
}`
    },
    {
        id: '3d_stripes',
        name: 'World Stripes',
        category: '3d',
        code: `${HEADER}
void main() {
     // Stripe based on UV or position? Let's use UV
     float stripe = step(0.5, fract(vUv.y * 20.0));
     vec3 col = mix(vec3(0.1), vec3(0.9), stripe);
     
     // Add some lighting
     vec3 n = normalize(vNormal);
     float diff = max(dot(n, normalize(vec3(1.0))), 0.2);
     
     fragColor = vec4(col * diff, 1.0);
}`
    },

    // --- ART ---
    {
        id: 'art_blob',
        name: 'Lava Blob',
        category: 'art',
        code: `${HEADER}
// Simple FBM
float noise(in vec3 x) {
    vec3 p = floor(x);
    vec3 f = fract(x);
    f = f*f*(3.0-2.0*f);
    return mix(mix(mix( fract(sin(dot(p + vec3(0,0,0), vec3(127.1,311.7, 74.7)))*43758.5453), 
                        fract(sin(dot(p + vec3(1,0,0), vec3(127.1,311.7, 74.7)))*43758.5453), f.x),
                   mix( fract(sin(dot(p + vec3(0,1,0), vec3(127.1,311.7, 74.7)))*43758.5453), 
                        fract(sin(dot(p + vec3(1,1,0), vec3(127.1,311.7, 74.7)))*43758.5453), f.x), f.y),
               mix(mix( fract(sin(dot(p + vec3(0,0,1), vec3(127.1,311.7, 74.7)))*43758.5453), 
                        fract(sin(dot(p + vec3(1,0,1), vec3(127.1,311.7, 74.7)))*43758.5453), f.x),
                   mix( fract(sin(dot(p + vec3(0,1,1), vec3(127.1,311.7, 74.7)))*43758.5453), 
                        fract(sin(dot(p + vec3(1,1,1), vec3(127.1,311.7, 74.7)))*43758.5453), f.x), f.y), f.z);
}

void main() {
    vec2 q = vUv * 2.0 - 1.0;
    float time = uTime * 0.5;
    float n = noise(vec3(q * 2.0 + time, time));
    vec3 col = mix(vec3(1.0, 0.2, 0.0), vec3(1.0, 0.8, 0.0), n);
    float glow = 1.0 - length(q);
    fragColor = vec4(col * glow, 1.0);
}`
    },
    {
        id: 'art_scanline',
        name: 'Retro Scanline',
        category: 'art',
        code: `${HEADER}
void main() {
    float scan = sin(vUv.y * 800.0 + uTime * 10.0) * 0.1;
    vec3 col = vec3(0.0, 1.0, 0.2);
    // Vignette
    vec2 p = vUv * 2.0 - 1.0;
    float vig = 1.0 - length(p) * 0.5;
    fragColor = vec4(col * (0.9 + scan) * vig, 1.0);
}`
    },
    // --- VFX ---
    {
        id: 'dissolve-noise',
        name: 'Noise Dissolve',
        category: 'art',
        code: `${HEADER}
// uniform sampler2D u_noise; // TODO: Texture support
void main() {
    float n = sin(vUv.x * 50.0 + uTime) * 0.5 + 0.5; // Fake noise
    float threshold = sin(uTime) * 0.5 + 0.5;
    float alpha = step(threshold, n);
    fragColor = vec4(1.0, alpha, alpha, 1.0);
}`
    },
    {
        id: 'rim-lighting-new',
        name: 'Fresnel Rim',
        category: '3d',
        code: `${HEADER}
void main() {
    vec3 n = normalize(vNormal);
    vec3 v = normalize(vViewPosition);
    float rim = 1.0 - max(dot(n, v), 0.0);
    rim = pow(rim, 3.0);
    fragColor = vec4(vec3(rim), 1.0);
}`
    },
    {
        id: 'pulse-glow',
        name: 'Pulsing Glow',
        category: 'art',
        code: `${HEADER}
void main() {
    float pulse = sin(uTime * 3.0) * 0.5 + 0.5;
    float glow = pulse * pulse;
    fragColor = vec4(glow, glow * 0.5, 1.0, 1.0);
}`
    },
    {
        id: 'fire-simple',
        name: 'Simple Fire',
        category: 'art',
        code: `${HEADER}
void main() {
    vec2 uv = vUv;
    float fire = sin(uv.y * 10.0 + uTime * 2.0) * exp(-uv.y * 2.0);
    fragColor = vec4(fire * 0.8, fire * 0.4, fire * 0.1, 1.0);
}`
    },
    {
        id: 'portal-vortex',
        name: 'Portal Vortex',
        category: 'art',
        code: `${HEADER}
void main() {
    vec2 uv = vUv - 0.5;
    float r = length(uv);
    float a = atan(uv.y, uv.x) + uTime;
    fragColor = vec4(sin(r * 10.0 - uTime * 5.0), sin(a * 10.0), cos(r * 5.0), 1.0);
}`
    },
    {
        id: 'scan-line',
        name: 'Scan Lines',
        category: 'art',
        code: `${HEADER}
void main() {
    vec2 uv = vUv;
    float scan = sin(uv.y * 800.0 + uTime * 10.0) * 0.5 + 0.5;
    fragColor = vec4(vec3(0.0, 1.0, 0.0) * scan, 1.0);
}`
    },
    {
        id: 'electricity',
        name: 'Lightning Bolt',
        category: 'art',
        code: `${HEADER}
void main() {
    vec2 uv = vUv;
    float bolt = fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453);
    bolt = smoothstep(0.98, 1.0, bolt) * sin(uTime * 20.0);
    fragColor = vec4(0.0, bolt, 1.0, 1.0);
}`
    },
    {
        id: 'heart-beat',
        name: 'Heartbeat',
        category: 'art',
        code: `${HEADER}
void main() {
    float beat = abs(sin(uTime * 2.0)) * exp(-abs(sin(uTime)));
    fragColor = vec4(1.0, 0.2, 0.5, 1.0) * beat;
}`
    },
    {
        id: 'matrix-rain',
        name: 'Matrix Rain',
        category: 'patterns',
        code: `${HEADER}
void main() {
    vec2 uv = vUv;
    float rain = fract(sin(dot(uv + uTime * 0.1, vec2(12.9898, 78.233))) * 43758.5453);
    fragColor = vec4(0.0, rain, 0.0, 1.0);
}`
    },
    {
        id: 'terrain-height',
        name: 'Height Color',
        category: 'patterns',
        code: `${HEADER}
void main() {
    float h = vUv.y; // Fake height
    vec3 color = h > 0.5 ? vec3(0.8, 0.6, 0.2) : h > 0.2 ? vec3(0.2, 0.6, 0.2) : vec3(0.1, 0.2, 0.4);
    fragColor = vec4(color, 1.0);
}`
    },
    // --- UTILITY ---
    {
        id: 'wireframe-grid',
        name: 'Wireframe Grid',
        category: 'basic',
        code: `${HEADER}
void main() {
    vec2 uv = vUv;
    float wire = step(0.98, max(abs(fract(uv.x * 10.0) - 0.5), abs(fract(uv.y * 10.0) - 0.5)));
    fragColor = vec4(0.0, 1.0, wire, 1.0);
}`
    },
    {
        id: 'checkerboard',
        name: 'Checkerboard',
        category: 'patterns',
        code: `${HEADER}
void main() {
    vec2 uv = vUv;
    float check = mod(floor(uv.x * 8.0) + floor(uv.y * 8.0), 2.0);
    fragColor = vec4(vec3(check), 1.0);
}`
    },
    {
        id: 'uv-grid',
        name: 'UV Grid',
        category: 'basic',
        code: `${HEADER}
void main() {
    vec2 uv = vUv;
    float grid = max(step(0.98, fract(uv.x * 10.0)), step(0.98, fract(uv.y * 10.0)));
    fragColor = vec4(vec3(grid), 1.0);
}`
    },
    {
        id: 'gradient-radial',
        name: 'Radial Gradient',
        category: 'basic',
        code: `${HEADER}
void main() {
    vec2 uv = vUv - 0.5;
    float radial = length(uv);
    fragColor = vec4(vec3(radial), 1.0);
}`
    },
    {
        id: 'full-normal',
        name: 'Normal Map',
        category: 'basic',
        code: `${HEADER}
void main() {
    fragColor = vec4(vNormal * 0.5 + 0.5, 1.0);
}`
    }
];
