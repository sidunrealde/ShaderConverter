import clsx from 'clsx';
import { useState } from 'react';
import { SHADER_LIBRARY } from '../data/shaderLibrary';

interface SidebarProps {
    onSelectSnippet: (code: string) => void;
    currentMesh: string;
    onSelectMesh: (mesh: string) => void;
    customModels?: { id: string, name: string, url: string }[];
    onUploadModel?: (name: string, url: string) => void;
    isDarkMode: boolean;
    onToggleTheme: () => void;
    className?: string;
}

type Tab = 'library' | 'settings' | 'info';

export const Sidebar = ({
    onSelectSnippet,
    currentMesh,
    onSelectMesh,
    customModels = [],
    onUploadModel,
    isDarkMode,
    onToggleTheme,
    className
}: SidebarProps) => {
    const [activeTab, setActiveTab] = useState<Tab>('library');

    // Start with all categories collapsed
    const allCategories = [...new Set(SHADER_LIBRARY.map(s => s.category))];
    const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set(allCategories));

    // Group snippets by category
    const categories = Object.entries(
        SHADER_LIBRARY.reduce((acc, snippet) => {
            acc[snippet.category] = [...(acc[snippet.category] || []), snippet];
            return acc;
        }, {} as Record<string, typeof SHADER_LIBRARY>)
    );

    const toggleCategory = (category: string) => {
        setCollapsedCategories(prev => {
            const next = new Set(prev);
            if (next.has(category)) {
                next.delete(category);
            } else {
                next.add(category);
            }
            return next;
        });
    };

    return (
        <div className={clsx(
            "flex flex-col border-r",
            isDarkMode ? "border-zinc-800 bg-zinc-900" : "border-gray-200 bg-white",
            className
        )} style={{ width: '260px' }}>
            {/* Tab Header - No duplicate title */}
            <div className={clsx("flex border-b", isDarkMode ? "border-zinc-800" : "border-gray-200")}>
                <button
                    onClick={() => setActiveTab('library')}
                    className={clsx(
                        "flex-1 py-3 text-xs font-medium transition-colors",
                        activeTab === 'library'
                            ? (isDarkMode ? "text-white bg-zinc-800 border-b-2 border-blue-500" : "text-gray-900 bg-gray-100 border-b-2 border-blue-500")
                            : (isDarkMode ? "text-zinc-500 hover:text-zinc-300" : "text-gray-500 hover:text-gray-700")
                    )}
                >
                    Library
                </button>
                <button
                    onClick={() => setActiveTab('settings')}
                    className={clsx(
                        "flex-1 py-3 text-xs font-medium transition-colors",
                        activeTab === 'settings'
                            ? (isDarkMode ? "text-white bg-zinc-800 border-b-2 border-blue-500" : "text-gray-900 bg-gray-100 border-b-2 border-blue-500")
                            : (isDarkMode ? "text-zinc-500 hover:text-zinc-300" : "text-gray-500 hover:text-gray-700")
                    )}
                >
                    Settings
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
                {activeTab === 'library' && (
                    <div className="space-y-2">
                        {categories.map(([category, snippets]) => (
                            <div key={category} className={clsx(
                                "rounded-lg overflow-hidden",
                                isDarkMode ? "bg-zinc-800/50" : "bg-gray-50"
                            )}>
                                <button
                                    onClick={() => toggleCategory(category)}
                                    className={clsx(
                                        "w-full flex items-center justify-between px-3 py-2 text-xs font-bold uppercase tracking-wider transition-colors",
                                        isDarkMode ? "text-zinc-400 hover:text-zinc-200" : "text-gray-500 hover:text-gray-700"
                                    )}
                                >
                                    <span>{category} ({snippets.length})</span>
                                    <svg
                                        className={clsx(
                                            "w-4 h-4 transition-transform",
                                            collapsedCategories.has(category) ? "" : "rotate-180"
                                        )}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                {!collapsedCategories.has(category) && (
                                    <div className="px-2 pb-2 space-y-0.5">
                                        {snippets.map(s => (
                                            <button
                                                key={s.id}
                                                onClick={() => onSelectSnippet(s.code)}
                                                className={clsx(
                                                    "w-full rounded px-2 py-1.5 text-left text-xs transition-colors",
                                                    isDarkMode
                                                        ? "text-zinc-300 hover:bg-zinc-700 hover:text-white"
                                                        : "text-gray-700 hover:bg-gray-200 hover:text-gray-900"
                                                )}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500/50" />
                                                    {s.name}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="space-y-4">
                        {/* Theme Toggle */}
                        <div>
                            <h3 className={clsx("mb-2 text-xs font-bold uppercase tracking-wider", isDarkMode ? "text-zinc-500" : "text-gray-500")}>
                                Theme
                            </h3>
                            <button
                                onClick={onToggleTheme}
                                className={clsx(
                                    "w-full flex items-center justify-between rounded-lg border px-3 py-2 text-sm transition-colors",
                                    isDarkMode
                                        ? "border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                                        : "border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100"
                                )}
                            >
                                <span>{isDarkMode ? '🌙 Dark Mode' : '☀️ Light Mode'}</span>
                                <div className={clsx(
                                    "w-10 h-5 rounded-full relative transition-colors",
                                    isDarkMode ? "bg-blue-600" : "bg-gray-300"
                                )}>
                                    <div className={clsx(
                                        "absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all",
                                        isDarkMode ? "right-0.5" : "left-0.5"
                                    )} />
                                </div>
                            </button>
                        </div>

                        {/* Preview Mesh */}
                        <div>
                            <h3 className={clsx("mb-2 text-xs font-bold uppercase tracking-wider", isDarkMode ? "text-zinc-500" : "text-gray-500")}>
                                Preview Mesh
                            </h3>
                            <div className="grid grid-cols-3 gap-2">
                                {['plane', 'box', 'sphere', 'torus', 'knot', 'cylinder', 'cone', 'icosahedron', 'octahedron', 'dodecahedron', 'tetrahedron', 'ring'].map(m => (
                                    <button
                                        key={m}
                                        onClick={() => onSelectMesh(m)}
                                        className={clsx(
                                            "rounded border px-2 py-2 text-xs capitalize transition-colors",
                                            currentMesh === m
                                                ? "bg-blue-600/20 border-blue-500/50 text-blue-300"
                                                : isDarkMode
                                                    ? "border-zinc-700 bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                                                    : "border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100"
                                        )}
                                    >
                                        {m}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Custom Model */}
                        <div>
                            <h3 className={clsx("mb-2 text-xs font-bold uppercase tracking-wider", isDarkMode ? "text-zinc-500" : "text-gray-500")}>
                                Custom Model
                            </h3>

                            {customModels.length > 0 && (
                                <div className="mb-2 grid grid-cols-1 gap-1">
                                    {customModels.map(model => (
                                        <button
                                            key={model.id}
                                            onClick={() => onSelectMesh('custom:' + model.url)}
                                            className={clsx(
                                                "flex items-center justify-between rounded border px-2 py-1.5 text-xs transition-colors text-left",
                                                currentMesh === 'custom:' + model.url
                                                    ? "bg-blue-600/20 border-blue-500/50 text-blue-300"
                                                    : isDarkMode
                                                        ? "border-zinc-700 bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                                                        : "border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100"
                                            )}
                                        >
                                            <span className="truncate">{model.name}</span>
                                        </button>
                                    ))}
                                </div>
                            )}

                            <label className={clsx(
                                "flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-3 transition-colors",
                                isDarkMode
                                    ? "border-zinc-700 bg-zinc-800/50 hover:border-zinc-500 hover:bg-zinc-800"
                                    : "border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100"
                            )}>
                                <svg className={clsx("mb-1 h-5 w-5", isDarkMode ? "text-zinc-400" : "text-gray-400")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                                </svg>
                                <p className={clsx("text-[10px]", isDarkMode ? "text-zinc-400" : "text-gray-500")}>Upload GLTF/GLB/OBJ</p>
                                <input
                                    type="file"
                                    className="hidden"
                                    accept=".gltf,.glb,.obj"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file && onUploadModel) {
                                            onUploadModel(file.name, URL.createObjectURL(file));
                                        } else if (file) {
                                            onSelectMesh('custom:' + URL.createObjectURL(file));
                                        }
                                    }}
                                />
                            </label>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer: Larger Support Link */}
            <div className={clsx("border-t p-4", isDarkMode ? "border-zinc-800" : "border-gray-200")}>
                <a
                    href="https://github.com/sponsors/sidunrealde"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={clsx(
                        "flex flex-col items-center justify-center gap-2 rounded-xl px-4 py-4 text-sm font-medium transition-all hover:scale-[1.02]",
                        "bg-gradient-to-r from-pink-600 to-purple-600 text-white hover:from-pink-500 hover:to-purple-500 shadow-lg"
                    )}
                >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                    <span className="font-semibold">Support This Project</span>
                    <span className="text-xs text-white/70">Become a sponsor on GitHub</span>
                </a>
            </div>
        </div>
    );
};
