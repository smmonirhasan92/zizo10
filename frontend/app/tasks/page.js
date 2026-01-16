'use client';
import { useState, useEffect } from 'react';
import api from '@/services/api';
import { CheckCircle, AlertTriangle, PlayCircle, Star, ShoppingBag, Video } from 'lucide-react';

export default function TaskCenterPage() {
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

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const res = await api.get('/task/status');
            // Backend sends { adTasks: [], reviewTasks: [], canWork: true/false, message: '' }

            if (res.data.canWork === false) {
                setCanWork(false);
                setLockMessage(res.data.message);
                return; // Stop loading tasks if locked
            }

            setAdTasks(res.data.adTasks || []);
            setReviewTasks(res.data.reviewTasks || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
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
            // Placeholder: Review Task Submission logic
            await api.post('/task/submit', { taskIds: selectedTasks, type: 'review' });
            setMessage(`🎉 Reviews Submitted Successfully!`);
            setSelectedTasks([]);
        } catch (err) {
            setMessage('❌ Error: ' + (err.response?.data?.message || err.message));
        } finally {
            setSubmitting(false);
        }
    };

    // --- Ad Task Logic ---
    // --- Ad Task Logic ---
    const import_useRouter = require('next/navigation').useRouter; // Need router.
    // Wait, I can't require in a function body like this in Next.js usually for hooks.
    // I need to add useRouter to top level.
    // Let me abort this specific chunk and do a full component update or see if router is available.
    // Checking file content... `import { useState, useEffect } from 'react';`
    // No router imported. I need to add `useRouter`.
    // I will do in next steps. For now, let's just use window.location.href as fallback or better, add the hook.

    // Actually, I can use a Link component or standard navigation. 
    // Let's modify the function to redirect.

    // I will simply replace the content with the logic, assuming I will add the hook import in another step.
    const handleWatchAd = (ad) => {
        // Navigate to Work Page for Embedded Viewing
        window.location.href = `/tasks/work?task=1&adId=${ad.id}`;
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
        <div className="min-h-screen bg-slate-900 pb-24 p-4">
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

            {/* --- SMART LOCK SCREEN --- */}
            {/* If backend says canWork: false (we need to capture this state) */}
            {/* Since I didn't update state yet, I will do it in next step. For now, let's assume if both empty and message says so. */}

            {/* --- TAB: SMART REVIEWS (NEW) --- */}
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

                    <div className="fixed bottom-24 left-4 right-4 md:left-64 md:right-10 z-40"> {/* Adjusted bottom */}
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

            {/* --- TAB: VIDEO ADS --- */}
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
                                    onClick={() => handleWatchAd(ad)}
                                    className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-[10px] md:text-xs font-bold text-white transition-colors"
                                >
                                    Watch & Earn
                                </button>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
