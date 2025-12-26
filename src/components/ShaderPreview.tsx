import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { useRef, useMemo, Component, ReactNode, Suspense, useState } from 'react';
import { OrbitControls, Sphere, Box, Torus, Plane, TorusKnot, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { GLTFLoader } from 'three-stdlib';

export type MeshType = 'plane' | 'box' | 'sphere' | 'torus' | 'knot' | string;
type LightingMode = 'shader' | 'lit';

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

// Custom Model with Shader Material
const CustomModelShader = ({ url, fragmentShader, vertexShader }: { url: string, fragmentShader: string, vertexShader: string }) => {
    const gltf = useLoader(GLTFLoader, url);

    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2() },
    }), []);

    const material = useMemo(() => new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms,
        side: THREE.DoubleSide,
        glslVersion: THREE.GLSL3
    }), [fragmentShader, vertexShader, uniforms]);

    useFrame((state) => {
        material.uniforms.uTime.value = state.clock.getElapsedTime();
    });

    const scene = useMemo(() => {
        if (!gltf) return null;
        const s = gltf.scene.clone();

        const box = new THREE.Box3().setFromObject(s);
        const size = new THREE.Vector3();
        box.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 2.0 / (maxDim || 1);
        s.scale.setScalar(scale);

        box.setFromObject(s);
        const center = new THREE.Vector3();
        box.getCenter(center);
        s.position.sub(center);

        s.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
                (child as THREE.Mesh).material = material;
            }
        });
        return s;
    }, [gltf, material]);

    return scene ? <primitive object={scene} /> : null;
};

// Custom Model with Standard Material (for Lit mode)
const CustomModelLit = ({ url }: { url: string }) => {
    const gltf = useLoader(GLTFLoader, url);

    const scene = useMemo(() => {
        if (!gltf) return null;
        const s = gltf.scene.clone();

        const box = new THREE.Box3().setFromObject(s);
        const size = new THREE.Vector3();
        box.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 2.0 / (maxDim || 1);
        s.scale.setScalar(scale);

        box.setFromObject(s);
        const center = new THREE.Vector3();
        box.getCenter(center);
        s.position.sub(center);

        // Use StandardMaterial for HDRI lighting
        const litMaterial = new THREE.MeshStandardMaterial({
            color: 0xcccccc,
            metalness: 0.5,
            roughness: 0.3,
        });

        s.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
                (child as THREE.Mesh).material = litMaterial;
            }
        });
        return s;
    }, [gltf]);

    return scene ? <primitive object={scene} /> : null;
};

// Primitive mesh with Shader Material
const PrimitiveMeshShader = ({ fragmentShader, vertexShader, meshType }: { fragmentShader: string, vertexShader: string, meshType: string }) => {
    const mesh = useRef<THREE.Mesh>(null);
    const materialRef = useRef<THREE.ShaderMaterial>(null);

    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2() },
    }), []);

    useFrame((state) => {
        if (materialRef.current) {
            materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
        }
    });

    const materialConfig = {
        vertexShader,
        fragmentShader,
        uniforms,
        side: THREE.DoubleSide,
        glslVersion: THREE.GLSL3
    };

    const Material = <shaderMaterial key={fragmentShader} ref={materialRef} attach="material" {...materialConfig} />;

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

