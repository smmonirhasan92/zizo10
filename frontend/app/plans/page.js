'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '../../services/api';
import { ArrowLeft, Crown, Check, Shield, AlertCircle, X, CheckCircle, Zap, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function PlansPage() {
    const router = useRouter();
    const [plans, setPlans] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [processing, setProcessing] = useState(false);

    // Custom UI States
    const [upgradeSuccess, setUpgradeSuccess] = useState(false);
    const [upgradeError, setUpgradeError] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [plansRes, userRes] = await Promise.all([
                api.get('/user/plans'),
                api.get('/auth/me')
            ]);
            setPlans(plansRes.data);
            setUser(userRes.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleUpgrade = async () => {
        if (!selectedPlan) return;
        setUpgradeError('');

        // Client-side Balance Check
        if (user?.Wallet && (parseFloat(user.Wallet.balance) + parseFloat(user.purchase_balance)) < parseFloat(selectedPlan.unlock_price)) {
            setUpgradeError('Insufficient Balance. Please Deposit first.');
            return;
        }

        setProcessing(true);
        try {
            const res = await api.post('/user/upgrade-tier', { planId: selectedPlan.id });
            if (res.data.success) {
                setUpgradeSuccess(true);
            }
        } catch (err) {
            console.error(err);
            setUpgradeError(err.response?.data?.message || 'Upgrade Failed');
        } finally {
            setProcessing(false);
        }
    };

    // Helper to get Plan Styles
    // Helper to get Plan Styles
    const getPlanStyle = (name) => {
        const lowerName = name.toLowerCase();
        if (lowerName.includes('vip') || lowerName.includes('diamond')) return {
            bg: 'bg-gradient-to-br from-[#1e1b4b] to-[#0F172A]',
            text: 'text-white',
            border: 'border-[#EAB308]',
            iconColor: 'bg-[#EAB308] text-black',
            badge: lowerName.includes('vip') ? 'LEGENDARY' : 'ELITE',
            shadow: 'shadow-[#EAB308]/20',
            glow: true,
            isDark: true,
            btn: 'bg-gradient-to-r from-[#EAB308] to-[#F59E0B] text-slate-900'
        };
        if (lowerName.includes('platinum')) return {
            bg: 'bg-gradient-to-br from-[#831843] to-[#500724]',
            text: 'text-white',
            border: 'border-pink-500/50',
            iconColor: 'bg-pink-500 text-white',
            badge: 'PREMIUM',
            shadow: 'shadow-pink-900/40',
            glow: false,
            isDark: true,
            btn: 'bg-gradient-to-r from-pink-500 to-pink-600 text-white'
        };
        if (lowerName.includes('gold')) return {
            bg: 'bg-gradient-to-br from-[#422006] to-[#0F172A]',
            text: 'text-amber-100',
            border: 'border-amber-600',
            iconColor: 'bg-amber-500 text-black',
            badge: 'POPULAR',
            shadow: 'shadow-amber-900/30',
            glow: false,
            isDark: true,
            btn: 'bg-gradient-to-r from-[#EAB308] to-[#D97706] text-slate-900'
        };
        if (lowerName.includes('silver')) return {
            bg: 'bg-white',
            text: 'text-slate-800',
            border: 'border-slate-200',
            iconColor: 'bg-slate-200 text-slate-600',
            badge: 'STANDARD',
            shadow: 'shadow-sm',
            glow: false,
            isDark: false,
            btn: 'bg-slate-900 text-white'
        };
        return {
            bg: 'bg-slate-50',
            text: 'text-slate-500',
            border: 'border-slate-100',
            iconColor: 'bg-slate-200 text-slate-400',
            badge: 'FREE',
            shadow: 'shadow-none',
            glow: false,
            isDark: false,
            btn: 'bg-white border-2 border-slate-200 text-slate-600'
        };
    };

    if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6"><div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>;

    const totalBalance = (parseFloat(user?.Wallet?.balance || 0) + parseFloat(user?.purchase_balance || 0)).toFixed(2);

    return (
        <div className="min-h-screen bg-[#1A1F2B] flex justify-center font-sans">
            <div className="w-full max-w-md bg-slate-50 min-h-screen relative shadow-2xl overflow-hidden">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="bg-[#0F172A] p-6 pb-12 rounded-b-[2.5rem] shadow-2xl relative overflow-hidden mb-6"
                >
                    {/* Premium Background Elements */}
                    <motion.div
                        animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="absolute top-0 right-0 w-64 h-64 bg-[#C2105E]/20 rounded-full blur-3xl -mr-20 -mt-20"
                    ></motion.div>
                    <motion.div
                        animate={{ scale: [1, 1.1, 1], x: [0, 20, 0] }}
                        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute bottom-0 left-0 w-48 h-48 bg-[#EAB308]/10 rounded-full blur-3xl -ml-16 -mb-16"
                    ></motion.div>

                    <div className="relative z-10">
                        <div className="flex justify-between items-center mb-6">
                            <Link href="/dashboard" className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center hover:bg-white/20 transition border border-white/5">
                                <ArrowLeft className="w-5 h-5 text-white" />
                            </Link>
                            {/* User Current Tier Badge */}
                            {user?.account_tier && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="flex items-center gap-2 bg-gradient-to-r from-yellow-600 to-yellow-500 px-4 py-1.5 rounded-full shadow-lg shadow-yellow-500/20"
                                >
                                    <Crown className="w-3.5 h-3.5 text-white fill-white" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white">{user.account_tier}</span>
                                </motion.div>
                            )}
                        </div>

                        <motion.h1
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-3xl font-black text-white mb-2 leading-tight"
                        >
                            Unlock <span className="text-[#EAB308]">VIP</span><br />Benefits
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="text-slate-400 text-sm font-medium"
                        >
                            Upgrade for higher daily limits & rewards.
                        </motion.p>
                    </div>
                </motion.div>

                {/* Plans Grid */}
                <motion.div
                    className="px-5 pb-32 space-y-5 -mt-6"
                    initial="hidden"
                    animate="visible"
                    variants={{
                        hidden: { opacity: 0 },
                        visible: {
                            opacity: 1,
                            transition: {
                                staggerChildren: 0.1
                            }
                        }
                    }}
                >
                    {plans.map((plan, index) => {
                        const style = getPlanStyle(plan.name);
                        const isCurrent = user?.account_tier === plan.name;

                        return (
                            <motion.div
                                key={plan.id}
                                variants={{
                                    hidden: { opacity: 0, y: 50 },
                                    visible: { opacity: 1, y: 0 }
                                }}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={`relative rounded-[2rem] p-0.5 transition-all duration-300 group ${style.shadow} ${style.glow ? 'animate-pulse-slow' : ''}`}
                                onClick={() => !isCurrent && setSelectedPlan(plan)}
                            >
                                {/* Border Gradient Container */}
                                <div className={`absolute inset-0 rounded-[2rem] ${style.bg} opacity-50 blur-sm`}></div>

                                <div className={`relative rounded-[2rem] p-6 overflow-hidden h-full border ${style.border} ${style.bg}`}>

                                    {/* Background Shine for Premium */}
                                    {style.glow && (
                                        <motion.div
                                            animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.2, 1] }}
                                            transition={{ duration: 4, repeat: Infinity }}
                                            className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-3xl"
                                        ></motion.div>
                                    )}

                                    <div className="flex justify-between items-start mb-6 relative z-10">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-lg ${style.iconColor}`}>
                                            {plan.name.includes('Diamond') ? '💎' : plan.name.includes('Gold') ? '👑' : plan.name.includes('Silver') ? '🛡️' : '🚀'}
                                        </div>
                                        <div className="text-right">
                                            <span className={`inline-block px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest mb-1 ${style.isDark ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                                {style.badge}
                                            </span>
                                            <p className={`text-2xl font-black ${style.text}`}>{plan.unlock_price > 0 ? `৳${plan.unlock_price}` : 'Free'}</p>
                                        </div>
                                    </div>

                                    <div className="mb-6 relative z-10">
                                        <h3 className={`text-xl font-black ${style.text} mb-1`}>{plan.name}</h3>
                                        <p className={`text-xs font-medium opacity-70 ${style.text}`}>Valid for {plan.validity_days} Days</p>
                                    </div>

                                    {/* Features */}
                                    <div className="space-y-3 mb-6 relative z-10">
                                        <div className={`flex items-center gap-3 p-3 rounded-xl backdrop-blur-sm border border-white/5 ${style.isDark ? 'bg-white/10' : 'bg-slate-100'}`}>
                                            <div className={`p-1.5 rounded-full ${style.isDark ? 'bg-white/20' : 'bg-white'}`}>
                                                <Zap className={`w-3.5 h-3.5 ${style.text}`} />
                                            </div>
                                            <div>
                                                <p className={`text-[9px] uppercase font-bold opacity-60 ${style.text}`}>Daily Limit</p>
                                                <p className={`text-sm font-bold ${style.text}`}>{plan.daily_limit} Tasks</p>
                                            </div>
                                        </div>
                                        <div className={`flex items-center gap-3 p-3 rounded-xl backdrop-blur-sm border border-white/5 ${style.isDark ? 'bg-white/10' : 'bg-slate-100'}`}>
                                            <div className={`p-1.5 rounded-full ${style.isDark ? 'bg-white/20' : 'bg-white'}`}>
                                                <Star className={`w-3.5 h-3.5 ${style.text}`} />
                                            </div>
                                            <div>
                                                <p className={`text-[9px] uppercase font-bold opacity-60 ${style.text}`}>Reward / Task</p>
                                                <p className={`text-sm font-bold ${style.text}`}>৳{plan.task_reward}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Button */}
                                    {isCurrent ? (
                                        <button className={`w-full py-4 rounded-xl font-bold text-sm cursor-default flex items-center justify-center gap-2 border ${style.isDark ? 'bg-white/20 border-white/10 text-white' : 'bg-emerald-100 border-emerald-200 text-emerald-700'}`}>
                                            <CheckCircle className="w-4 h-4" /> Current Plan
                                        </button>
                                    ) : (
                                        <button className={`w-full py-4 rounded-xl font-bold text-sm shadow-xl ${style.isDark
                                            ? 'bg-gradient-to-r from-[#EAB308] to-[#D97706] text-white overflow-hidden relative'
                                            : 'bg-[#0F172A] text-white hover:bg-slate-800'
                                            }`}>
                                            <span className="relative z-10">Select {plan.name}</span>
                                            {style.isDark && <div className="absolute inset-0 bg-white/20 opacity-0 hover:opacity-100 transition-opacity"></div>}
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>

                {/* Upgrade Modal */}
                <AnimatePresence>
                    {selectedPlan && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-0 md:p-4 z-[100]"
                        >
                            <motion.div
                                initial={{ y: "100%" }}
                                animate={{ y: 0 }}
                                exit={{ y: "100%" }}
                                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                                className="bg-white rounded-t-[2.5rem] md:rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
                            >
                                {upgradeSuccess ? (
                                    <div className="p-10 flex flex-col items-center text-center">
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            type="spring"
                                            className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6"
                                        >
                                            <CheckCircle className="w-12 h-12 text-green-600" />
                                        </motion.div>
                                        <h3 className="text-3xl font-black text-slate-800 mb-2">Success! 🎉</h3>
                                        <p className="text-slate-500 mb-8 font-medium">
                                            Welcome to the <span className="font-bold text-indigo-600">{selectedPlan.name}</span> club!
                                        </p>
                                        <button onClick={() => router.push('/dashboard')} className="w-full py-4 rounded-2xl bg-slate-900 text-white font-bold text-lg hover:bg-slate-800 transition">
                                            Go to Dashboard
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="p-8 pb-0">
                                            <div className="flex justify-between items-center mb-6">
                                                <div>
                                                    <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Confirm Upgrade</p>
                                                    <h2 className="text-3xl font-black text-slate-800">{selectedPlan.name}</h2>
                                                </div>
                                                <button onClick={() => setSelectedPlan(null)} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition">
                                                    <X className="w-6 h-6 text-slate-500" />
                                                </button>
                                            </div>

                                            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-4 mb-6">
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="font-bold text-slate-500">Price</span>
                                                    <span className="font-black text-xl text-slate-800">৳{selectedPlan.unlock_price}</span>
                                                </div>
                                                <div className="w-full h-px bg-slate-200"></div>
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="font-bold text-slate-500">Your Balance</span>
                                                    <span className={`font-black text-base ${parseFloat(totalBalance) < parseFloat(selectedPlan.unlock_price) ? 'text-red-500' : 'text-green-600'}`}>
                                                        ৳{totalBalance}
                                                    </span>
                                                </div>
                                            </div>

                                            {(upgradeError || (parseFloat(totalBalance) < parseFloat(selectedPlan.unlock_price))) && (
                                                <motion.div
                                                    initial={{ x: -10, opacity: 0 }}
                                                    animate={{ x: 0, opacity: 1 }}
                                                    className="bg-red-50 text-red-600 p-4 rounded-2xl flex gap-3 text-sm items-start font-medium mb-6"
                                                >
                                                    <AlertCircle className="w-5 h-5 shrink-0" />
                                                    <p>{upgradeError || 'Insufficient balance. Deposit funds to upgrade.'}</p>
                                                </motion.div>
                                            )}
                                        </div>

                                        <div className="p-8 pt-0">
                                            {(parseFloat(totalBalance) < parseFloat(selectedPlan.unlock_price)) ? (
                                                <Link href="/wallet/recharge" className="block w-full py-4 rounded-2xl bg-indigo-600 text-white font-bold text-lg hover:bg-indigo-700 shadow-xl shadow-indigo-200 text-center transition active:scale-[0.98]">
                                                    Deposit Money
                                                </Link>
                                            ) : (
                                                <button
                                                    onClick={handleUpgrade}
                                                    disabled={processing}
                                                    className="w-full py-4 rounded-2xl bg-slate-900 text-white font-bold text-lg hover:bg-slate-800 shadow-xl transition active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
                                                >
                                                    {processing ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Confirm & Pay'}
                                                </button>
                                            )}
                                        </div>
                                    </>
                                )}
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
