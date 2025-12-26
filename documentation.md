# Shader Converter Documentation

**Tech Stack**: Rust (WASM) + React + Vite + Cloudflare Pages.

## Architecture
The project follows a "Power Stack" architecture:
1.  **Frontend**: React + Vite + TypeScript. Located in `src/`.
2.  **Engine**: Rust + Naga compiled to WASM. Located in `engine/`.
3.  **Bridge**: `src/hooks/useWasm.ts` dynamically imports the compiled WASM from `src/engine-pkg/`.

## WASM Integration
We use `vite-plugin-wasm` to handle WASM modules.
The build process is:
1. `wasm-pack build --target web` in `engine/`.
2. Copy `engine/pkg` -> `src/engine-pkg`.
3. `vite` serves the app and loads the WASM.

## Setup Instructions
1.  Ensure Prerequisites are installed.
2.  **Build Engine**:
    ```bash
    cd engine
    wasm-pack build --target web
    # Manually copy pkg content to src/engine-pkg if script fails
    ```
3.  **Install Dependencies**: `npm install`
4.  **Run**: `npm run dev`



## Project Structure
- `engine/`: Rust source code for the shader compiler.
- `src/`: React frontend code.
- `.github/workflows`: CI/CD pipelines.

## Development Log
- **Phase 1**: Initial setup and basic WASM integration.
