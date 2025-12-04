"use client";

import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { ColorPicker } from "@/components/ui/color-picker";
import { GridArtworkParams } from "./GridArtwork";
import { ChevronDown, ChevronRight, Download, Image as ImageIcon, Shuffle, Play, Pause, Monitor } from "lucide-react";

interface GridControlsProps {
  params: GridArtworkParams;
  onParamChange: (param: keyof GridArtworkParams, value: number) => void;
  onColorChange: (param: keyof GridArtworkParams, value: string) => void;
  onExportImage: () => void;
  onExportGif: (duration: number, fps: number) => void;
  onExportWallpapers: () => void;
  onToggleAnimation: () => void;
  onRandomize: () => void;
  tokenInput?: string;
  onTokenChange?: (value: string) => void;
}

interface ControlConfig {
  key: keyof GridArtworkParams;
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
      { key: "minColumns", label: "Min Columns", min: 3, max: 8, step: 1 },
      { key: "maxColumns", label: "Max Columns", min: 6, max: 12, step: 1 },
      { key: "minModuleSize", label: "Min Module", min: 20, max: 100, step: 1 },
      { key: "maxDepth", label: "Max Depth", min: 1, max: 4, step: 1 },
      { key: "subdivideChance", label: "Subdivide", min: 0, max: 1, step: 0.01 },
    ]
  },
  {
    title: "Animation",
    controls: [
      { key: "animationSpeed", label: "Speed", min: 0.001, max: 0.15, step: 0.001 },
      { key: "crossSize", label: "Cross Size", min: 0.3, max: 1, step: 0.01 },
    ]
  },
];

export default function GridControls({ params, onParamChange, onColorChange, onExportImage, onExportGif, onExportWallpapers, onToggleAnimation, onRandomize, tokenInput, onTokenChange }: GridControlsProps) {
  const [gifDuration, setGifDuration] = useState(3);
  const [gifFps, setGifFps] = useState(30);
  const [isExporting, setIsExporting] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

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
    await onExportGif(gifDuration, gifFps);
    setIsExporting(false);
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
          onClick={onToggleAnimation}
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
          onClick={onRandomize}
          className="flex-1 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-md flex items-center justify-center gap-1.5 transition-colors font-medium text-xs"
        >
          <Shuffle className="w-3 h-3" />
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

      {/* Colors Section */}
      <div className="border-b border-zinc-100">
        <button
          onClick={() => toggleSection("Colors")}
          className="w-full px-3 py-2 flex items-center justify-between hover:bg-zinc-50 transition-colors"
        >
          <span className="font-semibold text-xs tracking-wider text-zinc-500">Colors</span>
          {expandedSections.has("Colors") ? (
            <ChevronDown className="w-3 h-3 text-zinc-400" />
          ) : (
            <ChevronRight className="w-3 h-3 text-zinc-400" />
          )}
        </button>
        {expandedSections.has("Colors") && (
          <div className="px-3 pb-3 grid grid-cols-2 gap-2">
            {[
              { key: 'backgroundColor' as keyof GridArtworkParams, label: 'Background' },
              { key: 'borderColor' as keyof GridArtworkParams, label: 'Border' },
              { key: 'color1' as keyof GridArtworkParams, label: 'Color 1' },
              { key: 'color2' as keyof GridArtworkParams, label: 'Color 2' },
              { key: 'color3' as keyof GridArtworkParams, label: 'Color 3' },
              { key: 'color4' as keyof GridArtworkParams, label: 'Color 4' },
            ].map(({ key, label }) => {
              const value = params[key] as string;
              return (
                <div key={key} className="flex flex-col gap-1">
                  <span className="text-[10px] text-zinc-500 tracking-wide">{label}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full overflow-hidden border border-zinc-200 flex-shrink-0">
                      <ColorPicker
                        value={value}
                        onChange={(v) => onColorChange(key, v)}
                      />
                    </div>
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => {
                        const newVal = e.target.value;
                        if (/^#[0-9A-Fa-f]{0,6}$/.test(newVal)) {
                          onColorChange(key, newVal);
                        }
                      }}
                      className="w-full h-6 bg-transparent font-mono text-[10px] text-zinc-700 focus:outline-none"
                      placeholder="#000000"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Canvas Section */}
      <div className="border-b border-zinc-100">
        <button
          onClick={() => toggleSection("Canvas")}
          className="w-full px-3 py-2 flex items-center justify-between hover:bg-zinc-50 transition-colors"
        >
          <span className="font-semibold text-xs tracking-wider text-zinc-500">Canvas</span>
          {expandedSections.has("Canvas") ? (
            <ChevronDown className="w-3 h-3 text-zinc-400" />
          ) : (
            <ChevronRight className="w-3 h-3 text-zinc-400" />
          )}
        </button>
        {expandedSections.has("Canvas") && (
          <div className="px-3 pb-3 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-zinc-500 tracking-wide">Width</span>
                  <span className="text-[10px] font-mono text-zinc-600">{params.canvasWidth}</span>
                </div>
                <Slider
                  value={[params.canvasWidth]}
                  onValueChange={([value]) => onParamChange('canvasWidth', value)}
                  min={400}
                  max={2500}
                  step={10}
                  className="w-full"
                />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-zinc-500 tracking-wide">Height</span>
                  <span className="text-[10px] font-mono text-zinc-600">{params.canvasHeight}</span>
                </div>
                <Slider
                  value={[params.canvasHeight]}
                  onValueChange={([value]) => onParamChange('canvasHeight', value)}
                  min={400}
                  max={2500}
                  step={10}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        )}
      </div>

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
              onClick={onExportWallpapers}
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
}
