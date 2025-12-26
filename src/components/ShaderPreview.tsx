import { Canvas, useFrame } from '@react-three/fiber';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';

interface ShaderPreviewProps {
    fragmentShader: string;
    vertexShader?: string;
}

const DEFAULT_VERTEX = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const PreviewMesh = ({ fragmentShader, vertexShader = DEFAULT_VERTEX }: ShaderPreviewProps) => {
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

    // Basic failure safety: if shader is invalid, Three.js might warn but not crash app usually.
    // Ideally we would validate before passing here, but for now we rely on simple connection.

    return (
        <mesh ref={mesh}>
            <planeGeometry args={[2, 2]} />
            <shaderMaterial
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms}
                side={THREE.DoubleSide}
            />
        </mesh>
    );
};

export const ShaderPreview = (props: ShaderPreviewProps) => {
    return (
        <div className="h-full w-full overflow-hidden rounded-md border border-zinc-700 bg-black">
            <Canvas camera={{ position: [0, 0, 1] }}>
                <PreviewMesh {...props} />
            </Canvas>
        </div>
    );
};
