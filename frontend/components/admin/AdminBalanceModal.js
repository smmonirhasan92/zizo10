import { useState, useEffect } from 'react';
import { X, DollarSign } from 'lucide-react';
import api from '../../services/api';

export default function AdminBalanceModal({ user, onClose }) {
    const [amount, setAmount] = useState('');
    const [type, setType] = useState('credit'); // credit (add) or debit (deduct)
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(false);

    if (!user) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Use specific endpoint for manual balance adjustment
            await api.post('/admin/user/balance-adjust', {
                userId: user.id,
                amount: parseFloat(amount),
                type,
                note
            });
            alert('Balance updated successfully');
            onClose(); // Parent should refresh
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Failed to update balance');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="font-bold text-lg text-slate-800">Manage Balance</h3>
                        <p className="text-xs text-slate-500">User: {user.fullName} ({user.phone})</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => setType('credit')}
                            className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition ${type === 'credit' ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                        >
                            <span className="font-bold text-sm">Add Money</span>
                            <span className="text-[10px] uppercase">Credit</span>
                        </button>
                        {/* Penalty Modal exists separately, but this allows general Debit too */}
                        <button
                            type="button"
                            onClick={() => setType('debit')}
                            className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition ${type === 'debit' ? 'bg-rose-50 border-rose-500 text-rose-700' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                        >
                            <span className="font-bold text-sm">Deduct Money</span>
                            <span className="text-[10px] uppercase">Debit</span>
                        </button>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Amount</label>
                        <div className="relative">
                            <DollarSign className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="0.00"
                                min="1"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Note / Reason</label>
                        <input
                            type="text"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="e.g., Manual Correction"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition disabled:opacity-50"
                    >
                        {loading ? 'Processing...' : 'Confirm Update'}
                    </button>
                </form>
            </div>
        </div>
    );
}
