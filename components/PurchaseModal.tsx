'use client';

import { useState, useEffect } from 'react';
import { X, Sparkles, MapPin, MessageCircle, User, Loader2, Copy, Check, ExternalLink, CreditCard } from 'lucide-react';
import { hasGifAccess } from '@/lib/paymentUtils';

interface PurchaseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPurchase: (provenance: {
        creator: string;
        location?: string;
        feeling: string;
    }) => Promise<string>; // Returns the generated token
    artworkType: string;
    price?: string; // e.g., "$5.00"
}

type Step = 'payment' | 'provenance' | 'success';

export function PurchaseModal({
    isOpen,
    onClose,
    onPurchase,
    artworkType,
    price = "Pay What You Want"
}: PurchaseModalProps) {
    const [step, setStep] = useState<Step>('payment');
    const [creator, setCreator] = useState('');
    const [location, setLocation] = useState('');
    const [feeling, setFeeling] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [generatedToken, setGeneratedToken] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
    const [isLoadingCheckout, setIsLoadingCheckout] = useState(false);

    // Check if user already has access (verified payment) - skip to provenance
    useEffect(() => {
        if (isOpen && hasGifAccess()) {
            setStep('provenance');
        }
    }, [isOpen]);

    // Create Polar checkout session when modal opens (only if not already verified)
    useEffect(() => {
        if (isOpen && step === 'payment' && !hasGifAccess()) {
            createCheckoutSession();
        }
    }, [isOpen, step]);

    // Check for payment success return
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('payment') === 'success' && isOpen) {
            setStep('provenance');
            // Clean up URL
            const newUrl = window.location.pathname;
            window.history.replaceState({}, '', newUrl);
        }
    }, [isOpen]);

    const createCheckoutSession = async () => {
        setIsLoadingCheckout(true);
        try {
            const response = await fetch('/api/create-checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    productType: 'edition_purchase',
                }),
            });

            const data = await response.json();

            if (data.checkoutUrl) {
                setCheckoutUrl(data.checkoutUrl);
            } else {
                console.error('No checkout URL received:', data);
                setError('Failed to create checkout session');
            }
        } catch (error) {
            console.error('Error creating checkout:', error);
            setError('Failed to connect to payment service');
        } finally {
            setIsLoadingCheckout(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!creator.trim()) {
            setError('Please enter your name');
            return;
        }
        if (!feeling.trim()) {
            setError('Please describe your feeling');
            return;
        }
        if (feeling.length > 100) {
            setError('Feeling must be 100 characters or less');
            return;
        }

        setIsProcessing(true);

        try {
            const token = await onPurchase({
                creator: creator.trim(),
                location: location.trim() || undefined,
                feeling: feeling.trim()
            });
            setGeneratedToken(token);
            setStep('success');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCopyToken = async () => {
        if (generatedToken) {
            await navigator.clipboard.writeText(generatedToken);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleClose = () => {
        setCreator('');
        setLocation('');
        setFeeling('');
        setGeneratedToken(null);
        setError(null);
        setCopied(false);
        setStep('payment');
        setCheckoutUrl(null);
        onClose();
    };

    // Skip payment for testing - allow direct provenance entry
    const handleSkipPayment = () => {
        setStep('provenance');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="relative px-6 pt-6 pb-4 border-b border-zinc-100">
                    <button
                        onClick={handleClose}
                        className="absolute top-4 right-4 p-2 rounded-full hover:bg-zinc-100 transition-colors"
                    >
                        <X className="w-5 h-5 text-zinc-400" />
                    </button>

                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-zinc-900">
                                {step === 'payment' && 'Get Your Edition'}
                                {step === 'provenance' && 'Personalize Your Edition'}
                                {step === 'success' && 'Edition Created!'}
                            </h2>
                            <p className="text-sm text-zinc-500">
                                {artworkType.charAt(0).toUpperCase() + artworkType.slice(1)} by Mahi Khan
                            </p>
                        </div>
                    </div>
                </div>

                {/* Step 1: Payment */}
                {step === 'payment' && (
                    <div className="p-6 space-y-5">
                        <div className="p-4 bg-gradient-to-br from-violet-50 to-fuchsia-50 rounded-xl border border-violet-100">
                            <div className="flex items-baseline gap-2 mb-2">
                                <span className="text-lg font-bold text-zinc-900">{price}</span>
                                <span className="text-sm text-zinc-500">· one-time</span>
                            </div>
                            <ul className="space-y-2 text-sm text-zinc-700">
                                <li className="flex items-center gap-2">
                                    <span className="text-violet-500">✓</span>
                                    <span>Unique v4 token with your name</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-violet-500">✓</span>
                                    <span>Certificate of authenticity</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-violet-500">✓</span>
                                    <span>Works forever (no subscription)</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-violet-500">✓</span>
                                    <span>High-res exports included</span>
                                </li>
                            </ul>
                        </div>

                        {error && (
                            <p className="text-sm text-red-500 bg-red-50 px-4 py-2 rounded-lg">
                                {error}
                            </p>
                        )}

                        {isLoadingCheckout ? (
                            <div className="flex items-center justify-center py-4">
                                <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
                                <span className="ml-2 text-sm text-zinc-600">Creating checkout...</span>
                            </div>
                        ) : checkoutUrl ? (
                            <a
                                href={checkoutUrl}
                                className="w-full py-3 px-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-medium rounded-xl hover:from-violet-700 hover:to-fuchsia-700 transition-all flex items-center justify-center gap-2"
                            >
                                <CreditCard className="w-5 h-5" />
                                Continue to Payment
                                <ExternalLink className="w-4 h-4" />
                            </a>
                        ) : (
                            <button
                                onClick={createCheckoutSession}
                                className="w-full py-3 px-4 bg-zinc-100 text-zinc-700 font-medium rounded-xl hover:bg-zinc-200 transition-colors"
                            >
                                Retry
                            </button>
                        )}

                        <p className="text-xs text-center text-zinc-400">
                            Secure payment powered by{' '}
                            <a href="https://polar.sh" target="_blank" rel="noopener noreferrer" className="text-violet-500 hover:underline">
                                Polar
                            </a>
                        </p>

                        <p className="text-xs text-center text-zinc-400">
                            Already purchased?{' '}
                            <button
                                onClick={() => {
                                    handleClose();
                                    window.dispatchEvent(new CustomEvent('showEmailVerification'));
                                }}
                                className="text-violet-500 hover:underline"
                            >
                                Verify your email
                            </button>
                        </p>

                        {/* Dev/Testing: Skip payment button */}
                        {process.env.NODE_ENV === 'development' && (
                            <button
                                onClick={handleSkipPayment}
                                className="w-full py-2 text-xs text-zinc-400 hover:text-zinc-600 transition-colors"
                            >
                                [Dev] Skip payment →
                            </button>
                        )}
                    </div>
                )}

                {/* Step 2: Provenance Form */}
                {step === 'provenance' && (
                    <form onSubmit={handleSubmit} className="p-6 space-y-5">
                        {/* Creator Name */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-medium text-zinc-700">
                                <User className="w-4 h-4" />
                                Your Name
                            </label>
                            <input
                                type="text"
                                value={creator}
                                onChange={(e) => setCreator(e.target.value)}
                                placeholder="John Doe"
                                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                                maxLength={50}
                            />
                        </div>

                        {/* Location (Optional) */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-medium text-zinc-700">
                                <MapPin className="w-4 h-4" />
                                Location <span className="text-zinc-400 font-normal">(optional)</span>
                            </label>
                            <input
                                type="text"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder="New York, USA"
                                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                                maxLength={50}
                            />
                        </div>

                        {/* Feeling */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-medium text-zinc-700">
                                <MessageCircle className="w-4 h-4" />
                                Your Feeling
                            </label>
                            <textarea
                                value={feeling}
                                onChange={(e) => setFeeling(e.target.value)}
                                placeholder="What does this artwork evoke in you?"
                                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all resize-none"
                                rows={2}
                                maxLength={100}
                            />
                            <p className="text-xs text-zinc-400 text-right">
                                {feeling.length}/100
                            </p>
                        </div>

                        {/* Error */}
                        {error && (
                            <p className="text-sm text-red-500 bg-red-50 px-4 py-2 rounded-lg">
                                {error}
                            </p>
                        )}

                        {/* Preview Card */}
                        <div className="p-4 bg-gradient-to-br from-zinc-50 to-zinc-100 rounded-xl border border-zinc-200">
                            <p className="text-xs text-zinc-500 mb-2">Preview of your certificate:</p>
                            <div className="text-sm">
                                <p className="text-zinc-900 font-medium">
                                    {creator || 'Your Name'}
                                </p>
                                {location && (
                                    <p className="text-zinc-500 text-xs">{location}</p>
                                )}
                                <p className="text-zinc-600 italic mt-1">
                                    &ldquo;{feeling || 'Your feeling...'}&rdquo;
                                </p>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isProcessing}
                            className="w-full py-3 px-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-medium rounded-xl hover:from-violet-700 hover:to-fuchsia-700 focus:outline-none focus:ring-2 focus:ring-violet-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-5 h-5" />
                                    Create My Edition
                                </>
                            )}
                        </button>
                    </form>
                )}

                {/* Step 3: Success */}
                {step === 'success' && generatedToken && (
                    <div className="p-6 space-y-5">
                        <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                                <Check className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-zinc-900 mb-2">
                                Your Edition is Ready!
                            </h3>
                            <p className="text-sm text-zinc-500">
                                Copy your token below. Paste it in the viewer anytime to see your artwork.
                            </p>
                        </div>

                        {/* Token Display */}
                        <div className="relative">
                            <div className="p-4 bg-zinc-900 rounded-xl font-mono text-xs text-green-400 break-all">
                                {generatedToken}
                            </div>
                            <button
                                onClick={handleCopyToken}
                                className="absolute top-2 right-2 p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
                            >
                                {copied ? (
                                    <Check className="w-4 h-4 text-green-400" />
                                ) : (
                                    <Copy className="w-4 h-4 text-zinc-400" />
                                )}
                            </button>
                        </div>

                        <p className="text-xs text-center text-zinc-500">
                            This token is yours forever. Keep it safe!
                        </p>

                        <button
                            onClick={handleClose}
                            className="w-full py-3 px-4 bg-zinc-100 text-zinc-700 font-medium rounded-xl hover:bg-zinc-200 transition-colors"
                        >
                            Done
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
