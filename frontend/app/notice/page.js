'use client';
import { Send, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TelegramNotice() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>

            <div className="relative z-10 max-w-md bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-2xl animate-in zoom-in duration-500">
                <div className="w-20 h-20 bg-[#0088cc] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-cyan-500/30">
                    <Send className="w-10 h-10 text-white ml-1" />
                </div>

                <h1 className="text-2xl font-bold text-white mb-2">Activation Required</h1>
                <p className="text-slate-400 mb-8 text-sm leading-relaxed">
                    Your account is currently <span className="text-yellow-400 font-bold">Pending Approval</span>.
                    Please join our official Telegram channel and contact an admin to activate your account.
                </p>

                <div className="space-y-4">
                    <a
                        href="https://t.me/+ReboihN0RXQxNTc1"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full py-4 bg-[#0088cc] hover:bg-[#0077b5] text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-cyan-500/25 flex items-center justify-center gap-2"
                    >
                        <Send className="w-5 h-5" /> Join Telegram Channel
                    </a>

                    <button
                        onClick={() => {
                            localStorage.removeItem('token');
                            router.push('/');
                        }}
                        className="block w-full py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 font-bold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
                    >
                        <LogOut className="w-4 h-4" /> Logout
                    </button>
                </div>
            </div>

            <p className="absolute bottom-6 text-slate-500 text-xs">
                &copy; 2026 Zizo 10. All rights reserved.
            </p>
        </div>
    );
}
