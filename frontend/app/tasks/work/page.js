'use client';
import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import api from '../../../services/api';
// import { useInterval } from 'react-use'; // Removed unused import
import { ArrowLeft, ExternalLink, Timer, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';

// ... imports
import { useNotification } from '../../../context/NotificationContext';

function WorkContent() {
    const { showSuccess, showError } = useNotification();
    const searchParams = useSearchParams();
    const router = useRouter();
    const taskNum = searchParams.get('task');
    const adId = searchParams.get('adId');

    const [timeLeft, setTimeLeft] = useState(10);
    const [isActive, setIsActive] = useState(false);
    const [canClaim, setCanClaim] = useState(false);
    const [loading, setLoading] = useState(false);
    const [adData, setAdData] = useState(null);

    const fetchAdData = async () => {
        try {
            const res = await api.get('/task/status');
            if (res.data.canWork === false) {
                showError(res.data.message || 'Please upgrade your plan.');
                return;
            }
            const ads = res.data.taskAds || [];
            const found = ads.find(a => a.id == adId);
            if (found) setAdData(found);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (adId) fetchAdData();
    }, [adId]);

    useEffect(() => {
        let interval = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            clearInterval(interval);
            setIsActive(false);
            setCanClaim(true);
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    const handleViewAd = () => {
        if (!adData?.adLink) return;
        // Open Ad in New Tab (Standard for "Clickable" revenue models)
        // But keep user here for timer.
        window.open(adData.adLink, '_blank');
        setIsActive(true);
    };

    const [showCoin, setShowCoin] = useState(false);

    // Removed Duplicate handleClaim


    if (!adData && adId) return <div className="p-10 text-center text-white">Loading Ad...</div>;

    useEffect(() => {
        // Auto-start timer if ad is present
        if (adData) {
            setIsActive(true);
        }
    }, [adData]);

    const handleClaim = async () => {
        setLoading(true);
        try {
            const res = await api.post('/task/submit');
            setShowCoin(true);
            showSuccess(`Reward Claimed: ${res.data.rewardEarned} BDT`);
            setTimeout(() => {
                router.push('/tasks');
            }, 2500);
        } catch (err) {
            showError(err.response?.data?.message || 'Task failed');
            setLoading(false);
        }
    };

    if (!adData && adId) return <div className="p-10 text-center text-white">Loading Ad content...</div>;

    const displayAd = adData || { title: 'Sponsored', description: 'Wait to claim reward.', imageUrl: '', adLink: '' };

    return (
        <div className="min-h-screen bg-black text-white p-4 flex flex-col items-center relative overflow-hidden">
            {/* Golden Coin Animation Overlay */}
            {showCoin && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-500">
                    <div className="relative animate-bounce-custom text-center">
                        <div className="w-40 h-40 mx-auto rounded-full bg-gradient-to-br from-yellow-300 via-yellow-500 to-amber-600 shadow-[0_0_100px_rgba(234,179,8,0.6)] flex items-center justify-center border-4 border-yellow-200">
                            <span className="text-6xl font-black text-yellow-100 drop-shadow-md">৳</span>
                        </div>
                        <h2 className="text-3xl font-bold text-yellow-400 mt-8 mb-2">Reward Claimed!</h2>
                        <p className="text-slate-300">Redirecting to tasks...</p>
                    </div>
                </div>
            )}

            <Link href="/tasks" className="absolute top-4 left-4 p-2 bg-white/10 backdrop-blur rounded-full hover:bg-white/20 transition z-50">
                <ArrowLeft className="w-5 h-5" />
            </Link>

            {/* Embedded Ad Container */}
            <div className="w-full max-w-4xl flex-1 flex flex-col gap-4 mt-12 mb-20">
                <div className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl relative aspect-video">
                    {/* If Link is YT or generic, try iframe. Ideally we'd parse. For now, assume generic. */}
                    {/* Fallback for safety: if no link, show image */}
                    {displayAd.adLink ? (
                        <iframe
                            src={displayAd.adLink}
                            title="Ad Content"
                            sandbox="allow-scripts allow-same-origin allow-presentation" // Secure sandbox
                            className="w-full h-full border-0"
                            onLoad={() => setIsActive(true)} // Ensure timer starts/continues
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-800">
                            <img src={displayAd.imageUrl} alt="Ad" className="max-h-full max-w-full object-contain" />
                        </div>
                    )}

                    {/* Timer Overlay (Always visible during count) */}
                    {!canClaim && (
                        <div className="absolute top-4 right-4 bg-black/70 backdrop-blur px-4 py-2 rounded-full font-mono font-bold text-yellow-400 border border-yellow-400/30 flex items-center gap-2">
                            <Timer className="w-4 h-4 animate-spin-slow" />
                            {timeLeft > 0 ? `${timeLeft}s Remaining` : 'Ready!'}
                        </div>
                    )}
                </div>

                <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/5">
                    <h1 className="text-xl md:text-2xl font-bold text-white mb-2">{displayAd.title}</h1>
                    <p className="text-slate-400 text-sm">{displayAd.reviewText || displayAd.description}</p>
                </div>
            </div>

            {/* Bottom Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-md p-4 border-t border-white/10 z-40">
                <div className="max-w-md mx-auto">
                    {!canClaim ? (
                        <button disabled className="w-full py-3.5 bg-slate-700/50 text-slate-500 rounded-xl font-bold text-lg flex items-center justify-center gap-2 cursor-not-allowed">
                            <Timer className="w-5 h-5" />
                            Wait {timeLeft}s to Claim
                        </button>
                    ) : (
                        <button
                            onClick={handleClaim}
                            disabled={loading || showCoin}
                            className="w-full py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-green-500/30 transition-all active:scale-95 animate-in slide-in-from-bottom-4"
                        >
                            {loading ? 'Claiming...' : (
                                <>
                                    <CheckCircle className="w-6 h-6" /> Claim Reward
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function WorkPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <WorkContent />
        </Suspense>
    );
}
