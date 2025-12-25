'use client';
import { useState } from 'react';
import api from '../../../services/api';
import { useRouter } from 'next/navigation';
import BottomNav from '../../../components/BottomNav';
import { ArrowLeft, Smartphone, Zap } from 'lucide-react';
import Link from 'next/link';
import TapToConfirmButton from '../../../components/TapToConfirmButton';

export default function MobileRechargePage() {
    const [operator, setOperator] = useState('Grameenphone');
    const [phone, setPhone] = useState('');
    const [amount, setAmount] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const operators = [
        { name: 'Grameenphone', color: 'bg-blue-500' },
        { name: 'Banglalink', color: 'bg-orange-500' },
        { name: 'Robi', color: 'bg-red-500' },
        { name: 'Airtel', color: 'bg-red-600' },
        { name: 'Teletalk', color: 'bg-green-500' }
    ];

    const handleConfirm = () => {
        setLoading(true);
        api.post('/transaction/mobile-recharge', {
            recipientPhone: phone,
            amount: parseFloat(amount),
            operator
        })
            .then(() => {
                setMessage('Recharge Successful! ⚡');
                setTimeout(() => router.push('/dashboard'), 2000);
            })
            .catch(err => {
                setMessage(err.response?.data?.message || 'Request failed');
                setLoading(false);
            });
    };

    return (
        <div className="flex flex-col h-screen bg-slate-50 font-sans">
            {/* Header */}
            <div className="bg-white p-4 pt-6 shadow-sm z-10 sticky top-0 flex items-center gap-4">
                <Link href="/dashboard" className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors">
                    <ArrowLeft className="w-6 h-6 text-slate-700" />
                </Link>
                <h1 className="text-lg font-bold text-slate-800">Mobile Recharge</h1>
            </div>

            <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                {message ? (
                    <div className="h-full flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-300">
                        <div className="w-24 h-24 bg-blue-100/50 rounded-full flex items-center justify-center mb-6 ring-8 ring-blue-50">
                            <span className="text-4xl animate-bounce">⚡</span>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">{message}</h2>
                        <p className="text-slate-500">Your recharge is being processed.</p>
                    </div>
                ) : (
                    <div className="max-w-lg mx-auto space-y-8 py-4">

                        {/* Phone Number Input */}
                        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Phone Number</label>
                            <div className="flex items-center gap-3">
                                <Smartphone className="w-5 h-5 text-slate-400" />
                                <input
                                    type="tel"
                                    className="w-full text-xl font-bold text-slate-800 outline-none placeholder:text-slate-300"
                                    placeholder="017XXXXXXXX"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Operator Grid */}
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">Select Operator</label>
                            <div className="grid grid-cols-3 gap-3">
                                {operators.map(op => (
                                    <button
                                        key={op.name}
                                        type="button"
                                        onClick={() => setOperator(op.name)}
                                        className={`py-3 px-2 rounded-xl text-xs font-bold transition-all border-2 ${operator === op.name
                                            ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md scale-[1.02]'
                                            : 'border-slate-100 bg-white text-slate-500 hover:bg-slate-50 hover:border-slate-200'
                                            }`}
                                    >
                                        {op.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Amount Input - Huge */}
                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm text-center focus-within:ring-4 focus-within:ring-blue-500/10 transition-all">
                            <label className="block text-xs font-bold text-blue-500 uppercase tracking-widest mb-4">Recharge Amount</label>
                            <div className="flex items-center justify-center">
                                <span className="text-4xl font-black text-slate-300 mr-2">৳</span>
                                <input
                                    type="number"
                                    className="w-48 text-5xl font-black text-slate-800 outline-none placeholder:text-slate-200 text-center bg-transparent"
                                    placeholder="0"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Tap to Confirm Section */}
            {!message && (
                <div className="bg-white p-6 pb-8 rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-20">
                    <div className="flex justify-between items-center mb-8 px-4 text-sm text-slate-500">
                        <span>Operator</span>
                        <span className="font-bold text-blue-600">{operator}</span>
                    </div>

                    <TapToConfirmButton
                        onConfirm={handleConfirm}
                        isLoading={loading}
                        color="blue"
                        initialLabel="Tap and Hold to Recharge"
                        confirmingLabel="Recharging..."
                    />
                </div>
            )}
        </div>
    );
}
