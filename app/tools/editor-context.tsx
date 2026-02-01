'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

type ToolMode = 'fx' | 'vocal' | 'karaoke';

interface EditorContextType {
    file: File | null;
    mode: ToolMode;
    setEditorData: (file: File | null, mode: ToolMode) => void;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export function EditorProvider({ children }: { children: ReactNode }) {
    const [file, setFile] = useState<File | null>(null);
    const [mode, setMode] = useState<ToolMode>('fx');

    const setEditorData = (newFile: File | null, newMode: ToolMode) => {
        setFile(newFile);
        setMode(newMode);
    };

    return (
        <EditorContext.Provider value={{ file, mode, setEditorData }}>
            {children}
        </EditorContext.Provider>
    );
}

export function useEditor() {
    const context = useContext(EditorContext);
    if (context === undefined) {
        throw new Error('useEditor must be used within an EditorProvider');
    }
    return context;
}
