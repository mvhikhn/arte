"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <input
      type="color"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-6 rounded cursor-pointer border-0"
      style={{ 
        backgroundColor: value,
        WebkitAppearance: 'none',
        appearance: 'none',
        padding: 0
      }}
    />
  );
}
