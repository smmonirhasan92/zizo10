'use client';
import { useState, useEffect } from 'react';
import api from '../../../services/api';
import { useRouter } from 'next/navigation';
import BottomNav from '../../../components/BottomNav';
import { ArrowLeft, Upload, Zap, Building2, Smartphone } from 'lucide-react';
import Link from 'next/link';
import TapToConfirmButton from '../../../components/TapToConfirmButton';

export default function RechargePage() {
    const [amount, setAmount] = useState('');
    const [paymentMode, setPaymentMode] = useState('mobile_banking'); // 'mobile_banking' | 'bank_transfer'
    const [method, setMethod] = useState('bkash');
    const [trxId, setTrxId] = useState('');
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [paymentSettings, setPaymentSettings] = useState({ bkash_number: '', bank_details: '', deposit_agents: [] });
    const [selectedDepositAgent, setSelectedDepositAgent] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await api.get('/transaction/settings/payment');
                setPaymentSettings(res.data);
                // Auto-select first agent if available
                if (res.data.deposit_agents && res.data.deposit_agents.length > 0) {
                    setSelectedDepositAgent(res.data.deposit_agents[0]);
                }
            } catch (err) {
                console.error('Failed to fetch settings');
            }
        };
        fetchSettings();
    }, []);

    const handleConfirm = () => {
        setLoading(true);

        const formData = new FormData();
        formData.append('amount', amount);
        formData.append('method', paymentMode === 'bank_transfer' ? 'Bank Transfer' : method);
        formData.append('transactionId', trxId);

        // Critical: Send Agent ID if money was sent to an Agent Number
        if (paymentMode === 'mobile_banking' && selectedDepositAgent) {
            formData.append('receivedByAgentId', selectedDepositAgent.agentId);
            formData.append('recipientDetails', `Sent to: ${selectedDepositAgent.number} (${selectedDepositAgent.agentName})`);
        } else {
            // Fallback for legacy static Admin Number
            formData.append('recipientDetails', `Sent to: ${paymentSettings.bkash_number}`);
        }

        if (file) formData.append('proofImage', file);

        api.post('/transaction/add-money', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
            .then(() => {
                setMessage('Request submitted! 🚀');
                setTimeout(() => router.push('/dashboard'), 2000);
            })
            .catch(err => {
                setMessage('Error submitting request.');
                setLoading(false);
            });
    };

    return (
        <div className="flex flex-col h-screen bg-slate-50 font-sans">
            {/* Header */}
            <div className="bg-white px-4 py-3 shadow-sm z-10 sticky top-0 flex items-center gap-3">
                <Link href="/dashboard" className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors">
                    <ArrowLeft className="w-5 h-5 text-slate-700" />
                </Link>
                <h1 className="text-base font-bold text-slate-800">Add Money</h1>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-hide">
                {message ? (
                    <div className="h-full flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-300">
                        <div className="w-20 h-20 bg-green-100/50 rounded-full flex items-center justify-center mb-6 ring-8 ring-green-50">
                            <span className="text-3xl animate-bounce">🎉</span>
                        </div>
                        <h2 className="text-xl font-bold text-slate-800 mb-1">{message}</h2>
                        <p className="text-xs text-slate-500">Your request has been submitted.</p>
                    </div>
                ) : (
                    <div className="max-w-lg mx-auto space-y-4">

                        {/* Payment Mode Tabs (Compact) */}
                        <div className="flex p-1 bg-slate-100 rounded-lg">
                            <button
                                type="button"
                                onClick={() => setPaymentMode('mobile_banking')}
                                className={`flex-1 py-2 rounded-md font-bold text-xs flex items-center justify-center gap-2 transition ${paymentMode === 'mobile_banking' ? 'bg-white text-green-600 shadow-sm' : 'text-slate-400'}`}
                            >
                                <Smartphone className="w-3.5 h-3.5" /> Mobile
                            </button>
                            <button
                                type="button"
                                onClick={() => setPaymentMode('bank_transfer')}
                                className={`flex-1 py-2 rounded-md font-bold text-xs flex items-center justify-center gap-2 transition ${paymentMode === 'bank_transfer' ? 'bg-white text-green-600 shadow-sm' : 'text-slate-400'}`}
                            >
                                <Building2 className="w-3.5 h-3.5" /> Bank
                            </button>
                        </div>

                        {/* Method Select (Compact) */}
                        {paymentMode === 'mobile_banking' && (
                            <div className="flex gap-2">
                                {['bkash', 'nagad', 'rocket'].map(m => (
                                    <button
                                        key={m}
                                        type="button"
                                        onClick={() => setMethod(m)}
                                        className={`flex-1 py-2 rounded-lg font-bold capitalize text-xs transition border ${method === m ? 'border-green-500 bg-green-50 text-green-700' : 'border-slate-100 bg-white text-slate-400 hover:bg-slate-50'}`}
                                    >
                                        {m}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Payment Info Box (Compact) */}
                        <div className="bg-slate-800 p-4 rounded-xl text-white shadow-md relative overflow-hidden">
                            <div className="relative z-10">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Send Money To</p>
                                {paymentMode === 'mobile_banking' ? (
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 bg-white/10 rounded-md"><Smartphone className="w-4 h-4" /></div>
                                        <div className="flex-1">
                                            {/* Dynamic Agent Selection or Static Fallback */}
                                            {paymentSettings.deposit_agents && paymentSettings.deposit_agents.length > 0 ? (
                                                <select
                                                    className="w-full bg-transparent font-mono text-base font-bold tracking-wider outline-none text-white border-b border-slate-600 pb-1"
                                                    onChange={(e) => {
                                                        const agent = paymentSettings.deposit_agents.find(a => a.number === e.target.value);
                                                        setSelectedDepositAgent(agent);
                                                    }}
                                                    value={selectedDepositAgent?.number || ''}
                                                >
                                                    {paymentSettings.deposit_agents.map((agent, idx) => (
                                                        <option key={idx} value={agent.number} className="text-slate-900">
                                                            {agent.number} ({agent.agentName})
                                                        </option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <p className="font-mono text-base font-bold tracking-wider">{paymentSettings.bkash_number || '01XXXXXXXXX'}</p>
                                            )}
                                            <p className="text-[10px] text-slate-400 mt-1">Personal (Send Money)</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 bg-white/10 rounded-md"><Building2 className="w-4 h-4" /></div>
                                        <p className="whitespace-pre-line text-xs leading-relaxed font-mono opacity-90">{paymentSettings.bank_details || 'City Bank\nA/C: 1234567890'}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Transaction ID Input (Compact) */}
                        <div className="bg-white px-3 py-2 rounded-xl border border-slate-100 shadow-sm transition-all focus-within:ring-1 focus-within:ring-green-500/20">
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                                {paymentMode === 'mobile_banking' ? 'Sender Number / TrxID' : 'Your Account / TrxID'}
                            </label>
                            <input
                                type="text"
                                className="w-full text-base font-bold text-slate-800 outline-none placeholder:text-slate-300"
                                placeholder={paymentMode === 'mobile_banking' ? 'e.g. 017xxxxxxxx' : 'e.g. 1234567890'}
                                value={trxId}
                                onChange={(e) => setTrxId(e.target.value)}
                            />
                        </div>

                        {/* File Upload (Very Compact) */}
                        <div className={`border border-dashed rounded-lg p-3 text-center cursor-pointer transition ${file ? 'border-green-500 bg-green-50/50' : 'border-slate-200 hover:bg-slate-50'}`}>
                            <input
                                type="file"
                                id="file-upload"
                                className="hidden"
                                accept="image/*"
                                onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                        setFile(e.target.files[0]);
                                    }
                                }}
                            />
                            <label htmlFor="file-upload" className="cursor-pointer flex items-center justify-center gap-2 w-full">
                                <Upload className={`w-3.5 h-3.5 ${file ? 'text-green-600' : 'text-slate-400'}`} />
                                <span className={`text-xs font-bold ${file ? 'text-green-700' : 'text-slate-400'}`}>{file ? file.name : 'Upload Screenshot (Optional)'}</span>
                            </label>
                        </div>

                        {/* Amount Input - Compact Vertical */}
                        <div className="bg-white py-4 rounded-[1.5rem] border border-slate-100 shadow-sm text-center focus-within:ring-2 focus-within:ring-green-500/10 transition-all">
                            <label className="block text-[10px] font-bold text-green-500 uppercase tracking-widest mb-1">Amount</label>
                            <div className="flex items-center justify-center">
                                <span className="text-2xl font-black text-slate-300 mr-1">৳</span>
                                <input
                                    type="number"
                                    className="w-32 text-4xl font-black text-slate-800 outline-none placeholder:text-slate-200 text-center bg-transparent p-0 m-0"
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
                        <span>Payment Method</span>
                        <span className="font-bold text-green-600 capitalize">{paymentMode === 'mobile_banking' ? method : 'Bank Transfer'}</span>
                    </div>

                    <TapToConfirmButton
                        onConfirm={handleConfirm}
                        isLoading={loading}
                        color="green"
                        initialLabel="Tap and Hold to Add Money"
                        confirmingLabel="Processing..."
                    />
                </div>
            )}
        </div>
    );
}
