"use client";

import { useEffect, useState } from "react";
import { X, Loader2, ExternalLink } from "lucide-react";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  darkMode?: boolean;
}

export function PaymentModal({ isOpen, onClose, onSuccess, darkMode = false }: PaymentModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Reset state when modal opens
      setEmail('');
      setEmailError('');
      setCheckoutUrl(null);
    }
  }, [isOpen]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailSubmit = async () => {
    // Validate email
    if (!email.trim()) {
      setEmailError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email');
      return;
    }

    setEmailError('');
    
    // Store email in localStorage for this session
    localStorage.setItem('arte_checkout_email', email.toLowerCase().trim());
    
    // Create checkout session
    await createCheckoutSession();
  };

  const createCheckoutSession = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productType: 'gif_export',
        }),
      });

      const data = await response.json();
      
      if (data.checkoutUrl) {
        setCheckoutUrl(data.checkoutUrl);
      } else {
        console.error('No checkout URL received:', data);
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
    } finally {
      setIsLoading(false);
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
      <div className={`relative w-full max-w-md rounded-lg shadow-2xl overflow-hidden ${darkMode ? 'bg-zinc-900 text-zinc-100' : 'bg-white text-zinc-900'}`}>
        {/* Header */}
        <div className={`px-6 py-4 border-b ${darkMode ? 'border-zinc-700' : 'border-zinc-200'}`}>
          <div className="flex items-center justify-between">
            <h2 className="text-[13px] font-semibold">Unlock GIF Exports</h2>
            <button
              onClick={onClose}
              className={`p-1 rounded-lg transition-colors ${darkMode ? 'hover:bg-zinc-800' : 'hover:bg-zinc-100'}`}
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-[13px] font-medium mb-2">GIF Export Feature</h3>
              <p className={`text-[13px] ${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
                Get unlimited GIF exports for all your generative artworks. Perfect for sharing your creations on social media!
              </p>
              <p className={`text-[11px] mt-2 ${darkMode ? 'text-zinc-500' : 'text-zinc-500'}`}>
                You&apos;ll be redirected to complete your payment securely. After payment, you&apos;ll return here with instant access.
              </p>
            </div>

            <div className={`p-4 rounded-lg ${darkMode ? 'bg-zinc-800' : 'bg-zinc-50'}`}>
              <div className="flex items-baseline gap-2">
                <span className="text-[13px] font-bold">Pay What You Want</span>
                <span className={`text-[13px] ${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>· one-time</span>
              </div>
              <p className={`mt-2 text-[11px] ${darkMode ? 'text-zinc-500' : 'text-zinc-500'}`}>
                Choose your own price. Suggested: $5
              </p>
              <ul className={`mt-3 space-y-2 text-[13px] ${darkMode ? 'text-zinc-300' : 'text-zinc-700'}`}>
                <li className="flex items-center gap-2">
                  <span className="text-cyan-500">✓</span>
                  <span>Unlimited GIF exports</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-cyan-500">✓</span>
                  <span>Custom duration (1-10 seconds)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-cyan-500">✓</span>
                  <span>Adjustable FPS (10-60)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-cyan-500">✓</span>
                  <span>All 4 artwork types</span>
                </li>
              </ul>
            </div>

            {!checkoutUrl ? (
              <div className="space-y-3">
                <div>
                  <label className={`block text-[13px] font-medium mb-2 ${darkMode ? 'text-zinc-300' : 'text-zinc-700'}`}>
                    Enter your email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setEmailError('');
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleEmailSubmit();
                      }
                    }}
                    placeholder="your@email.com"
                    className={`w-full px-3 py-2 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-cyan-500 ${
                      darkMode 
                        ? 'bg-zinc-800 border border-zinc-600 text-zinc-100 placeholder-zinc-500' 
                        : 'bg-white border border-zinc-300 text-zinc-900 placeholder-zinc-400'
                    } ${emailError ? 'border-red-500' : ''}`}
                  />
                  {emailError && (
                    <p className="text-red-500 text-[11px] mt-1">{emailError}</p>
                  )}
                  <p className={`text-[11px] mt-1 ${darkMode ? 'text-zinc-500' : 'text-zinc-500'}`}>
                    We&apos;ll use this to restore your access across devices
                  </p>
                </div>
                <button
                  onClick={handleEmailSubmit}
                  disabled={isLoading}
                  className="w-full px-4 py-3 bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-[13px] font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating checkout...
                    </>
                  ) : (
                    <>
                      Continue to Checkout
                      <ExternalLink className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            ) : (
              <a
                href={checkoutUrl}
                className="w-full px-4 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg text-[13px] font-medium transition-colors flex items-center justify-center gap-2"
              >
                Choose Your Price & Unlock
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className={`px-6 py-3 text-[13px] border-t ${darkMode ? 'border-zinc-700 text-zinc-500' : 'border-zinc-200 text-zinc-500'}`}>
          <p className="text-center mb-2">
            Secure payment powered by{" "}
            <a 
              href="https://polar.sh" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-cyan-500 hover:underline"
            >
              Polar
            </a>
          </p>
          <p className="text-center text-[11px]">
            Already purchased?{" "}
            <button
              onClick={() => {
                onClose();
                // Parent will show verification modal
                window.dispatchEvent(new CustomEvent('showEmailVerification'));
              }}
              className="text-cyan-500 hover:underline"
            >
              Verify your email
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
