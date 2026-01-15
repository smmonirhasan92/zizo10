'use client';
import { useState, useEffect } from 'react';
import api from '@/services/api';
import { ArrowLeft, ArrowUpRight, ArrowDownLeft, Clock, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

export default function HistoryPage() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const res = await api.get('/wallet/history'); // Need to ensure this route exists
            setTransactions(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="min-h-screen bg-slate-900 pb-20 p-4">
            <header className="flex items-center gap-4 mb-6">
                <Link href="/dashboard" className="p-2 bg-slate-800 rounded-full text-white">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <h1 className="text-xl font-bold text-white">Transaction History</h1>
            </header>

            {loading ? (
                <div className="text-center text-slate-500 mt-10">Loading...</div>
            ) : transactions.length === 0 ? (
                <div className="text-center text-slate-500 mt-10">No transactions found.</div>
            ) : (
                <div className="space-y-3">
                    {transactions.map((tx) => (
                        <div key={tx.id} className="bg-slate-800 p-4 rounded-2xl flex justify-between items-center shadow-lg border border-slate-700/50">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${tx.type === 'deposit' || tx.type === 'task_income' || tx.type === 'signup_bonus' ? 'bg-green-500/20 text-green-400' :
                                        tx.type === 'withdraw' || tx.type === 'purchase' || tx.type === 'penalty' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'
                                    }`}>
                                    {tx.type === 'deposit' || tx.type === 'task_income' ? <ArrowDownLeft className="w-5 h-5" /> :
                                        tx.type === 'withdraw' || tx.type === 'purchase' ? <ArrowUpRight className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-white capitalize">{tx.description || tx.type.replace('_', ' ')}</h3>
                                    <p className="text-[10px] text-slate-400">{formatDate(tx.createdAt)}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className={`font-mono font-bold ${parseFloat(tx.amount) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {parseFloat(tx.amount) > 0 ? '+' : ''}{parseFloat(tx.amount).toFixed(2)} TK
                                </p>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full ${tx.status === 'completed' ? 'bg-green-500/10 text-green-400' :
                                        tx.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-red-500/10 text-red-400'
                                    }`}>
                                    {tx.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
