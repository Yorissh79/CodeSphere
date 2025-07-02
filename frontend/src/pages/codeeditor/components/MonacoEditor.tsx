// components/MonacoEditor.tsx
import React, {useRef} from 'react';
import Editor from '@monaco-editor/react';
import type {FileType} from './types'; // Assuming types.ts is in the parent directory

interface MonacoEditorProps {
    value: string;
    language: FileType; // Use FileType for better type safety
    onChange: (value: string) => void;
    options?: any;
}

const MonacoEditor: React.FC<MonacoEditorProps> = ({value, language, onChange, options = {}}) => {
    const editorRef = useRef(null);

    const getMonacoLanguage = (fileType: FileType) => {
        switch (fileType) {
            case 'javascript':
                return 'javascript';
            case 'typescript':
                return 'typescript';
            case 'html':
                return 'html';
            case 'css':
                return 'css';
            case 'json':
                return 'json';
            case 'markdown':
                return 'markdown';
            default:
                return 'plaintext';
        }
    };

    const handleEditorDidMount = (editor: any, monaco: any) => {
        editorRef.current = editor;

        monaco.editor.defineTheme('custom-dark', {
            base: 'vs-dark',
            inherit: true,
            rules: [
                {token: 'comment', foreground: '6A9955'},
                {token: 'keyword', foreground: '569CD6'},
                {token: 'string', foreground: 'CE9178'},
                {token: 'number', foreground: 'B5CEA8'},
            ],
            colors: {
                'editor.background': '#1E1E1E',
                'editor.foreground': '#D4D4D4',
                'editorLineNumber.foreground': '#858585',
                'editor.selectionBackground': '#264F78',
                'editor.inactiveSelectionBackground': '#3A3D41',
            }
        });

        monaco.editor.defineTheme('custom-light', {
            base: 'vs',
            inherit: true,
            rules: [
                {token: 'comment', foreground: '008000'},
                {token: 'keyword', foreground: '0000FF'},
                {token: 'string', foreground: 'A31515'},
                {token: 'number', foreground: '098658'},
            ],
            colors: {
                'editor.background': '#FFFFFF',
                'editor.foreground': '#000000',
                'editorLineNumber.foreground': '#2B91AF',
                'editor.selectionBackground': '#ADD6FF',
                'editor.inactiveSelectionBackground': '#E5EBF1',
            }
        });

        monaco.editor.setTheme('custom-dark');

        if (language === 'html') {
            monaco.languages.setLanguageConfiguration('html', {
                autoClosingPairs: [
                    {open: '<', close: '>'},
                    {open: '"', close: '"'},
                    {open: "'", close: "'"},
                ],
                surroundingPairs: [
                    {open: '<', close: '>'},
                    {open: '"', close: '"'},
                    {open: "'", close: "'"},
                ]
            });
            monaco.languages.registerCompletionItemProvider('html', {
                triggerCharacters: ['!'],
                provideCompletionItems: (model: { getLineContent: (arg0: any) => any }, position: {
                    lineNumber: any;
                    column: number;
                }) => {
                    const line = model.getLineContent(position.lineNumber);
                    const textBeforeCursor = line.substring(0, position.column - 1);

                    let range;
                    if (textBeforeCursor.endsWith('!')) {
                        const startColumn = position.column - '!'.length;
                        range = {
                            startLineNumber: position.lineNumber,
                            endLineNumber: position.lineNumber,
                            startColumn: startColumn,
                            endColumn: position.column
                        };
                    } else {
                        range = {
                            startLineNumber: position.lineNumber,
                            endLineNumber: position.lineNumber,
                            startColumn: position.column,
                            endColumn: position.column
                        };
                    }

                    const suggestions = [
                        {
                            label: '!',
                            kind: monaco.languages.CompletionItemKind.Snippet,
                            insertText: '<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>Document</title>\n</head>\n<body>\n    $0\n</body>\n</html>',
                            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                            documentation: 'HTML5 DOCTYPE template',
                            range: range
                        },
                        {
                            label: 'div',
                            kind: monaco.languages.CompletionItemKind.Snippet,
                            insertText: '<div>\n\t$0\n</div>',
                            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                            documentation: 'HTML div element',
                            range: {
                                startLineNumber: position.lineNumber,
                                endLineNumber: position.lineNumber,
                                startColumn: position.column - (textBeforeCursor.endsWith('div') ? 'div'.length : 0),
                                endColumn: position.column
                            }
                        },
                        {
                            label: 'button',
                            kind: monaco.languages.CompletionItemKind.Snippet,
                            insertText: '<button>$0</button>',
                            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                            documentation: 'HTML button element',
                            range: {
                                startLineNumber: position.lineNumber,
                                endLineNumber: position.lineNumber,
                                startColumn: position.column - (textBeforeCursor.endsWith('button') ? 'button'.length : 0),
                                endColumn: position.column
                            }
                        }
                    ];
                    return {suggestions};
                }
            });
        }

        if (language === 'css') {
            monaco.languages.registerCompletionItemProvider('css', {
                provideCompletionItems: (model: { getLineContent: (arg0: any) => any }, position: {
                    lineNumber: any;
                    column: number;
                }) => {
                    const line = model.getLineContent(position.lineNumber);
                    const textBeforeCursor = line.substring(0, position.column - 1);

                    const suggestions = [
                        {
                            label: 'flexbox-center',
                            kind: monaco.languages.CompletionItemKind.Snippet,
                            insertText: 'display: flex;\njustify-content: center;\nalign-items: center;',
                            documentation: 'Flexbox centering',
                            range: {
                                startLineNumber: position.lineNumber,
                                endLineNumber: position.lineNumber,
                                startColumn: position.column - (textBeforeCursor.endsWith('flexbox-center') ? 'flexbox-center'.length : 0),
                                endColumn: position.column
                            }
                        },
                        {
                            label: 'grid-layout',
                            kind: monaco.languages.CompletionItemKind.Snippet,
                            insertText: 'display: grid;\ngrid-template-columns: repeat(auto-fit, minmax(250px, 1fr));\ngap: 1rem;',
                            documentation: 'Responsive grid layout',
                            range: {
                                startLineNumber: position.lineNumber,
                                endLineNumber: position.lineNumber,
                                startColumn: position.column - (textBeforeCursor.endsWith('grid-layout') ? 'grid-layout'.length : 0),
                                endColumn: position.column
                            }
                        }
                    ];
                    return {suggestions};
                }
            });
        }
    };

    const handleEditorChange = (value: any) => {
        onChange(value || '');
    };

    const defaultOptions = {
        minimap: {enabled: false},
        fontSize: 14,
        fontFamily: 'Consolas, "Courier New", monospace',
        wordWrap: 'on',
        automaticLayout: true,
        scrollBeyondLastLine: false,
        renderWhitespace: 'selection',
        lineNumbers: 'on',
        glyphMargin: true,
        folding: true,
        lineDecorationsWidth: 10,
        lineNumbersMinChars: 3,
        bracketPairColorization: {enabled: true},
        suggestOnTriggerCharacters: true,
        acceptSuggestionOnEnter: 'on',
        tabCompletion: 'on',
        quickSuggestions: {
            other: true,
            comments: false,
            strings: true
        },
        ...options
    };

    return (
        <Editor
            height="100%"
            width="100%"
            language={getMonacoLanguage(language)}
            value={value}
            onChange={handleEditorChange}
            options={defaultOptions}
            onMount={handleEditorDidMount}
            loading={
                <div className="flex items-center justify-center h-full bg-white dark:bg-gray-800">
                    <span className="text-gray-600 dark:text-gray-300">Loading Editor...</span>
                </div>
            }
        />
    );
};

export default MonacoEditor;