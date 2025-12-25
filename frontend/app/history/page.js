'use client';
import { useEffect, useState } from 'react';
import api from '../../services/api';
import { ArrowLeft, Wallet, Send, Gamepad2, Gift, Clock, Smartphone, ChevronRight, Calendar, Filter } from 'lucide-react';
import Link from 'next/link';
import BottomNav from '../../components/BottomNav';

export default function HistoryPage() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await api.get('/transactions/history');
                setTransactions(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    const getMeta = (type) => {
        switch (type) {
            case 'add_money': return { icon: Wallet, color: 'text-emerald-500', bg: 'bg-emerald-500/10', label: 'Deposit' };
            case 'mobile_recharge': return { icon: Smartphone, color: 'text-violet-500', bg: 'bg-violet-500/10', label: 'Recharge' };
            case 'send_money': return { icon: Send, color: 'text-rose-500', bg: 'bg-rose-500/10', label: 'Transfer' };
            case 'game_win': return { icon: Gamepad2, color: 'text-amber-500', bg: 'bg-amber-500/10', label: 'Game Win' };
            case 'referral_bonus': return { icon: Gift, color: 'text-purple-500', bg: 'bg-purple-500/10', label: 'Referral Bonus' };
            default: return { icon: Clock, color: 'text-slate-400', bg: 'bg-slate-500/10', label: type?.replace('_', ' ') || 'Transaction' };
        }
    };

    // Smart Grouping Logic
    const groupTransactions = (txs) => {
        const groups = {};
        txs.forEach(tx => {
            const date = new Date(tx.createdAt);
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);

            let key = date.toLocaleDateString();
            if (date.toDateString() === today.toDateString()) key = 'Today';
            else if (date.toDateString() === yesterday.toDateString()) key = 'Yesterday';

            if (!groups[key]) groups[key] = [];
            groups[key].push(tx);
        });
        return groups;
    };

    const filteredTransactions = transactions.filter(tx => filter === 'all' || tx.type === filter);
    const groupedTransactions = groupTransactions(filteredTransactions);

    return (
        <div className="min-h-screen bg-[#1A1F2B] font-sans pb-24 text-slate-200">
            {/* Header */}
            <div className="sticky top-0 z-20 bg-[#1A1F2B]/90 backdrop-blur-md border-b border-white/5 px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="p-2 -ml-2 hover:bg-white/5 rounded-full transition text-slate-400">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="text-lg font-bold text-white tracking-wide">Activity</h1>
                </div>
                <button className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition border border-white/5">
                    <Filter className="w-4 h-4 text-slate-300" />
                </button>
            </div>

            {/* Content */}
            <div className="p-5">
                {/* Filter Tabs */}
                <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide mb-2">
                    {['all', 'add_money', 'mobile_recharge', 'game_win'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-1.5 rounded-full text-[11px] font-bold tracking-wide uppercase transition whitespace-nowrap border ${filter === f
                                ? 'bg-white text-[#1A1F2B] border-white'
                                : 'bg-transparent text-slate-500 border-slate-700 hover:border-slate-500'
                                }`}
                        >
                            {f === 'all' ? 'All' : f.replace('_', ' ')}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-16 bg-white/5 rounded-2xl animate-pulse"></div>
                        ))}
                    </div>
                ) : Object.keys(groupedTransactions).length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                            <Clock className="w-8 h-8 text-slate-600" />
                        </div>
                        <h3 className="text-sm font-bold text-slate-400">No transactions found</h3>
                        <p className="text-[10px] text-slate-600 mt-1">Your recent activity will appear here</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {Object.entries(groupedTransactions).map(([date, txs]) => (
                            <div key={date}>
                                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 pl-1">{date}</h3>
                                <div className="space-y-3">
                                    {txs.map(tx => {
                                        const meta = getMeta(tx.type);
                                        const Icon = meta.icon;
                                        const isCredit = parseFloat(tx.amount) > 0 || ['game_win', 'referral_bonus'].includes(tx.type);
                                        const amount = Math.abs(parseFloat(tx.amount));

                                        return (
                                            <div key={tx.id} className="bg-[#121620] p-4 rounded-2xl border border-white/5 flex items-center justify-between active:scale-[0.99] transition-transform">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${meta.bg} ${meta.color}`}>
                                                        <Icon className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-200">{meta.label}</p>
                                                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                                                            {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className={`text-sm font-bold tracking-tight ${isCredit ? 'text-emerald-400' : 'text-slate-200'}`}>
                                                        {isCredit ? '+' : '-'}৳{amount.toLocaleString()}
                                                    </p>
                                                    <p className={`text-[9px] font-bold uppercase tracking-wider mt-0.5 ${tx.status === 'completed' ? 'text-emerald-500/60' :
                                                            tx.status === 'pending' ? 'text-amber-500/60' : 'text-rose-500/60'
                                                        }`}>
                                                        {tx.status}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <BottomNav />
        </div>
    );
}
