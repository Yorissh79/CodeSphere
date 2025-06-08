import Fsection from "../fsection/Fsection.tsx";
import Ssection from "../ssection/Ssection.tsx";
import CodeEditorPreview from "../tsection/Tsection.tsx";

const F = () => {
    return (
        <div className={"container mx-auto px-4 py-8"}>

            <Fsection/>
            <Ssection/>
            <CodeEditorPreview/>

        </div>
    )
}
export default F