// Primitive mesh with Standard Material (for Lit mode)
const PrimitiveMeshLit = ({ meshType }: { meshType: string }) => {
    const mesh = useRef<THREE.Mesh>(null);
    const Material = <meshStandardMaterial attach="material" color={0xcccccc} metalness={0.5} roughness={0.3} />;

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

interface PreviewMeshProps {
    fragmentShader: string;
    vertexShader?: string;
    meshType: MeshType;
    lightingMode: LightingMode;
}

const PreviewMesh = ({ fragmentShader, vertexShader = GLSL3_VERTEX, meshType = 'plane', lightingMode }: PreviewMeshProps) => {
    const safeFragmentShader = fragmentShader || `
        out vec4 fragColor;
        void main() { fragColor = vec4(1.0, 0.0, 1.0, 1.0); }
    `;

    const isCustom = meshType.startsWith('custom:');
    const url = isCustom ? meshType.replace('custom:', '') : '';

    if (lightingMode === 'lit') {
        // Lit mode: Use StandardMaterial
        if (isCustom) {
            return <CustomModelLit url={url} />;
        }
        return <PrimitiveMeshLit meshType={meshType} />;
    }

    // Shader mode: Use custom ShaderMaterial
    if (isCustom) {
        return <CustomModelShader url={url} fragmentShader={safeFragmentShader} vertexShader={vertexShader} />;
    }
    return <PrimitiveMeshShader fragmentShader={safeFragmentShader} vertexShader={vertexShader} meshType={meshType} />;
};

class ErrorBoundary extends Component<{ children: ReactNode, fallback?: ReactNode, resetKey?: string }, { hasError: boolean }> {
    constructor(props: any) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError() {
        return { hasError: true };
    }
    componentDidUpdate(prevProps: { resetKey?: string }) {
        if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
            this.setState({ hasError: false });
        }
    }
    componentDidCatch(error: any, errorInfo: any) {
        console.error("ShaderPreview Error:", error, errorInfo);
    }
    render() {
        if (this.state.hasError) {
            return this.props.fallback || <mesh><boxGeometry /><meshBasicMaterial color="red" /></mesh>;
        }
        return this.props.children;
    }
}

const LoadingFallback = () => (
    <mesh>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshBasicMaterial color="yellow" wireframe />
    </mesh>
);

export const ShaderPreview = (props: ShaderPreviewProps) => {
    const [lightingMode, setLightingMode] = useState<LightingMode>('shader');
    const [hdriRotation, setHdriRotation] = useState(0);

    return (
        <div className="h-full w-full overflow-hidden rounded-md border border-zinc-700 bg-black relative">
            {/* Lighting Controls */}
            <div className="absolute top-2 left-2 z-10 flex flex-col gap-2 bg-black/50 p-2 rounded backdrop-blur">
                <div className="flex gap-1">
                    <button
                        onClick={() => setLightingMode('shader')}
                        className={`px-2 py-1 text-[10px] rounded transition-colors ${lightingMode === 'shader' ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}
                    >
                        Shader
                    </button>
                    <button
                        onClick={() => setLightingMode('lit')}
                        className={`px-2 py-1 text-[10px] rounded transition-colors ${lightingMode === 'lit' ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}
                    >
                        Lit (HDRI)
                    </button>
                </div>
                {lightingMode === 'lit' && (
                    <div className="flex flex-col gap-1">
                        <span className="text-[9px] text-zinc-500">Rotate HDRI</span>
                        <input
                            type="range"
                            min="0"
                            max={Math.PI * 2}
                            step="0.1"
                            value={hdriRotation}
                            onChange={(e) => setHdriRotation(parseFloat(e.target.value))}
                            className="w-24 h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>
                )}
            </div>

            <Canvas camera={{ position: [0, 0, 3], fov: 75 }}>
                <color attach="background" args={['#111']} />
                <OrbitControls makeDefault />

                {/* Lighting based on mode */}
                {lightingMode === 'shader' ? (
                    <>
                        <ambientLight intensity={0.5} />
                        <pointLight position={[10, 10, 10]} intensity={1} />
                    </>
                ) : (
                    <>
                        <Environment
                            preset="sunset"
                            background={false}
                            environmentRotation={[0, hdriRotation, 0]}
                        />
                        <ambientLight intensity={0.2} />
                    </>
                )}

                <gridHelper args={[20, 20, 0x444444, 0x222222]} />

                <ErrorBoundary
                    resetKey={`${props.meshType}-${lightingMode}`}
                    fallback={<mesh><boxGeometry /><meshBasicMaterial color="magenta" /></mesh>}
                >
                    <Suspense fallback={<LoadingFallback />}>
                        <PreviewMesh
                            fragmentShader={props.fragmentShader}
                            vertexShader={props.vertexShader}
                            meshType={props.meshType || 'plane'}
                            lightingMode={lightingMode}
                        />
                    </Suspense>
                </ErrorBoundary>
            </Canvas>
        </div>
    );
};
