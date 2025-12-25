'use client';
import { useState, useEffect } from 'react';
import api from '../../../services/api';
import BottomNav from '../../../components/BottomNav';
import { ArrowLeft, Wallet, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function WithdrawalPage() {
    const router = useRouter();
    const [balance, setBalance] = useState({ main: 0, income: 0 });
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [form, setForm] = useState({
        amount: '',
        method: 'Bkash',
        walletType: 'income', // Default to Income
        accountDetails: ''
    });

    useEffect(() => {
        fetchBalance();
    }, []);

    const fetchBalance = async () => {
        try {
            const res = await api.get('/wallet/balance');
            setBalance({
                main: res.data.wallet_balance,
                income: res.data.income_balance
            });
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleWithdraw = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        setSuccess('');

        try {
            // Basic validation
            if (parseFloat(form.amount) < 100) { // Min withdraw example
                throw new Error("Minimum withdrawal is 100 BDT");
            }

            await api.post('/withdrawal/request', {
                amount: form.amount,
                method: form.method,
                walletType: form.walletType,
                accountDetails: form.accountDetails
            });

            setSuccess('Withdrawal request submitted successfully!');
            setForm({ ...form, amount: '', accountDetails: '' });
            fetchBalance(); // Refresh balance
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Withdrawal failed');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-gray-50 text-gray-800">
            {/* Header */}
            <div className="bg-primary p-6 rounded-b-[2rem] shadow-lg text-white mb-6">
                <Link href="/dashboard" className="inline-flex items-center text-white/80 hover:text-white transition gap-2 mb-4">
                    <ArrowLeft className="w-5 h-5" /> Back
                </Link>
                <h1 className="text-2xl font-bold">Withdraw Money</h1>
                <p className="text-pink-100 text-sm opacity-90">Securely transfer to your account</p>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-24 no-scrollbar">

                {/* Balance Cards */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div
                        onClick={() => setForm({ ...form, walletType: 'income' })}
                        className={`p-4 rounded-2xl border-2 transition cursor-pointer relative overflow-hidden ${form.walletType === 'income' ? 'border-primary bg-pink-50' : 'border-white bg-white shadow-sm'}`}
                    >
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Income Wallet</p>
                        <h3 className="text-xl font-bold text-gray-900">৳ {balance.income}</h3>
                        {form.walletType === 'income' && <div className="absolute top-2 right-2 text-primary"><Wallet className="w-4 h-4" /></div>}
                    </div>

                    <div
                        onClick={() => setForm({ ...form, walletType: 'main' })}
                        className={`p-4 rounded-2xl border-2 transition cursor-pointer relative overflow-hidden ${form.walletType === 'main' ? 'border-primary bg-pink-50' : 'border-white bg-white shadow-sm'}`}
                    >
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Main Wallet</p>
                        <h3 className="text-xl font-bold text-gray-900">৳ {balance.main}</h3>
                        {form.walletType === 'main' && <div className="absolute top-2 right-2 text-primary"><Wallet className="w-4 h-4" /></div>}
                    </div>
                </div>

                {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm flex items-center shadow-sm"><AlertCircle className="w-4 h-4 mr-2" /> {error}</div>}
                {success && <div className="mb-6 p-4 bg-green-50 text-green-600 rounded-xl border border-green-100 text-sm flex items-center shadow-sm">✅ {success}</div>}

                <form onSubmit={handleWithdraw} className="space-y-5 bg-white p-6 rounded-3xl shadow-sm border border-gray-100/50">

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 ml-1">Withdraw From</label>
                        <div className="p-3 bg-gray-50 rounded-xl text-sm font-medium text-gray-700 capitalize border border-gray-100">
                            {form.walletType} Wallet
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 ml-1">Payment Method</label>
                        <div className="grid grid-cols-2 gap-3">
                            {['Bkash', 'Nagad'].map(method => (
                                <button
                                    key={method}
                                    type="button"
                                    onClick={() => setForm({ ...form, method })}
                                    className={`py-3 px-4 rounded-xl text-sm font-bold transition ${form.method === method ? 'bg-primary text-white shadow-md transform scale-[1.02]' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                                >
                                    {method}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 ml-1">Amount</label>
                        <input
                            type="number"
                            placeholder="Min 100 ৳"
                            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-bold text-xl placeholder:text-gray-300 placeholder:font-normal"
                            value={form.amount}
                            onChange={(e) => setForm({ ...form, amount: e.target.value })}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 ml-1">Account Number</label>
                        <input
                            type="tel"
                            placeholder="017..."
                            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-medium placeholder:text-gray-400"
                            value={form.accountDetails}
                            onChange={(e) => setForm({ ...form, accountDetails: e.target.value })}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-primary text-white font-bold py-4 rounded-2xl shadow-xl hover:bg-primary-dark active:scale-95 transition-all flex justify-center items-center text-lg mt-4 disabled:opacity-70 disabled:active:scale-100"
                    >
                        {submitting ? <span className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></span> : 'Request Withdraw'}
                    </button>
                </form>

                <div className="mt-8 text-center text-xs text-gray-400 max-w-[200px] mx-auto leading-relaxed">
                    Withdrawals are processed within 24 hours. Contact Support for urgent issues.
                </div>
            </div>

            <div className="fixed bottom-0 left-0 right-0 z-40 md:absolute">
                <BottomNav />
            </div>
        </div>
    );
}
