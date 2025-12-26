import clsx from 'clsx';
import { useState } from 'react';
import { SHADER_LIBRARY } from '../data/shaderLibrary';

interface SidebarProps {
    onSelectSnippet: (code: string) => void;
    currentMesh: string;
    onSelectMesh: (mesh: string) => void;
    className?: string;
}

type Tab = 'library' | 'settings' | 'info';

export const Sidebar = ({ onSelectSnippet, currentMesh, onSelectMesh, className }: SidebarProps) => {
    const [activeTab, setActiveTab] = useState<Tab>('library');

    // Group snippets by category
    const categories = Object.entries(
        SHADER_LIBRARY.reduce((acc, snippet) => {
            acc[snippet.category] = [...(acc[snippet.category] || []), snippet];
            return acc;
        }, {} as Record<string, typeof SHADER_LIBRARY>)
    );

    return (
        <div className={clsx("flex flex-col border-r border-zinc-800 bg-zinc-900", className)} style={{ width: '250px' }}>
            {/* Tab Header */}
            <div className="flex border-b border-zinc-800">
                <button
                    onClick={() => setActiveTab('library')}
                    className={clsx("flex-1 py-3 text-xs font-medium transition-colors", activeTab === 'library' ? "text-white bg-zinc-800 border-b-2 border-blue-500" : "text-zinc-500 hover:text-zinc-300")}
                >
                    Library
                </button>
                <button
                    onClick={() => setActiveTab('settings')}
                    className={clsx("flex-1 py-3 text-xs font-medium transition-colors", activeTab === 'settings' ? "text-white bg-zinc-800 border-b-2 border-blue-500" : "text-zinc-500 hover:text-zinc-300")}
                >
                    Settings
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {activeTab === 'library' && (
                    <div className="space-y-6">
                        {categories.map(([category, snippets]) => (
                            <div key={category}>
                                <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-zinc-500">{category}</h3>
                                <div className="space-y-1">
                                    {snippets.map(s => (
                                        <button
                                            key={s.id}
                                            onClick={() => onSelectSnippet(s.code)}
                                            className="w-full rounded px-2 py-1.5 text-left text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className="h-1.5 w-1.5 rounded-full bg-blue-500/50" />
                                                {s.name}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="space-y-6">
                        <div>
                            <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-zinc-500">Preview Mesh</h3>
                            <div className="grid grid-cols-2 gap-2">
                                {['plane', 'box', 'sphere', 'torus', 'knot'].map(m => (
                                    <button
                                        key={m}
                                        onClick={() => onSelectMesh(m)}
                                        className={clsx(
                                            "rounded border px-2 py-2 text-xs capitalize transition-colors",
                                            currentMesh === m
                                                ? "bg-blue-600/20 border-blue-500/50 text-blue-200"
                                                : "border-zinc-700 bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                                        )}
                                    >
                                        {m}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-zinc-500">Custom Model</h3>
                            <div className="relative">
                                <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-zinc-700 bg-zinc-800/50 p-4 transition-colors hover:border-zinc-500 hover:bg-zinc-800">
                                    <div className="flex flex-col items-center justify-center gap-1 text-center">
                                        <svg className="mb-1 h-6 w-6 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                                        </svg>
                                        <p className="text-xs text-zinc-400"><span className="font-semibold">Click to upload</span></p>
                                        <p className="text-[10px] text-zinc-500">GLTF / GLB / OBJ</p>
                                    </div>
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept=".gltf,.glb,.obj"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) onSelectMesh('custom:' + URL.createObjectURL(file));
                                        }}
                                    />
                                </label>
                                {currentMesh.startsWith('custom:') && (
                                    <p className="mt-2 text-center text-xs text-green-400">
                                        Custom model loaded
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
