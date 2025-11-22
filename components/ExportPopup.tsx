"use client";

import { useEffect } from "react";
import { Download, CheckCircle } from "lucide-react";

interface ExportPopupProps {
  isExporting: boolean;
  message: string;
  onClose?: () => void;
}

export function ExportPopup({ isExporting, message, onClose }: ExportPopupProps) {
  useEffect(() => {
    if (!isExporting && onClose) {
      const timer = setTimeout(onClose, 2000);
      return () => clearTimeout(timer);
    }
  }, [isExporting, onClose]);

  if (!isExporting && !message) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl px-4 py-3 flex items-center gap-3 min-w-[200px]">
        {isExporting ? (
          <>
            <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-[13px] text-white">{message}</span>
          </>
        ) : (
          <>
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-[13px] text-white">{message}</span>
          </>
        )}
      </div>
    </div>
  );
}
