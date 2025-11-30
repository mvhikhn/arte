"use client";

import { useEffect, useRef, useState } from "react";

interface WhiteboardProps {
    width: number; // Percentage width of the container
}

export default function Whiteboard({ width }: WhiteboardProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
    const lastWidthRef = useRef(width);

    // Initialize canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Set canvas size to a large fixed width to allow "erasing" by clipping
        // and full height of the container
        const resizeCanvas = () => {
            const parent = canvas.parentElement;
            if (parent) {
                // Save current content
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = canvas.width;
                tempCanvas.height = canvas.height;
                const tempCtx = tempCanvas.getContext('2d');
                if (tempCtx) {
                    tempCtx.drawImage(canvas, 0, 0);
                }

                canvas.height = parent.scrollHeight; // Use scrollHeight to cover full scrollable area
                canvas.width = parent.clientWidth; // Match parent width exactly

                // Restore content
                if (tempCtx) {
                    ctx.drawImage(tempCanvas, 0, 0);
                }

                // Re-apply styles
                ctx.lineCap = "round";
                ctx.lineJoin = "round";
                ctx.strokeStyle = "#000000";
                ctx.lineWidth = 2;
            }
        };

        resizeCanvas();
        window.addEventListener("resize", resizeCanvas);

        setContext(ctx);

        return () => window.removeEventListener("resize", resizeCanvas);
    }, []);

    // Handle erasing when width decreases
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !context) return;

        const parent = canvas.parentElement;
        if (!parent) return;

        // If width decreased, we need to clear the area that is now "gone"
        // Actually, since we want the divider to act as an eraser, we should clear everything
        // to the right of the new width.
        // However, the canvas width itself might be resizing if we set it to 100%.
        // Let's keep the canvas width fixed large, but clear the pixels.

        // Wait, the requirement is: "when I drag the divider on board little by little the marks don't erase"
        // This implies the canvas should be the full potential width, but we clear pixels beyond the current visible width.

        // Let's change strategy: Canvas is always full width of the container. 
        // When container shrinks, the canvas shrinks (because of CSS width: 100%).
        // But standard canvas resizing clears content. We want to PRESERVE content on the left, and LOSE content on the right.
        // Default canvas resize behavior actually clears EVERYTHING.

        // Better strategy:
        // 1. Canvas width matches parent width.
        // 2. When parent resizes (drag), we resize canvas.
        // 3. We save/restore content.
        // 4. Content outside the new width is naturally lost (erased).

        const handleResize = () => {
            const parent = canvas.parentElement;
            if (!parent) return;

            // We need to manually resize the canvas resolution to match display size
            // to ensure 1:1 pixel mapping and correct "erasing" (cropping).
            if (canvas.width !== parent.clientWidth || canvas.height !== parent.scrollHeight) {
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = canvas.width;
                tempCanvas.height = canvas.height;
                const tempCtx = tempCanvas.getContext('2d');
                if (tempCtx) tempCtx.drawImage(canvas, 0, 0);

                canvas.width = parent.clientWidth;
                canvas.height = parent.scrollHeight;

                context.drawImage(tempCanvas, 0, 0);

                // Restore styles
                context.lineCap = "round";
                context.lineJoin = "round";
                context.strokeStyle = "#000000";
                context.lineWidth = 2;
            }
        };

        handleResize();

    }, [width, context]); // Run when width prop changes

    const startDrawing = (e: React.MouseEvent) => {
        if (!context) return;

        // Check if we are clicking on text
        // We can use document.elementFromPoint to see if we are hitting a text element
        // But since the canvas is z-0 and text is z-10, the text should block events automatically
        // IF the text elements have pointer-events-auto.
        // The user said "make sure I can write only where there is no text".
        // If the text wrapper has pointer-events-none, clicks go through to canvas.
        // We need text elements to have pointer-events-auto.

        const { offsetX, offsetY } = e.nativeEvent;
        context.beginPath();
        context.moveTo(offsetX, offsetY);
        setIsDrawing(true);
    };

    const draw = (e: React.MouseEvent) => {
        if (!isDrawing || !context) return;

        const { offsetX, offsetY } = e.nativeEvent;
        context.lineTo(offsetX, offsetY);
        context.stroke();
    };

    const stopDrawing = () => {
        if (!context) return;
        context.closePath();
        setIsDrawing(false);
    };

    return (
        <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 z-0 cursor-crosshair touch-none"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            style={{ pointerEvents: 'auto' }}
        />
    );
}
