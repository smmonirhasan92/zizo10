import { useState, useEffect } from 'react';
import api from '../../services/api';
import { X, TrendingUp, Check, Shield } from 'lucide-react';

export default function PromoteModal({ show, onClose, userId, username, currentTier }) {
    const [tiers, setTiers] = useState([]);
    const [selectedTier, setSelectedTier] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (show) {
            fetchTiers();
        }
    }, [show]);

    const fetchTiers = async () => {
        try {
            const res = await api.get('/plans'); // Or admin specific plans
            setTiers(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handlePromote = async () => {
        if (!selectedTier) return;
        setLoading(true);
        try {
            await api.post('/admin/user/promote', { userId, tierId: selectedTier });
            alert(`User promoted to new tier!`);
            onClose();
        } catch (err) {
            console.error(err);
            alert('Failed to promote user');
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
                        <div className="p-2 bg-emerald-100 rounded-xl">
                            <TrendingUp className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 leading-tight">Promote User</h3>
                            <p className="text-xs text-slate-400">{username}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition">
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6">
                    <p className="text-xs text-slate-400 font-bold uppercase mb-1">Current Status</p>
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-700">Current Tier</span>
                        <span className="px-2 py-1 bg-white border border-slate-200 rounded-md text-xs font-bold text-indigo-600">{currentTier || 'Starter'}</span>
                    </div>
                </div>

                <div className="mb-6 space-y-2">
                    <p className="text-sm font-bold text-slate-700 ml-1">Select New Tier</p>
                    <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-1">
                        {tiers.map(tier => (
                            <div
                                key={tier.id}
                                onClick={() => setSelectedTier(tier.id)}
                                className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${selectedTier === tier.id
                                        ? 'bg-emerald-50 border-emerald-500 shadow-sm'
                                        : 'bg-white border-slate-200 hover:border-emerald-300'
                                    }`}
                            >
                                <div>
                                    <p className={`text-sm font-bold ${selectedTier === tier.id ? 'text-emerald-700' : 'text-slate-700'}`}>{tier.name}</p>
                                    <p className="text-[10px] text-slate-400">Unlock: ৳{tier.unlock_price}</p>
                                </div>
                                {selectedTier === tier.id && <Check className="w-4 h-4 text-emerald-500" />}
                            </div>
                        ))}
                    </div>
                </div>

                <button
                    onClick={handlePromote}
                    disabled={loading || !selectedTier}
                    className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold rounded-xl transition flex items-center justify-center gap-2"
                >
                    {loading ? 'Processing...' : 'Confirm Promotion'}
                </button>

            </div>
        </div>
    );
}
