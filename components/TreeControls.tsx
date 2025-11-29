"use client";

import { useState } from "react";
import { TreeArtworkParams } from "./TreeArtwork";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";
import { ChevronDown, ChevronRight, Pause, Play, RefreshCw, Shuffle, Download, Image as ImageIcon, Monitor } from "lucide-react";

interface TreeControlsProps {
  params: TreeArtworkParams;
  onParamChange: (param: keyof TreeArtworkParams, value: number) => void;
  onColorChange: (param: keyof TreeArtworkParams, value: string) => void;
  onExportImage: () => void;
  onExportGif: (duration: number, fps: number) => void;
  onExportWallpapers: () => void;
  onToggleAnimation: () => void;
  onRandomize: () => void;
  onRegenerate: () => void;
}

export default function TreeControls({
  params,
  onParamChange,
  onColorChange,
  onExportImage,
  onExportGif,
  onExportWallpapers,
  onToggleAnimation,
  onRandomize,
  onRegenerate,
}: TreeControlsProps) {
  const [gifDuration, setGifDuration] = useState(5);
  const [gifFps, setGifFps] = useState(30);
  const [isExporting, setIsExporting] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["Tree Structure", "Visual"]));

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
      setTimeout(() => setIsExporting(false), (gifDuration + 1) * 1000);
    } catch (error) {
      console.error("GIF export failed:", error);
      setIsExporting(false);
    }
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
          onClick={onRegenerate}
          className="flex-1 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 rounded-md flex items-center justify-center gap-1.5 transition-colors font-medium text-xs"
        >
          <RefreshCw className="w-3 h-3" />
          Regenerate
        </button>
        <button
          onClick={onRandomize}
          className="flex-1 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-md flex items-center justify-center gap-1.5 transition-colors font-medium text-xs"
        >
          Randomize
        </button>
      </div>

      {/* Tree Structure Section */}
      <div className="border-b border-zinc-100">
        <button
          onClick={() => toggleSection("Tree Structure")}
          className="w-full px-3 py-2 flex items-center justify-between hover:bg-zinc-50 transition-colors"
        >
          <span className="font-semibold text-xs uppercase tracking-wider text-zinc-500">Tree Structure</span>
          {expandedSections.has("Tree Structure") ? (
            <ChevronDown className="w-3 h-3 text-zinc-400" />
          ) : (
            <ChevronRight className="w-3 h-3 text-zinc-400" />
          )}
        </button>
        {expandedSections.has("Tree Structure") && (
          <div className="px-3 pb-3 space-y-3">
            {[
              { key: 'initialPaths' as keyof TreeArtworkParams, label: 'Initial Branches', min: 1, max: 5, step: 1 },
              { key: 'initialVelocity' as keyof TreeArtworkParams, label: 'Initial Velocity', min: 5, max: 20, step: 0.5 },
              { key: 'branchProbability' as keyof TreeArtworkParams, label: 'Branch Probability', min: 0.05, max: 0.4, step: 0.01 },
              { key: 'diameterShrink' as keyof TreeArtworkParams, label: 'Diameter Shrink', min: 0.5, max: 0.8, step: 0.01 },
              { key: 'minDiameter' as keyof TreeArtworkParams, label: 'Min Diameter', min: 0.1, max: 1.0, step: 0.05 },
            ].map((config) => (
              <div key={config.key} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-700 font-medium">{config.label}</span>
                  <input
                    type="number"
                    value={formatValue(params[config.key] as number, config.step)}
                    onChange={(e) => onParamChange(config.key, parseFloat(e.target.value))}
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
                  value={[params[config.key] as number]}
                  onValueChange={(values) => onParamChange(config.key, values[0])}
                  className="py-1"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Movement Section */}
      <div className="border-b border-zinc-100">
        <button
          onClick={() => toggleSection("Movement")}
          className="w-full px-3 py-2 flex items-center justify-between hover:bg-zinc-50 transition-colors"
        >
          <span className="font-semibold text-xs uppercase tracking-wider text-zinc-500">Movement</span>
          {expandedSections.has("Movement") ? (
            <ChevronDown className="w-3 h-3 text-zinc-400" />
          ) : (
            <ChevronRight className="w-3 h-3 text-zinc-400" />
          )}
        </button>
        {expandedSections.has("Movement") && (
          <div className="px-3 pb-3 space-y-3">
            {[
              { key: 'bumpMultiplier' as keyof TreeArtworkParams, label: 'Bump Strength', min: 0.1, max: 0.5, step: 0.01 },
              { key: 'velocityRetention' as keyof TreeArtworkParams, label: 'Velocity Retention', min: 0.5, max: 0.95, step: 0.01 },
              { key: 'speedMin' as keyof TreeArtworkParams, label: 'Speed Min', min: 3, max: 8, step: 0.5 },
              { key: 'speedMax' as keyof TreeArtworkParams, label: 'Speed Max', min: 8, max: 15, step: 0.5 },
            ].map((config) => (
              <div key={config.key} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-700 font-medium">{config.label}</span>
                  <input
                    type="number"
                    value={formatValue(params[config.key] as number, config.step)}
                    onChange={(e) => onParamChange(config.key, parseFloat(e.target.value))}
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
                  value={[params[config.key] as number]}
                  onValueChange={(values) => onParamChange(config.key, values[0])}
                  className="py-1"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Visual Section */}
      <div className="border-b border-zinc-100">
        <button
          onClick={() => toggleSection("Visual")}
          className="w-full px-3 py-2 flex items-center justify-between hover:bg-zinc-50 transition-colors"
        >
          <span className="font-semibold text-xs uppercase tracking-wider text-zinc-500">Visual</span>
          {expandedSections.has("Visual") ? (
            <ChevronDown className="w-3 h-3 text-zinc-400" />
          ) : (
            <ChevronRight className="w-3 h-3 text-zinc-400" />
          )}
        </button>
        {expandedSections.has("Visual") && (
          <div className="px-3 pb-3 space-y-3">
            {[
              { key: 'finishedCircleSize' as keyof TreeArtworkParams, label: 'Tip Circle Size', min: 5, max: 20, step: 0.5 },
              { key: 'strokeWeightMultiplier' as keyof TreeArtworkParams, label: 'Stroke Weight', min: 0.5, max: 2.0, step: 0.05 },
            ].map((config) => (
              <div key={config.key} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-700 font-medium">{config.label}</span>
                  <input
                    type="number"
                    value={formatValue(params[config.key] as number, config.step)}
                    onChange={(e) => onParamChange(config.key, parseFloat(e.target.value))}
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
                  value={[params[config.key] as number]}
                  onValueChange={(values) => onParamChange(config.key, values[0])}
                  className="py-1"
                />
              </div>
            ))}
          </div>
        )}
      </div>

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
          <div className="px-3 pb-3 space-y-3">
            <div className="space-y-1">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wide">Background</span>
              <div className="flex items-center gap-2">
                <div className="w-full h-6 rounded border border-zinc-200 overflow-hidden" style={{ backgroundColor: params.backgroundColor }}>
                  <input
                    type="color"
                    value={params.backgroundColor}
                    onChange={(e) => onColorChange("backgroundColor", e.target.value)}
                    className="w-full h-full opacity-0 cursor-pointer"
                    style={{ backgroundColor: params.backgroundColor }}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wide">Stem Colors</span>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((i) => {
                  const paramKey = `stemColor${i}` as keyof TreeArtworkParams;
                  return (
                    <div key={paramKey} className="h-6 rounded border border-zinc-200 overflow-hidden relative">
                      <div className="absolute inset-0" style={{ backgroundColor: params[paramKey] as string }} />
                      <input
                        type="color"
                        value={params[paramKey] as string}
                        onChange={(e) => onColorChange(paramKey, e.target.value)}
                        className="w-full h-full opacity-0 cursor-pointer relative z-10"
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wide">Tip Colors</span>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((i) => {
                  const paramKey = `tipColor${i}` as keyof TreeArtworkParams;
                  return (
                    <div key={paramKey} className="h-6 rounded border border-zinc-200 overflow-hidden relative">
                      <div className="absolute inset-0" style={{ backgroundColor: params[paramKey] as string }} />
                      <input
                        type="color"
                        value={params[paramKey] as string}
                        onChange={(e) => onColorChange(paramKey, e.target.value)}
                        className="w-full h-full opacity-0 cursor-pointer relative z-10"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Background Section */}
      <div className="border-b border-zinc-100">
        <button
          onClick={() => toggleSection("Background")}
          className="w-full px-3 py-2 flex items-center justify-between hover:bg-zinc-50 transition-colors"
        >
          <span className="font-semibold text-xs uppercase tracking-wider text-zinc-500">Background</span>
          {expandedSections.has("Background") ? (
            <ChevronDown className="w-3 h-3 text-zinc-400" />
          ) : (
            <ChevronRight className="w-3 h-3 text-zinc-400" />
          )}
        </button>
        {expandedSections.has("Background") && (
          <div className="px-3 pb-3 space-y-3">
            {/* Background Color */}
            <div className="space-y-1">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wide">Background Color</span>
              <div className="flex items-center gap-2">
                <div className="w-full h-6 rounded border border-zinc-200 overflow-hidden relative">
                  <div className="absolute inset-0" style={{ backgroundColor: params.backgroundColor }} />
                  <input
                    type="color"
                    value={params.backgroundColor}
                    onChange={(e) => onColorChange('backgroundColor', e.target.value)}
                    className="w-full h-full cursor-pointer opacity-0 relative z-10"
                  />
                </div>
                <input
                  type="text"
                  value={params.backgroundColor}
                  onChange={(e) => onColorChange('backgroundColor', e.target.value)}
                  className="w-20 px-2 py-1 bg-zinc-50 border border-zinc-200 rounded text-[10px] font-mono focus:outline-none focus:border-zinc-400"
                />
              </div>
            </div>

            {/* Background Image */}
            <div className="space-y-1">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wide">Background Image</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      if (event.target?.result) {
                        onColorChange('backgroundImage', event.target.result as string);
                      }
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                className="w-full text-[10px] text-zinc-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[10px] file:font-medium file:bg-zinc-100 file:text-zinc-700 hover:file:bg-zinc-200"
              />
              {params.backgroundImage && (
                <button
                  onClick={() => onColorChange('backgroundImage', '')}
                  className="text-[10px] text-red-500 hover:text-red-600 underline"
                >
                  Remove Image
                </button>
              )}
            </div>

            {/* Background Scale */}
            {params.backgroundImage && (
              <div className="space-y-1">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wide">Image Scale</span>
                <div className="flex gap-1">
                  {['cover', 'contain'].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => onColorChange('backgroundScale', mode)}
                      className={`flex-1 py-1 text-[10px] rounded border ${params.backgroundScale === mode
                        ? 'bg-zinc-900 text-white border-zinc-900'
                        : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300'
                        }`}
                    >
                      {mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Text Overlay Section */}
      <div className="border-b border-zinc-100">
        <button
          onClick={() => toggleSection("Text Overlay")}
          className="w-full px-3 py-2 flex items-center justify-between hover:bg-zinc-50 transition-colors"
        >
          <span className="font-semibold text-xs uppercase tracking-wider text-zinc-500">Text Overlay</span>
          {expandedSections.has("Text Overlay") ? (
            <ChevronDown className="w-3 h-3 text-zinc-400" />
          ) : (
            <ChevronRight className="w-3 h-3 text-zinc-400" />
          )}
        </button>
        {expandedSections.has("Text Overlay") && (
          <div className="px-3 pb-3 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-zinc-700 font-medium">Enable Overlay</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={params.textEnabled}
                  onChange={(e) => onParamChange("textEnabled", e.target.checked ? 1 : 0)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-zinc-900"></div>
              </label>
            </div>

            {params.textEnabled && (
              <>
                <textarea
                  value={params.textContent}
                  onChange={(e) => onColorChange('textContent', e.target.value)}
                  placeholder="Enter text..."
                  className="w-full h-24 px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-md resize-none text-xs focus:outline-none focus:border-zinc-400 font-sans"
                />
                {/* Font URL Input */}
                <div className="space-y-1">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wide">Font URL (Google Fonts, etc.)</span>
                  <input
                    type="text"
                    value={params.fontUrl || ''}
                    onChange={(e) => {
                      const url = e.target.value;
                      onColorChange('fontUrl', url);
                      // Extract font family name from URL if possible
                      const match = url.match(/family=([^&]*)/);
                      const family = match ? decodeURIComponent(match[1].replace(/\+/g, ' ')) : '';
                      onColorChange('customFontFamily', family);
                    }}
                    placeholder="https://fonts.googleapis.com/css2?family=..."
                    className="w-full px-2 py-1 bg-zinc-50 border border-zinc-200 rounded text-xs focus:outline-none focus:border-zinc-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wide">Font Family</span>
                    <select
                      value={params.fontFamily}
                      onChange={(e) => onColorChange("fontFamily" as any, e.target.value)}
                      className="w-full px-2 py-1 bg-zinc-50 border border-zinc-200 rounded text-xs"
                    >
                      <option value="Georgia, serif">Georgia</option>
                      <option value="'Times New Roman', serif">Times New Roman</option>
                      <option value="'Courier New', monospace">Courier</option>
                      <option value="Arial, sans-serif">Arial</option>
                      <option value="Verdana, sans-serif">Verdana</option>
                      {params.fontUrl && <option value="custom">Custom (from URL)</option>}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wide">Text Color</span>
                    <div className="flex items-center gap-2 h-[26px]">
                      <div className="w-6 h-6 rounded border border-zinc-200 overflow-hidden flex-shrink-0 relative">
                        <div className="absolute inset-0" style={{ backgroundColor: params.textColor }} />
                        <input
                          type="color"
                          value={params.textColor}
                          onChange={(e) => onColorChange("textColor" as any, e.target.value)}
                          className="w-full h-full opacity-0 cursor-pointer relative z-10"
                        />
                      </div>
                      <input
                        type="text"
                        value={params.textColor}
                        onChange={(e) => onColorChange("textColor" as any, e.target.value)}
                        className="w-full h-full px-2 bg-zinc-50 border border-zinc-200 rounded text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wide">Size</span>
                    <input
                      type="number"
                      value={params.fontSize}
                      onChange={(e) => onParamChange("fontSize", Number(e.target.value))}
                      className="w-full px-2 py-1 bg-zinc-50 border border-zinc-200 rounded text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wide">Line Height</span>
                    <input
                      type="number"
                      step="0.1"
                      value={params.lineHeight}
                      onChange={(e) => onParamChange("lineHeight", Number(e.target.value))}
                      className="w-full px-2 py-1 bg-zinc-50 border border-zinc-200 rounded text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wide">Alignment</span>
                  <div className="flex bg-zinc-100 p-1 rounded-md">
                    {['left', 'center', 'right'].map((align) => (
                      <button
                        key={align}
                        onClick={() => onColorChange("textAlign" as any, align)}
                        className={`flex-1 py-1 text-[10px] uppercase font-medium rounded-sm transition-colors ${params.textAlign === align
                          ? 'bg-white shadow-sm text-zinc-900'
                          : 'text-zinc-500 hover:text-zinc-700'
                          }`}
                      >
                        {align}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wide">Position X</span>
                    <span className="text-[10px] text-zinc-400 font-mono">{Math.round(params.textX)}</span>
                  </div>
                  <Slider
                    min={0}
                    max={800} // Assuming canvas width is 800
                    step={1}
                    value={[params.textX]}
                    onValueChange={(values) => onParamChange("textX", values[0])}
                    className="py-1"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wide">Position Y</span>
                    <span className="text-[10px] text-zinc-400 font-mono">{Math.round(params.textY)}</span>
                  </div>
                  <Slider
                    min={0}
                    max={1000} // Assuming canvas height is 1000
                    step={1}
                    value={[params.textY]}
                    onValueChange={(values) => onParamChange("textY", values[0])}
                    className="py-1"
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-zinc-50">
                  <span className="text-zinc-700 font-medium">Paper Grain</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={params.paperGrain}
                      onChange={(e) => onParamChange("paperGrain", e.target.checked ? 1 : 0)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-zinc-900"></div>
                  </label>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Canvas Section */}
      <div className="border-b border-zinc-100">
        <button
          onClick={() => toggleSection("Canvas")}
          className="w-full px-3 py-2 flex items-center justify-between hover:bg-zinc-50 transition-colors"
        >
          <span className="font-semibold text-xs uppercase tracking-wider text-zinc-500">Canvas</span>
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
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wide">Width</span>
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
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wide">Height</span>
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
