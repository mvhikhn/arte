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
    <div className="h-full overflow-y-auto overflow-x-hidden bg-white text-zinc-900 text-xs no-scrollbar">
      {/* Control Buttons */}
      <div className="px-3 py-3 border-b border-zinc-100 flex gap-2">
        <button
          onClick={onRegenerate}
          className="flex-1 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 rounded-md flex items-center justify-center gap-1.5 transition-colors font-medium text-xs"
        >
          <Shuffle className="w-3 h-3" />
          Regenerate
        </button>
        <button
          onClick={onRandomize}
          className="flex-1 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-md flex items-center justify-center gap-1.5 transition-colors font-medium text-xs"
        >
          Randomize
        </button>
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
              <span className="font-semibold text-xs uppercase tracking-wider text-zinc-500">{section.title}</span>
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
          <span className="font-semibold text-xs uppercase tracking-wider text-zinc-500">Colors</span>
          {expandedSections.has("Colors") ? (
            <ChevronDown className="w-3 h-3 text-zinc-400" />
          ) : (
            <ChevronRight className="w-3 h-3 text-zinc-400" />
          )}
        </button>
        {expandedSections.has("Colors") && (
          <div className="px-3 pb-3 grid grid-cols-2 gap-2">
            {[
              { key: 'color1' as keyof MosaicArtworkParams, label: 'Color 1' },
              { key: 'color2' as keyof MosaicArtworkParams, label: 'Color 2' },
              { key: 'color3' as keyof MosaicArtworkParams, label: 'Color 3' },
              { key: 'color4' as keyof MosaicArtworkParams, label: 'Color 4' },
            ].map(({ key, label }) => {
              const value = params[key] as string;
              return (
                <div key={key} className="flex flex-col gap-1">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wide">{label}</span>
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
                      className="w-full h-6 bg-transparent font-mono text-[10px] text-zinc-700 focus:outline-none uppercase"
                      placeholder="#000000"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Export Section */}
      <div className="border-b border-zinc-100">
        <button
          onClick={() => toggleSection("Export")}
          className="w-full px-3 py-2 flex items-center justify-between hover:bg-zinc-50 transition-colors"
        >
          <span className="font-semibold text-xs uppercase tracking-wider text-zinc-500">Export</span>
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
