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

const DEFAULT_VERTEX = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const PreviewMesh = ({ fragmentShader, vertexShader = DEFAULT_VERTEX, meshType = 'plane' }: { fragmentShader: string, vertexShader?: string, meshType: MeshType }) => {
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
            <Canvas camera={{ position: [0, 0, 2] }}>
                <color attach="background" args={['#111']} />
                <OrbitControls makeDefault enableDamping />
                <PreviewMesh {...props} meshType={props.meshType || 'plane'} />
                <gridHelper args={[10, 10]} position={[0, -2, 0]} />
            </Canvas>
        </div>
    );
};
