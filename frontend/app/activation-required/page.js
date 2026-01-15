'use client';
import { useRouter } from 'next/navigation';
import { ShieldAlert, Send } from 'lucide-react';

export default function ActivationRequired() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center text-white font-sans">
            <div className="max-w-md w-full bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-8 rounded-3xl shadow-2xl animate-in zoom-in-95">

                <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-6 ring-4 ring-rose-500/20">
                    <ShieldAlert className="w-10 h-10 text-rose-500" />
                </div>

                <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent mb-3">
                    Account Inactive
                </h1>

                <p className="text-slate-400 text-sm leading-relaxed mb-8">
                    Your account is currently <span className="text-rose-400 font-bold">Pending Approval</span>.
                    <br />
                    To activate your dashboard and start working, you must complete the verification process via Telegram.
                </p>

                <div className="space-y-4">
                    <a
                        href="https://t.me/MonirHasan1995"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-4 bg-[#0088cc] hover:bg-[#007db9] active:scale-95 transition-all rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                    >
                        <Send className="w-5 h-5" />
                        Contact on Telegram
                    </a>

                    <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700/50 text-xs text-slate-500">
                        <p className="font-bold text-slate-400 mb-1">Activation Requirement:</p>
                        <p>You may need to make a deposit to activate the account depending on your selected tier.</p>
                    </div>

                    <button
                        onClick={() => router.push('/')}
                        className="text-slate-500 text-xs hover:text-white transition mt-4"
                    >
                        Return to Login
                    </button>
                </div>

            </div>

            <p className="fixed bottom-6 text-[10px] text-slate-600">
                System Security • ID Verification Required
            </p>
        </div>
    );
}
