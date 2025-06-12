declare module 'dom-to-image-more' {
    interface Options {
        bgcolor?: string;
        height?: number;
        width?: number;
        quality?: number;
        style?: { [key: string]: string | number };
        filter?: (node: HTMLElement) => boolean;
        imagePlaceholder?: string;
        cacheBust?: boolean;
    }

    const domtoimage: {
        toPng(node: HTMLElement, options?: Options): Promise<string>;
        toJpeg(node: HTMLElement, options?: Options): Promise<string>;
        toBlob(node: HTMLElement, options?: Options): Promise<Blob>;
        toPixelData(node: HTMLElement, options?: Options): Promise<Uint8ClampedArray>;
        toSvg(node: HTMLElement, options?: Options): Promise<string>;
    };

    export default domtoimage;
}
