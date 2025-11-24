"use client";

import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { ColorPicker } from "@/components/ui/color-picker";
import { MosaicArtworkParams } from "./MosaicArtwork";
import { ChevronDown, ChevronRight, Download, Image as ImageIcon, Shuffle, Monitor } from "lucide-react";

interface MosaicControlsProps {
  params: MosaicArtworkParams;
  onParamChange: (param: keyof MosaicArtworkParams, value: number) => void;
  onColorChange: (param: keyof MosaicArtworkParams, value: string) => void;
  onExportImage: () => void;
  onExportWallpapers: () => void;
  onRandomize: () => void;
  onRegenerate: () => void;
}

interface ControlConfig {
  key: keyof MosaicArtworkParams;
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
    title: "Initial Rectangle",
    controls: [
      { key: "initialRectMinSize", label: "Min Size", min: 0.2, max: 0.8, step: 0.01 },
      { key: "initialRectMaxSize", label: "Max Size", min: 0.4, max: 1, step: 0.01 },
    ]
  },
  {
    title: "Division",
    controls: [
      { key: "gridDivisionChance", label: "Grid Chance", min: 0, max: 1, step: 0.01 },
      { key: "recursionChance", label: "Recursion", min: 0, max: 1, step: 0.01 },
      { key: "minRecursionSize", label: "Min Size", min: 20, max: 100, step: 1 },
    ]
  },
  {
    title: "Grid Settings",
    controls: [
      { key: "minGridRows", label: "Min Rows", min: 2, max: 6, step: 1 },
      { key: "maxGridRows", label: "Max Rows", min: 3, max: 10, step: 1 },
      { key: "minGridCols", label: "Min Cols", min: 2, max: 6, step: 1 },
      { key: "maxGridCols", label: "Max Cols", min: 3, max: 10, step: 1 },
    ]
  },
  {
    title: "Details",
    controls: [
      { key: "splitRatioMin", label: "Split Min", min: 0.1, max: 0.4, step: 0.01 },
      { key: "splitRatioMax", label: "Split Max", min: 0.6, max: 0.9, step: 0.01 },
      { key: "marginMultiplier", label: "Margin", min: 0.05, max: 0.3, step: 0.001 },
      { key: "detailGridMin", label: "Detail Min", min: 2, max: 4, step: 1 },
      { key: "detailGridMax", label: "Detail Max", min: 3, max: 6, step: 1 },
      { key: "noiseDensity", label: "Noise", min: 0, max: 0.3, step: 0.001 },
    ]
  },
];

export default function MosaicControls({ params, onParamChange, onColorChange, onExportImage, onExportWallpapers, onRandomize, onRegenerate }: MosaicControlsProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["Division", "Colors"]));

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
    <div className="h-full overflow-y-auto overflow-x-hidden bg-white text-zinc-900">
      {/* Control Buttons */}
      <div className="px-2 py-2 border-b border-zinc-200 space-y-1.5">
        <button
          onClick={onRegenerate}
          className="w-full px-2 py-1.5 bg-zinc-100 hover:bg-zinc-200 rounded flex items-center justify-center gap-1.5 transition-colors"
        >
          <Shuffle className="w-3.5 h-3.5" />
          Regenerate
        </button>
        <button
          onClick={onRandomize}
          className="w-full px-2 py-1.5 bg-cyan-600 hover:bg-cyan-500 rounded flex items-center justify-center gap-1.5 transition-colors"
        >
          <Shuffle className="w-3.5 h-3.5" />
          Randomize All
        </button>
      </div>

      {/* Collapsible Sections */}
      {sections.map((section) => {
        const isExpanded = expandedSections.has(section.title);
        return (
          <div key={section.title} className="border-b border-zinc-200">
            <button
              onClick={() => toggleSection(section.title)}
              className="w-full px-2 py-2 flex items-center justify-between hover:bg-zinc-50 transition-colors"
            >
              <span className="font-medium">{section.title}</span>
              {isExpanded ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>
            {isExpanded && (
              <div className="px-2 pb-2 space-y-1.5">
                {section.controls.map((config) => {
                  const value = params[config.key];
                  if (typeof value !== 'number') return null;
                  return (
                    <div key={config.key} className="flex items-center gap-1.5">
                      <span className="text-zinc-900 min-w-[75px] text-ellipsis overflow-hidden whitespace-nowrap flex-shrink-0">{config.label}</span>
                      <div className="flex-1 min-w-0">
                        <Slider
                          min={config.min}
                          max={config.max}
                          step={config.step}
                          value={[value]}
                          onValueChange={(values) => onParamChange(config.key, values[0])}
                        />
                      </div>
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
                        className="w-11 h-6 bg-zinc-100/80 border border-zinc-300 rounded px-1.5 text-zinc-900 font-mono text-right focus:outline-none focus:border-cyan-500 flex-shrink-0"
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
      <div className="border-b border-zinc-200">
        <button
          onClick={() => toggleSection("Colors")}
          className="w-full px-2 py-2 flex items-center justify-between hover:bg-zinc-50 transition-colors"
        >
          <span className="font-medium">Colors</span>
          {expandedSections.has("Colors") ? (
            <ChevronDown className="w-3.5 h-3.5" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5" />
          )}
        </button>
        {expandedSections.has("Colors") && (
          <div className="px-2 pb-2 space-y-1.5">
            {[
              { key: 'color1' as keyof MosaicArtworkParams, label: 'Color 1' },
              { key: 'color2' as keyof MosaicArtworkParams, label: 'Color 2' },
              { key: 'color3' as keyof MosaicArtworkParams, label: 'Color 3' },
              { key: 'color4' as keyof MosaicArtworkParams, label: 'Color 4' },
            ].map(({ key, label }) => {
              const value = params[key] as string;
              return (
                <div key={key} className="flex items-center gap-1.5">
                  <span className="text-zinc-900 min-w-[50px] flex-shrink-0">{label}</span>
                  <div className="w-14 flex-shrink-0">
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
                    className="flex-1 min-w-0 h-6 bg-zinc-100/80 border border-zinc-300 rounded px-1.5 text-zinc-900 font-mono focus:outline-none focus:border-cyan-500"
                    placeholder="#000000"
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Export Section */}
      <div className="border-b border-zinc-200">
        <button
          onClick={() => toggleSection("Export")}
          className="w-full px-2 py-2 flex items-center justify-between hover:bg-zinc-50 transition-colors"
        >
          <span className="font-medium">Export</span>
          {expandedSections.has("Export") ? (
            <ChevronDown className="w-3.5 h-3.5" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5" />
          )}
        </button>
        {expandedSections.has("Export") && (
          <div className="px-2 pb-2 space-y-2">
            <button
              onClick={onExportImage}
              className="w-full px-2 py-1.5 bg-zinc-100 hover:bg-zinc-200 rounded flex items-center justify-center gap-1.5 transition-colors"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              Export PNG
            </button>
            <button
              onClick={onExportWallpapers}
              className="w-full px-2 py-1.5 rounded flex items-center justify-center gap-1.5 transition-colors bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium"
            >
              <Monitor className="w-3.5 h-3.5" />
              Export Wallpapers (6K+Mobile)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
