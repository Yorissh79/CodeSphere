import React, {useState, useEffect, useRef} from 'react';
import {
    useGetContentByTypeQuery,
    useUpdateContentAdminMutation, // Changed to use the admin mutation
    // Removed unused useUploadMediaMutation, useGetMediaQuery, useResizeImageMutation, useAnalyzeSEOMutation
    type Content as IContent, // Renamed to avoid conflict with local interface, if any
    // Removed IContentBlock as it's not directly exported by the new contentApi
} from '../../../services/contentApi'; // Import from the new contentApi

import {
    Save,
    Image,
    Eye,
    EyeOff,
    Plus,
    Trash2,
    Search,
    AlertCircle,
    Upload,
    Settings
} from 'lucide-react';

interface IMedia {
    _id: string;
    url: string;
    thumbnailUrl?: string;
    altText?: string;
    originalName: string;
    mimeType: string;
}

interface IContentBlock {
    _id: string;
    type: 'text' | 'image';
    order: number;
    content: {
        text?: string;
        imageId?: string;
        altText?: string;
        caption?: string;
    };
    isActive: boolean;
}

interface ContentManagerProps {
    pageType: string;
    onSave?: (content: IContent) => void;
}

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({value, onChange, placeholder}) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const [showSource, setShowSource] = useState(false);

    const formatText = (command: string, value?: string) => {
        document.execCommand(command, false, value);
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
    };

    const handleInput = () => {
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
    };

    useEffect(() => {
        if (editorRef.current && !showSource) {
            editorRef.current.innerHTML = value;
        }
    }, [value, showSource]);

    return (
        <div className="border border-gray-300 rounded-lg overflow-hidden">
            <div className="bg-gray-50 p-2 border-b flex gap-2 flex-wrap">
                <button
                    type="button"
                    onClick={() => formatText('bold')}
                    className="px-2 py-1 text-sm bg-white border rounded hover:bg-gray-100"
                >
                    <strong>B</strong>
                </button>
                <button
                    type="button"
                    onClick={() => formatText('italic')}
                    className="px-2 py-1 text-sm bg-white border rounded hover:bg-gray-100"
                >
                    <em>I</em>
                </button>
                <button
                    type="button"
                    onClick={() => formatText('underline')}
                    className="px-2 py-1 text-sm bg-white border rounded hover:bg-gray-100"
                >
                    <u>U</u>
                </button>
                <div className="w-px bg-gray-300 my-1"></div>
                <button
                    type="button"
                    onClick={() => formatText('formatBlock', 'h1')}
                    className="px-2 py-1 text-sm bg-white border rounded hover:bg-gray-100"
                >
                    H1
                </button>
                <button
                    type="button"
                    onClick={() => formatText('formatBlock', 'h2')}
                    className="px-2 py-1 text-sm bg-white border rounded hover:bg-gray-100"
                >
                    H2
                </button>
                <button
                    type="button"
                    onClick={() => formatText('formatBlock', 'h3')}
                    className="px-2 py-1 text-sm bg-white border rounded hover:bg-gray-100"
                >
                    H3
                </button>
                <div className="w-px bg-gray-300 my-1"></div>
                <button
                    type="button"
                    onClick={() => formatText('insertUnorderedList')}
                    className="px-2 py-1 text-sm bg-white border rounded hover:bg-gray-100"
                >
                    • List
                </button>
                <button
                    type="button"
                    onClick={() => formatText('insertOrderedList')}
                    className="px-2 py-1 text-sm bg-white border rounded hover:bg-gray-100"
                >
                    1. List
                </button>
                <div className="w-px bg-gray-300 my-1"></div>
                <button
                    type="button"
                    onClick={() => setShowSource(!showSource)}
                    className="px-2 py-1 text-sm bg-white border rounded hover:bg-gray-100"
                >
                    {showSource ? <Eye className="w-4 h-4"/> : <EyeOff className="w-4 h-4"/>}
                </button>
            </div>
            {showSource ? (
                <textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full h-64 p-3 font-mono text-sm resize-none focus:outline-none"
                    placeholder={placeholder}
                />
            ) : (
                <div
                    ref={editorRef}
                    contentEditable
                    onInput={handleInput}
                    className="min-h-[16rem] p-3 focus:outline-none"
                    style={{minHeight: '16rem'}}
                    suppressContentEditableWarning={true}
                />
            )}
        </div>
    );
};

