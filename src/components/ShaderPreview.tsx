import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { useRef, useMemo } from 'react';
import { OrbitControls, Sphere, Box, Torus, Plane, TorusKnot } from '@react-three/drei';
import * as THREE from 'three';
import { GLTFLoader } from 'three-stdlib';
import { OBJLoader } from 'three-stdlib';

export type MeshType = 'plane' | 'box' | 'sphere' | 'torus' | 'knot' | string;

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

const CustomModel = ({ url, material }: { url: string, material: THREE.ShaderMaterial }) => {
    // Determine loader based on extension (Default to GLTF for blobs)
    const gltf = useLoader(GLTFLoader, url);

    const scene = useMemo(() => {
        if (!gltf) return null;
        const s = gltf.scene.clone();
        s.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
                (child as THREE.Mesh).material = material;
            }
        });
        return s;
    }, [gltf, material]);

    return scene ? <primitive object={scene} /> : null;
};

const PreviewMesh = ({ fragmentShader, vertexShader = GLSL3_VERTEX, meshType = 'plane' }: { fragmentShader: string, vertexShader?: string, meshType: MeshType }) => {
    const mesh = useRef<THREE.Mesh>(null);
    const materialRef = useRef<THREE.ShaderMaterial>(null);

    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2() },
    }), []);

    useFrame((state) => {
        const { clock } = state;
        if (mesh.current) {
            (mesh.current.material as THREE.ShaderMaterial).uniforms.uTime.value = clock.getElapsedTime();
        }
        if (materialRef.current) {
            materialRef.current.uniforms.uTime.value = clock.getElapsedTime();
        }
    });

    // Fallback shader to prevent crash and ensure visibility
    const safeFragmentShader = fragmentShader || `
        out vec4 fragColor;
        void main() { fragColor = vec4(1.0, 0.0, 1.0, 1.0); }
    `;

    const materialConfig = {
        vertexShader,
        fragmentShader: safeFragmentShader,
        uniforms,
        side: THREE.DoubleSide,
        glslVersion: THREE.GLSL3
    };

    // key={safeFragmentShader} forces re-creation on shader change
    const Material = <shaderMaterial key={safeFragmentShader} ref={materialRef} attach="material" {...materialConfig} />;

    if (meshType.startsWith('custom:')) {
        const url = meshType.replace('custom:', '');
        const rawMat = useMemo(() => new THREE.ShaderMaterial(materialConfig), [safeFragmentShader, vertexShader]);

        useFrame((state) => {
            rawMat.uniforms.uTime.value = state.clock.getElapsedTime();
        });

        return <CustomModel url={url} material={rawMat} />;
    }

    switch (meshType) {
        case 'box':
            return <Box key="box" args={[1.5, 1.5, 1.5]} ref={mesh}>{Material}</Box>;
        case 'sphere':
            return <Sphere key="sphere" args={[1, 64, 64]} ref={mesh}>{Material}</Sphere>;
        case 'torus':
            return <Torus key="torus" args={[0.8, 0.4, 64, 64]} ref={mesh}>{Material}</Torus>;
        case 'knot':
            return <TorusKnot key="knot" args={[0.6, 0.2, 128, 32]} ref={mesh}>{Material}</TorusKnot>;
        case 'plane':
        default:
            return <Plane key="plane" args={[2, 2]} ref={mesh}>{Material}</Plane>;
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
