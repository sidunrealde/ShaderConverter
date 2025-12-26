import clsx from 'clsx';
import { useState, useEffect } from 'react';
import { Allotment } from 'allotment';
import 'allotment/dist/style.css';
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
    const [sourceLang, setSourceLang] = useState('glsl');
    const [targetLang, setTargetLang] = useState('hlsl');
    const [customModels, setCustomModels] = useState<{ id: string, name: string, url: string }[]>([]);
    const [isDarkMode, setIsDarkMode] = useState(true);

    const handleUploadModel = (name: string, url: string) => {
        const newModel = { id: crypto.randomUUID(), name, url };
        setCustomModels(prev => [...prev, newModel]);
        setMeshType(`custom:${url}`);
    };

    const toggleTheme = () => setIsDarkMode(prev => !prev);

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
        const res = wasm.convert_shader(glsl, sourceLang, targetLang, 'fragment');
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
        return (
            <div className={clsx("flex h-screen items-center justify-center", isDarkMode ? "bg-zinc-950" : "bg-gray-50")}>
                <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
                    <p className={clsx("text-sm", isDarkMode ? "text-zinc-400" : "text-gray-600")}>Loading Shader Engine...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={clsx(
            "flex h-screen flex-col transition-colors",
            isDarkMode ? "bg-zinc-950 text-white" : "bg-gray-100 text-gray-900"
        )}>
            {/* Header */}
            <header className={clsx(
                "flex items-center justify-between border-b px-4 py-3",
                isDarkMode ? "border-zinc-800 bg-zinc-900" : "border-gray-200 bg-white"
            )}>
                <div className="flex items-center gap-3">
                    <img src="/favicon.png" alt="Logo" className="w-7 h-7" />
                    <h1 className="text-lg font-bold tracking-tight">
                        Shader Converter
                    </h1>
                </div>

                <div className="flex items-center gap-4">
                    {/* Conversion Settings Group */}
                    <div className={clsx(
                        "flex items-center gap-2 rounded-lg px-3 py-1.5",
                        isDarkMode ? "bg-zinc-800" : "bg-gray-100"
                    )}>
                        <span className={clsx("text-xs font-medium", isDarkMode ? "text-zinc-500" : "text-gray-500")}>From</span>
                        <select
                            value={sourceLang}
                            onChange={e => setSourceLang(e.target.value)}
                            className={clsx(
                                "rounded border-0 bg-transparent px-2 py-1 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500",
                                isDarkMode ? "text-white" : "text-gray-900"
                            )}
                        >
                            <option value="glsl">GLSL</option>
                            <option value="wgsl">WGSL</option>
                        </select>

                        <svg className={clsx("w-4 h-4", isDarkMode ? "text-zinc-500" : "text-gray-400")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>

                        <span className={clsx("text-xs font-medium", isDarkMode ? "text-zinc-500" : "text-gray-500")}>To</span>
                        <select
                            value={targetLang}
                            onChange={e => setTargetLang(e.target.value)}
                            className={clsx(
                                "rounded border-0 bg-transparent px-2 py-1 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500",
                                isDarkMode ? "text-white" : "text-gray-900"
                            )}
                        >
                            <option value="hlsl">HLSL</option>
                            <option value="wgsl">WGSL</option>
                            <option value="msl">MSL</option>
                            <option value="glsl">GLSL</option>
                        </select>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleConvert}
                            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 transition-colors"
                        >
                            Convert
                        </button>

                        <button
                            onClick={handleShare}
                            className={clsx(
                                "rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                                isDarkMode
                                    ? "border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                                    : "border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            )}
                            title="Copy shareable link"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                            </svg>
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex flex-1 overflow-hidden">
                {/* Sidebar (fixed width) */}
                <Sidebar
                    onSelectSnippet={setGlsl}
                    currentMesh={meshType}
                    onSelectMesh={(m) => setMeshType(m as MeshType)}
                    customModels={customModels}
                    onUploadModel={handleUploadModel}
                    isDarkMode={isDarkMode}
                    onToggleTheme={toggleTheme}
                />

                {/* Main Content Area with Resizable Panels */}
                <div className="flex-1 overflow-hidden">
                    <Allotment vertical>
                        {/* Upper: Editor & Preview */}
                        <Allotment.Pane preferredSize="65%">
                            <Allotment>
                                {/* Input Editor */}
                                <Allotment.Pane preferredSize="50%">
                                    <div className="flex h-full flex-col">
                                        <div className={clsx(
                                            "flex items-center justify-between px-4 py-2 border-b",
                                            isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-gray-50 border-gray-200"
                                        )}>
                                            <span className={clsx("text-xs font-medium uppercase tracking-wider", isDarkMode ? "text-zinc-400" : "text-gray-500")}>
                                                {sourceLang.toUpperCase()} Source
                                            </span>
                                        </div>
                                        <div className="flex-1 min-h-0">
                                            <CodeEditor value={glsl} onChange={setGlsl} language="cpp" isDarkMode={isDarkMode} />
                                        </div>
                                    </div>
                                </Allotment.Pane>

                                {/* Preview */}
                                <Allotment.Pane preferredSize="50%">
                                    <div className="relative h-full bg-black">
                                        <div className="absolute top-2 right-2 z-10 flex gap-2">
                                            <div className="rounded bg-black/50 px-2 py-1 text-xs text-zinc-400 backdrop-blur">
                                                {meshType.startsWith('custom:') ? 'CUSTOM' : meshType.toUpperCase()}
                                            </div>
                                        </div>
                                        <ShaderPreview fragmentShader={glsl} meshType={meshType} />
                                    </div>
                                </Allotment.Pane>
                            </Allotment>
                        </Allotment.Pane>

                        {/* Lower: Output */}
                        <Allotment.Pane preferredSize="35%">
                            <div className={clsx("flex h-full flex-col", isDarkMode ? "bg-zinc-900" : "bg-white")}>
                                <div className={clsx(
                                    "flex items-center justify-between px-4 py-2 border-b",
                                    isDarkMode ? "border-zinc-800" : "border-gray-200"
                                )}>
                                    <span className={clsx("text-xs font-medium uppercase tracking-wider", isDarkMode ? "text-zinc-400" : "text-gray-500")}>
                                        Compiled Output ({targetLang.toUpperCase()})
                                    </span>
                                    <span className={clsx("text-xs font-medium", output.startsWith('// Error') ? "text-red-400" : "text-green-500")}>
                                        {output.startsWith('// Error') ? '❌ Compilation Failed' : '✅ Ready'}
                                    </span>
                                </div>
                                <div className="flex-1 min-h-0">
                                    <CodeEditor value={output} readOnly language="cpp" isDarkMode={isDarkMode} />
                                </div>
                            </div>
                        </Allotment.Pane>
                    </Allotment>
                </div>
            </main>
        </div>
    );
}

export default App;
