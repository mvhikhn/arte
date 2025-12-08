import React, { useMemo, useState } from 'react';
import { getSchema, ControlConfig } from '@/utils/schemaRegistry';
import { SlidersHorizontal, Palette, Type, ToggleLeft, ChevronDown, ChevronRight, Play, Pause, Download, Image as ImageIcon, Shuffle, Monitor } from 'lucide-react';
import { Slider } from "@/components/ui/slider";
import { ColorPicker } from "@/components/ui/color-picker";

interface GenericControlsProps {
    artworkType: string;
    params: any;
    onParamChange: (key: string, value: any) => void;
    onColorChange?: (key: string, value: string) => void;
    onExportImage?: () => void;
    onExportGif?: (duration: number, fps: number) => void;
    onExportWallpapers?: () => void;
    onToggleAnimation?: () => void;
    onRandomize?: () => void;
    onTokenChange?: (value: string) => void;
    tokenInput?: string;
    onRegenerate?: () => void;
}

export const GenericControls: React.FC<GenericControlsProps> = ({
    artworkType,
    params,
    onParamChange,
    onColorChange,
    onExportImage,
    onExportGif,
    onExportWallpapers,
    onToggleAnimation,
    onRandomize,
    onTokenChange,
    tokenInput
}) => {
    const schema = getSchema(artworkType);
    const controls = schema.controls;
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['General', 'Colors']));
    const [gifDuration, setGifDuration] = useState(3);
    const [isExporting, setIsExporting] = useState(false);

    const toggleSection = (title: string) => {
        const newExpanded = new Set(expandedSections);
        if (newExpanded.has(title)) {
            newExpanded.delete(title);
        } else {
            newExpanded.add(title);
        }
        setExpandedSections(newExpanded);
    };

    const handleExportGif = async () => {
        setIsExporting(true);
        try {
            await onExportGif?.(gifDuration, 30);
            setTimeout(() => setIsExporting(false), (gifDuration + 2) * 1000);
        } catch (error) {
            setIsExporting(false);
        }
    };

    // Group controls by section
    const sections = useMemo(() => {
        if (!controls) return {};
        const groups: Record<string, string[]> = {};

        Object.entries(controls).forEach(([key, config]) => {
            const section = config.section || 'General';
            if (!groups[section]) groups[section] = [];
            groups[section].push(key);
        });

        return groups;
    }, [controls]);

    if (!controls) {
        return (
            <div className="p-4 text-center text-zinc-500 text-sm">
                No controls defined for this artwork.
            </div>
        );
    }

    const renderControl = (key: string, config: ControlConfig) => {
        const value = params[key];

        switch (config.type) {
            case 'range':
                return (
                    <div key={key} className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                            <label className="text-zinc-700 font-medium">{config.label}</label>
                            <input
                                type="number"
                                value={typeof value === 'number' ? value.toFixed(config.step && config.step < 1 ? 2 : 0) : value}
                                onChange={(e) => onParamChange(key, parseFloat(e.target.value))}
                                className="w-12 h-5 bg-transparent text-right font-mono text-zinc-500 focus:outline-none focus:text-zinc-900"
                                step={config.step}
                                min={config.min}
                                max={config.max}
                            />
                        </div>
                        <Slider
                            min={config.min}
                            max={config.max}
                            step={config.step}
                            value={[value]}
                            onValueChange={(values) => onParamChange(key, values[0])}
                            className="py-1"
                        />
                    </div>
                );

            case 'color':
                return (
                    <div key={key} className="flex flex-col gap-1">
                        <span className="text-[10px] text-zinc-500 tracking-wide">{config.label}</span>
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full overflow-hidden border border-zinc-200 flex-shrink-0">
                                <ColorPicker
                                    value={value}
                                    onChange={(v) => onParamChange(key, v)}
                                />
                            </div>
                            <input
                                type="text"
                                value={value}
                                onChange={(e) => onParamChange(key, e.target.value)}
                                className="w-full h-6 bg-transparent font-mono text-[10px] text-zinc-700 focus:outline-none"
                            />
                        </div>
                    </div>
                );

            case 'boolean':
                return (
                    <div key={key} className="flex items-center justify-between">
                        <label className="text-xs text-zinc-600 font-medium">{config.label}</label>
                        <button
                            onClick={() => onParamChange(key, !value)}
                            className={`relative inline - flex h - 5 w - 9 items - center rounded - full transition - colors ${value ? 'bg-zinc-900' : 'bg-zinc-200'
                                } `}
                        >
                            <span
                                className={`inline - block h - 3.5 w - 3.5 transform rounded - full bg - white transition - transform ${value ? 'translate-x-4.5' : 'translate-x-0.5'
                                    } `}
                                style={{ transform: value ? 'translateX(18px)' : 'translateX(2px)' }}
                            />
                        </button>
                    </div>
                );

            case 'select':
                return (
                    <div key={key} className="space-y-1">
                        <label className="text-xs text-zinc-600 font-medium">{config.label}</label>
                        <select
                            value={value}
                            onChange={(e) => onParamChange(key, e.target.value)}
                            className="w-full text-xs p-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-400"
                        >
                            {config.options?.map((opt) => (
                                <option key={opt} value={opt}>
                                    {opt}
                                </option>
                            ))}
                        </select>
                    </div>
                );

            default:
                return null;
        }
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
                    onClick={() => onRandomize?.()}
                    className="flex-1 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-md flex items-center justify-center gap-1.5 transition-colors font-medium text-xs"
                >
                    <Shuffle className="w-3 h-3" />
                    Randomize
                </button>
            </div>

            {/* Token Section */}
            {onTokenChange && params.token && (
                <div className="border-b border-zinc-100">
                    <button
                        onClick={() => toggleSection("Token")}
                        className="w-full px-3 py-2 flex items-center justify-between hover:bg-zinc-50 transition-colors"
                    >
                        <span className="font-semibold text-xs tracking-wider text-zinc-500">Token (Seed)</span>
                        {expandedSections.has("Token") ? <ChevronDown className="w-3 h-3 text-zinc-400" /> : <ChevronRight className="w-3 h-3 text-zinc-400" />}
                    </button>
                    {expandedSections.has("Token") && (
                        <div className="px-3 pb-3 space-y-1.5">
                            <div className="flex gap-1">
                                <input
                                    type="text"
                                    value={tokenInput || params.token}
                                    onChange={(e) => onTokenChange && onTokenChange(e.target.value)}
                                    className="flex-1 px-2 py-1.5 bg-zinc-50 border border-zinc-200 rounded-md font-mono text-[10px] text-zinc-600 focus:border-zinc-400 focus:text-zinc-900 focus:outline-none transition-colors"
                                    placeholder="fx-..."
                                />
                                <button
                                    onClick={() => navigator.clipboard.writeText(tokenInput || params.token)}
                                    className="px-2 py-1.5 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 rounded-md text-zinc-500 hover:text-zinc-700 transition-colors"
                                    title="Copy Token"
                                >
                                    <ImageIcon className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Dynamic Sections */}
            {Object.entries(sections).map(([section, keys]) => (
                <div key={section} className="border-b border-zinc-100">
                    <button
                        onClick={() => toggleSection(section)}
                        className="w-full px-3 py-2 flex items-center justify-between hover:bg-zinc-50 transition-colors"
                    >
                        <span className="font-semibold text-xs tracking-wider text-zinc-500">{section}</span>
                        {expandedSections.has(section) ? <ChevronDown className="w-3 h-3 text-zinc-400" /> : <ChevronRight className="w-3 h-3 text-zinc-400" />}
                    </button>
                    {expandedSections.has(section) && (
                        <div className="px-3 pb-3 space-y-3">
                            {keys.map(key => renderControl(key, controls[key]))}
                        </div>
                    )}
                </div>
            ))}

            {/* Export Section */}
            <div className="border-b border-zinc-100">
                <button
                    onClick={() => toggleSection("Export")}
                    className="w-full px-3 py-2 flex items-center justify-between hover:bg-zinc-50 transition-colors"
                >
                    <span className="font-semibold text-xs tracking-wider text-zinc-500">Export</span>
                    {expandedSections.has("Export") ? <ChevronDown className="w-3 h-3 text-zinc-400" /> : <ChevronRight className="w-3 h-3 text-zinc-400" />}
                </button>
                {expandedSections.has("Export") && (
                    <div className="px-3 pb-3 space-y-2">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-zinc-700 font-medium">Size</span>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    value={params.exportWidth}
                                    onChange={(e) => onParamChange('exportWidth', parseInt(e.target.value) || 800)}
                                    className="w-12 h-5 bg-transparent text-right font-mono text-zinc-500 focus:outline-none focus:text-zinc-900"
                                />
                                <span className="text-zinc-400">×</span>
                                <input
                                    type="number"
                                    value={params.exportHeight}
                                    onChange={(e) => onParamChange('exportHeight', parseInt(e.target.value) || 1000)}
                                    className="w-12 h-5 bg-transparent text-right font-mono text-zinc-500 focus:outline-none focus:text-zinc-900"
                                />
                            </div>
                        </div>

                        <button
                            onClick={onExportImage}
                            className="w-full px-3 py-2 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-md flex items-center justify-center gap-2 transition-colors text-xs font-medium text-zinc-700"
                        >
                            <ImageIcon className="w-3.5 h-3.5" />
                            Export Image
                        </button>

                        <div className="pt-2 border-t border-zinc-100">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-zinc-700 font-medium">GIF Duration (s)</span>
                                <input
                                    type="number"
                                    value={gifDuration}
                                    onChange={(e) => {
                                        const newVal = parseFloat(e.target.value);
                                        if (!isNaN(newVal) && newVal >= 1 && newVal <= 10) {
                                            setGifDuration(newVal);
                                        }
                                    }}
                                    step={0.5}
                                    min={1}
                                    max={10}
                                    className="w-12 h-5 bg-transparent text-right font-mono text-zinc-500 focus:outline-none focus:text-zinc-900"
                                />
                            </div>
                            <Slider
                                min={1}
                                max={10}
                                step={0.5}
                                value={[gifDuration]}
                                onValueChange={(v) => setGifDuration(v[0])}
                                className="mb-2"
                            />
                            <button
                                onClick={handleExportGif}
                                disabled={isExporting}
                                className="w-full px-3 py-2 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-md flex items-center justify-center gap-2 transition-colors disabled:opacity-50 text-xs font-medium text-zinc-700"
                            >
                                <Download className="w-3.5 h-3.5" />
                                {isExporting ? 'Recording...' : 'Export GIF'}
                            </button>
                        </div>

                        <button
                            onClick={() => onExportWallpapers?.()}
                            className="w-full px-3 py-2 rounded-md flex items-center justify-center gap-2 transition-colors bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium mt-2"
                        >
                            <Monitor className="w-3.5 h-3.5" />
                            Export Wallpapers
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
