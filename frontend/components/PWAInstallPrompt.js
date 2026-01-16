'use client';
import { useState, useEffect } from 'react';
import { Download, X, Share, PlusSquare } from 'lucide-react';

export default function PWAInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);
    const [showPrompt, setShowPrompt] = useState(false);

    useEffect(() => {
        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
            setIsStandalone(true);
            console.log("PWA: App is running in standalone mode.");
        }

        // Detect iOS
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
        setIsIOS(isIosDevice);

        if (isIosDevice && !isStandalone) {
            // Show iOS prompt after a delay if not in standalone
            // setTimeout(() => setShowPrompt(true), 3000); // Optional: Auto-show on load
        }

        const handleBeforeInstallPrompt = (e) => {
            console.log("PWA: 'beforeinstallprompt' event fired.");
            e.preventDefault();
            setDeferredPrompt(e);
            setShowPrompt(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // Custom Trigger for manual install buttons
        const handleManualTrigger = () => {
            console.log("PWA: Manual install trigger received.");
            setShowPrompt(true);
        };
        window.addEventListener('pwa-install-trigger', handleManualTrigger);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('pwa-install-trigger', handleManualTrigger);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`PWA: User response to install prompt: ${outcome}`);

        setDeferredPrompt(null);
        setShowPrompt(false);
    };

    const closePrompt = () => {
        setShowPrompt(false);
        console.log("PWA: User dismissed the install prompt UI.");
    };

    if (isStandalone) return null; // Don't show if already installed

    if (!showPrompt && !isIOS) return null; // Show nothing if no prompt available (unless iOS manual trigger desired)

    // For iOS, we might want to only show this when specifically requested or via a small banner
    // This implementation shows a modal/banner when 'showPrompt' is true (Android) OR if we decide to force it for iOS 
    // Currently for iOS, we rely on the user finding the "Add to Home" button unless we force 'showPrompt = true'

    // Let's make a permanent "Install App" floater or only show when triggered?
    // User requested "works properly on all mobiles". 
    // Best practice: Simple banner at bottom.

    if (!showPrompt) return null;

    return (
        <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-slide-up">
            <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-4 shadow-2xl backdrop-blur-md text-white">
                <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                            <img src="/icons/icon-192x192.png" className="w-8 h-8 rounded-lg" alt="App Icon" />
                        </div>
                        <div>
                            <h3 className="font-bold text-sm">Install Zizo 10 App</h3>
                            <p className="text-xs text-slate-400">Add to home screen for better experience</p>
                        </div>
                    </div>
                    <button onClick={closePrompt} className="p-1 hover:bg-white/10 rounded-full transition">
                        <X className="w-4 h-4 text-slate-400" />
                    </button>
                </div>

                {isIOS ? (
                    <div className="space-y-2 text-xs text-slate-300 bg-slate-800/50 p-3 rounded-lg">
                        <p className="flex items-center gap-2">
                            1. Tap the <Share className="w-4 h-4" /> <strong>Share</strong> button.
                        </p>
                        <p className="flex items-center gap-2">
                            2. Scroll down and tap <PlusSquare className="w-4 h-4" /> <strong>Add to Home Screen</strong>.
                        </p>
                    </div>
                ) : (
                    <button
                        onClick={handleInstallClick}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-95 transition-all py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
                    >
                        <Download className="w-4 h-4" /> Install Now
                    </button>
                )}
            </div>

            <style jsx>{`
                @keyframes slide-up {
                    from { transform: translateY(100%); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .animate-slide-up {
                    animation: slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1);
                }
            `}</style>
        </div>
    );
}
