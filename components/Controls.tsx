"use client";

import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { ColorPicker } from "@/components/ui/color-picker";
import { ArtworkParams } from "./Artwork";
import { ChevronDown, ChevronRight, Play, Pause, Download, Image as ImageIcon, Shuffle, Monitor } from "lucide-react";

interface ControlsProps {
  params: ArtworkParams;
  onParamChange: (param: keyof ArtworkParams, value: number) => void;
  onColorChange: (param: keyof ArtworkParams, value: string) => void;
  onExportImage: () => void;
  onExportGif: (duration: number, fps: number) => void;
  onExportWallpapers: () => void;
  onToggleAnimation: () => void;
  onRandomize: () => void;
  onTokenChange?: (value: string) => void;
}

interface ControlConfig {
  key: keyof ArtworkParams;
  label: string;
  min: number;
  max: number;
  step: number;
  unit?: string;
}

interface Section {
  title: string;
  controls: ControlConfig[];
}

const sections: Section[] = [
  {
    title: "Basic Settings",
    controls: [
      { key: "numPoints", label: "Points", min: 50, max: 500, step: 1 },
    ]
  },
  {
    title: "Movement Settings",
    controls: [
      { key: "scaleValue", label: "Scale", min: 0.001, max: 0.02, step: 0.0001 },
      { key: "noiseSpeed", label: "Noise Speed", min: 0.0001, max: 0.002, step: 0.00001 },
      { key: "movementDistance", label: "Movement", min: 1, max: 20, step: 0.1 },
    ]
  },
  {
    title: "Distribution Settings",
    controls: [
      { key: "gaussianMean", label: "Mean", min: 0.1, max: 0.9, step: 0.01 },
      { key: "gaussianStd", label: "Std Dev", min: 0.05, max: 0.3, step: 0.001 },
    ]
  },
  {
    title: "Iteration Settings",
    controls: [
      { key: "minIterations", label: "Min Iter", min: 5, max: 50, step: 1 },
      { key: "maxIterations", label: "Max Iter", min: 10, max: 100, step: 1 },
    ]
  },
  {
    title: "Shape Settings",
    controls: [
      { key: "circleSize", label: "Circle Size", min: 1, max: 20, step: 0.1 },
      { key: "strokeWeightMin", label: "Stroke Min", min: 0.1, max: 5, step: 0.05 },
      { key: "strokeWeightMax", label: "Stroke Max", min: 0.5, max: 10, step: 0.1 },
    ]
  },
  {
    title: "Angle Settings",
    controls: [
      { key: "angleMultiplier1", label: "Angle Mult 1", min: 1, max: 30, step: 1 },
      { key: "angleMultiplier2", label: "Angle Mult 2", min: 1, max: 30, step: 1 },
    ]
  },
];

export default function Controls({ params, onParamChange, onColorChange, onExportImage, onExportGif, onExportWallpapers, onToggleAnimation, onRandomize, onTokenChange }: ControlsProps) {
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
    try {
      await onExportGif(gifDuration, gifFps);
      // Keep exporting state for the duration of the recording
      setTimeout(() => setIsExporting(false), (gifDuration + 2) * 1000);
    } catch (error) {
      setIsExporting(false);
    }
  };

  const formatValue = (value: number, step: number) => {
    if (step < 1) {
      return value.toFixed(step < 0.01 ? 4 : step < 0.1 ? 3 : 2);
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

      {/* Token Section - Only show if onTokenChange is provided */}
      {onTokenChange && params.token && (
        <div className="border-b border-zinc-100">
          <button
            onClick={() => toggleSection("Token")}
            className="w-full px-3 py-2 flex items-center justify-between hover:bg-zinc-50 transition-colors"
          >
            <span className="font-semibold text-xs tracking-wider text-zinc-500">TOKEN</span>
            {expandedSections.has("Token") ? (
              <ChevronDown className="w-3 h-3 text-zinc-400" />
            ) : (
              <ChevronRight className="w-3 h-3 text-zinc-400" />
            )}
          </button>
          {expandedSections.has("Token") && (
            <div className="px-3 pb-3 space-y-2">
              <span className="text-[10px] text-zinc-500 tracking-wide">Paste a saved token to reproduce artwork</span>
              <input
                type="text"
                value={params.token}
                onChange={(e) => onTokenChange(e.target.value)}
                className="w-full px-2 py-1.5 bg-zinc-50 border border-zinc-200 rounded-md font-mono text-[10px] text-zinc-600 focus:outline-none focus:border-zinc-400 focus:text-zinc-900 transition-colors"
                placeholder="fx-..."
              />
            </div>
          )}
        </div>
      )}

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

      {/* Color Palette Section */}
      <div className="border-b border-zinc-100">
        <button
          onClick={() => toggleSection("Color Palette")}
          className="w-full px-3 py-2 flex items-center justify-between hover:bg-zinc-50 transition-colors"
        >
          <span className="font-semibold text-xs tracking-wider text-zinc-500">Color Palette</span>
          {expandedSections.has("Color Palette") ? (
            <ChevronDown className="w-3 h-3 text-zinc-400" />
          ) : (
            <ChevronRight className="w-3 h-3 text-zinc-400" />
          )}
        </button>
        {expandedSections.has("Color Palette") && (
          <div className="px-3 pb-3 grid grid-cols-2 gap-2">
            {['color1', 'color2', 'color3', 'color4', 'color5'].map((colorKey, index) => {
              const value = params[colorKey as keyof ArtworkParams] as string;
              return (
                <div key={colorKey} className="flex flex-col gap-1">
                  <span className="text-[10px] text-zinc-500 tracking-wide">Color {index + 1}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full overflow-hidden border border-zinc-200 flex-shrink-0">
                      <ColorPicker
                        value={value}
                        onChange={(v) => onColorChange(colorKey as keyof ArtworkParams, v)}
                      />
                    </div>
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => {
                        const newVal = e.target.value;
                        if (/^#[0-9A-Fa-f]{0,6}$/.test(newVal)) {
                          onColorChange(colorKey as keyof ArtworkParams, newVal);
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
