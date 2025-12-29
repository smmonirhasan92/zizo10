'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '../../services/api';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

const countries = [
    'Bangladesh', 'India', 'Pakistan', 'United States', 'United Kingdom', 'Canada', 'Australia', 'United Arab Emirates', 'Saudi Arabia', 'Malaysia', 'Singapore'
];

function RegisterForm() { // Wrapped in component for Suspense
    const router = useRouter();
    const searchParams = useSearchParams();
    const refCodeFromUrl = searchParams.get('ref');

    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        country: '',
        password: '',
        referralCode: refCodeFromUrl || ''
    });

    useEffect(() => {
        if (refCodeFromUrl) {
            setFormData(prev => ({ ...prev, referralCode: refCodeFromUrl }));
        }
    }, [refCodeFromUrl]);

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showCountryList, setShowCountryList] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await api.post('/auth/register', formData);

            // Auto-Login: Store token and redirect directly to dashboard
            if (res.data.token && res.data.user) {
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('user', JSON.stringify(res.data.user));

                if (res.data.user.role === 'admin') {
                    router.push('/admin/dashboard');
                } else {
                    router.push('/dashboard');
                }
            } else {
                // Fallback implementation if token missing (should not happen with new backend)
                router.push('/');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-primary text-white">
            <div className="p-6">
                <Link href="/" className="inline-flex items-center text-white/80 hover:text-white transition gap-2 font-medium mb-6">
                    <ArrowLeft className="w-5 h-5" /> Back to Login
                </Link>
                <h1 className="text-3xl font-bold tracking-tight">Create Account</h1>
                <p className="text-pink-100 mt-2 text-sm">Join Zizo 10 today.</p>
            </div>

            <div className="bg-white rounded-t-[2.5rem] p-8 -mx-0 flex-1 text-gray-800 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] pb-10 overflow-y-auto no-scrollbar">
                {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm flex items-center shadow-sm">⚠️ {error}</div>}

                <form onSubmit={handleRegister} className="space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 ml-1">Full Name</label>
                        <input
                            type="text"
                            name="fullName"
                            placeholder="e.g. John Doe"
                            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-medium placeholder:text-gray-400"
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 ml-1">Phone Number</label>
                        <input
                            type="tel"
                            name="phone"
                            placeholder="e.g. 01700000000"
                            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-medium placeholder:text-gray-400"
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="relative">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 ml-1">Country</label>
                        <input
                            type="text"
                            value={formData.country}
                            name="user_country_selection"
                            placeholder="Search Country..."
                            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-medium placeholder:text-gray-400"
                            onChange={(e) => {
                                setFormData({ ...formData, country: e.target.value });
                                setShowCountryList(true);
                            }}
                            onFocus={() => setShowCountryList(true)}
                            onBlur={() => setTimeout(() => setShowCountryList(false), 200)}
                            required
                            autoComplete="off"
                            data-lpignore="true"
                            data-form-type="other"
                        />
                        {showCountryList && (
                            <div className="absolute z-10 w-full mt-1 max-h-48 overflow-y-auto bg-white border border-gray-100 rounded-xl shadow-lg no-scrollbar">
                                {countries.filter(c => c.toLowerCase().includes(formData.country.toLowerCase())).map((c) => (
                                    <div
                                        key={c}
                                        className="p-3 hover:bg-slate-50 cursor-pointer text-sm font-medium text-slate-700 transition"
                                        onMouseDown={() => {
                                            setFormData({ ...formData, country: c });
                                            setShowCountryList(false);
                                        }}
                                    >
                                        {c}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 ml-1">Password</label>
                        <input
                            type="password"
                            name="password"
                            placeholder="••••••••"
                            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-medium placeholder:text-gray-400"
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 ml-1">
                            Referral Code (Optional)
                            {formData.referralCode && <span className="text-green-500 ml-2 text-[10px] uppercase tracking-wider">● Code Applied</span>}
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                name="referralCode"
                                value={formData.referralCode}
                                placeholder="e.g. REF12345"
                                className={`w-full p-4 bg-gray-50 border ${formData.referralCode ? 'border-green-500 ring-1 ring-green-500/20' : 'border-gray-100'} rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-medium placeholder:text-gray-400`}
                                onChange={handleChange}
                            />
                            {formData.referralCode && (
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500 pointer-events-none">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary text-white font-bold py-4 rounded-2xl shadow-xl hover:bg-primary-dark active:scale-95 transition-all flex justify-center items-center text-lg"
                        >
                            {loading ? <span className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></span> : 'Sign Up'}
                        </button>
                    </div>
                </form>

                <div className="mt-6 text-center text-sm text-gray-500 font-medium">
                    Already have an account? <Link href="/" className="text-primary font-bold hover:underline">Login</Link>
                </div>

                {/* Telegram Support Floating Button */}
                <a href="https://t.me/+ReboihN0RXQxNTc1" target="_blank" rel="noopener noreferrer" className="fixed bottom-6 right-6 bg-blue-500 text-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform z-50 animate-bounce">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2L2 15l8.5 2M21.5 2L10.5 22l4-8.5" /></svg>
                </a>
            </div>
        </div>
    );
}

export default function RegisterPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <RegisterForm />
        </Suspense>
    )
}
