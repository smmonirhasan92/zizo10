'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import api from '@/services/api';
import { CheckCircle, AlertTriangle, PlayCircle, Star, ShoppingBag, Video, Timer, X, Maximize2 } from 'lucide-react';
import { useNotification } from '@/context/NotificationContext';

export default function TaskCenterPage() {
    const { showSuccess, showError } = useNotification();
    const [adTasks, setAdTasks] = useState([]);
    const [reviewTasks, setReviewTasks] = useState([]);

    const [selectedTasks, setSelectedTasks] = useState([]); // For Review Tasks
    const [activeTab, setActiveTab] = useState('review'); // 'review' or 'ad'

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState('');

    // Lock Screen State
    const [canWork, setCanWork] = useState(true);
    const [lockMessage, setLockMessage] = useState('');

    // --- SMART MODAL STATE ---
    const [showModal, setShowModal] = useState(false);
    const [activeTask, setActiveTask] = useState(null); // The ad being watched
    const [modalTimer, setModalTimer] = useState(10);
    const [isClaimable, setIsClaimable] = useState(false);
    const [showCoin, setShowCoin] = useState(false); // Coin Animation

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const res = await api.get(`/task/status?t=${new Date().getTime()}`);
            if (res.data.canWork === false) {
                setCanWork(false);
                setLockMessage(res.data.message);
                return;
            }

            setAdTasks(res.data.adTasks || []);
            setReviewTasks(res.data.reviewTasks || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // --- Modal Logic ---
    const openAdModal = (task) => {
        setActiveTask(task);
        setModalTimer(10);
        setIsClaimable(false);
        setShowModal(true);
        setShowCoin(false);
    };

    const closeAdModal = () => {
        if (!isClaimable && modalTimer > 0) return; // Prevent closing if timer running
        setShowModal(false);
        setActiveTask(null);
    };

    // Timer Effect
    useEffect(() => {
        let interval = null;
        if (showModal && modalTimer > 0) {
            interval = setInterval(() => {
                setModalTimer((prev) => prev - 1);
            }, 1000);
        } else if (showModal && modalTimer === 0) {
            setIsClaimable(true);
        }
        return () => clearInterval(interval);
    }, [showModal, modalTimer]);


    // --- Claim Logic (Inside Modal) ---
    const handleClaimReward = async () => {
        if (!activeTask) return;
        setSubmitting(true);
        try {
            // Submit single task
            const res = await api.post('/task/submit', { taskIds: [activeTask.id], type: 'ad' });

            // Show Coin Animation
            setShowCoin(true);
            showSuccess(`Reward Claimed: ${res.data.rewardEarned || 'Success'} BDT`);

            // Hard Refresh to ensure strict sync (Bullet-Proof Directive)
            window.location.reload();

            // Ideally we should just filter it out locally to feel faster, but fetch ensures sync.
            // Let's filter locally for instant feel? 
            // Actually, keep it simple.

            setTimeout(() => {
                setShowModal(false);
                setActiveTask(null);
                setShowCoin(false);
            }, 2500); // 2.5s Audio/Anim Duration

        } catch (err) {
            showError(err.response?.data?.message || 'Task failed');
        } finally {
            setSubmitting(false);
        }
    };


    // --- Review Task Logic ---
    const toggleReviewTask = (taskId) => {
        if (selectedTasks.includes(taskId)) {
            setSelectedTasks(selectedTasks.filter(id => id !== taskId));
        } else {
            if (selectedTasks.length >= 5) {
                alert("You can select max 5 tasks per batch!");
                return;
            }
            setSelectedTasks([...selectedTasks, taskId]);
        }
    };

    const handleApplyReviews = async () => {
        if (selectedTasks.length < 5) {
            alert("Please select at least 5 tasks to complete the set.");
            return;
        }
        setSubmitting(true);
        try {
            await api.post('/task/submit', { taskIds: selectedTasks, type: 'review' });
            setMessage(`🎉 Reviews Submitted Successfully!`);
            setSelectedTasks([]);
            // Hard Refresh to ensure strict sync (Bullet-Proof Directive)
            window.location.reload();
        } catch (err) {
            setMessage('❌ Error: ' + (err.response?.data?.message || err.message));
        } finally {
            setSubmitting(false);
        }
    };


    // --- Helper to determine Content Type ---
    const isImageLink = (url) => {
        if (!url) return false;
        return url.match(/\.(jpeg|jpg|gif|png|webp)$/) != null;
    };


    if (loading) return <div className="p-10 text-center text-white flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div></div>;

    if (!canWork) {
        return (
            <div className="min-h-screen bg-slate-900 pb-24 p-6 flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mb-6 shadow-2xl shadow-black/50 border border-slate-700">
                    <ShoppingBag className="w-10 h-10 text-slate-500" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">Access Locked</h1>
                <p className="text-slate-400 mb-8 max-w-xs mx-auto">{lockMessage || "You need an active plan to access these tasks."}</p>

                <a href="/plans" className="w-full max-w-sm py-4 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-2xl font-bold text-slate-900 shadow-lg shadow-amber-500/20 hover:scale-105 transition-transform">
                    View VIP Plans
                </a>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-900 pb-24 p-4 relative">
            <header className="mb-6">
                <h1 className="text-2xl font-bold text-white mb-4">Task Center</h1>

                {/* Tabs */}
                <div className="flex bg-slate-800 p-1 rounded-xl">
                    <button
                        onClick={() => setActiveTab('review')}
                        className={`flex-1 py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'review' ? 'bg-slate-700 text-yellow-400 shadow-lg' : 'text-slate-400 hover:text-white'}`}
                    >
                        <Star className="w-4 h-4" />
                        Smart Reviews
                    </button>
                    <button
                        onClick={() => setActiveTab('ad')}
                        className={`flex-1 py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'ad' ? 'bg-slate-700 text-blue-400 shadow-lg' : 'text-slate-400 hover:text-white'}`}
                    >
                        <Video className="w-4 h-4" />
                        Video Ads
                    </button>
                </div>
            </header>

            {message && (
                <div className={`mb-6 p-4 rounded-xl animate-in zoom-in border ${message.includes('Error') ? 'bg-red-500/10 border-red-500/20 text-red-200' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-200'}`}>
                    {message}
                </div>
            )}


            {/* --- TAB: SMART REVIEWS --- */}
            {activeTab === 'review' && (
                <div className="animate-in fade-in slide-in-from-right-4">
                    <div className="flex justify-between items-center mb-4">
                        <p className="text-xs text-slate-400">Select 5 tasks to submit.</p>
                        <span className="text-xs bg-yellow-400/10 text-yellow-400 px-2 py-1 rounded border border-yellow-400/20">Selected: {selectedTasks.length}/5</span>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                        {reviewTasks.map(task => (
                            <div key={task.id} onClick={() => toggleReviewTask(task.id)}
                                className={`relative p-3 md:p-4 rounded-xl md:rounded-2xl border-2 transition-all cursor-pointer shadow-lg overflow-hidden group
                                    ${selectedTasks.includes(task.id)
                                        ? 'bg-gradient-to-br from-purple-600/20 to-blue-600/20 border-green-400 shadow-green-400/10'
                                        : 'bg-slate-800/50 border-slate-700/50 hover:border-slate-500'}`}
                            >
                                <div className={`absolute top-2 right-2 md:top-4 md:right-4 z-10 w-5 h-5 md:w-6 md:h-6 rounded-full border-2 flex items-center justify-center transition-all ${selectedTasks.includes(task.id) ? 'bg-green-500 border-green-500 scale-110' : 'border-slate-500 bg-slate-900/50'}`}>
                                    {selectedTasks.includes(task.id) && <CheckCircle className="w-3 h-3 md:w-4 md:h-4 text-white" />}
                                </div>
                                <div className="flex flex-col md:flex-row gap-2 md:gap-4">
                                    <div className="w-full h-24 md:w-20 md:h-20 rounded-lg md:rounded-xl bg-slate-700 shrink-0 overflow-hidden">
                                        <img src={task.productImage} alt={task.productName} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-sm md:text-base text-white mb-1 leading-tight truncate">{task.productName}</h3>
                                        <p className="text-[10px] md:text-xs text-slate-400 line-clamp-2 md:line-clamp-3 break-words">{task.reviewText}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="fixed bottom-24 left-4 right-4 md:left-64 md:right-10 z-40">
                        <button
                            onClick={handleApplyReviews}
                            disabled={selectedTasks.length < 5 || submitting}
                            className={`w-full py-4 rounded-2xl font-bold text-lg shadow-xl shadow-black/20 transition-all active:scale-95 ${selectedTasks.length >= 5 ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white' : 'bg-slate-700 text-slate-400 cursor-not-allowed'}`}
                        >
                            {submitting ? 'Verifying...' : `Apply / Complete (${selectedTasks.length}/5)`}
                        </button>
                    </div>
                </div>
            )}

            {/* --- TAB: VIDEO ADS (MODAL TRIGGER) --- */}
            {activeTab === 'ad' && (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 pb-20 animate-in fade-in slide-in-from-left-4">
                    {adTasks.length === 0 ? (
                        <div className="col-span-full text-center py-20 text-slate-500">No Video Ads Available Today.</div>
                    ) : (
                        adTasks.map(ad => (
                            <div key={ad.id} className="bg-[#121620] p-3 md:p-4 rounded-xl md:rounded-2xl border border-white/5 flex flex-col items-center text-center gap-3 group hover:border-blue-500/30 transition-all h-full relative overflow-hidden">
                                <div className="absolute top-2 right-2 px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[10px] font-bold rounded">Video</div>
                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform shrink-0 mt-2">
                                    <PlayCircle className="w-5 h-5 md:w-6 md:h-6" />
                                </div>
                                <div className="flex-1 min-w-0 w-full">
                                    <h3 className="font-bold text-sm md:text-base text-white truncate w-full">{ad.title}</h3>
                                    <p className="text-[10px] md:text-xs text-slate-400 truncate w-full">{ad.reviewText || 'Watch to earn'}</p>
                                </div>
                                <button
                                    onClick={() => openAdModal(ad)}
                                    className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-[10px] md:text-xs font-bold text-white transition-colors"
                                >
                                    Watch & Earn
                                </button>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* --- SMART AD MODAL --- */}
            {showModal && activeTask && (
                <div className="fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur-xl animate-in zoom-in-95 duration-200">

                    {/* Header: Timer & Status */}
                    <div className="flex justify-between items-center p-4 border-b border-white/10 bg-black/40">
                        <div className="flex items-center gap-2">
                            <h2 className="text-white font-bold truncate max-w-[200px]">{activeTask.title}</h2>
                        </div>
                        <div className={`px-4 py-1.5 rounded-full font-mono font-bold text-sm flex items-center gap-2 border ${isClaimable ? 'bg-green-500/20 text-green-400 border-green-500/50' : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'}`}>
                            <Timer className="w-4 h-4" />
                            {isClaimable ? 'Ready!' : `${modalTimer}s`}
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 relative w-full h-full flex items-center justify-center overflow-hidden bg-black">
                        {showCoin && (
                            <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in">
                                <div className="text-center animate-bounce-custom">
                                    <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-yellow-300 via-yellow-500 to-amber-600 shadow-[0_0_80px_rgba(234,179,8,0.5)] flex items-center justify-center border-4 border-yellow-200">
                                        <span className="text-5xl font-black text-yellow-100">৳</span>
                                    </div>
                                    <h2 className="text-2xl font-bold text-yellow-400 mt-6">Claimed!</h2>
                                </div>
                            </div>
                        )}

                        {/* Rendering Logic: Image vs Iframe */}
                        {isImageLink(activeTask.adLink) ? (
                            <img src={activeTask.adLink} alt="Ad Content" className="max-w-full max-h-full object-contain" />
                        ) : (
                            <iframe
                                src={activeTask.adLink}
                                title="Ad Frame"
                                className="w-full h-full border-0 bg-white"
                                sandbox="allow-scripts allow-same-origin allow-presentation"
                            />
                        )}
                    </div>

                    {/* Footer: Controls */}
                    <div className="p-4 border-t border-white/10 bg-black/40 pb-10 md:pb-4">
                        {!isClaimable ? (
                            <button disabled className="w-full py-4 bg-slate-800 text-slate-500 rounded-xl font-bold flex items-center justify-center gap-2 cursor-wait">
                                <Timer className="w-5 h-5 animate-spin-slow" />
                                Wait {modalTimer}s to Claim
                            </button>
                        ) : (
                            <div className="flex gap-3">
                                <button onClick={closeAdModal} className="px-6 py-4 bg-slate-700 text-white rounded-xl font-bold hover:bg-slate-600 transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                                <button onClick={handleClaimReward} disabled={submitting} className="flex-1 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-green-500/20 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2">
                                    <CheckCircle className="w-5 h-5" />
                                    Claim Reward
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
