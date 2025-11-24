"use client";

import { useState } from "react";
import { TreeArtworkParams } from "./TreeArtwork";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";
import { Download, RefreshCw, Play, Pause, Image as ImageIcon, Monitor } from "lucide-react";

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
  
  const textClass = "text-zinc-700";
  const borderClass = "border-zinc-200";

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

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className={`text-lg font-semibold ${textClass}`}>Tree Growth</h2>
        <div className="flex gap-2">
          <button
            onClick={onToggleAnimation}
            className={`p-2 border rounded transition-colors ${borderClass} hover:bg-zinc-100 text-zinc-600`}
            title={params.isAnimating ? "Pause" : "Play"}
          >
            {params.isAnimating ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={onRegenerate}
            className={`p-2 border rounded transition-colors ${borderClass} hover:bg-zinc-100 text-zinc-600`}
            title="Regenerate"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Export & Randomize Section */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <button
            onClick={onExportImage}
            className={`flex-1 px-3 py-2 border rounded transition-colors flex items-center justify-center gap-2 ${borderClass} bg-white hover:bg-zinc-50 text-zinc-700`}
            title="Export PNG"
          >
            <ImageIcon className="w-4 h-4" />
            <span className="text-sm">PNG</span>
          </button>
          <button
            onClick={handleExportGif}
            disabled={isExporting}
            className={`flex-1 px-3 py-2 border rounded transition-colors flex items-center justify-center gap-2 ${borderClass} ${
              isExporting
                ? "opacity-50 cursor-not-allowed"
                : "bg-white hover:bg-zinc-50 text-zinc-700"
            }`}
            title="Export GIF"
          >
            <Download className="w-4 h-4" />
            <span className="text-sm">{isExporting ? "Recording..." : "GIF"}</span>
          </button>
        </div>

        <button
          onClick={onExportWallpapers}
          className="w-full px-4 py-2 rounded transition-colors bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium flex items-center justify-center gap-2"
        >
          <Monitor className="w-4 h-4" />
          Export Wallpapers (6K+Mobile)
        </button>

        <div className="flex gap-2">
        </div>

        {/* GIF Settings */}
        <div className="space-y-2">
          <div className="flex gap-2 items-center">
            <Label className={`text-xs ${textClass} flex-shrink-0`}>Duration (s):</Label>
            <input
              type="number"
              value={gifDuration}
              onChange={(e) => setGifDuration(Number(e.target.value))}
              min={1}
              max={10}
              className={`flex-1 px-2 py-1 text-xs border rounded ${borderClass} bg-white text-zinc-900`}
            />
            <Label className={`text-xs ${textClass} flex-shrink-0`}>FPS:</Label>
            <input
              type="number"
              value={gifFps}
              onChange={(e) => setGifFps(Number(e.target.value))}
              min={10}
              max={60}
              className={`flex-1 px-2 py-1 text-xs border rounded ${borderClass} bg-white text-zinc-900`}
            />
          </div>
        </div>

        <button
          onClick={onRandomize}
          className={`w-full px-4 py-2 border rounded transition-colors ${borderClass} bg-white hover:bg-zinc-50 text-zinc-700`}
        >
          Randomize All
        </button>
      </div>

      {/* Tree Structure */}
      <div className="space-y-3">
        <Label className={textClass}>Tree Structure</Label>
        
        <div className="space-y-2">
          <Label className={`text-xs ${textClass}`}>Initial Branches: {params.initialPaths}</Label>
          <Slider
            value={[params.initialPaths]}
            onValueChange={(value) => onParamChange("initialPaths", value[0])}
            min={1}
            max={5}
            step={1}
          />
        </div>

        <div className="space-y-2">
          <Label className={`text-xs ${textClass}`}>Initial Velocity: {params.initialVelocity.toFixed(1)}</Label>
          <Slider
            value={[params.initialVelocity]}
            onValueChange={(value) => onParamChange("initialVelocity", value[0])}
            min={5}
            max={20}
            step={0.5}
          />
        </div>

        <div className="space-y-2">
          <Label className={`text-xs ${textClass}`}>Branch Probability: {params.branchProbability.toFixed(2)}</Label>
          <Slider
            value={[params.branchProbability]}
            onValueChange={(value) => onParamChange("branchProbability", value[0])}
            min={0.05}
            max={0.4}
            step={0.01}
          />
        </div>

        <div className="space-y-2">
          <Label className={`text-xs ${textClass}`}>Diameter Shrink: {params.diameterShrink.toFixed(2)}</Label>
          <Slider
            value={[params.diameterShrink]}
            onValueChange={(value) => onParamChange("diameterShrink", value[0])}
            min={0.5}
            max={0.8}
            step={0.01}
          />
        </div>

        <div className="space-y-2">
          <Label className={`text-xs ${textClass}`}>Min Diameter: {params.minDiameter.toFixed(2)}</Label>
          <Slider
            value={[params.minDiameter]}
            onValueChange={(value) => onParamChange("minDiameter", value[0])}
            min={0.1}
            max={1.0}
            step={0.05}
          />
        </div>
      </div>

      {/* Movement Settings */}
      <div className="space-y-3">
        <Label className={textClass}>Movement</Label>
        
        <div className="space-y-2">
          <Label className={`text-xs ${textClass}`}>Bump Strength: {params.bumpMultiplier.toFixed(2)}</Label>
          <Slider
            value={[params.bumpMultiplier]}
            onValueChange={(value) => onParamChange("bumpMultiplier", value[0])}
            min={0.1}
            max={0.5}
            step={0.01}
          />
        </div>

        <div className="space-y-2">
          <Label className={`text-xs ${textClass}`}>Velocity Retention: {params.velocityRetention.toFixed(2)}</Label>
          <Slider
            value={[params.velocityRetention]}
            onValueChange={(value) => onParamChange("velocityRetention", value[0])}
            min={0.5}
            max={0.95}
            step={0.01}
          />
        </div>

        <div className="space-y-2">
          <Label className={`text-xs ${textClass}`}>Speed Min: {params.speedMin.toFixed(1)}</Label>
          <Slider
            value={[params.speedMin]}
            onValueChange={(value) => onParamChange("speedMin", value[0])}
            min={3}
            max={8}
            step={0.5}
          />
        </div>

        <div className="space-y-2">
          <Label className={`text-xs ${textClass}`}>Speed Max: {params.speedMax.toFixed(1)}</Label>
          <Slider
            value={[params.speedMax]}
            onValueChange={(value) => onParamChange("speedMax", value[0])}
            min={8}
            max={15}
            step={0.5}
          />
        </div>
      </div>

      {/* Visual Settings */}
      <div className="space-y-3">
        <Label className={textClass}>Visual</Label>
        
        <div className="space-y-2">
          <Label className={`text-xs ${textClass}`}>Tip Circle Size: {params.finishedCircleSize.toFixed(1)}</Label>
          <Slider
            value={[params.finishedCircleSize]}
            onValueChange={(value) => onParamChange("finishedCircleSize", value[0])}
            min={5}
            max={20}
            step={0.5}
          />
        </div>

        <div className="space-y-2">
          <Label className={`text-xs ${textClass}`}>Stroke Weight: {params.strokeWeightMultiplier.toFixed(2)}</Label>
          <Slider
            value={[params.strokeWeightMultiplier]}
            onValueChange={(value) => onParamChange("strokeWeightMultiplier", value[0])}
            min={0.5}
            max={2.0}
            step={0.05}
          />
        </div>
      </div>

      {/* Stem Colors (Darker) */}
      <div className="space-y-3">
        <Label className={textClass}>Stem Colors (Base/Dark)</Label>
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map((i) => {
            const paramKey = `stemColor${i}` as keyof TreeArtworkParams;
            return (
              <input
                key={paramKey}
                type="color"
                value={params[paramKey] as string}
                onChange={(e) => onColorChange(paramKey, e.target.value)}
                className="w-full h-10 rounded cursor-pointer"
              />
            );
          })}
        </div>
      </div>

      {/* Tip Colors (Lighter) */}
      <div className="space-y-3">
        <Label className={textClass}>Tip Colors (Branch/Light)</Label>
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map((i) => {
            const paramKey = `tipColor${i}` as keyof TreeArtworkParams;
            return (
              <input
                key={paramKey}
                type="color"
                value={params[paramKey] as string}
                onChange={(e) => onColorChange(paramKey, e.target.value)}
                className="w-full h-10 rounded cursor-pointer"
              />
            );
          })}
        </div>
      </div>

      {/* Background Color */}
      <div className="space-y-3">
        <Label className={textClass}>Background Color</Label>
        <input
          type="color"
          value={params.backgroundColor}
          onChange={(e) => onColorChange("backgroundColor", e.target.value)}
          className="w-full h-10 rounded cursor-pointer"
        />
      </div>

      {/* Text/Poem Section */}
      <div className="space-y-3 border-t border-zinc-200 pt-6">
        <div className="flex items-center justify-between">
          <Label className={textClass}>Poem / Letter Overlay</Label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={params.textEnabled}
              onChange={(e) => onParamChange("textEnabled", e.target.checked ? 1 : 0)}
              className="w-4 h-4"
            />
            <span className="text-xs text-zinc-600">Enable</span>
          </label>
        </div>

        {params.textEnabled && (
          <>
            <div className="space-y-2">
              <Label className={`text-xs ${textClass}`}>Your Text</Label>
              <textarea
                value={params.textContent}
                onChange={(e) => {
                  const newParams = { ...params, textContent: e.target.value };
                  onColorChange("textContent" as any, e.target.value);
                }}
                placeholder="Enter your poem or letter here...&#10;Line breaks will be preserved"
                className="w-full h-32 px-3 py-2 border border-zinc-300 rounded resize-none text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                style={{ fontFamily: params.fontFamily }}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className={`text-xs ${textClass}`}>Font Size: {params.fontSize}px</Label>
                <Slider
                  value={[params.fontSize]}
                  onValueChange={(value) => onParamChange("fontSize", value[0])}
                  min={12}
                  max={48}
                  step={1}
                />
              </div>

              <div className="space-y-2">
                <Label className={`text-xs ${textClass}`}>Line Height: {params.lineHeight}</Label>
                <Slider
                  value={[params.lineHeight]}
                  onValueChange={(value) => onParamChange("lineHeight", value[0])}
                  min={1.0}
                  max={2.5}
                  step={0.1}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className={`text-xs ${textClass}`}>Font Family</Label>
              <select
                value={params.fontFamily}
                onChange={(e) => onColorChange("fontFamily" as any, e.target.value)}
                className="w-full px-3 py-2 border border-zinc-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="Georgia, serif">Georgia (Serif)</option>
                <option value="'Times New Roman', serif">Times New Roman</option>
                <option value="'Courier New', monospace">Courier (Typewriter)</option>
                <option value="Arial, sans-serif">Arial (Sans-serif)</option>
                <option value="'Brush Script MT', cursive">Brush Script (Handwritten)</option>
                <option value="Garamond, serif">Garamond</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label className={`text-xs ${textClass}`}>Text Alignment</Label>
              <div className="flex gap-2">
                {(['left', 'center', 'right'] as const).map((align) => (
                  <button
                    key={align}
                    onClick={() => onColorChange("textAlign" as any, align)}
                    className={`flex-1 px-3 py-2 border rounded text-xs transition-colors ${
                      params.textAlign === align
                        ? 'bg-cyan-500 text-white border-cyan-500'
                        : 'bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-50'
                    }`}
                  >
                    {align.charAt(0).toUpperCase() + align.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className={`text-xs ${textClass}`}>X Position: {params.textX}</Label>
                <Slider
                  value={[params.textX]}
                  onValueChange={(value) => onParamChange("textX", value[0])}
                  min={50}
                  max={750}
                  step={10}
                />
              </div>

              <div className="space-y-2">
                <Label className={`text-xs ${textClass}`}>Y Position: {params.textY}</Label>
                <Slider
                  value={[params.textY]}
                  onValueChange={(value) => onParamChange("textY", value[0])}
                  min={30}
                  max={500}
                  step={10}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className={`text-xs ${textClass}`}>Text Color</Label>
              <input
                type="color"
                value={params.textColor}
                onChange={(e) => onColorChange("textColor", e.target.value)}
                className="w-full h-10 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <Label className={`text-xs ${textClass}`}>Paper Grain Effect</Label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={params.paperGrain}
                  onChange={(e) => onParamChange("paperGrain", e.target.checked ? 1 : 0)}
                  className="w-4 h-4"
                />
                <span className="text-xs text-zinc-600">Enable</span>
              </label>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
