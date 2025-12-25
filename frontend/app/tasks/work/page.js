'use client';
import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import api from '../../../services/api';
// import { useInterval } from 'react-use'; // Removed unused import
import { ArrowLeft, ExternalLink, Timer, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';

function WorkContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const taskNum = searchParams.get('task');
    const adId = searchParams.get('adId');

    const [timeLeft, setTimeLeft] = useState(10);
    const [isActive, setIsActive] = useState(false);
    const [canClaim, setCanClaim] = useState(false);
    const [loading, setLoading] = useState(false);
    const [adData, setAdData] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        // Fetch Ad details if adId is present, or just use generic placeholder
        if (adId) {
            // Ideally fetch ad details. For V1 we might pass data or fetch from a list.
            // Since we don't have a single ad fetch endpoint, we can fetch all and find, or just use the data if passed (not passed).
            // Let's simple fetch status again to get ad list and find it? Or create a detail endpoint.
            // Optim: Fetch /task/status and find the ad.
            fetchAdData();
        }
    }, [adId]);

    const fetchAdData = async () => {
        try {
            const res = await api.get('/task/status');

            // Check Plan Restriction
            if (res.data.canWork === false) {
                setError(res.data.message || 'Please upgrade your plan.');
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
        window.open(adData.adLink, '_blank');
        setIsActive(true);
    };

    const handleClaim = async () => {
        setLoading(true);
        try {
            await api.post('/task/submit');
            // Show Success?
            router.push('/tasks'); // Back to list
        } catch (err) {
            setError(err.response?.data?.message || 'Task failed');
            setLoading(false);
        }
    };

    if (!adData && adId) return <div className="p-10 text-center text-white">Loading Ad...</div>;

    // Fallback if no ad data found but taskNum exists (shouldn't happen often)
    const displayAd = adData || { title: 'Sponsored Ad', description: 'Visit our partner site', imageUrl: '/uploads/placeholder.png', adLink: 'https://google.com' };

    return (
        <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center justify-center relative">
            <Link href="/tasks" className="absolute top-6 left-6 p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition">
                <ArrowLeft className="w-5 h-5" />
            </Link>

            <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden shadow-2xl">
                {/* Image */}
                <div className="h-48 bg-gray-800 relative">
                    {/* Use img tag for external uploads or optimized Next Image if internal */}
                    <img
                        src={displayAd.imageUrl || 'https://via.placeholder.com/400x200?text=Ad'}
                        alt="Ad"
                        className="w-full h-full object-cover opacity-80"
                        onError={(e) => e.target.src = 'https://via.placeholder.com/400x200?text=No+Image'}
                    />
                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold border border-white/10">
                        Task #{taskNum}
                    </div>
                </div>

                <div className="p-6 text-center">
                    <h2 className="text-xl font-bold mb-2">{displayAd.title}</h2>
                    <p className="text-gray-400 text-sm mb-6">{displayAd.reviewText || displayAd.description}</p>

                    {error && <div className="mb-4 text-red-400 text-sm font-bold bg-red-900/20 p-2 rounded-lg">{error}</div>}

                    {!canClaim ? (
                        <div className="space-y-4">
                            {!isActive && timeLeft === 10 ? (
                                <button
                                    onClick={handleViewAd}
                                    className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition animate-pulse"
                                >
                                    <ExternalLink className="w-5 h-5" /> View Ad
                                </button>
                            ) : (
                                <div className="w-full py-4 bg-gray-800 rounded-xl font-bold text-lg flex items-center justify-center gap-2 text-yellow-400 border border-yellow-400/30">
                                    <Timer className="w-5 h-5 animate-spin-slow" />
                                    Wait {timeLeft}s
                                </div>
                            )}
                            <p className="text-xs text-gray-500">Do not close the browser while timer runs.</p>
                        </div>
                    ) : (
                        <button
                            onClick={handleClaim}
                            disabled={loading}
                            className="w-full py-4 bg-green-500 hover:bg-green-400 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-green-500/20 transition transform active:scale-95"
                        >
                            {loading ? 'Claiming...' : (
                                <>
                                    <CheckCircle className="w-5 h-5" /> Claim Reward
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
