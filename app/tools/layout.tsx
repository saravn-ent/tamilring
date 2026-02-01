import { EditorProvider } from './editor-context';

export default function ToolsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <EditorProvider>
            {children}
        </EditorProvider>
    );
}
