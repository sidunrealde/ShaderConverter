import { Canvas, useFrame } from '@react-three/fiber';
import { useRef, useMemo } from 'react';
import { OrbitControls, Sphere, Box, Torus, Plane, TorusKnot } from '@react-three/drei';
import * as THREE from 'three';

export type MeshType = 'plane' | 'box' | 'sphere' | 'torus' | 'knot';

interface ShaderPreviewProps {
    fragmentShader: string;
    vertexShader?: string;
    meshType?: MeshType;
}

// Proper GLSL3 Vertex Shader
const GLSL3_VERTEX = `
out vec2 vUv;
out vec3 vNormal;
out vec3 vViewPosition;

void main() {
  vUv = uv;
  vNormal = normalize(normalMatrix * normal);
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  vViewPosition = -mvPosition.xyz;
  gl_Position = projectionMatrix * mvPosition;
}
`;

const PreviewMesh = ({ fragmentShader, vertexShader = GLSL3_VERTEX, meshType = 'plane' }: { fragmentShader: string, vertexShader?: string, meshType: MeshType }) => {
    const mesh = useRef<THREE.Mesh>(null);

    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2() },
    }), []);

    useFrame((state) => {
        if (mesh.current) {
            const { clock } = state;
            (mesh.current.material as THREE.ShaderMaterial).uniforms.uTime.value = clock.getElapsedTime();
        }
    });

    const Material = (
        <shaderMaterial
            vertexShader={vertexShader}
            fragmentShader={fragmentShader}
            uniforms={uniforms}
            side={THREE.DoubleSide}
            glslVersion={THREE.GLSL3}
        />
    );

    switch (meshType) {
        case 'box':
            return <Box args={[1.5, 1.5, 1.5]} ref={mesh}>{Material}</Box>;
        case 'sphere':
            return <Sphere args={[1, 64, 64]} ref={mesh}>{Material}</Sphere>;
        case 'torus':
            return <Torus args={[0.8, 0.4, 64, 64]} ref={mesh}>{Material}</Torus>;
        case 'knot':
            return <TorusKnot args={[0.6, 0.2, 128, 32]} ref={mesh}>{Material}</TorusKnot>;
        case 'plane':
        default:
            return <Plane args={[2, 2]} ref={mesh}>{Material}</Plane>;
    }
};

export const ShaderPreview = (props: ShaderPreviewProps) => {
    return (
        <div className="h-full w-full overflow-hidden rounded-md border border-zinc-700 bg-black relative">
            <Canvas camera={{ position: [0, 0, 3], fov: 75 }}>
                <color attach="background" args={['#111']} />
                <OrbitControls makeDefault />
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} />
                <PreviewMesh {...props} meshType={props.meshType || 'plane'} />
                <gridHelper args={[20, 20, 0x444444, 0x222222]} />
            </Canvas>
        </div>
    );
};
