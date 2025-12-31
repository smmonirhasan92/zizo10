'use client';
import { useState, useEffect } from 'react';
import api from '../../services/api';
import TaskCard from '../../components/TaskCard';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Crown, CheckCircle, X } from 'lucide-react';

export default function TaskPage() {
    const router = useRouter();
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    const fetchStatus = async () => {
        try {
            const res = await api.get('/task/status');
            setStatus(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setError('Failed to load tasks. Please try again.');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatus();
    }, []);

    if (loading) return <div className="text-white text-center p-10">Loading Task Center...</div>;
    if (error) return <div className="text-red-500 text-center p-10">{error}</div>;

    const { tasksCompleted, dailyLimit, taskAds, tierName } = status;

    const handleTaskClick = (taskNumber, adId) => {
        if (!status) return;

        // Restriction Check: If Starter/Free, Show Modal
        // Restriction Check: If !canWork, Show Modal
        if (status.canWork === false) {
            setShowUpgradeModal(true);
            return;
        }

        // Redirect to Work Page with adId
        router.push(`/tasks/work?task=${taskNumber}&adId=${adId || ''}`);
    };

    return (
        <div className="min-h-screen bg-black text-white p-4 pb-20">
            {/* Header */}
            <header className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="p-2 bg-gray-800 rounded-full text-gray-400 hover:text-white hover:bg-gray-700 transition"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
                        Task Center
                    </h1>
                </div>
                <div className="text-right">
                    <p className="text-sm text-gray-400">Today&apos;s Progress</p>
                    <p className="text-xl font-bold text-green-400 mb-1">
                        {tasksCompleted} / {dailyLimit}
                    </p>
                    <Link href="/plans" className="text-xs font-bold text-purple-400 hover:text-purple-300 border border-purple-500/30 px-2 py-1 rounded-lg">
                        + Increase Limit
                    </Link>
                </div>
            </header>

            {/* Task Grid - 2 Columns */}
            <div className="grid grid-cols-2 gap-4">
                {[...Array(dailyLimit)].map((_, index) => {
                    const taskNum = index + 1;

                    // Assign Ad from List (Cycle if fewer ads than limit)
                    const adData = taskAds && taskAds.length > 0
                        ? taskAds[index % taskAds.length]
                        : null;

                    let taskStatus = 'locked';
                    let isLocked = true;

                    if (taskNum <= tasksCompleted) {
                        taskStatus = 'completed';
                        isLocked = true;
                    } else if (taskNum === tasksCompleted + 1) {
                        taskStatus = 'active';
                        isLocked = false;
                    }

                    return (
                        <TaskCard
                            key={taskNum}
                            taskNumber={taskNum}
                            status={taskStatus}
                            isLocked={isLocked}
                            adData={adData}
                            onClick={() => handleTaskClick(taskNum, adData?.id)}
                        />
                    );
                })}
            </div>

            <div className="mt-8 text-center text-gray-500 text-sm">
                <p>Complete tasks daily to earn rewards.</p>
                <p>Tasks reset every day at midnight.</p>
            </div>

            {/* Upgrade Modal */}
            {showUpgradeModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden animate-slide-up relative">
                        {/* Close Button */}
                        <button
                            onClick={() => setShowUpgradeModal(false)}
                            className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition z-10"
                        >
                            <X className="w-4 h-4 text-slate-500" />
                        </button>

                        {/* Graphic */}
                        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-8 text-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-400/20 rounded-full -ml-10 -mb-10 blur-xl"></div>

                            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl mx-auto flex items-center justify-center mb-4 border border-white/30 shadow-lg">
                                <Crown className="w-8 h-8 text-white fill-yellow-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-1">Premium Plan</h2>
                            <p className="text-indigo-100 text-sm">Unlock Required</p>
                        </div>

                        {/* Content */}
                        <div className="p-6 text-center">
                            <h3 className="font-bold text-slate-800 text-lg mb-2">
                                Upgrade to Start Earning!
                            </h3>
                            <p className="text-slate-500 text-sm leading-relaxed mb-6">
                                To complete daily tasks and withdraw earnings, you must have an active <strong>Premium Package</strong>.
                                <br /><br />
                                Your daily income limit depends on your plan tier.
                            </p>

                            <div className="space-y-3">
                                <Link
                                    href="/plans"
                                    className="block w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-lg shadow-purple-200 hover:opacity-90 transition active:scale-95"
                                >
                                    View Plans & Upgrade
                                </Link>
                                <button
                                    onClick={() => setShowUpgradeModal(false)}
                                    className="block w-full py-3 text-slate-400 font-medium text-sm hover:text-slate-600 transition"
                                >
                                    Maybe Later
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
