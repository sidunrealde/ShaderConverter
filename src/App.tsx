import { useState } from 'react';
import { CodeEditor } from './components/CodeEditor';
import { useWasm } from './hooks/useWasm';
import { SHADER_LIBRARY } from './data/shaderLibrary';

function App() {
    const { wasm, isReady, error } = useWasm();
    const [glsl, setGlsl] = useState<string>(SHADER_LIBRARY[0].code);
    const [output, setOutput] = useState<string>('// Converted code will appear here');
    const [target, setTarget] = useState('hlsl');

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
                        onClick={handleConvert}
                        className="rounded bg-blue-600 px-4 py-1.5 text-sm font-semibold hover:bg-blue-500 transition-colors"
                    >
                        Convert
                    </button>
                </div>
            </header>

            <main className="flex flex-1 overflow-hidden">
                <div className="flex h-full w-full flex-col p-4 md:flex-row md:gap-4">
                    <div className="flex-1 flex flex-col gap-2 min-h-0">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-zinc-400 font-medium">Input (GLSL)</span>
                            <div className="flex gap-2">
                                {SHADER_LIBRARY.map(s => (
                                    <button
                                        key={s.id}
                                        onClick={() => setGlsl(s.code)}
                                        className="bg-zinc-800 hover:bg-zinc-700 px-2 py-0.5 text-xs rounded border border-zinc-700"
                                    >
                                        {s.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <CodeEditor value={glsl} onChange={setGlsl} language="cpp" />
                    </div>

                    <div className="flex-1 flex flex-col gap-2 min-h-0">
                        <span className="text-sm text-zinc-400 font-medium">Output ({target.toUpperCase()})</span>
                        <CodeEditor value={output} readOnly language="cpp" />
                    </div>
                </div>
            </main>
        </div>
    );
}

export default App;
