
import { useState } from 'react';
import { CodeEditor } from './components/CodeEditor';
import { useWasm } from './hooks/useWasm';
import { SHADER_LIBRARY } from './data/shaderLibrary';
import { ShaderPreview, MeshType } from './components/ShaderPreview';
import { UrlService } from './services/urlService';
import { useEffect } from 'react';

function App() {
    const { wasm, isReady, error } = useWasm();
    const [glsl, setGlsl] = useState<string>(SHADER_LIBRARY[0].code);
    const [meshType, setMeshType] = useState<MeshType>('box');
    const [output, setOutput] = useState<string>('// Converted code will appear here');
    const [target, setTarget] = useState('hlsl');

    useEffect(() => {
        const hash = window.location.hash.slice(1);
        if (hash) {
            const decoded = UrlService.decode(hash);
            if (decoded) setGlsl(decoded);
        }
    }, []);

    const handleShare = () => {
        const hash = UrlService.encode(glsl);
        window.location.hash = hash;
        navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
    };

    const handleConvert = () => {
        if (!wasm) return;
        const res = wasm.convert_glsl(glsl, target, 'fragment');
        if (res.success) {
            setOutput(res.output);
        } else {
            setOutput(`// Error:\n${res.error}`);
        }
    };

    if (error) {
        return <div className="p-10 text-red-500">Failed to load WASM Engine. Run npm run build:wasm</div>;
    }

    if (!isReady) {
        return <div className="p-10 text-blue-500">Loading Shader Engine...</div>;
    }

    return (
        <div className="flex h-screen flex-col bg-zinc-950 text-white">
            <header className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900 px-6 py-4">
                <h1 className="text-xl font-bold tracking-tight">Shader Converter <span className="text-xs text-green-500 font-mono">WASM</span></h1>

                <div className="flex items-center gap-4">
                    <select
                        value={target}
                        onChange={e => setTarget(e.target.value)}
                        className="rounded border border-zinc-700 bg-zinc-800 px-3 py-1 text-sm text-white"
                    >
                        <option value="hlsl">HLSL (Unreal/Unity)</option>
                        <option value="wgsl">WGSL (WebGPU)</option>
                        <option value="msl">MSL (Metal)</option>
                    </select>

                    <button
                        onClick={handleShare}
                        className="rounded border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm font-semibold hover:bg-zinc-700 transition-colors"
                    >
                        Share
                    </button>

                    <button
                        onClick={handleConvert}
                        className="rounded bg-blue-600 px-4 py-1.5 text-sm font-semibold hover:bg-blue-500 transition-colors"
                    >
                        Convert
                    </button>
                </div>
            </header>

            <main className="flex flex-1 overflow-hidden">
                <div className="flex h-full w-full flex-col p-4 gap-4">

                    {/* Top Row: Editor and Preview */}
                    <div className="flex flex-1 gap-4 min-h-0">
                        {/* Input Editor */}
                        <div className="flex-1 flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-zinc-400 font-medium">Input (GLSL)</span>
                                <div className="flex gap-2">
                                    <select
                                        className="bg-zinc-800 text-xs text-white border border-zinc-700 rounded px-2 py-1"
                                        onChange={(e) => {
                                            const s = SHADER_LIBRARY.find(x => x.id === e.target.value);
                                            if (s) setGlsl(s.code);
                                        }}
                                    >
                                        <option value="">Load Snippet...</option>
                                        {SHADER_LIBRARY.map(s => (
                                            <option key={s.id} value={s.id}>{s.name} ({s.category})</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <CodeEditor value={glsl} onChange={setGlsl} language="cpp" />
                        </div>

                        {/* Live Preview */}
                        <div className="flex-1 flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-zinc-400 font-medium">Live Preview</span>
                                <select
                                    value={meshType}
                                    onChange={(e) => setMeshType(e.target.value as MeshType)}
                                    className="bg-zinc-800 text-xs text-white border border-zinc-700 rounded px-2 py-1"
                                >
                                    <option value="plane">Plane</option>
                                    <option value="box">Box</option>
                                    <option value="sphere">Sphere</option>
                                    <option value="torus">Torus</option>
                                    <option value="knot">Knot</option>
                                </select>
                            </div>
                            <ShaderPreview fragmentShader={glsl} meshType={meshType} />
                        </div>
                    </div>

                    {/* Bottom Row: Output */}
                    <div className="h-1/3 flex flex-col gap-2 min-h-0">
                        <span className="text-sm text-zinc-400 font-medium">Output ({target.toUpperCase()})</span>
                        <CodeEditor value={output} readOnly language="cpp" />
                    </div>

                </div>
            </main>
        </div>
    );
}

export default App;
