import { useState } from 'react';
import { X, ArrowRightLeft, Wallet, Gamepad2 } from 'lucide-react';
import api from '../services/api';

export default function WalletTransferModal({ isOpen, onClose, onSuccess, mainBalance, gameBalance }) {
    const [direction, setDirection] = useState('to_game'); // 'to_game' | 'to_main'
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);

    const handleTransfer = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const endpoint = direction === 'to_game' ? '/wallet/transfer/game' : '/wallet/transfer/main';
            await api.post(endpoint, { amount });
            onSuccess(); // Refresh parent data
            onClose();
            setAmount('');
            alert('Transfer successful!');
        } catch (err) {
            alert(err.response?.data?.message || 'Transfer failed');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#1a1b2e] border border-white/10 rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 text-white">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-xl">Transfer Funds</h3>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full">
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                {/* Balances */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Main Wallet</span>
                        <span className="text-lg font-bold">৳{mainBalance}</span>
                    </div>
                    <div className="bg-purple-500/10 p-3 rounded-2xl border border-purple-500/20">
                        <span className="text-[10px] uppercase font-bold text-purple-300 block mb-1">Game Wallet</span>
                        <span className="text-lg font-bold text-purple-300">৳{gameBalance}</span>
                    </div>
                </div>

                {/* Direction Toggle */}
                <div className="flex items-center justify-between bg-white/5 p-1 rounded-xl mb-6 relative">
                    <button
                        onClick={() => setDirection('to_game')}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${direction === 'to_game' ? 'bg-purple-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                    >
                        <Wallet className="w-3 h-3" /> <ArrowRightLeft className="w-3 h-3" /> <Gamepad2 className="w-3 h-3" />
                    </button>
                    <button
                        onClick={() => setDirection('to_main')}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${direction === 'to_main' ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                    >
                        <Gamepad2 className="w-3 h-3" /> <ArrowRightLeft className="w-3 h-3" /> <Wallet className="w-3 h-3" />
                    </button>
                </div>

                <form onSubmit={handleTransfer} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase">
                            Amount to Transfer ({direction === 'to_game' ? 'Main → Game' : 'Game → Main'})
                        </label>
                        <input
                            type="number"
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full p-4 bg-white/5 border border-white/10 rounded-xl font-bold text-xl outline-none focus:border-purple-500 transition-colors"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 font-bold rounded-xl shadow-lg shadow-purple-500/20 active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                        {loading ? 'Processing...' : 'Transfer Now'}
                    </button>
                </form>
            </div>
        </div>
    );
}
