"use client";

import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { ColorPicker } from "@/components/ui/color-picker";
import { GridArtworkParams } from "./GridArtwork";
import { ChevronDown, ChevronRight, Play, Pause, Download, Image, Shuffle } from "lucide-react";

interface GridControlsProps {
  params: GridArtworkParams;
  onParamChange: (param: keyof GridArtworkParams, value: number) => void;
  onColorChange: (param: keyof GridArtworkParams, value: string) => void;
  onExportImage: () => void;
  onExportGif: (duration: number, fps: number) => void;
  onToggleAnimation: () => void;
  onRandomize: () => void;
  darkMode?: boolean;
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

export default function GridControls({ params, onParamChange, onColorChange, onExportImage, onExportGif, onToggleAnimation, onRandomize, darkMode = false }: GridControlsProps) {
  const [gifDuration, setGifDuration] = useState(3);
  const [gifFps, setGifFps] = useState(30);
  const [isExporting, setIsExporting] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["Grid Settings", "Colors"]));

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
    <div className={`h-full overflow-y-auto overflow-x-hidden ${darkMode ? 'bg-zinc-900 text-zinc-100' : 'bg-white text-zinc-900'}`}>
      {/* Control Buttons */}
      <div className="px-2 py-2 border-b border-zinc-200 space-y-1.5">
        <button
          onClick={onToggleAnimation}
          className="w-full px-2 py-1.5 bg-zinc-100 hover:bg-zinc-200 rounded flex items-center justify-center gap-1.5 transition-colors"
        >
          {params.isAnimating ? (
            <>
              <Pause className="w-3.5 h-3.5" />
              Pause
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5" />
              Play
            </>
          )}
        </button>
        <button
          onClick={onRandomize}
          className="w-full px-2 py-1.5 bg-cyan-600 hover:bg-cyan-500 rounded flex items-center justify-center gap-1.5 transition-colors"
        >
          <Shuffle className="w-3.5 h-3.5" />
          Randomize
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
              { key: 'backgroundColor' as keyof GridArtworkParams, label: 'Background' },
              { key: 'borderColor' as keyof GridArtworkParams, label: 'Border' },
              { key: 'color1' as keyof GridArtworkParams, label: 'Color 1' },
              { key: 'color2' as keyof GridArtworkParams, label: 'Color 2' },
              { key: 'color3' as keyof GridArtworkParams, label: 'Color 3' },
              { key: 'color4' as keyof GridArtworkParams, label: 'Color 4' },
            ].map(({ key, label }) => {
              const value = params[key] as string;
              return (
                <div key={key} className="flex items-center gap-1.5">
                  <span className="text-zinc-900 min-w-[70px] flex-shrink-0">{label}</span>
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
              <Image className="w-3.5 h-3.5" />
              Export Image
            </button>
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-900 min-w-[75px] flex-shrink-0">GIF Duration</span>
              <div className="flex-1 min-w-0">
                <Slider
                  min={1}
                  max={10}
                  step={0.5}
                  value={[gifDuration]}
                  onValueChange={(v) => setGifDuration(v[0])}
                />
              </div>
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
                className="w-11 h-6 bg-zinc-100/80 border border-zinc-300 rounded px-1.5 text-zinc-900 font-mono text-right focus:outline-none focus:border-cyan-500 flex-shrink-0"
              />
            </div>
            <button
              onClick={handleExportGif}
              disabled={isExporting}
              className="w-full px-2 py-1.5 bg-zinc-100 hover:bg-zinc-200 disabled:opacity-50 rounded flex items-center justify-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              {isExporting ? 'Recording...' : 'Export GIF'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
