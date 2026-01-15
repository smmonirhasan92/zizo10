'use client';
import { useEffect, useState } from 'react';
import api from '../../services/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import BottomNav from '../../components/BottomNav';
import ImageSlider from '../../components/ImageSlider';
import Loading from '../../components/Loading'; // Custom Skeleton
import { Bell, Zap, Send, Smartphone, Plus, Gamepad2, Headset, Wallet, ArrowRight, User, History, CheckCircle, TrendingUp, DollarSign, ArrowDownLeft, ChevronUp, ChevronDown, Share2 } from 'lucide-react';

export default function DashboardPage() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeBalance, setActiveBalance] = useState('wallet'); // wallet, income, bonus
    const [showAmount, setShowAmount] = useState(false);
    const [isExpanded, setIsExpanded] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await api.get('/auth/me');
                if (res.data.role === 'agent') {
                    router.push('/agent/dashboard');
                    return;
                }
                setUser(res.data);
            } catch (err) {
                if (err.response && err.response.status === 401) {
                    localStorage.removeItem('token');
                    router.push('/');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [router]);

    if (loading) return <Loading />;

    const getBalance = () => {
        if (!user) return 0;
        switch (activeBalance) {
            case 'wallet': return user.wallet_balance || 0;
            case 'income': return user.income_balance || 0;
            case 'bonus': return user.purchase_balance || 0;
            default: return 0;
        }
    };

    const getCurrencyColor = () => {
        switch (activeBalance) {
            case 'wallet': return 'text-emerald-400';
            case 'income': return 'text-yellow-400';
            case 'bonus': return 'text-purple-400';
            default: return 'text-white';
        }
    };

    return (
        <div className="flex min-h-screen bg-[#1A1F2B] font-sans text-slate-200">
            {/* Desktop Sidebar (Stats) - Hidden on Mobile */}
            <aside className="hidden lg:flex flex-col w-64 bg-[#121620] border-r border-white/5 p-6 fixed h-full z-20">
                <div className="flex items-center gap-3 mb-10">
                    <img src="/logo.png" className="w-8 h-8 rounded-lg" alt="Logo" />
                    <h1 className="text-xl font-bold text-white tracking-wide">Zizo 10</h1>
                </div>

                <div className="space-y-6">
                    <div className="bg-[#1A1F2B] p-4 rounded-2xl border border-white/5">
                        <h4 className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Lifetime Summary</h4>
                        <div className="space-y-3">
                            <div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span>Total Deposit</span>
                                    <span className="text-emerald-400">৳{Number(user?.total_deposit || 0).toLocaleString()}</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 w-[75%] rounded-full"></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span>Total Withdraw</span>
                                    <span className="text-rose-400">৳{Number(user?.total_withdraw || 0).toLocaleString()}</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-rose-500 w-[45%] rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col items-center lg:ml-64 w-full">
                <div className="w-full max-w-[500px] lg:max-w-3xl flex flex-col min-h-screen relative pb-24">

                    {/* 1. Dynamic Header */}
                    <div className="px-5 pt-6 pb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="bg-white/5 p-1.5 rounded-xl border border-white/10 backdrop-blur-md">
                                <img src="/logo.png" className="w-6 h-6 rounded-md" alt="Zizo" />
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-400 leading-none">Hello,</p>
                                <h2 className="text-sm font-bold text-white leading-tight">{user?.fullName?.split(' ')[0]} 👋</h2>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link href="/support" className="relative p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors border border-white/5">
                                <Headset className="w-5 h-5 text-slate-300" />
                                {activeBalance === 'wallet' && <span className="absolute top-1.5 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-[#1A1F2B]"></span>}
                            </Link>
                            <Link href="/profile" className="w-9 h-9 rounded-full bg-indigo-600 p-0.5 border border-white/10 shadow-lg shadow-indigo-500/20">
                                <img src={`https://zizo10.com/api${user?.photoUrl}` || "https://ui-avatars.com/api/?name=User"} className="w-full h-full rounded-full object-cover" onError={(e) => e.target.src = "https://ui-avatars.com/api/?name=User"} />
                            </Link>
                        </div>
                    </div>

                    {/* 3. Slider (Moved to Top) */}
                    <div className="mt-4 w-full h-32 md:h-40 relative px-5">
                        <div className="rounded-2xl overflow-hidden shadow-2xl shadow-black/40 border border-white/5 h-full transform transition-transform hover:scale-[1.02]">
                            <ImageSlider />
                        </div>
                    </div>

                    {/* 2. Compact Balance Widget (3 Buttons) */}
                    <div className="px-5 mt-6">
                        <div className="bg-[#121620] p-1.5 rounded-2xl flex justify-between gap-1 border border-white/5 shadow-inner">
                            {['wallet', 'income', 'bonus'].map((type) => (
                                <button
                                    key={type}
                                    onClick={() => { setActiveBalance(type); setShowAmount(true); }}
                                    className={`flex-1 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-300 ${activeBalance === type
                                        ? 'bg-[#1A1F2B] text-white shadow-lg border border-white/10 translate-y-0'
                                        : 'text-slate-500 hover:text-slate-300'
                                        }`}
                                >
                                    {type === 'wallet' ? 'Main' : type.charAt(0).toUpperCase() + type.slice(1)}
                                </button>
                            ))}
                        </div>

                        {/* Amount Display (Collapsible) */}
                        <div className={`mt-4 overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'}`}>
                            <div className="text-center cursor-pointer active:scale-95 transition-transform" onClick={() => setShowAmount(!showAmount)}>
                                <h1 className={`text-4xl font-black tracking-tight ${getCurrencyColor()} drop-shadow-lg`}>
                                    <span className="text-2xl mr-1">৳</span>
                                    {showAmount ? Number(getBalance()).toLocaleString() : '••••••'}
                                </h1>
                            </div>
                        </div>

                        {/* Collapsible Toggle & Label */}
                        <div className="flex justify-center mt-2">
                            <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 transition-colors border border-white/5"
                            >
                                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest flex items-center gap-1">
                                    {activeBalance === 'wallet' && <Wallet className="w-3 h-3" />}
                                    {activeBalance === 'income' && <TrendingUp className="w-3 h-3" />}
                                    {activeBalance === 'bonus' && <Zap className="w-3 h-3" />}
                                    Current Balance
                                </p>
                                {isExpanded ? <ChevronUp className="w-3 h-3 text-slate-500" /> : <ChevronDown className="w-3 h-3 text-slate-500" />}
                            </button>
                        </div>
                    </div>

                    {/* Quick Actions (Restored & Styled) */}
                    <div className="px-5 mt-6 grid grid-cols-4 gap-3">
                        <Link href="/wallet/recharge" className="flex flex-col items-center gap-2 group">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 flex items-center justify-center border border-emerald-500/20 shadow-lg shadow-emerald-500/5 group-hover:scale-105 transition-transform backdrop-blur-sm">
                                <Plus className="w-5 h-5 text-emerald-400 group-hover:text-emerald-300" />
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 group-hover:text-emerald-400 transition-colors">Deposit</span>
                        </Link>

                        <Link href="/wallet/withdraw" className="flex flex-col items-center gap-2 group">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500/20 to-rose-600/10 flex items-center justify-center border border-rose-500/20 shadow-lg shadow-rose-500/5 group-hover:scale-105 transition-transform backdrop-blur-sm">
                                <ArrowDownLeft className="w-5 h-5 text-rose-400 group-hover:text-rose-300" />
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 group-hover:text-rose-400 transition-colors">Withdraw</span>
                        </Link>

                        <Link href="/invite" className="flex flex-col items-center gap-2 group">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 flex items-center justify-center border border-purple-500/20 shadow-lg shadow-purple-500/5 group-hover:scale-105 transition-transform backdrop-blur-sm">
                                <Share2 className="w-5 h-5 text-purple-400 group-hover:text-purple-300 -ml-0.5 mt-0.5" />
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 group-hover:text-purple-400 transition-colors">Invite</span>
                        </Link>

                        <Link href="/history" className="flex flex-col items-center gap-2 group">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 flex items-center justify-center border border-amber-500/20 shadow-lg shadow-amber-500/5 group-hover:scale-105 transition-transform backdrop-blur-sm">
                                <History className="w-5 h-5 text-amber-400 group-hover:text-amber-300" />
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 group-hover:text-amber-400 transition-colors">History</span>
                        </Link>
                    </div>



                    {/* 4. Task Center (List View Cards) */}
                    <div className="px-5 mt-8">
                        <div className="flex justify-between items-end mb-4 px-1">
                            <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                <span className="w-1 h-4 bg-yellow-400 rounded-full"></span>
                                Task Center
                            </h3>
                            <Link href="/tasks" className="text-[10px] text-yellow-400 font-bold hover:underline">View All</Link>
                        </div>

                        <div className="space-y-3">
                            {/* Example Task Card */}
                            <Link href="/tasks" className="block bg-[#121620] p-4 rounded-2xl border border-white/5 hover:border-white/10 transition-colors group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all">
                                        <CheckCircle className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-sm font-bold text-white">Watch Daily Ad</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="h-1 flex-1 bg-slate-800 rounded-full overflow-hidden">
                                                <div className="h-full bg-blue-500 w-[60%] rounded-full"></div>
                                            </div>
                                            <span className="text-[9px] text-slate-400">60% Done</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-sm font-bold text-yellow-400">+৳10</span>
                                        <ChevronRight className="w-4 h-4 text-slate-600" />
                                    </div>
                                </div>
                            </Link>

                            {/* Game Teaser */}
                            <Link href="/game" className="block bg-[#121620] p-4 rounded-2xl border border-white/5 hover:border-white/10 transition-colors group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-400 group-hover:bg-rose-500 group-hover:text-white transition-all">
                                        <Gamepad2 className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-sm font-bold text-white">Flip & Win</h4>
                                        <p className="text-[10px] text-slate-400 mt-0.5">Double your money instantly</p>
                                    </div>
                                    <div className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-400 text-[10px] font-bold border border-rose-500/20">
                                        Play
                                    </div>
                                </div>
                            </Link>
                        </div>
                    </div>

                    <div className="h-20"></div> {/* Spacer for bottom nav */}
                </div>
            </main>

            {/* Bottom Nav */}
            <BottomNav />

            {/* Floating Telegram Button */}
            <a href="https://t.me/+ReboihN0RXQxNTc1" target="_blank" className="fixed bottom-24 right-5 w-12 h-12 bg-[#0088cc] rounded-full flex items-center justify-center shadow-lg shadow-cyan-500/30 z-[9999] animate-bounce-slow hover:scale-110 transition-transform">
                <Send className="w-5 h-5 text-white" />
            </a>

            <style jsx>{`
                .animate-bounce-slow {
                    animation: bounce-slow 3s infinite;
                }
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
            `}</style>
        </div>
    );
}

function ChevronRight({ className }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="m9 18 6-6-6-6" />
        </svg>
    )
}
