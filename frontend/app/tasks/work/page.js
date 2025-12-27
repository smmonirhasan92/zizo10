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

    useEffect(() => {
        if (adId) fetchAdData();
    }, [adId]);

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

    const handleClaim = async () => {
        setLoading(true);
        try {
            const res = await api.post('/task/submit');
            showSuccess(`Reward Claimed: ${res.data.rewardEarned} BDT`);
            setTimeout(() => {
                router.push('/tasks');
            }, 1000);
        } catch (err) {
            showError(err.response?.data?.message || 'Task failed');
            setLoading(false);
        }
    };

    if (!adData && adId) return <div className="p-10 text-center text-white">Loading Ad...</div>;

    const displayAd = adData || { title: 'Sponsored Task', description: 'Visit our partner to unlock reward.', imageUrl: '/uploads/placeholder.png', adLink: 'https://google.com' };

    return (
        <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center justify-center relative">
            <Link href="/tasks" className="absolute top-6 left-6 p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition">
                <ArrowLeft className="w-5 h-5" />
            </Link>

            <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                {/* Image Area */}
                <div className="h-48 bg-gray-800 relative group">
                    <img
                        src={displayAd.imageUrl || 'https://via.placeholder.com/400x200?text=Ad'}
                        alt="Ad"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        onError={(e) => e.target.src = 'https://via.placeholder.com/400x200?text=No+Image'}
                    />
                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold border border-white/10 shadow-lg">
                        Task #{taskNum}
                    </div>
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-80"></div>
                </div>

                <div className="p-8 text-center -mt-12 relative z-10">
                    <h2 className="text-2xl font-bold mb-2 text-white shadow-black drop-shadow-md">{displayAd.title}</h2>
                    <p className="text-gray-400 text-sm mb-8 leading-relaxed max-w-xs mx-auto">{displayAd.reviewText || displayAd.description}</p>

                    {!canClaim ? (
                        <div className="space-y-4">
                            {!isActive && timeLeft === 10 ? (
                                <button
                                    onClick={handleViewAd}
                                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.02] shadow-lg shadow-blue-500/25"
                                >
                                    <ExternalLink className="w-5 h-5" /> View Ad to Unlock
                                </button>
                            ) : (
                                <div className="w-full py-4 bg-gray-800/50 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 text-yellow-400 border border-yellow-400/20">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-yellow-400 blur-sm opacity-20 animate-pulse"></div>
                                        <Timer className="w-5 h-5 animate-spin-slow relative z-10" />
                                    </div>
                                    Wait {timeLeft}s
                                </div>
                            )}
                            <p className="text-xs text-gray-500 font-medium">Please keep this tab open</p>
                        </div>
                    ) : (
                        <button
                            onClick={handleClaim}
                            disabled={loading}
                            className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-green-500/30 transition-all transform active:scale-95 animate-in fade-in zoom-in duration-300"
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
