"use client";

import { useState } from "react";
import { hasGifAccess, grantGifAccess, revokeGifAccess, getAccessDate } from "@/lib/paymentUtils";

export function DevTools() {
  const [isOpen, setIsOpen] = useState(false);
  const [access, setAccess] = useState(hasGifAccess());

  const refresh = () => {
    setAccess(hasGifAccess());
  };

  const handleRevoke = () => {
    revokeGifAccess();
    refresh();
  };

  const handleGrant = () => {
    grantGifAccess();
    refresh();
  };

  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div className="fixed bottom-4 right-4 z-[200]">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-[11px] font-medium shadow-lg"
        >
          🛠️ Dev Tools
        </button>
      ) : (
        <div className="bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl p-4 w-64">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[13px] font-bold text-white">Dev Tools</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-zinc-400 hover:text-white text-[11px]"
            >
              ✕
            </button>
          </div>

          <div className="space-y-3">
            <div className="p-2 bg-zinc-800 rounded">
              <p className="text-[11px] text-zinc-400 mb-1">GIF Access Status:</p>
              <p className="text-[13px] font-medium text-white">
                {access ? '✅ Granted' : '🔒 Blocked'}
              </p>
              {access && getAccessDate() && (
                <p className="text-[10px] text-zinc-500 mt-1">
                  Since: {new Date(getAccessDate()!).toLocaleString()}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleRevoke}
                className="flex-1 px-2 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-[11px] font-medium"
              >
                Revoke Access
              </button>
              <button
                onClick={handleGrant}
                className="flex-1 px-2 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-[11px] font-medium"
              >
                Grant Access
              </button>
            </div>

            <button
              onClick={refresh}
              className="w-full px-2 py-1.5 bg-zinc-700 hover:bg-zinc-600 text-white rounded text-[11px] font-medium"
            >
              🔄 Refresh Status
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
