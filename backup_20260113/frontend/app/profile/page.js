'use client';
import { useState, useEffect } from 'react';
import api from '../../services/api'; // Correct path to services/api
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Camera, Save, User } from 'lucide-react';

export default function ProfilePage() {
    const [user, setUser] = useState(null);
    const [fullName, setFullName] = useState('');
    const [photo, setPhoto] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    // Password Change State
    const [passwords, setPasswords] = useState({ old: '', new: '', confirm: '' });
    const [passLoading, setPassLoading] = useState(false);
    const [passMessage, setPassMessage] = useState('');

    const router = useRouter();

    useEffect(() => {
        api.get('/auth/me')
            .then(res => {
                setUser(res.data);
                setFullName(res.data.fullName);
                if (res.data.photoUrl) {
                    setPreview(`https://zizo10.com/api/${res.data.photoUrl}`);
                }
            })
            .catch(() => router.push('/'));
    }, [router]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setPhoto(file);
        setPreview(URL.createObjectURL(file));
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData();
        formData.append('fullName', fullName);
        if (photo) formData.append('photo', photo);

        try {
            const res = await api.put('/user/profile', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setMessage('Profile Updated! ✅');
            setUser(res.data.user);
            // Update local storage user if needed or rely on refresh
        } catch (err) {
            console.error(err);
            setMessage('Failed to update ❌');
        } finally {
            setLoading(false);
        }
    };

    if (!user) return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-pink-500"></div></div>;

    return (
        <div className="flex flex-col h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-white p-4 flex items-center gap-4 shadow-sm z-10 sticky top-0">
                <Link href="/dashboard" className="p-2 hover:bg-slate-100 rounded-full transition">
                    <ArrowLeft className="w-6 h-6 text-slate-600" />
                </Link>
                <h1 className="text-lg font-bold text-slate-800">Edit Profile</h1>
            </div>

            <div className="flex-1 overflow-y-auto p-6 pb-24">
                <form onSubmit={handleUpdate} className="max-w-md mx-auto space-y-8">

                    {/* Photo Upload */}
                    <div className="flex justify-center">
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl bg-slate-200">
                                {preview ? (
                                    <img src={preview} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                                        <User className="w-16 h-16" />
                                    </div>
                                )}
                            </div>
                            <label className="absolute bottom-0 right-0 bg-pink-500 text-white p-2.5 rounded-full shadow-lg cursor-pointer hover:bg-pink-600 active:scale-90 transition-all">
                                <Camera className="w-5 h-5" />
                                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                            </label>
                        </div>
                    </div>

                    {/* Fields */}
                    <div className="space-y-5">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full p-4 bg-white border border-slate-200 rounded-2xl font-bold text-slate-700 focus:ring-2 focus:ring-pink-500/20 outline-none transition"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Username</label>
                                <input
                                    type="text"
                                    value={`@${user.username}`}
                                    disabled
                                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-600 cursor-not-allowed"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Account Tier</label>
                                <div className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-600 uppercase flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full ${user.account_tier === 'Diamond' ? 'bg-cyan-400 shadow-[0_0_10px_cyan]' : user.account_tier === 'Gold' ? 'bg-yellow-400' : 'bg-slate-400'}`}></span>
                                    {user.account_tier || 'Standard'}
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Referral ID (Share This)</label>
                            <div className="relative group cursor-pointer" onClick={() => { navigator.clipboard.writeText(user.referral_code); setMessage('Referral Code Copied! 📋'); setTimeout(() => setMessage(''), 2000); }}>
                                <input
                                    type="text"
                                    value={user.referral_code || 'Generating...'}
                                    disabled
                                    className="w-full p-4 bg-indigo-50 border border-indigo-100 rounded-2xl font-black text-indigo-600 text-center tracking-widest cursor-pointer"
                                />
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-200 bg-white/50 backdrop-blur-[2px] rounded-2xl font-bold text-xs text-indigo-700">
                                    Tap to Copy
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Phone Number</label>
                            <input
                                type="text"
                                value={user.phone}
                                disabled
                                className="w-full p-4 bg-slate-100 border border-slate-200 rounded-2xl font-bold text-slate-500 cursor-not-allowed"
                            />
                            <p className="text-[10px] text-slate-400 mt-1 ml-1">Phone number cannot be changed</p>
                        </div>
                    </div>

                    {/* Action */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-pink-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-pink-200 hover:bg-pink-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? 'Updating...' : <><Save className="w-5 h-5" /> Update Profile</>}
                    </button>

                    {message && (
                        <div className={`p-4 rounded-xl text-center font-bold text-sm ${message.includes('Failed') ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}`}>
                            {message}
                        </div>
                    )}

                </form>
            </div>
        </div>
    );
}
