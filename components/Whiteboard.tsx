"use client";

import { useEffect, useRef, useState } from "react";

export default function Whiteboard() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);

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
                canvas.height = parent.scrollHeight; // Use scrollHeight to cover full scrollable area
                canvas.width = 2000; // Fixed large width
            }
        };

        resizeCanvas();
        window.addEventListener("resize", resizeCanvas);

        // Style setup
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 2;

        setContext(ctx);

        return () => window.removeEventListener("resize", resizeCanvas);
    }, []);

    const startDrawing = (e: React.MouseEvent) => {
        if (!context) return;

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
