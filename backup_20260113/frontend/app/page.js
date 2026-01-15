'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../services/api';
import Link from 'next/link';
import { User, Lock, ArrowRight } from 'lucide-react'; // Placeholder icons, will use text if not available

export default function LoginPage() {
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await api.post('/auth/login', { phone, password });
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));

            if (res.data.user.role === 'admin' || res.data.user.role === 'super_admin') {
                router.push('/admin/dashboard');
            } else if (res.data.user.role === 'agent') {
                router.push('/agent/dashboard');
            } else {
                router.push('/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full min-h-screen bg-gradient-premium relative font-sans text-gray-100">
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/90 via-[#1e1b4b]/80 to-[#C2105E]/90 z-0"></div>

            <div className="relative z-10 flex-1 flex flex-col justify-center items-center px-6 pt-12 pb-6">

                {/* Logo Section */}
                <div className="mb-8 flex flex-col items-center animate-in fade-in zoom-in duration-700">
                    <div className="w-24 h-24 rounded-[1.5rem] bg-gradient-to-br from-[#EAB308] to-[#D97706] p-[2px] shadow-[0_0_30px_rgba(234,179,8,0.4)]">
                        <div className="w-full h-full bg-slate-900 rounded-[1.4rem] flex items-center justify-center relative overflow-hidden">
                            <img src="/logo.png" alt="Zizo 10" className="w-full h-full object-cover opacity-90" />
                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent"></div>
                        </div>
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight mt-6 text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 drop-shadow-sm">
                        Zizo 10
                    </h1>
                    <p className="text-slate-300 mt-2 text-sm font-medium tracking-wide flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Transfer with Confidence
                    </p>
                </div>

                {/* Glass Login Card */}
                <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 shadow-2xl ring-1 ring-black/5 animate-in slide-in-from-bottom-5 duration-700 delay-100">
                    <h2 className="text-xl font-bold mb-6 text-center text-white/90">Welcome Back</h2>

                    {error && (
                        <div className="mb-6 p-3 bg-red-500/20 text-red-100 rounded-xl text-xs font-bold flex items-center border border-red-500/30">
                            ⚠️ {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="group">
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1 transition-colors group-focus-within:text-yellow-400">Phone Number</label>
                            <div className="relative">
                                <span className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-yellow-400 transition-colors">📱</span>
                                <input
                                    type="tel"
                                    placeholder="017..."
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-900/50 border border-slate-700/50 rounded-2xl focus:ring-2 focus:ring-[#EAB308] focus:border-transparent outline-none transition-all font-medium text-white placeholder:text-slate-600 shadow-inner"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div className="group">
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1 transition-colors group-focus-within:text-yellow-400">Password</label>
                            <div className="relative">
                                <span className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-yellow-400 transition-colors">🔒</span>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-900/50 border border-slate-700/50 rounded-2xl focus:ring-2 focus:ring-[#EAB308] focus:border-transparent outline-none transition-all font-medium text-white placeholder:text-slate-600 shadow-inner"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-[#C2105E] to-[#E2136E] text-white font-bold py-4 rounded-2xl shadow-[0_10px_20px_-5px_rgba(194,16,94,0.4)] hover:shadow-[0_15px_30px_-5px_rgba(194,16,94,0.6)] active:scale-[0.98] transition-all flex justify-center items-center text-base border-t border-white/10"
                            >
                                {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : 'LOGIN'}
                            </button>
                        </div>

                        <div className="text-center">
                            <button
                                type="button"
                                onClick={() => alert("Please contact Customer Support or an Admin to reset your password.")}
                                className="text-slate-400 text-xs hover:text-[#EAB308] transition font-medium"
                            >
                                Forgot Password?
                            </button>
                        </div>
                    </form>
                </div>

                <div className="mt-8 text-center text-sm font-medium">
                    <span className="text-slate-400">Don&apos;t have an account?</span>{' '}
                    <Link href="/register" className="text-[#EAB308] font-bold hover:underline hover:text-yellow-300 transition">
                        Create Account
                    </Link>
                </div>

                {/* Telegram Floating Button */}
                <a href="https://t.me/+ReboihN0RXQxNTc1" target="_blank" rel="noopener noreferrer" className="fixed bottom-6 right-6 bg-[#0088cc] text-white p-3.5 rounded-full shadow-[0_10px_20px_-5px_rgba(0,136,204,0.4)] hover:scale-110 active:scale-95 transition-transform z-50">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"></path></svg>
                </a>
            </div>
        </div>
    );
}
