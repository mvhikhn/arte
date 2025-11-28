"use client";

import { useState } from "react";
import { TextDesignArtworkParams } from "./TextDesignArtwork";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";
import { ChevronDown, ChevronRight, Download, Image as ImageIcon, Monitor } from "lucide-react";

interface TextDesignControlsProps {
    params: TextDesignArtworkParams;
    onParamChange: (param: keyof TextDesignArtworkParams, value: any) => void;
    onExportImage: () => void;
    onExportWallpapers: () => void;
}

export default function TextDesignControls({
    params,
    onParamChange,
    onExportImage,
    onExportWallpapers,
}: TextDesignControlsProps) {
    const [expandedSections, setExpandedSections] = useState<Set<string>>(
        new Set(["Global Settings", "Layer 1"])
    );

    const toggleSection = (title: string) => {
        const newExpanded = new Set(expandedSections);
        if (newExpanded.has(title)) {
            newExpanded.delete(title);
        } else {
            newExpanded.add(title);
        }
        setExpandedSections(newExpanded);
    };

    const formatValue = (value: number, step: number) => {
        if (step < 1) {
            return value.toFixed(step < 0.01 ? 3 : 2);
        }
        return Math.round(value).toString();
    };

    const updateLayer = (layerNum: 1 | 2 | 3, field: string, value: any) => {
        const layerKey = `layer${layerNum}` as 'layer1' | 'layer2' | 'layer3';
        const currentLayer = params[layerKey];
        const updatedLayer = {
            ...(currentLayer as object),
            [field]: value,
        };
        onParamChange(layerKey as keyof TextDesignArtworkParams, updatedLayer);
    };

    const renderLayerControls = (layerNum: 1 | 2 | 3, title: string) => {
        const layerKey = `layer${layerNum}` as keyof TextDesignArtworkParams;
        const layer = params[layerKey] as any;
        const isExpanded = expandedSections.has(title);

        return (
            <div key={title} className="border-b border-zinc-100">
                <button
                    onClick={() => toggleSection(title)}
                    className="w-full px-3 py-2 flex items-center justify-between hover:bg-zinc-50 transition-colors"
                >
                    <span className="font-medium text-xs uppercase tracking-wide text-zinc-700">{title}</span>
                    {isExpanded ? <ChevronDown className="w-3 h-3 text-zinc-500" /> : <ChevronRight className="w-3 h-3 text-zinc-500" />}
                </button>
                {isExpanded && (
                    <div className="px-3 pb-3 space-y-3">
                        {/* Text Content */}
                        <div className="space-y-1">
                            <span className="text-[10px] text-zinc-500 uppercase tracking-wide">Text Content</span>
                            <input
                                type="text"
                                value={layer.text}
                                onChange={(e) => updateLayer(layerNum, 'text', e.target.value)}
                                placeholder="Enter text..."
                                className="w-full px-2 py-1 bg-zinc-50 border border-zinc-200 rounded text-xs focus:outline-none focus:border-zinc-400"
                            />
                        </div>

                        {/* Font URL */}
                        <div className="space-y-1">
                            <span className="text-[10px] text-zinc-500 uppercase tracking-wide">Font URL (TTF)</span>
                            <input
                                type="text"
                                value={layer.fontUrl || ''}
                                onChange={(e) => updateLayer(layerNum, 'fontUrl', e.target.value)}
                                placeholder="https://.../font.ttf"
                                className="w-full px-2 py-1 bg-zinc-50 border border-zinc-200 rounded text-xs focus:outline-none focus:border-zinc-400"
                            />
                        </div>

                        {/* Font Size */}
                        <div className="space-y-1">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] text-zinc-500 uppercase tracking-wide">Font Size</span>
                                <span className="text-[10px] font-mono text-zinc-600">{layer.size}</span>
                            </div>
                            <Slider
                                value={[layer.size]}
                                onValueChange={([value]) => updateLayer(layerNum, 'size', value)}
                                min={10}
                                max={400}
                                step={1}
                                className="w-full"
                            />
                        </div>

                        {/* Alignment */}
                        <div className="space-y-1">
                            <span className="text-[10px] text-zinc-500 uppercase tracking-wide">Alignment</span>
                            <div className="flex gap-1">
                                {(['left', 'center', 'right'] as const).map((align) => (
                                    <button
                                        key={align}
                                        onClick={() => updateLayer(layerNum, 'alignment', align)}
                                        className={`flex-1 px-2 py-1 rounded text-[10px] font-medium uppercase transition-colors ${layer.alignment === align
                                            ? 'bg-zinc-900 text-white'
                                            : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                                            }`}
                                    >
                                        {align}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Position */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] text-zinc-500 uppercase tracking-wide">Position X</span>
                                    <span className="text-[10px] font-mono text-zinc-600">{formatValue(layer.x, 0.001)}</span>
                                </div>
                                <Slider
                                    value={[layer.x]}
                                    onValueChange={([value]) => updateLayer(layerNum, 'x', value)}
                                    min={0}
                                    max={1}
                                    step={0.001}
                                    className="w-full"
                                />
                            </div>
                            <div className="space-y-1">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] text-zinc-500 uppercase tracking-wide">Position Y</span>
                                    <span className="text-[10px] font-mono text-zinc-600">{formatValue(layer.y, 0.001)}</span>
                                </div>
                                <Slider
                                    value={[layer.y]}
                                    onValueChange={([value]) => updateLayer(layerNum, 'y', value)}
                                    min={0}
                                    max={1}
                                    step={0.001}
                                    className="w-full"
                                />
                            </div>
                        </div>

                        {/* Colors */}
                        <div className="space-y-2">
                            <div className="space-y-1">
                                <span className="text-[10px] text-zinc-500 uppercase tracking-wide">Face Color</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-full h-6 rounded border border-zinc-200 overflow-hidden" style={{ backgroundColor: layer.fill }}>
                                        <input
                                            type="color"
                                            value={layer.fill}
                                            onChange={(e) => updateLayer(layerNum, 'fill', e.target.value)}
                                            className="w-full h-full cursor-pointer opacity-0"
                                        />
                                    </div>
                                    <input
                                        type="text"
                                        value={layer.fill}
                                        onChange={(e) => updateLayer(layerNum, 'fill', e.target.value)}
                                        className="w-20 px-2 py-1 bg-zinc-50 border border-zinc-200 rounded text-[10px] font-mono focus:outline-none focus:border-zinc-400"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <span className="text-[10px] text-zinc-500 uppercase tracking-wide">Outline Color</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-full h-6 rounded border border-zinc-200 overflow-hidden" style={{ backgroundColor: layer.outlineColor }}>
                                        <input
                                            type="color"
                                            value={layer.outlineColor}
                                            onChange={(e) => updateLayer(layerNum, 'outlineColor', e.target.value)}
                                            className="w-full h-full cursor-pointer opacity-0"
                                        />
                                    </div>
                                    <input
                                        type="text"
                                        value={layer.outlineColor}
                                        onChange={(e) => updateLayer(layerNum, 'outlineColor', e.target.value)}
                                        className="w-20 px-2 py-1 bg-zinc-50 border border-zinc-200 rounded text-[10px] font-mono focus:outline-none focus:border-zinc-400"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Outline Thickness */}
                        <div className="space-y-1">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] text-zinc-500 uppercase tracking-wide">Outline Thickness</span>
                                <span className="text-[10px] font-mono text-zinc-600">{layer.outlineThickness}</span>
                            </div>
                            <Slider
                                value={[layer.outlineThickness]}
                                onValueChange={([value]) => updateLayer(layerNum, 'outlineThickness', value)}
                                min={0}
                                max={20}
                                step={1}
                                className="w-full"
                            />
                        </div>

                        {/* Highlight */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] text-zinc-500 uppercase tracking-wide">Show Highlight</span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={layer.showHighlight}
                                        onChange={(e) => updateLayer(layerNum, 'showHighlight', e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-9 h-5 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-zinc-900"></div>
                                </label>
                            </div>

                            {layer.showHighlight && (
                                <div className="space-y-1">
                                    <span className="text-[10px] text-zinc-500 uppercase tracking-wide">Highlight Color</span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-full h-6 rounded border border-zinc-200 overflow-hidden" style={{ backgroundColor: layer.highlight }}>
                                            <input
                                                type="color"
                                                value={layer.highlight}
                                                onChange={(e) => updateLayer(layerNum, 'highlight', e.target.value)}
                                                className="w-full h-full cursor-pointer opacity-0"
                                            />
                                        </div>
                                        <input
                                            type="text"
                                            value={layer.highlight}
                                            onChange={(e) => updateLayer(layerNum, 'highlight', e.target.value)}
                                            className="w-20 px-2 py-1 bg-zinc-50 border border-zinc-200 rounded text-[10px] font-mono focus:outline-none focus:border-zinc-400"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 3D Extrusion */}
                        <div className="space-y-2 pt-2 border-t border-zinc-100">
                            <span className="text-[10px] text-zinc-500 uppercase tracking-wide font-semibold">3D Extrusion</span>

                            <div className="space-y-1">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] text-zinc-500 uppercase tracking-wide">Depth</span>
                                    <span className="text-[10px] font-mono text-zinc-600">{layer.extrudeDepth}</span>
                                </div>
                                <Slider
                                    value={[layer.extrudeDepth]}
                                    onValueChange={([value]) => updateLayer(layerNum, 'extrudeDepth', value)}
                                    min={0}
                                    max={100}
                                    step={1}
                                    className="w-full"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] text-zinc-500 uppercase tracking-wide">Angle X</span>
                                        <span className="text-[10px] font-mono text-zinc-600">{formatValue(layer.extrudeX, 0.1)}</span>
                                    </div>
                                    <Slider
                                        value={[layer.extrudeX]}
                                        onValueChange={([value]) => updateLayer(layerNum, 'extrudeX', value)}
                                        min={-5}
                                        max={5}
                                        step={0.1}
                                        className="w-full"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] text-zinc-500 uppercase tracking-wide">Angle Y</span>
                                        <span className="text-[10px] font-mono text-zinc-600">{formatValue(layer.extrudeY, 0.1)}</span>
                                    </div>
                                    <Slider
                                        value={[layer.extrudeY]}
                                        onValueChange={([value]) => updateLayer(layerNum, 'extrudeY', value)}
                                        min={-5}
                                        max={5}
                                        step={0.1}
                                        className="w-full"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <span className="text-[10px] text-zinc-500 uppercase tracking-wide">Depth Start Color</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-full h-6 rounded border border-zinc-200 overflow-hidden" style={{ backgroundColor: layer.extrudeStart }}>
                                        <input
                                            type="color"
                                            value={layer.extrudeStart}
                                            onChange={(e) => updateLayer(layerNum, 'extrudeStart', e.target.value)}
                                            className="w-full h-full cursor-pointer opacity-0"
                                        />
                                    </div>
                                    <input
                                        type="text"
                                        value={layer.extrudeStart}
                                        onChange={(e) => updateLayer(layerNum, 'extrudeStart', e.target.value)}
                                        className="w-20 px-2 py-1 bg-zinc-50 border border-zinc-200 rounded text-[10px] font-mono focus:outline-none focus:border-zinc-400"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <span className="text-[10px] text-zinc-500 uppercase tracking-wide">Depth End Color</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-full h-6 rounded border border-zinc-200 overflow-hidden" style={{ backgroundColor: layer.extrudeEnd }}>
                                        <input
                                            type="color"
                                            value={layer.extrudeEnd}
                                            onChange={(e) => updateLayer(layerNum, 'extrudeEnd', e.target.value)}
                                            className="w-full h-full cursor-pointer opacity-0"
                                        />
                                    </div>
                                    <input
                                        type="text"
                                        value={layer.extrudeEnd}
                                        onChange={(e) => updateLayer(layerNum, 'extrudeEnd', e.target.value)}
                                        className="w-20 px-2 py-1 bg-zinc-50 border border-zinc-200 rounded text-[10px] font-mono focus:outline-none focus:border-zinc-400"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="h-full overflow-y-auto overflow-x-hidden bg-white text-zinc-900 text-xs no-scrollbar">
            {/* Export Buttons */}
            <div className="px-3 py-3 border-b border-zinc-100 space-y-2">
                <button
                    onClick={onExportImage}
                    className="w-full px-3 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-md flex items-center justify-center gap-2 transition-colors font-medium text-xs"
                >
                    <Download className="w-3.5 h-3.5" />
                    Export Image
                </button>
                <button
                    onClick={onExportWallpapers}
                    className="w-full px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 rounded-md flex items-center justify-center gap-2 transition-colors font-medium text-xs"
                >
                    <Monitor className="w-3.5 h-3.5" />
                    Export Wallpapers
                </button>
            </div>

            {/* Global Settings */}
            <div className="border-b border-zinc-100">
                <button
                    onClick={() => toggleSection("Global Settings")}
                    className="w-full px-3 py-2 flex items-center justify-between hover:bg-zinc-50 transition-colors"
                >
                    <span className="font-medium text-xs uppercase tracking-wide text-zinc-700">Global Settings</span>
                    {expandedSections.has("Global Settings") ? (
                        <ChevronDown className="w-3 h-3 text-zinc-500" />
                    ) : (
                        <ChevronRight className="w-3 h-3 text-zinc-500" />
                    )}
                </button>
                {expandedSections.has("Global Settings") && (
                    <div className="px-3 pb-3 space-y-3">
                        <div className="space-y-1">
                            <span className="text-[10px] text-zinc-500 uppercase tracking-wide">Background Color</span>
                            <div className="flex items-center gap-2">
                                <div className="w-full h-6 rounded border border-zinc-200 overflow-hidden" style={{ backgroundColor: params.backgroundColor }}>
                                    <input
                                        type="color"
                                        value={params.backgroundColor}
                                        onChange={(e) => onParamChange('backgroundColor', e.target.value)}
                                        className="w-full h-full cursor-pointer opacity-0"
                                    />
                                </div>
                                <input
                                    type="text"
                                    value={params.backgroundColor}
                                    onChange={(e) => onParamChange('backgroundColor', e.target.value)}
                                    className="w-20 px-2 py-1 bg-zinc-50 border border-zinc-200 rounded text-[10px] font-mono focus:outline-none focus:border-zinc-400"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] text-zinc-500 uppercase tracking-wide">Width</span>
                                    <span className="text-[10px] font-mono text-zinc-600">{params.canvasWidth}</span>
                                </div>
                                <Slider
                                    value={[params.canvasWidth]}
                                    onValueChange={([value]) => onParamChange('canvasWidth', value)}
                                    min={500}
                                    max={2500}
                                    step={1}
                                    className="w-full"
                                />
                            </div>
                            <div className="space-y-1">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] text-zinc-500 uppercase tracking-wide">Height</span>
                                    <span className="text-[10px] font-mono text-zinc-600">{params.canvasHeight}</span>
                                </div>
                                <Slider
                                    value={[params.canvasHeight]}
                                    onValueChange={([value]) => onParamChange('canvasHeight', value)}
                                    min={300}
                                    max={1500}
                                    step={1}
                                    className="w-full"
                                />
                            </div>
                        </div>

                        <div className="space-y-1 pt-2 border-t border-zinc-100">
                            <span className="text-[10px] text-zinc-500 uppercase tracking-wide">Font URL (.ttf)</span>
                            <input
                                type="text"
                                value={params.fontUrl || ''}
                                onChange={(e) => onParamChange('fontUrl', e.target.value)}
                                placeholder="https://example.com/font.ttf"
                                className="w-full px-2 py-1 bg-zinc-50 border border-zinc-200 rounded text-xs focus:outline-none focus:border-zinc-400"
                            />
                        </div>

                        <div className="space-y-1">
                            <span className="text-[10px] text-zinc-500 uppercase tracking-wide">Custom Font Family</span>
                            <input
                                type="text"
                                value={params.customFontFamily || ''}
                                onChange={(e) => onParamChange('customFontFamily', e.target.value)}
                                placeholder="Noto Sans Bengali"
                                className="w-full px-2 py-1 bg-zinc-50 border border-zinc-200 rounded text-xs focus:outline-none focus:border-zinc-400"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Layer Controls */}
            {renderLayerControls(1, "Layer 1")}
            {renderLayerControls(2, "Layer 2")}
            {renderLayerControls(3, "Layer 3")}
        </div>
    );
}
