"use client";

import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { LambArtworkParams } from "./LambArtwork";
import { ChevronDown, ChevronRight, Download, Image as ImageIcon, Shuffle, Play, Pause } from "lucide-react";

interface LambControlsProps {
    params: LambArtworkParams;
    onParamChange: (param: keyof LambArtworkParams, value: number) => void;
    onExportImage: () => void;
    onExportHighRes?: (scale: number) => void;
    onToggleAnimation?: () => void;
    onRandomize?: () => void;
    onRegenerate?: () => void;
    tokenInput?: string;
    onTokenChange?: (value: string) => void;
}

interface ControlConfig {
    key: keyof LambArtworkParams;
    label: string;
    min: number;
    max: number;
    step: number;
}

interface Section {
    title: string;
    controls: ControlConfig[];
}

const sections: Section[] = [
    {
        title: "Grid Settings",
        controls: [
            { key: "cols", label: "Columns", min: 10, max: 200, step: 10 },
            { key: "rows", label: "Rows", min: 10, max: 200, step: 10 },
        ]
    },
    {
        title: "Physics",
        controls: [
            { key: "noiseScale", label: "Noise Scale", min: 0.001, max: 0.05, step: 0.001 },
            { key: "lifeStep", label: "Life Step", min: 0.001, max: 0.02, step: 0.001 },
            { key: "weiRangeMax", label: "Weight Range", min: 4, max: 512, step: 4 },
        ]
    },
    {
        title: "Layout",
        controls: [
            { key: "wOff", label: "Width Offset", min: 0, max: 500, step: 10 },
            { key: "hOff", label: "Height Offset", min: 0, max: 500, step: 10 },
        ]
    },
];

