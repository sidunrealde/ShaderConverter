import clsx from 'clsx';
import { useState, useEffect } from 'react';
import { CodeEditor } from './components/CodeEditor';
import { useWasm } from './hooks/useWasm';
import { SHADER_LIBRARY } from './data/shaderLibrary';
import { ShaderPreview, MeshType } from './components/ShaderPreview';
import { Sidebar } from './components/Sidebar';
import { UrlService } from './services/urlService';

function App() {
    const { wasm, isReady, error } = useWasm();
    const [glsl, setGlsl] = useState<string>(SHADER_LIBRARY[0].code);
    const [meshType, setMeshType] = useState<MeshType>('box');
    const [output, setOutput] = useState<string>('// Converted code will appear here');
    const [target, setTarget] = useState('hlsl');
    const [customModels, setCustomModels] = useState<{ id: string, name: string, url: string }[]>([]);

    const handleUploadModel = (name: string, url: string) => {
        const newModel = { id: crypto.randomUUID(), name, url };
        setCustomModels(prev => [...prev, newModel]);
        setMeshType(`custom:${url}`);
    };

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
                {/* Sidebar */}
                <Sidebar
                    onSelectSnippet={setGlsl}
                    currentMesh={meshType}
                    onSelectMesh={(m) => setMeshType(m as MeshType)}
                    customModels={customModels}
                    onUploadModel={handleUploadModel}
                />

                {/* Main Content Area */}
                <div className="flex h-full flex-1 flex-col">
                    {/* Upper: Editor & Preview */}
                    <div className="flex h-2/3 border-b border-zinc-800">
                        {/* Input Editor */}
                        <div className="flex w-1/2 flex-col border-r border-zinc-800">
                            <div className="flex items-center justify-between bg-zinc-900 px-4 py-2 border-b border-zinc-800">
                                <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">GLSL Source</span>
                            </div>
                            <div className="flex-1 min-h-0">
                                <CodeEditor value={glsl} onChange={setGlsl} language="cpp" />
                            </div>
                        </div>

                        {/* Preview */}
                        <div className="relative flex w-1/2 flex-col bg-black">
                            <div className="absolute top-2 right-2 z-10 flex gap-2">
                                <div className="rounded bg-black/50 px-2 py-1 text-xs text-zinc-400 backdrop-blur">
                                    {meshType.toUpperCase()}
                                </div>
                            </div>
                            <ShaderPreview fragmentShader={glsl} meshType={meshType} />
                        </div>
                    </div>

                    {/* Lower: Output */}
                    <div className="flex h-1/3 flex-col bg-zinc-900">
                        <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800">
                            <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Compiled Output ({target})</span>
                            <span className={clsx("text-xs", output.startsWith('// Error') ? "text-red-400" : "text-green-500")}>
                                {output.startsWith('// Error') ? 'Compilation Failed' : 'Ready'}
                            </span>
                        </div>
                        <div className="flex-1 min-h-0">
                            <CodeEditor value={output} readOnly language="cpp" />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default App;
