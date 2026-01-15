import { useState } from 'react';
import api from '../../services/api';
import { X, AlertTriangle, ShieldAlert } from 'lucide-react';

export default function PenaltyModal({ show, onClose, userId, username }) {
    const [amount, setAmount] = useState('');
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);

    const handleConfirm = async () => {
        if (!amount || !reason) return;
        if (!confirm(`Are you sure you want to deduct ৳${amount} from ${username}?`)) return;

        setLoading(true);
        try {
            await api.post('/admin/user/penalty', { userId, amount, reason });
            alert('Penalty imposed successfully');
            onClose();
            setAmount('');
            setReason('');
        } catch (err) {
            console.error(err);
            alert('Failed to impose penalty: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-100 rounded-xl">
                            <ShieldAlert className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 leading-tight">Impose Penalty</h3>
                            <p className="text-xs text-slate-400">{username}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition">
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 mb-6">
                    <div className="flex gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-700 leading-relaxed">
                            This action will deduct money from the user's Main Balance and log a penalty record in the system. The user will be notified.
                        </p>
                    </div>
                </div>

                <div className="space-y-4 mb-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">Penalty Amount (৳)</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="e.g. 500"
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:ring-2 focus:ring-amber-500"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">Reason</label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Why is this penalty being imposed?"
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:ring-2 focus:ring-amber-500 min-h-[80px]"
                        ></textarea>
                    </div>
                </div>

                <button
                    onClick={handleConfirm}
                    disabled={loading || !amount || !reason}
                    className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold rounded-xl transition flex items-center justify-center gap-2"
                >
                    {loading ? 'Processing...' : 'Confirm Deduction'}
                </button>

            </div>
        </div>
    );
}
