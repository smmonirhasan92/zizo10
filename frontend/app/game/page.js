'use client';
import { useState, useEffect } from 'react';
import api from '../../services/api';
import GameWalletSheet from '../../components/GameWalletSheet';
import { Gamepad2, Wallet, ArrowLeft, RotateCcw, Plus } from 'lucide-react';
import Link from 'next/link';

export default function GamePage() {
    const [choice, setChoice] = useState('head'); // Default to head
    const [betAmount, setBetAmount] = useState(20);
    const [minBet, setMinBet] = useState(10);
    const [maxBet, setMaxBet] = useState(1000);

    const [gameState, setGameState] = useState('idle'); // idle, flipping, result
    const [result, setResult] = useState(null); // 'win', 'loss'
    const [coinSide, setCoinSide] = useState('head'); // 'head', 'tail'
    const [bonusMsg, setBonusMsg] = useState('');

    const [gameBalance, setGameBalance] = useState(0);
    const [showTransfer, setShowTransfer] = useState(false);

    const [mainBalance, setMainBalance] = useState(0);
    const [showToast, setShowToast] = useState(false);
    const [isMaintenance, setIsMaintenance] = useState(false);

    useEffect(() => {
        fetchGameInfo();
        fetchWallet();
        const interval = setInterval(fetchWallet, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchGameInfo = async () => {
        try { const res = await api.get('/game'); if (res.data) { setMinBet(res.data.minBet || 10); setMaxBet(res.data.maxBet || 1000); } } catch (err) { console.error(err); }
    };

    const fetchWallet = async () => {
        try {
            const res = await api.get('/wallet/balance');
            setGameBalance(res.data.game_balance || 0);
            setMainBalance(res.data.wallet_balance || 0);
        } catch (err) { console.error(err); }
    };

    const handlePlay = async () => {
        if (gameState === 'flipping') return;
        if (parseFloat(gameBalance) < betAmount) { setShowTransfer(true); return; }

        setGameState('flipping');
        setResult(null);

        try {
            // Optimistic Flip
            const startTime = Date.now();
            const res = await api.post('/game/play', { betAmount, choice });

            // Ensure minimum flip time of 5s
            const elapsed = Date.now() - startTime;
            const delay = Math.max(0, 5000 - elapsed);

            setTimeout(() => {
                setCoinSide(res.data.result);
                setResult(res.data.won ? 'win' : 'loss');
                setBonusMsg(res.data.bonusMsg || '');
                setGameBalance(res.data.newBalance);
                setGameState('result');
            }, delay);

        } catch (err) {
            if (err.response && err.response.status === 503) {
                setIsMaintenance(true);
            } else {
                alert(err.response?.data?.message || 'Game Error');
            }
            setGameState('idle');
        }
    };

    const handleTransferSuccess = () => {
        fetchWallet();
        setShowTransfer(false);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    return (
        <div className="flex flex-col h-screen bg-slate-900 text-white overflow-hidden">
            {/* Header */}
            <div className="p-4 flex items-center justify-between bg-slate-800 shadow-md z-10">
                <Link href="/dashboard" className="p-2 bg-slate-700 rounded-full hover:bg-slate-600 transition">
                    <ArrowLeft className="w-5 h-5 text-gray-300" />
                </Link>
                <div className="flex flex-col items-center">
                    <span className="font-bold text-lg tracking-wider text-yellow-400">COIN FLIP</span>
                    <span className="text-[10px] text-gray-400">WIN 2X</span>
                </div>
                <div onClick={() => setShowTransfer(true)} className="flex items-center gap-2 bg-slate-700 px-3 py-1 rounded-full cursor-pointer border border-slate-600">
                    <Gamepad2 className="w-4 h-4 text-purple-400" />
                    <span className="font-mono font-bold">৳{Number(gameBalance).toFixed(0)}</span>
                    <Plus className="w-3 h-3 bg-green-500 rounded-full text-slate-900 p-0.5" />
                </div>
            </div>

            {/* Game Area */}
            <div className="flex-1 flex flex-col items-center justify-center relative">

                {/* Free Toast */}
                <div className={`absolute top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ${showToast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
                    <div className="bg-green-500 text-white px-6 py-2 rounded-full shadow-lg font-bold text-sm flex items-center gap-2">
                        <div className="bg-white rounded-full p-0.5"><Plus className="w-3 h-3 text-green-500" /></div>
                        Transfer Successful!
                    </div>
                </div>

                {/* Coin Container */}
                <div className="relative mb-10 perspective-1000">
                    <div className={`w-56 h-56 relative transform-style-3d ${gameState === 'flipping' ? 'animate-coin-spin' : ''}`}>
                        {/* Front Face (Head) */}
                        <div className={`absolute inset-0 backface-hidden rounded-full shadow-[0_0_25px_rgba(255,215,0,0.6)] border-[6px] border-yellow-500 bg-slate-800 overflow-hidden`}
                            style={{ transform: itemRotation(coinSide, 'head') }}>
                            <div className="absolute inset-0 border-[3px] border-yellow-300 rounded-full opacity-50 z-10"></div>
                            <img src="/uploads/head_v2.png" alt="Head" className="w-full h-full object-cover rounded-full" />
                        </div>

                        {/* Back Face (Tail) */}
                        <div className={`absolute inset-0 backface-hidden rounded-full shadow-[0_0_25px_rgba(255,215,0,0.6)] border-[6px] border-yellow-500 bg-slate-800 overflow-hidden`}
                            style={{ transform: itemRotation(coinSide, 'tail') }}>
                            <div className="absolute inset-0 border-[3px] border-yellow-300 rounded-full opacity-50 z-10"></div>
                            <img src="/uploads/tail_v2.png" alt="Tail" className="w-full h-full object-cover rounded-full" />
                        </div>
                    </div>
                </div>

                {/* Result Message */}
                <div className="h-12 flex items-center justify-center">
                    {gameState === 'result' && (
                        <div className={`text-2xl font-black tracking-widest animate-bounce ${result === 'win' ? 'text-green-400' : 'text-red-400'}`}>
                            {result === 'win' ? 'YOU WON!' : 'TRY AGAIN'}
                        </div>
                    )}
                    {gameState === 'flipping' && (
                        <div className="text-yellow-400 font-bold tracking-widest animate-pulse">FLIPPING...</div>
                    )}
                </div>
                {/* Maintenance Overlay */}
                {isMaintenance && (
                    <div className="absolute inset-0 bg-slate-900/90 z-50 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300">
                        <div className="w-20 h-20 bg-red-100/10 rounded-full flex items-center justify-center mb-6 animate-pulse">
                            <RotateCcw className="w-10 h-10 text-red-500" />
                        </div>
                        <h2 className="text-3xl font-black text-white mb-2">GAME OFFLINE</h2>
                        <p className="text-slate-400 mb-8 max-w-xs">
                            The game is currently under maintenance or disabled by admin.
                        </p>
                        <button
                            onClick={() => { setIsMaintenance(false); window.location.reload(); }}
                            className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition"
                        >
                            Try Again
                        </button>
                        <Link href="/dashboard" className="text-slate-500 font-bold text-sm mt-6 hover:text-white transition">
                            Go to Dashboard
                        </Link>
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className="bg-slate-800 p-6 rounded-t-3xl shadow-[0_-5px_20px_rgba(0,0,0,0.3)] z-10">
                <div className="flex gap-4 mb-6">
                    <button onClick={() => setChoice('head')} className={`flex-1 py-4 rounded-xl flex flex-col items-center gap-1 border-2 transition ${choice === 'head' ? 'border-yellow-500 bg-yellow-500/10 text-yellow-400' : 'border-slate-700 bg-slate-700/50 text-slate-400'}`}>
                        <span className="text-xl font-black">HEAD</span>
                    </button>
                    <button onClick={() => setChoice('tail')} className={`flex-1 py-4 rounded-xl flex flex-col items-center gap-1 border-2 transition ${choice === 'tail' ? 'border-slate-300 bg-slate-300/10 text-slate-200' : 'border-slate-700 bg-slate-700/50 text-slate-400'}`}>
                        <span className="text-xl font-black">TAIL</span>
                    </button>
                </div>

                <div className="mb-6">
                    <div className="flex justify-between text-sm font-bold text-slate-400 mb-2"><span>Bet Amount</span><span className="text-white">৳{betAmount}</span></div>
                    <input type="range" min={minBet} max={maxBet} step="10" value={betAmount} onChange={(e) => setBetAmount(Number(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500" />
                    <div className="flex justify-between mt-2">{[20, 50, 100, 500].map(amt => (<button key={amt} onClick={() => setBetAmount(amt)} className="px-3 py-1 bg-slate-700 rounded-lg text-xs font-bold text-slate-300 hover:bg-slate-600">{amt}</button>))}</div>
                </div>

                <button onClick={handlePlay} disabled={gameState === 'flipping'} className={`w-full py-4 rounded-2xl font-black text-xl tracking-widest shadow-lg transition active:scale-95 ${gameState === 'flipping' ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:brightness-110'}`}>
                    {gameState === 'flipping' ? 'WAIT...' : `FLIP FOR ৳${betAmount * 2}`}
                </button>
            </div>

            <style jsx>{`
                .perspective-1000 { perspective: 1000px; }
                .transform-style-3d { transform-style: preserve-3d; }
                .backface-hidden { backface-visibility: hidden; }
                
                @keyframes coin-spin {
                    0% { transform: rotateY(0); }
                    100% { transform: rotateY(3600deg); } /* 10 flips for 5s */
                }
                .animate-coin-spin { animation: coin-spin 5s ease-out forwards; }
            `}</style>

            <GameWalletSheet isOpen={showTransfer} onClose={() => setShowTransfer(false)} mainBalance={mainBalance} gameBalance={gameBalance} onSuccess={handleTransferSuccess} />
        </div>
    );
}

function itemRotation(side, face) {
    // If Result=Head (side='head'):
    //   Front(Head) Face should be at 0deg?
    //   Back(Tail) Face should be at 180deg.
    // Animation ends at 1800deg (Multiple of 360). So we see 0deg.

    // If Result=Tail (side='tail'):
    //   We need to end showing Tail.
    //   Tail is at 180deg relative to Head?

    // Let's simplify:
    // Front Face (Head) is always rotateY(0).
    // Back Face (Tail) is always rotateY(180).
    //
    // If Result=Head: End rotation is 1800 (360*5). Front is visible.
    // If Result=Tail: End rotation is 1980 (1800+180). Back is visible.
    // But we are using a fixed keyframe 'coin-spin' that goes to 1800.

    // If result is TAIL, we need to modify the animation or the initial rotation.
    // Better strategy: Always animate to 1800.
    // IF result is TAIL, we SWAP the faces so Head is at 180 and Tail is at 0.

    // Logic: 
    // If side==head: Front=0, Back=180
    // If side==tail: Front=180, Back=0 (So Tail at 0 is visible when animation ends at 0/360)

    if (side === 'head') {
        return face === 'head' ? 'rotateY(0deg)' : 'rotateY(180deg)';
    } else {
        return face === 'head' ? 'rotateY(180deg)' : 'rotateY(0deg)';
    }
}
