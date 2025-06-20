import React, {useEffect} from 'react';
import sdk from '@stackblitz/sdk';

interface EditorSDKProps {
    projectId: string;
    exerciseId: string;
}

const EditorSDK: React.FC<EditorSDKProps> = ({projectId, exerciseId}) => {
    useEffect(() => {
        sdk.embedProjectId('editor-container', projectId, {
            openFile: 'src/App.tsx',
            view: 'editor',
            height: 600,
            theme: 'dark',
        });
    }, [projectId, exerciseId]);

    return <div id="editor-container" style={{width: '100%', height: '600px'}}/>;
};

export default EditorSDK;