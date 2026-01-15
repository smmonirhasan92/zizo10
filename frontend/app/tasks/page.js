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

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const res = await api.get('/task/status');
            // Backend sends { adTasks: [], reviewTasks: [] }
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
    const handleWatchAd = (ad) => {
        window.open(ad.adLink, '_blank');
        // Logic to claim reward after timer? 
        // For now, simple alert or auto-claim
        alert(`Opened Ad: ${ad.title}. Reward added (Simulated).`);
    };

    if (loading) return <div className="p-10 text-center text-white">Loading Tasks...</div>;

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
                <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 rounded-xl animate-in zoom-in">
                    {message}
                </div>
            )}

            {/* --- TAB: SMART REVIEWS (NEW) --- */}
            {activeTab === 'review' && (
                <div className="animate-in fade-in slide-in-from-right-4">
                    <div className="flex justify-between items-center mb-4">
                        <p className="text-xs text-slate-400">Select 5 tasks to submit.</p>
                        <span className="text-xs bg-yellow-400/10 text-yellow-400 px-2 py-1 rounded border border-yellow-400/20">Selected: {selectedTasks.length}/5</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {reviewTasks.map(task => (
                            <div key={task.id} onClick={() => toggleReviewTask(task.id)}
                                className={`relative p-4 rounded-2xl border-2 transition-all cursor-pointer shadow-lg overflow-hidden group
                                    ${selectedTasks.includes(task.id)
                                        ? 'bg-gradient-to-br from-purple-600/20 to-blue-600/20 border-green-400 shadow-green-400/10'
                                        : 'bg-slate-800/50 border-slate-700/50 hover:border-slate-500'}`}
                            >
                                <div className={`absolute top-4 right-4 z-10 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${selectedTasks.includes(task.id) ? 'bg-green-500 border-green-500 scale-110' : 'border-slate-500 bg-slate-900/50'}`}>
                                    {selectedTasks.includes(task.id) && <CheckCircle className="w-4 h-4 text-white" />}
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-20 h-20 rounded-xl bg-slate-700 shrink-0 overflow-hidden">
                                        <img src={task.productImage} alt={task.productName} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-white mb-1 leading-tight">{task.productName}</h3>
                                        <p className="text-xs text-slate-400 line-clamp-3">{task.reviewText}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="fixed bottom-20 left-4 right-4 md:left-64 md:right-10">
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

            {/* --- TAB: VIDEO ADS (OLD/RESTORED) --- */}
            {activeTab === 'ad' && (
                <div className="animate-in fade-in slide-in-from-left-4 space-y-4">
                    {adTasks.length === 0 ? (
                        <div className="text-center py-20 text-slate-500">No Video Ads Available Today.</div>
                    ) : (
                        adTasks.map(ad => (
                            <div key={ad.id} className="bg-[#121620] p-4 rounded-2xl border border-white/5 flex gap-4 items-center group hover:border-blue-500/30 transition-all">
                                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                                    <PlayCircle className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-white">{ad.title}</h3>
                                    <p className="text-xs text-slate-400">{ad.reviewText || 'Watch video to earn reward'}</p>
                                </div>
                                <button
                                    onClick={() => handleWatchAd(ad)}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs font-bold text-white transition-colors"
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
