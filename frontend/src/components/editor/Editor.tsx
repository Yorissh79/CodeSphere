import React, {useEffect, useRef} from 'react';

interface EditorProps {
    projectId: string;
    exerciseId: string;
}

const Editor: React.FC<EditorProps> = ({projectId}) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);

    useEffect(() => {
        // Dynamically set StackBlitz embed URL
        const embedUrl = `https://stackblitz.com/edit/${projectId}?embed=1&file=src/App.tsx&theme=dark&view=editor`;
        if (iframeRef.current) {
            iframeRef.current.src = embedUrl;
        }
    }, [projectId]);

    return (
        <iframe
            ref={iframeRef}
            title="StackBlitz Editor"
            style={{width: '100%', height: '100%', border: 'none'}}
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        />
    );
};

export default Editor;