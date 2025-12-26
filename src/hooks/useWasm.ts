import { useEffect, useState } from 'react';

// Define the shape of our WASM module
interface WasmModule {
    init_panic_hook: () => void;
    convert_glsl: (code: string, format: string, stage: string) => any;
    convert_shader: (code: string, source_lang: string, target_lang: string, stage: string) => any;
    greet: () => string;
}

export function useWasm() {
    const [wasm, setWasm] = useState<WasmModule | null>(null);
    const [error, setError] = useState<unknown>(null);

    useEffect(() => {
        async function load() {
            try {
                // We assume the build process places the pkg in src/engine-pkg or compatible
                // Dynamic import enables Code Splitting and init
                // @ts-ignore - The module might not exist until build
                const module = await import('../engine-pkg/shader_converter_engine.js');
                await module.default(); // Initialize the WASM memory
                module.init_panic_hook();
                setWasm(module as unknown as WasmModule);
            } catch (e) {
                console.error("Failed to load WASM module", e);
                setError(e);
            }
        }
        load();
    }, []);

    return { wasm, error, isReady: !!wasm };
}