const ContentManager: React.FC<ContentManagerProps> = ({pageType, onSave}) => {
    const [activeTab, setActiveTab] = useState<'content' | 'seo' | 'media'>('content');
    const [showPreview, setShowPreview] = useState(false);
    const [seoScore, setSeoScore] = useState<number | null>(null);
    const [seoSuggestions, setSeoSuggestions] = useState<string[]>([]);
    const [localMedia, setLocalMedia] = useState<IMedia[]>([]); // State to hold media items, as getMedia query is removed

    const {data: content, isLoading, error} = useGetContentByTypeQuery(pageType);
    const [updateContentAdmin] = useUpdateContentAdminMutation(); // Using the admin mutation

    // Removed the following hooks as their corresponding endpoints were not in the new contentApi or were admin-specific:
    // useUploadMediaMutation();
    // useResizeImageMutation();
    // useAnalyzeSEOMutation();
    // useGetMediaQuery();

    // Placeholder functions for media and SEO analysis as they are not directly supported by the provided contentApi routes
    // You would typically have separate APIs for Media Management and SEO Analysis.
    const handleSEOAnalysis = async () => {
        alert('SEO Analysis feature is not directly available via the current content API. This would require a separate SEO analysis endpoint.');
        setSeoScore(75); // Mock score
        setSeoSuggestions(['Ensure all images have alt text', 'Use more keywords in main content']); // Mock suggestions
    };

    const handleImageUpload = async (file: File): Promise<IMedia | undefined> => {
        alert('Image upload feature is not directly available via the current content API. This would require a separate media upload endpoint.');
        // Mocking an upload result
        const mockMedia: IMedia = {
            _id: `mock-media-${Date.now()}`,
            url: URL.createObjectURL(file), // Use a temporary URL for preview
            originalName: file.name,
            mimeType: file.type,
            altText: `Mock image for ${file.name}`
        };
        setLocalMedia(prev => [...prev, mockMedia]);
        return mockMedia;
    };

    const resizeImage = async (id: string, options: any) => {
        alert('Image resize feature is not directly available via the current content API. This would require a separate media manipulation endpoint.');
        console.log(`Mock resizing image with id: ${id} and options:`, options);
    };


    const [formData, setFormData] = useState<Partial<IContent>>({
        title: '',
        content: '',
        seoMetadata: {
            pageTitle: '',
            metaDescription: '',
            metaKeywords: '',
            ogTitle: '',
            ogDescription: '',
            ogImage: '' // Added ogImage here as it's part of the content type
        },
        richContent: [],
        isActive: true,
    });

    useEffect(() => {
        if (content) {
            setFormData({
                ...content,
                // Ensure seoMetadata and richContent are not null/undefined for consistent state
                seoMetadata: content.seoMetadata || {
                    pageTitle: '',
                    metaDescription: '',
                    metaKeywords: '',
                    ogTitle: '',
                    ogDescription: '',
                    ogImage: ''
                },
                richContent: content.richContent || [],
            });
        }
    }, [content]);

    const handleSave = async () => {
        try {
            // The `updateContentAdmin` mutation expects `pageType` directly at the top level of the payload,
            // along with the data for update (title, content, isActive, seoMetadata, richContent).
            const payload = {
                pageType: pageType,
                title: formData.title,
                content: formData.content,
                isActive: formData.isActive,
                seoMetadata: formData.seoMetadata,
                richContent: formData.richContent,
            };

            const result = await updateContentAdmin(payload).unwrap(); // Pass the payload directly
            onSave?.(result);

            alert('Content saved successfully!');
        } catch (error) {
            console.error('Failed to save content:', error);
            alert('Failed to save content. Please try again.');
        }
    };

    const addContentBlock = (type: IContentBlock['type']) => {
        const newBlock: IContentBlock = {
            _id: `temp-${Date.now()}`,
            type,
            order: (formData.richContent?.length || 0) + 1,
            content: {},
            isActive: true,
        };

        setFormData(prev => ({
            ...prev,
            richContent: [...(prev.richContent || []), newBlock],
        }));
    };

    const updateContentBlock = (blockId: string, updates: Partial<IContentBlock>) => {
        setFormData(prev => ({
            ...prev,
            richContent: prev.richContent?.map(block =>
                block._id === blockId ? {...block, ...updates} : block
            ),
        }));
    };

    const removeContentBlock = (blockId: string) => {
        setFormData(prev => ({
            ...prev,
            richContent: prev.richContent?.filter(block => block._id !== blockId),
        }));
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-red-700">
                    <AlertCircle className="w-5 h-5"/>
                    <span>Failed to load content</span>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="bg-white rounded-lg shadow-lg">
                <div className="border-b border-gray-200">
                    <div className="flex items-center justify-between p-6">
                        <h1 className="text-2xl font-bold text-gray-900">
                            Content Manager - {pageType}
                        </h1>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowPreview(!showPreview)}
                                className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                {showPreview ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                                {showPreview ? 'Hide Preview' : 'Show Preview'}
                            </button>
                            <button
                                onClick={handleSave}
                                className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                <Save className="w-4 h-4"/>
                                Save Changes
                            </button>
                        </div>
                    </div>

                    <div className="flex border-b">
                        {['content', 'seo', 'media'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as typeof activeTab)}
                                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                                    activeTab === tab
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-6">
                    {activeTab === 'content' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Page Title
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.title || ''}
                                        onChange={(e) => setFormData(prev => ({...prev, title: e.target.value}))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Enter page title"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Status
                                    </label>
                                    <select
                                        value={formData.isActive ? 'active' : 'inactive'}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            isActive: e.target.value === 'active'
                                        }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Main Content
                                </label>
                                <RichTextEditor
                                    value={formData.content || ''}
                                    onChange={(value) => setFormData(prev => ({...prev, content: value}))}
                                    placeholder="Enter your content here..."
                                />
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-medium text-gray-900">Content Blocks</h3>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => addContentBlock('text')}
                                            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                                        >
                                            <Plus className="w-4 h-4 inline mr-1"/>
                                            Text
                                        </button>
                                        <button
                                            onClick={() => addContentBlock('image')}
                                            className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                                        >
                                            <Image className="w-4 h-4 inline mr-1"/>
                                            Image
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {formData.richContent?.map((block) => (
                                        <div key={block._id} className="border border-gray-200 rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="text-sm font-medium text-gray-700">
                                                    {block.type.charAt(0).toUpperCase() + block.type.slice(1)} Block
                                                </span>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => removeContentBlock(block._id)}
                                                        className="text-red-600 hover:text-red-700"
                                                    >
                                                        <Trash2 className="w-4 h-4"/>
                                                    </button>
                                                </div>
                                            </div>

                                            {block.type === 'text' && (
                                                <RichTextEditor
                                                    value={block.content.text || ''}
                                                    onChange={(value) => updateContentBlock(block._id, {
                                                        content: {...block.content, text: value}
                                                    })}
                                                    placeholder="Enter block content..."
                                                />
                                            )}

                                            {block.type === 'image' && (
                                                <div className="space-y-3">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Image
                                                        </label>
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={async (e) => {
                                                                const file = e.target.files?.[0];
                                                                if (file) {
                                                                    const uploadedImage = await handleImageUpload(file);
                                                                    if (uploadedImage) {
                                                                        updateContentBlock(block._id, {
                                                                            content: {
                                                                                ...block.content,
                                                                                imageId: uploadedImage._id
                                                                            }
                                                                        });
                                                                    }
                                                                }
                                                            }}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Alt Text
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={block.content.altText || ''}
                                                            onChange={(e) => updateContentBlock(block._id, {
                                                                content: {...block.content, altText: e.target.value}
                                                            })}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                            placeholder="Describe the image for accessibility"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Caption
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={block.content.caption || ''}
                                                            onChange={(e) => updateContentBlock(block._id, {
                                                                content: {...block.content, caption: e.target.value}
                                                            })}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                            placeholder="Optional image caption"
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'seo' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-medium text-gray-900">SEO Settings</h3>
                                <button
                                    onClick={handleSEOAnalysis}
                                    className="flex items-center gap-2 px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                                >
                                    <Search className="w-4 h-4"/>
                                    Analyze SEO
                                </button>
                            </div>

                            {seoScore !== null && (
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div
                                            className={`w-3 h-3 rounded-full ${seoScore >= 80 ? 'bg-green-500' : seoScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                                        <span className="font-medium">SEO Score: {seoScore}/100</span>
                                    </div>
                                    {seoSuggestions.length > 0 && (
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-2">Suggestions:</h4>
                                            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                                                {seoSuggestions.map((suggestion, index) => (
                                                    <li key={index}>{suggestion}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Page Title (SEO)
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.seoMetadata?.pageTitle || ''}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            seoMetadata: {...prev.seoMetadata, pageTitle: e.target.value}
                                        }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="SEO optimized page title"
                                        maxLength={60}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        {(formData.seoMetadata?.pageTitle || '').length}/60 characters
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Meta Keywords
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.seoMetadata?.metaKeywords || ''}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            seoMetadata: {...prev.seoMetadata, metaKeywords: e.target.value}
                                        }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="keyword1, keyword2, keyword3"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Meta Description
                                </label>
                                <textarea
                                    value={formData.seoMetadata?.metaDescription || ''}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        seoMetadata: {...prev.seoMetadata, metaDescription: e.target.value}
                                    }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    rows={3}
                                    placeholder="Brief description of the page content"
                                    maxLength={160}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    {(formData.seoMetadata?.metaDescription || '').length}/160 characters
                                </p>
                            </div>

                            <div className="border-t pt-6">
                                <h4 className="text-md font-medium text-gray-900 mb-4">Open Graph Settings</h4>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            OG Title
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.seoMetadata?.ogTitle || ''}
                                            onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                seoMetadata: {...prev.seoMetadata, ogTitle: e.target.value}
                                            }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Title for social media sharing"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            OG Image URL
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.seoMetadata?.ogImage || ''}
                                            onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                seoMetadata: {...prev.seoMetadata, ogImage: e.target.value}
                                            }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="https://example.com/image.jpg"
                                        />
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        OG Description
                                    </label>
                                    <textarea
                                        value={formData.seoMetadata?.ogDescription || ''}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            seoMetadata: {...prev.seoMetadata, ogDescription: e.target.value}
                                        }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        rows={3}
                                        placeholder="Description for social media sharing"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'media' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-medium text-gray-900">Media Library</h3>
                                <div className="flex gap-2">
                                    <input
                                        type="file"
                                        accept="image/*,video/*"
                                        multiple
                                        onChange={async (e) => {
                                            const files = Array.from(e.target.files || []);
                                            for (const file of files) {
                                                await handleImageUpload(file);
                                            }
                                        }}
                                        className="hidden"
                                        id="media-upload"
                                    />
                                    <label
                                        htmlFor="media-upload"
                                        className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
                                    >
                                        <Upload className="w-4 h-4"/>
                                        Upload Media
                                    </label>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {/* Using localMedia state for display as getMedia query is removed */}
                                {localMedia.length > 0 ? (
                                    localMedia.map((item) => (
                                        <div key={item._id} className="relative group">
                                            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                                                {item.mimeType.startsWith('image/') ? (
                                                    <img
                                                        src={item.thumbnailUrl || item.url}
                                                        alt={item.altText || item.originalName}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                                    />
                                                ) : (
                                                    <div
                                                        className="w-full h-full flex items-center justify-center text-gray-400">
                                                        <div className="text-center">
                                                            <div className="text-2xl mb-2">📄</div>
                                                            <div className="text-xs">{item.originalName}</div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            <div
                                                className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity rounded-lg flex items-center justify-center">
                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(item.url);
                                                            alert('URL copied to clipboard!');
                                                        }}
                                                        className="px-3 py-1 text-sm bg-white text-gray-900 rounded mr-2"
                                                    >
                                                        Copy URL
                                                    </button>
                                                    <button
                                                        onClick={async () => {
                                                            if (item.mimeType.startsWith('image/')) {
                                                                await resizeImage(item._id, {
                                                                    width: 800, height: 600, quality: 85
                                                                });
                                                            }
                                                        }}
                                                        className="px-3 py-1 text-sm bg-white text-gray-900 rounded"
                                                    >
                                                        <Settings className="w-4 h-4"/>
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="mt-2 text-xs text-gray-600 truncate">
                                                {item.originalName}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500">No media uploaded yet. Use the "Upload Media" button to
                                        add files.</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {showPreview && (
                <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-xl font-bold mb-4">Preview</h2>
                    <div className="prose max-w-none">
                        <h1>{formData.title}</h1>
                        <div dangerouslySetInnerHTML={{__html: formData.content || ''}}/>

                        {formData.richContent?.map((block) => (
                            <div key={block._id} className="my-4">
                                {block.type === 'text' && (
                                    <div dangerouslySetInnerHTML={{__html: block.content.text || ''}}/>
                                )}
                                {block.type === 'image' && block.content.imageId && (
                                    <figure>
                                        <img
                                            src={localMedia.find(m => m._id === block.content.imageId)?.url || ''}
                                            alt={block.content.altText || ''}
                                            className="max-w-full h-auto rounded-lg"
                                        />
                                        {block.content.caption && (
                                            <figcaption className="text-sm text-gray-600 mt-2">
                                                {block.content.caption}
                                            </figcaption>
                                        )}
                                    </figure>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContentManager;