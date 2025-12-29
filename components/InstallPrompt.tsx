"use client";

import { useEffect, useState } from "react";
import { Download, Share, PlusSquare } from "lucide-react";

export default function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isInstallable, setIsInstallable] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [showIOSPrompt, setShowIOSPrompt] = useState(false);

    useEffect(() => {
        // Check if iOS
        const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
        // Check if already standalone (installed)
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;

        if (isIOSDevice && !isStandalone) {
            setIsIOS(true);
        }

        const handleBeforeInstallPrompt = (e: any) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e);
            setIsInstallable(true);
        };

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        // Show the install prompt
        deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);

        // We've used the prompt, and can't use it again, throw it away
        setDeferredPrompt(null);
        setIsInstallable(false);
    };

    if (!isInstallable && !isIOS) return null;

    return (
        <>
            {isInstallable && (
                <button
                    onClick={handleInstallClick}
                    className="flex items-center gap-x-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-full font-bold hover:scale-105 transition shadow-lg mt-4 animate-pulse"
                >
                    <Download size={20} />
                    Install App
                </button>
            )}

            {isIOS && (
                <div className="mt-4">
                    <button
                        onClick={() => setShowIOSPrompt(!showIOSPrompt)}
                        className="flex items-center gap-x-2 bg-neutral-100 text-neutral-800 px-4 py-2 rounded-full font-bold hover:bg-neutral-200 transition"
                    >
                        <Download size={20} className="text-orange-500" />
                        Install on iPhone
                    </button>

                    {showIOSPrompt && (
                        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={() => setShowIOSPrompt(false)}>
                            <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl space-y-4" onClick={e => e.stopPropagation()}>
                                <div className="flex items-start justify-between">
                                    <h3 className="text-lg font-bold text-neutral-900">Install for iOS</h3>
                                    <button onClick={() => setShowIOSPrompt(false)} className="text-neutral-400">✕</button>
                                </div>
                                <div className="space-y-4 text-neutral-600 text-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-neutral-100 rounded-lg">
                                            <Share size={24} className="text-blue-500" />
                                        </div>
                                        <p>1. Tap the <span className="font-bold text-neutral-800">Share</span> button in Safari menu bar.</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-neutral-100 rounded-lg">
                                            <PlusSquare size={24} className="text-neutral-800" />
                                        </div>
                                        <p>2. Scroll down and create <span className="font-bold text-neutral-800">Add to Home Screen</span>.</p>
                                    </div>
                                </div>
                                <div className="pt-2 text-center">
                                    <button
                                        onClick={() => setShowIOSPrompt(false)}
                                        className="text-orange-600 font-bold hover:underline"
                                    >
                                        Close
                                    </button>
                                </div>
                                {/* Triangle pointer logic could go here but tricky with generic positioning */}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </>
    );
}
