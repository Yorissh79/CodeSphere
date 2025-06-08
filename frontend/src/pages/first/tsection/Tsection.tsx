function CodeEditorPreview() {
    return (
        <section className="py-16">
            <div className="max-w-4xl mx-auto bg-gray-900 p-4 rounded-lg shadow-md w-full">
                <div className="flex items-center mb-2">
                    <span className="text-gray-400">File: main.rb</span>
                </div>
                <div className="flex">
                    <div className="text-gray-400 mr-4">
                        <div>1</div>
                        <div>2</div>
                        <div>3</div>
                        <div>4</div>
                    </div>
                    <div className="text-white">
                        <div><span className="text-blue-400">def</span> g1_greet()</div>
                        <div>  <span className="text-blue-400">int</span> H1</div>
                        <div>  <span className="text-purple-400">puts</span> <span className="text-green-400">"Hello, CodeSphere!"</span></div>
                        <div><span className="text-blue-400">end</span> a</div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default CodeEditorPreview;