import Editor, { OnMount } from '@monaco-editor/react';
import { useRef } from 'react';

interface CodeEditorProps {
    value: string;
    language?: string;
    onChange?: (value: string) => void;
    readOnly?: boolean;
}

export const CodeEditor = ({ value, language = 'cpp', onChange, readOnly = false }: CodeEditorProps) => {
    const editorRef = useRef<any>(null);

    const handleEditorDidMount: OnMount = (editor, _monaco) => {
        editorRef.current = editor;
    };

    return (
        <div className="h-full w-full overflow-hidden rounded-md border border-zinc-700 bg-[#1e1e1e]">
            <Editor
                height="100%"
                defaultLanguage={language}
                language={language}
                value={value}
                onChange={(val) => onChange?.(val || '')}
                onMount={handleEditorDidMount}
                theme="vs-dark"
                options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                    scrollBeyondLastLine: false,
                    readOnly,
                    automaticLayout: true,
                }}
            />
        </div>
    );
};
