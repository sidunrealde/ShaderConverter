# Shader Converter

A powerful web-based tool for converting GLSL shaders to HLSL, WGSL, and MSL. Features a live 3D preview, 90+ shader examples, and custom model support.

[![Deploy to Cloudflare Pages](https://img.shields.io/badge/Deploy-Cloudflare%20Pages-orange)](https://pages.cloudflare.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## ✨ Features

- **Shader Conversion** - Convert GLSL fragment shaders to:
  - HLSL (DirectX / Unreal Engine / Unity)
  - WGSL (WebGPU)
  - MSL (Metal / Apple platforms)
  
- **Live 3D Preview** - See your shaders rendered in real-time on various meshes:
  - 12 built-in shapes (plane, box, sphere, torus, knot, cylinder, cone, icosahedron, octahedron, dodecahedron, tetrahedron, ring)
  - Custom GLTF/GLB/OBJ model upload
  
- **90+ Shader Examples** - Extensive library organized by category:
  - Basic / UV / Patterns / Math / SDF
  - 3D Lighting / PBR / Art / VFX / Terrain
  
- **Modern UI** - Clean interface with light/dark mode toggle

- **Share Links** - Copy shareable URLs with your shader code encoded

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Rust](https://rustup.rs/) (for building the WASM engine)
- [wasm-pack](https://rustwasm.github.io/wasm-pack/installer/)

### Installation

```bash
# Clone the repository
git clone https://github.com/sidunrealde/ShaderConverter.git
cd ShaderConverter

# Install dependencies
npm install

# Build the WASM engine
npm run build:wasm

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Production Build

```bash
npm run build
```

The output will be in the `dist/` folder, ready for deployment.

## 🛠️ Tech Stack

- **Frontend**: React + TypeScript + Vite
- **3D Rendering**: Three.js + React Three Fiber
- **Code Editor**: Monaco Editor
- **Shader Conversion**: Rust/WASM (Naga compiler)
- **Styling**: Tailwind CSS

## 📁 Project Structure

```
ShaderConverter/
├── engine/              # Rust WASM shader conversion engine
│   ├── src/lib.rs       # Naga-based GLSL to HLSL/WGSL/MSL converter
│   └── Cargo.toml
├── src/
│   ├── components/      # React components
│   │   ├── ShaderPreview.tsx   # 3D preview with R3F
│   │   ├── CodeEditor.tsx      # Monaco editor wrapper
│   │   └── Sidebar.tsx         # Library & settings UI
│   ├── data/
│   │   └── shaderLibrary.ts    # 90+ shader examples
│   ├── hooks/
│   │   └── useWasm.ts          # WASM loader hook
│   └── App.tsx
├── public/              # Static assets (favicon, OG image)
└── index.html
```

## 🎮 Usage

1. **Select a shader** from the Library tab or write your own GLSL code
2. **Choose a preview mesh** from the Settings tab
3. **Pick target format** (HLSL/WGSL/MSL) from the dropdown
4. **Click Convert** to compile your shader
5. **Copy the output** or use the Share button to create a link

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 💖 Support

If you find this project useful, consider [sponsoring on GitHub](https://github.com/sponsors/sidunrealde).

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.