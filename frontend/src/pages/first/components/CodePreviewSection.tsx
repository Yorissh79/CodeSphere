import type {FC} from 'react';

const CodePreviewSection: FC = () => {
    return (
        <section
            className="py-16 px-4 sm:px-6 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
            <div className="max-w-5xl mx-auto">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 text-center mb-4">
                    Real-Time Coding Experience
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400 text-center mb-12 max-w-2xl mx-auto">
                    Try our powerful code editor with real-time collaboration and execution.
                </p>
                <div className="relative group">
                    <div
                        className="absolute -inset-2 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-2xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity duration-500"/>
                    <div
                        className="relative bg-gray-800 dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-700/50 overflow-hidden">
                        <div
                            className="flex items-center justify-between px-4 py-3 bg-gray-700 dark:bg-gray-800 border-b border-gray-600">
                            <div className="flex items-center gap-2">
                                <div className="flex gap-1.5">
                                    <div className="w-2.5 h-2.5 bg-red-500 rounded-full"/>
                                    <div className="w-2.5 h-2.5 bg-yellow-500 rounded-full"/>
                                    <div className="w-2.5 h-2.5 bg-green-500 rounded-full"/>
                                </div>
                                <span className="text-gray-300 text-sm font-mono">main.rb</span>
                            </div>
                            <div className="text-gray-400 text-sm">Ruby</div>
                        </div>
                        <div className="p-6 font-mono text-base">
                            <div className="flex">
                                <div className="text-gray-500 mr-6 select-none">
                                    <div className="leading-7">1</div>
                                    <div className="leading-7">2</div>
                                    <div className="leading-7">3</div>
                                    <div className="leading-7">4</div>
                                </div>
                                <div className="text-gray-100 leading-7">
                                    <div>
                                        <span className="text-indigo-400">def</span>{" "}
                                        <span className="text-blue-300">greet</span>
                                        <span className="text-gray-300">()</span>
                                    </div>
                                    <div className="pl-4">
                                        <span className="text-gray-500"># Welcome message</span>
                                    </div>
                                    <div className="pl-4">
                                        <span className="text-indigo-400">puts</span>{" "}
                                        <span className="text-green-400">"Hello, CodeSphere!"</span>
                                    </div>
                                    <div>
                                        <span className="text-indigo-400">end</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="border-t border-gray-600 bg-gray-700 dark:bg-gray-800 px-6 py-4">
                            <div className="text-green-400 font-mono text-sm">
                                <span className="text-gray-500">$ ruby main.rb</span>
                                <div className="mt-2">Hello, CodeSphere!</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CodePreviewSection;