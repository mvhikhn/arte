"use client";

import { useState } from "react";
import { X, Loader2, CheckCircle2 } from "lucide-react";

interface EmailVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EmailVerificationModal({ isOpen, onClose, onSuccess }: EmailVerificationModalProps) {
  const [email, setEmail] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleVerify = async () => {
    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    setError('');
    setIsVerifying(true);

    try {
      const response = await fetch('/api/verify-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.hasAccess) {
        // Grant local access
        localStorage.setItem('arte_gif_access', 'true');
        localStorage.setItem('arte_gif_access_date', new Date().toISOString());
        localStorage.setItem('arte_verified_email', email);
        
        setSuccess(true);
        setTimeout(() => {
          // Redirect with verified parameter to trigger state restoration
          window.location.href = window.location.pathname + '?verified=true';
        }, 1500);
      } else {
        setError('No purchase found for this email. Please check your email or make a purchase.');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setError('Failed to verify. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md rounded-lg shadow-2xl overflow-hidden bg-white text-zinc-900">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200">
          <div className="flex items-center justify-between">
            <h2 className="text-[13px] font-semibold">Verify Your Access</h2>
            <button
              onClick={onClose}
              className="p-1 rounded-lg transition-colors hover:bg-zinc-100"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {success ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-green-500" />
              <p className="text-[13px] text-center text-zinc-700">
                Access verified successfully!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="text-[13px] mb-4 text-zinc-600">
                  Enter the email you used when purchasing GIF export access to restore it on this device.
                </p>
                
                <label className="block text-[13px] font-medium mb-2 text-zinc-700">
                  Your email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleVerify();
                    }
                  }}
                  placeholder="your@email.com"
                  className={`w-full px-3 py-2 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-cyan-500 bg-white border border-zinc-300 text-zinc-900 placeholder-zinc-400 ${error ? 'border-red-500' : ''}`}
                />
                {error && (
                  <p className="text-red-500 text-[11px] mt-1">{error}</p>
                )}
              </div>

              <button
                onClick={handleVerify}
                disabled={isVerifying}
                className="w-full px-4 py-3 bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-[13px] font-medium transition-colors flex items-center justify-center gap-2"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify Access'
                )}
              </button>

              <p className="text-[11px] text-center text-zinc-500">
                Don&apos;t have access yet?{' '}
                <button 
                  onClick={() => {
                    onClose();
                    // The parent will handle showing the payment modal
                  }}
                  className="text-cyan-500 hover:underline"
                >
                  Purchase now
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