export default function LambControls({
    params,
    onParamChange,
    onExportImage,
    onExportHighRes,
    onToggleAnimation,
    onRandomize,
    onRegenerate,
    tokenInput,
    onTokenChange
}: LambControlsProps) {
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["Grid Settings", "Physics"]));

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

    return (
        <div className="h-full overflow-y-auto overflow-x-hidden bg-white text-zinc-900 text-xs no-scrollbar">
            {/* Control Buttons */}
            <div className="px-3 py-3 border-b border-zinc-100 flex gap-2">
                <button
                    onClick={() => onToggleAnimation?.()}
                    className="flex-1 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 rounded-md flex items-center justify-center gap-1.5 transition-colors font-medium text-xs"
                >
                    {params.isAnimating ? (
                        <>
                            <Pause className="w-3 h-3" />
                            Pause
                        </>
                    ) : (
                        <>
                            <Play className="w-3 h-3" />
                            Play
                        </>
                    )}
                </button>
                <button
                    onClick={() => onRegenerate?.()}
                    className="flex-1 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 rounded-md flex items-center justify-center gap-1.5 transition-colors font-medium text-xs"
                >
                    <Shuffle className="w-3 h-3" />
                    Regenerate
                </button>
                <button
                    onClick={() => onRandomize?.()}
                    className="flex-1 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-md flex items-center justify-center gap-1.5 transition-colors font-medium text-xs"
                >
                    Randomize
                </button>
            </div>

            {/* Token Input */}
            <div className="border-b border-zinc-100">
                <button
                    onClick={() => toggleSection("Token")}
                    className="w-full px-3 py-2 flex items-center justify-between hover:bg-zinc-50 transition-colors"
                >
                    <span className="font-semibold text-xs tracking-wider text-zinc-500">Token</span>
                    {expandedSections.has("Token") ? (
                        <ChevronDown className="w-3 h-3 text-zinc-400" />
                    ) : (
                        <ChevronRight className="w-3 h-3 text-zinc-400" />
                    )}
                </button>
                {expandedSections.has("Token") && (
                    <div className="px-3 pb-3">
                        <div className="flex gap-1">
                            <input
                                type="text"
                                value={tokenInput || params.token || ''}
                                onChange={(e) => onTokenChange && onTokenChange(e.target.value)}
                                className="flex-1 px-2 py-1.5 bg-zinc-50 border border-zinc-200 rounded text-xs font-mono text-zinc-600 focus:outline-none focus:border-zinc-400 focus:ring-0"
                                placeholder="fx-..."
                            />
                            <button
                                onClick={() => navigator.clipboard.writeText(tokenInput || params.token || '')}
                                className="px-2 py-1.5 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 rounded text-zinc-500 hover:text-zinc-700 transition-colors"
                                title="Copy Token"
                            >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                            </button>
                        </div>
                        <p className="mt-1.5 text-[10px] text-zinc-400 leading-relaxed">
                            This token uniquely identifies your artwork. Paste a previous token to restore it.
                        </p>
                    </div>
                )}
            </div>

            {/* Collapsible Sections */}
            {sections.map((section) => {
                const isExpanded = expandedSections.has(section.title);
                return (
                    <div key={section.title} className="border-b border-zinc-100">
                        <button
                            onClick={() => toggleSection(section.title)}
                            className="w-full px-3 py-2 flex items-center justify-between hover:bg-zinc-50 transition-colors"
                        >
                            <span className="font-semibold text-xs tracking-wider text-zinc-500">{section.title}</span>
                            {isExpanded ? (
                                <ChevronDown className="w-3 h-3 text-zinc-400" />
                            ) : (
                                <ChevronRight className="w-3 h-3 text-zinc-400" />
                            )}
                        </button>
                        {isExpanded && (
                            <div className="px-3 pb-3 space-y-3">
                                {section.controls.map((config) => {
                                    const value = params[config.key];
                                    if (typeof value !== 'number') return null;
                                    return (
                                        <div key={config.key} className="space-y-1.5">
                                            <div className="flex items-center justify-between">
                                                <span className="text-zinc-700 font-medium">{config.label}</span>
                                                <input
                                                    type="number"
                                                    value={formatValue(value, config.step)}
                                                    onChange={(e) => {
                                                        const newVal = parseFloat(e.target.value);
                                                        if (!isNaN(newVal)) {
                                                            onParamChange(config.key, newVal);
                                                        }
                                                    }}
                                                    step={config.step}
                                                    min={config.min}
                                                    max={config.max}
                                                    className="w-12 h-5 bg-transparent text-right font-mono text-zinc-500 focus:outline-none focus:text-zinc-900"
                                                />
                                            </div>
                                            <Slider
                                                min={config.min}
                                                max={config.max}
                                                step={config.step}
                                                value={[value]}
                                                onValueChange={(values) => onParamChange(config.key, values[0])}
                                                className="py-1"
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                );
            })}

            {/* Export Section */}
            <div className="border-b border-zinc-100">
                <button
                    onClick={() => toggleSection("Export")}
                    className="w-full px-3 py-2 flex items-center justify-between hover:bg-zinc-50 transition-colors"
                >
                    <span className="font-semibold text-xs tracking-wider text-zinc-500">Export</span>
                    {expandedSections.has("Export") ? (
                        <ChevronDown className="w-3 h-3 text-zinc-400" />
                    ) : (
                        <ChevronRight className="w-3 h-3 text-zinc-400" />
                    )}
                </button>
                {expandedSections.has("Export") && (
                    <div className="px-3 pb-3 space-y-2">
                        <button
                            onClick={onExportImage}
                            className="w-full px-3 py-2 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-md flex items-center justify-center gap-2 transition-colors text-xs font-medium text-zinc-700"
                        >
                            <ImageIcon className="w-3.5 h-3.5" />
                            Export PNG
                        </button>
                        <button
                            onClick={() => onExportHighRes?.(4)}
                            className="w-full px-3 py-2 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-md flex items-center justify-center gap-2 transition-colors text-xs font-medium text-zinc-700"
                        >
                            <Download className="w-3.5 h-3.5" />
                            Export High Res (4x)
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
