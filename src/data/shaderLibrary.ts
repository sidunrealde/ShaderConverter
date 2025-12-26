export interface ShaderSnippet {
    id: string;
    name: string;
    code: string;
}

export const SHADER_LIBRARY: ShaderSnippet[] = [
    {
        id: 'basic',
        name: 'Basic Red',
        code: `// Basic Red
void main() {
    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
}`,
    },
    {
        id: 'gradients',
        name: 'UV Gradients',
        code: `// UV Gradients
varying vec2 vUv;
void main() {
    gl_FragColor = vec4(vUv.x, vUv.y, 0.0, 1.0);
}`,
    },
    {
        id: 'circle',
        name: 'Circle SDF',
        code: `// Circle SDF
varying vec2 vUv;
void main() {
    vec2 center = vec2(0.5);
    float d = length(vUv - center);
    float circle = 1.0 - step(0.3, d);
    gl_FragColor = vec4(vec3(circle), 1.0);
}`,
    },
];
