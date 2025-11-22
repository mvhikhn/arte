"use client";

import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { ColorPicker } from "@/components/ui/color-picker";
import { ArtworkParams } from "./Artwork";
import { ChevronDown, ChevronRight, Play, Pause, Download, Image, Shuffle } from "lucide-react";

interface ControlsProps {
  params: ArtworkParams;
  onParamChange: (param: keyof ArtworkParams, value: number) => void;
  onColorChange: (param: keyof ArtworkParams, value: string) => void;
  onExportImage: () => void;
  onExportGif: (duration: number, fps: number) => void;
  onToggleAnimation: () => void;
  onRandomize: () => void;
  darkMode?: boolean;
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

export default function Controls({ params, onParamChange, onColorChange, onExportImage, onExportGif, onToggleAnimation, onRandomize, darkMode = false }: ControlsProps) {
  const [gifDuration, setGifDuration] = useState(3);
  const [gifFps, setGifFps] = useState(30);
  const [isExporting, setIsExporting] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["Basic Settings", "Color Palette"]));

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
    <div className={`h-full overflow-y-auto overflow-x-hidden ${darkMode ? 'bg-zinc-900 text-zinc-100' : 'bg-white text-zinc-900'}`}>
      {/* Control Buttons */}
      <div className={`px-2 py-2 space-y-1.5 ${darkMode ? 'border-b border-zinc-700' : 'border-b border-zinc-200'}`}>
        <button
          onClick={onToggleAnimation}
          className={`w-full px-2 py-1.5 rounded flex items-center justify-center gap-1.5 transition-colors ${darkMode ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-100' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-900'}`}
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
          className="w-full px-2 py-1.5 bg-cyan-500 hover:bg-cyan-600 text-white rounded flex items-center justify-center gap-1.5 transition-colors"
        >
          <Shuffle className="w-3.5 h-3.5" />
          Randomize
        </button>
      </div>

      {/* Collapsible Sections */}
      {sections.map((section) => {
        const isExpanded = expandedSections.has(section.title);
        return (
          <div key={section.title} className={`${darkMode ? 'border-b border-zinc-700' : 'border-b border-zinc-200'}`}>
            <button
              onClick={() => toggleSection(section.title)}
              className={`w-full px-2 py-2 flex items-center justify-between transition-colors ${darkMode ? 'hover:bg-zinc-800' : 'hover:bg-zinc-50'}`}
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
                      <span className={`min-w-[75px] text-ellipsis overflow-hidden whitespace-nowrap flex-shrink-0 text-[13px] ${darkMode ? 'text-zinc-300' : 'text-zinc-700'}`}>{config.label}</span>
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
                        className={`w-11 h-6 rounded px-1.5 font-mono text-right focus:outline-none focus:border-cyan-500 flex-shrink-0 ${darkMode ? 'bg-zinc-800 border border-zinc-600 text-zinc-100' : 'bg-zinc-50 border border-zinc-300 text-zinc-900'}`}
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
      <div className={`${darkMode ? 'border-b border-zinc-700' : 'border-b border-zinc-200'}`}>
        <button
          onClick={() => toggleSection("Color Palette")}
          className={`w-full px-2 py-2 flex items-center justify-between transition-colors ${darkMode ? 'hover:bg-zinc-800' : 'hover:bg-zinc-50'}`}
        >
          <span className="font-medium">Color Palette</span>
          {expandedSections.has("Color Palette") ? (
            <ChevronDown className="w-3.5 h-3.5" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5" />
          )}
        </button>
        {expandedSections.has("Color Palette") && (
          <div className="px-2 pb-2 space-y-1.5">
            {['color1', 'color2', 'color3', 'color4', 'color5'].map((colorKey, index) => {
              const value = params[colorKey as keyof ArtworkParams] as string;
              return (
                <div key={colorKey} className="flex items-center gap-1.5">
                  <span className={`min-w-[50px] flex-shrink-0 text-[13px] ${darkMode ? 'text-zinc-300' : 'text-zinc-700'}`}>Color {index + 1}</span>
                  <div className="w-14 flex-shrink-0">
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
                    className={`flex-1 min-w-0 h-6 rounded px-1.5 font-mono text-[13px] focus:outline-none focus:border-cyan-500 ${darkMode ? 'bg-zinc-800 border border-zinc-600 text-zinc-100' : 'bg-zinc-50 border border-zinc-300 text-zinc-900'}`}
                    placeholder="#000000"
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Export Section */}
      <div className={`${darkMode ? 'border-b border-zinc-700' : 'border-b border-zinc-200'}`}>
        <button
          onClick={() => toggleSection("Export")}
          className={`w-full px-2 py-2 flex items-center justify-between transition-colors ${darkMode ? 'hover:bg-zinc-800' : 'hover:bg-zinc-50'}`}
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
            <div className="flex items-center gap-1.5">
              <span className={`min-w-[50px] flex-shrink-0 ${darkMode ? 'text-zinc-300' : 'text-zinc-700'}`}>Size</span>
              <input
                type="number"
                value={params.exportWidth}
                onChange={(e) => onParamChange('exportWidth', parseInt(e.target.value) || 800)}
                className={`w-16 px-1.5 py-1 rounded outline-none h-6 ${darkMode ? 'bg-zinc-800 border border-zinc-600 text-zinc-100' : 'bg-zinc-50 border border-zinc-300 text-zinc-900'}`}
              />
              <span className={darkMode ? 'text-zinc-300' : 'text-zinc-700'}>×</span>
              <input
                type="number"
                value={params.exportHeight}
                onChange={(e) => onParamChange('exportHeight', parseInt(e.target.value) || 1000)}
                className={`w-16 px-1.5 py-1 rounded outline-none h-6 ${darkMode ? 'bg-zinc-800 border border-zinc-600 text-zinc-100' : 'bg-zinc-50 border border-zinc-300 text-zinc-900'}`}
              />
            </div>
            <button
              onClick={onExportImage}
              className={`w-full px-2 py-1.5 rounded flex items-center justify-center gap-1.5 transition-colors ${darkMode ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-100' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-900'}`}
            >
              <Image className="w-3.5 h-3.5" />
              Export Image
            </button>
            <div className="flex items-center gap-1.5">
              <span className={`min-w-[75px] flex-shrink-0 ${darkMode ? 'text-zinc-300' : 'text-zinc-700'}`}>GIF Duration</span>
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
                className={`w-11 h-6 rounded px-1.5 font-mono text-right focus:outline-none focus:border-cyan-500 flex-shrink-0 ${darkMode ? 'bg-zinc-800 border border-zinc-600 text-zinc-100' : 'bg-zinc-50 border border-zinc-300 text-zinc-900'}`}
              />
            </div>
            <button
              onClick={handleExportGif}
              disabled={isExporting}
              className={`w-full px-2 py-1.5 disabled:opacity-50 rounded flex items-center justify-center gap-1.5 transition-colors ${darkMode ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-100' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-900'}`}
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
