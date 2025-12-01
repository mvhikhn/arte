"use client";

import { useEffect, useRef, useState } from "react";

interface TypstRendererProps {
    content: string;
}

export default function TypstRenderer({ content }: TypstRendererProps) {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [height, setHeight] = useState(200);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data.type === 'READY') {
                setIsReady(true);
                // Send initial content
                if (iframeRef.current?.contentWindow) {
                    iframeRef.current.contentWindow.postMessage({ type: 'RENDER', content }, '*');
                }
            } else if (event.data.type === 'RESIZE') {
                setHeight(event.data.height);
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [content]);

    // Re-send content if it changes and we are ready
    useEffect(() => {
        if (isReady && iframeRef.current?.contentWindow) {
            iframeRef.current.contentWindow.postMessage({ type: 'RENDER', content }, '*');
        }
    }, [content, isReady]);

    return (
        <iframe
            ref={iframeRef}
            src="/typst-renderer.html"
            className="w-full border-none overflow-hidden"
            style={{ height: `${height}px` }}
            title="Typst Content"
        />
    );
}
