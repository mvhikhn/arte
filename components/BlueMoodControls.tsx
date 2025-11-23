"use client";

import { useState } from "react";
import { BlueMoodArtworkParams } from "./BlueMoodArtwork";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";
import { Download, RefreshCw, Play, Pause, Image as ImageIcon } from "lucide-react";

interface BlueMoodControlsProps {
  params: BlueMoodArtworkParams;
  onParamChange: (param: keyof BlueMoodArtworkParams, value: number) => void;
  onColorChange: (param: keyof BlueMoodArtworkParams, value: string) => void;
  onExportImage: () => void;
  onExportGif: (duration: number, fps: number) => void;
  onToggleAnimation: () => void;
  onRandomize: () => void;
  onRegenerate: () => void;
  darkMode: boolean;
}

export default function BlueMoodControls({
  params,
  onParamChange,
  onColorChange,
  onExportImage,
  onExportGif,
  onToggleAnimation,
  onRandomize,
  onRegenerate,
  darkMode,
}: BlueMoodControlsProps) {
  const [gifDuration, setGifDuration] = useState(3);
  const [gifFps, setGifFps] = useState(30);
  const [isExporting, setIsExporting] = useState(false);
  
  const textClass = darkMode ? "text-zinc-300" : "text-zinc-700";
  const borderClass = darkMode ? "border-zinc-700" : "border-zinc-200";

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
        <h2 className={`text-lg font-semibold ${textClass}`}>Blue Mood</h2>
        <div className="flex gap-2">
          <button
            onClick={onToggleAnimation}
            className={`p-2 border rounded transition-colors ${borderClass} ${
              darkMode
                ? "hover:bg-zinc-700 text-zinc-300"
                : "hover:bg-zinc-100 text-zinc-600"
            }`}
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
            className={`p-2 border rounded transition-colors ${borderClass} ${
              darkMode
                ? "hover:bg-zinc-700 text-zinc-300"
                : "hover:bg-zinc-100 text-zinc-600"
            }`}
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
            className={`flex-1 px-3 py-2 border rounded transition-colors flex items-center justify-center gap-2 ${borderClass} ${
              darkMode
                ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-100"
                : "bg-white hover:bg-zinc-50 text-zinc-700"
            }`}
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
                : darkMode
                ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-100"
                : "bg-white hover:bg-zinc-50 text-zinc-700"
            }`}
            title="Export GIF"
          >
            <Download className="w-4 h-4" />
            <span className="text-sm">{isExporting ? "Recording..." : "GIF"}</span>
          </button>
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
              className={`flex-1 px-2 py-1 text-xs border rounded ${borderClass} ${
                darkMode ? "bg-zinc-800 text-zinc-100" : "bg-white text-zinc-900"
              }`}
            />
            <Label className={`text-xs ${textClass} flex-shrink-0`}>FPS:</Label>
            <input
              type="number"
              value={gifFps}
              onChange={(e) => setGifFps(Number(e.target.value))}
              min={10}
              max={60}
              className={`flex-1 px-2 py-1 text-xs border rounded ${borderClass} ${
                darkMode ? "bg-zinc-800 text-zinc-100" : "bg-white text-zinc-900"
              }`}
            />
          </div>
        </div>

        <button
          onClick={onRandomize}
          className={`w-full px-4 py-2 border rounded transition-colors ${borderClass} ${
            darkMode
              ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-100"
              : "bg-white hover:bg-zinc-50 text-zinc-700"
          }`}
        >
          Randomize All
        </button>
      </div>

      {/* Colors 1 Palette */}
      <div className="space-y-3">
        <Label className={textClass}>Colors Palette 1</Label>
        <div className="grid grid-cols-5 gap-2">
          {[1, 2, 3, 4, 5].map((i) => {
            const paramKey = `color1_${i}` as keyof BlueMoodArtworkParams;
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

      {/* Colors 2 Palette */}
      <div className="space-y-3">
        <Label className={textClass}>Colors Palette 2</Label>
        <div className="grid grid-cols-5 gap-2">
          {[1, 2, 3, 4, 5].map((i) => {
            const paramKey = `color2_${i}` as keyof BlueMoodArtworkParams;
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

      {/* Background Colors */}
      <div className="space-y-3">
        <Label className={textClass}>Background Colors</Label>
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map((i) => {
            const paramKey = `colorBg${i}` as keyof BlueMoodArtworkParams;
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

      <div className={`border-t ${borderClass} pt-4 space-y-4`}>
        {/* Wave Parameters */}
        <div className="space-y-3">
          <Label className={textClass}>
            Wave Ranges: {params.ranges}
          </Label>
          <Slider
            value={[params.ranges]}
            onValueChange={([value]) => onParamChange("ranges", value)}
            min={10}
            max={100}
            step={1}
          />
        </div>

        <div className="space-y-3">
          <Label className={textClass}>
            Stroke Weight: {params.strokeWeight.toFixed(1)}
          </Label>
          <Slider
            value={[params.strokeWeight]}
            onValueChange={([value]) => onParamChange("strokeWeight", value)}
            min={0.5}
            max={25}
            step={0.5}
          />
        </div>

        <div className="space-y-3">
          <Label className={textClass}>
            Animation Speed: {params.animationSpeed.toFixed(4)}
          </Label>
          <Slider
            value={[params.animationSpeed]}
            onValueChange={([value]) => onParamChange("animationSpeed", value)}
            min={0.0001}
            max={0.01}
            step={0.0001}
          />
        </div>

        <div className="space-y-3">
          <Label className={textClass}>
            Wave Height: {params.waveHeight.toFixed(2)}
          </Label>
          <Slider
            value={[params.waveHeight]}
            onValueChange={([value]) => onParamChange("waveHeight", value)}
            min={0.1}
            max={2}
            step={0.05}
          />
        </div>

        <div className="space-y-3">
          <Label className={textClass}>
            Wave Amplitude: {params.waveAmplitude.toFixed(2)}
          </Label>
          <Slider
            value={[params.waveAmplitude]}
            onValueChange={([value]) => onParamChange("waveAmplitude", value)}
            min={0.1}
            max={2}
            step={0.05}
          />
        </div>

        <div className="space-y-3">
          <Label className={textClass}>
            Noise Scale: {params.noiseScale.toFixed(3)}
          </Label>
          <Slider
            value={[params.noiseScale]}
            onValueChange={([value]) => onParamChange("noiseScale", value)}
            min={0.001}
            max={0.1}
            step={0.001}
          />
        </div>

        {/* Pattern Parameters */}
        <div className="space-y-3">
          <Label className={textClass}>
            Pattern Depth: {params.patternDepth}
          </Label>
          <Slider
            value={[params.patternDepth]}
            onValueChange={([value]) => onParamChange("patternDepth", value)}
            min={1}
            max={6}
            step={1}
          />
        </div>

        <div className="space-y-3">
          <Label className={textClass}>
            Pattern Divisions: {params.patternDivisions}
          </Label>
          <Slider
            value={[params.patternDivisions]}
            onValueChange={([value]) => onParamChange("patternDivisions", value)}
            min={3}
            max={12}
            step={1}
          />
        </div>

        <div className="space-y-3">
          <Label className={textClass}>
            Shadow Blur: {params.shadowBlur}
          </Label>
          <Slider
            value={[params.shadowBlur]}
            onValueChange={([value]) => onParamChange("shadowBlur", value)}
            min={0}
            max={20}
            step={1}
          />
        </div>

        <div className="space-y-3">
          <Label className={textClass}>
            Shadow Offset: {params.shadowOffset}
          </Label>
          <Slider
            value={[params.shadowOffset]}
            onValueChange={([value]) => onParamChange("shadowOffset", value)}
            min={0}
            max={10}
            step={1}
          />
        </div>

        <div className="space-y-3">
          <Label className={textClass}>
            Frame Margin: {params.margin}
          </Label>
          <Slider
            value={[params.margin]}
            onValueChange={([value]) => onParamChange("margin", value)}
            min={0}
            max={100}
            step={1}
          />
        </div>
      </div>
    </div>
  );
}
